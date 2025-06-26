import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { platform } from 'node:os'
import { existsSync } from 'node:fs'
import process from 'node:process'
import ffmpegPath from 'ffmpeg-static'

// Re-export types for convenience
export type InputType = 'screen' | 'audio' | 'both'
export type QualityLevel =
  | 'ultrafast' // Fastest encoding, largest file size
  | 'superfast' // Very fast encoding
  | 'veryfast' // Fast encoding
  | 'faster' // Faster than default
  | 'fast' // Fast encoding
  | 'medium' // Default balanced quality
  | 'slow' // Slower encoding, better quality
  | 'slower' // Much slower encoding
  | 'veryslow' // Slowest encoding, best quality
  | 'placebo' // Extremely slow, diminishing returns
  // Legacy simple levels for backward compatibility
  | 'low' // Maps to 'veryfast'
  | 'high' // Maps to 'slow'

export type VideoQualityPreset =
  | 'lossless' // Lossless encoding
  | 'visually-lossless' // CRF 15-18
  | 'high' // CRF 18-23
  | 'medium' // CRF 23-28
  | 'low' // CRF 28-35
  | 'very-low' // CRF 35+

export type AudioQualityPreset =
  | 'lossless' // FLAC or high bitrate
  | 'high' // 256-320 kbps
  | 'medium' // 128-192 kbps
  | 'low' // 64-96 kbps
  | 'very-low' // 32-48 kbps

export type DisplayServer = 'x11' | 'wayland' | 'auto'
export type WindowsCaptureMethod = 'gdigrab' | 'dshow' | 'auto'

// Platform-specific configuration
export interface PlatformConfig {
  displayServer?: DisplayServer
  windowsCaptureMethod?: WindowsCaptureMethod
  preferredAudioBackend?: string
}

export interface RecorderOptions {
  input: 'screen' | 'audio' | 'both'
  output: string
  fps?: number
  screenId?: number
  audioDevice?: string
  ffmpegPath?: string
  videoCodec?: string
  audioCodec?: string
  // Legacy quality option (deprecated, use videoQuality/audioQuality instead)
  quality?: QualityLevel
  // New detailed quality options
  videoQuality?: VideoQualityPreset
  audioQuality?: AudioQualityPreset
  // Encoding speed preset (affects encoding time vs compression efficiency)
  encodingSpeed?: QualityLevel
  // Custom CRF value (0-51, lower = better quality)
  crf?: number
  // Custom bitrate for video (e.g., '2M', '1000k')
  videoBitrate?: string
  // Custom bitrate for audio (e.g., '128k', '256k')
  audioBitrate?: string
  platformConfig?: PlatformConfig
}

export interface Recorder {
  start: () => Promise<void>
  stop: () => Promise<void>
  process: ChildProcess | null
  isRecording: boolean
}

export async function createRecorder(options: RecorderOptions): Promise<Recorder> {
  // Validate options
  validateRecorderOptions(options)

  const recorder: Recorder = {
    process: null,
    isRecording: false,
    start: async () => {
      if (recorder.isRecording) {
        throw new Error('Recording is already in progress')
      }

      const args = createFfmpegArgs(options)
      const command = options.ffmpegPath || ffmpegPath

      if (!command) {
        throw new Error('FFmpeg path not found. Please install ffmpeg-static or provide a custom path.')
      }

      return new Promise((resolve, reject) => {
        recorder.process = spawn(command, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
        })

        recorder.process.on('spawn', () => {
          recorder.isRecording = true
          resolve()
        })

        recorder.process.on('error', (error) => {
          recorder.isRecording = false
          recorder.process = null
          reject(new Error(`Failed to start FFmpeg: ${error.message}`))
        })

        recorder.process.stderr?.on('data', (_data) => {
          // FFmpeg outputs to stderr, we can optionally log this for debugging
          // console.log(`FFmpeg: ${data.toString()}`)
        })
      })
    },
    stop: async () => {
      if (!recorder.process || !recorder.isRecording) {
        return
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (recorder.process) {
            recorder.process.kill('SIGKILL')
            reject(new Error('FFmpeg process did not terminate gracefully'))
          }
        }, 5000) // 5 second timeout

        recorder.process!.on('exit', (code) => {
          clearTimeout(timeout)
          recorder.process = null
          recorder.isRecording = false

          if (code === 0 || code === null) {
            resolve()
          }
          else {
            reject(new Error(`FFmpeg exited with code ${code}`))
          }
        })

        // Send SIGINT for graceful shutdown
        recorder.process!.kill('SIGINT')
      })
    },
  }

  return recorder
}

function createFfmpegArgs(options: RecorderOptions): string[] {
  const args: string[] = ['-y'] // Overwrite output file
  const {
    input,
    output,
    fps = 30,
    screenId = 0,
    audioDevice,
    videoCodec,
    audioCodec,
    quality = 'medium',
    videoQuality,
    audioQuality,
    encodingSpeed,
    crf,
    videoBitrate,
    audioBitrate,
    platformConfig = {},
  } = options

  const currentPlatform = platform()

  // Create quality configuration object
  const qualityConfig = {
    legacy: quality,
    videoQuality,
    audioQuality,
    encodingSpeed,
    crf,
    videoBitrate,
    audioBitrate,
  }

  // Handle different input types
  if (input === 'screen') {
    addVideoInput(args, currentPlatform, screenId, fps, platformConfig)
    addVideoCodec(args, videoCodec, qualityConfig)
  }
  else if (input === 'audio') {
    addAudioInput(args, currentPlatform, audioDevice, platformConfig)
    addAudioCodec(args, audioCodec, qualityConfig)
  }
  else if (input === 'both') {
    // For combined capture, we need to handle inputs differently per platform
    if (currentPlatform === 'darwin') {
      // macOS: Use single avfoundation input with both video and audio
      args.push('-f', 'avfoundation')
      args.push('-i', `${screenId}:${audioDevice || '0'}`)
      args.push('-r', fps.toString())
    }
    else {
      // Windows/Linux: Use separate inputs
      addVideoInput(args, currentPlatform, screenId, fps, platformConfig)
      addAudioInput(args, currentPlatform, audioDevice, platformConfig)
    }
    addVideoCodec(args, videoCodec, qualityConfig)
    addAudioCodec(args, audioCodec, qualityConfig)
  }

  // Output file
  args.push(output)

  return args
}

function detectDisplayServer(): DisplayServer {
  // Check for Wayland
  if (process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === 'wayland') {
    return 'wayland'
  }

  // Check for X11
  if (process.env.DISPLAY || process.env.XDG_SESSION_TYPE === 'x11') {
    return 'x11'
  }

  // Default fallback
  return 'x11'
}

function detectWindowsCaptureMethod(): WindowsCaptureMethod {
  // For now, default to gdigrab as it's most widely supported
  // Could be enhanced to detect available methods
  return 'gdigrab'
}

function addVideoInput(
  args: string[],
  platform: string,
  screenId: number,
  fps: number,
  config: PlatformConfig,
): void {
  if (platform === 'darwin') {
    // macOS - AVFoundation
    args.push('-f', 'avfoundation')
    args.push('-i', `${screenId}:`)
    args.push('-r', fps.toString())
  }
  else if (platform === 'win32') {
    // Windows - Multiple capture methods
    const captureMethod = config.windowsCaptureMethod || detectWindowsCaptureMethod()

    switch (captureMethod) {
      case 'gdigrab':
        args.push('-f', 'gdigrab')
        args.push('-framerate', fps.toString())
        if (screenId > 0) {
          args.push('-i', `desktop`)
          args.push('-offset_x', '0', '-offset_y', '0') // Could be enhanced for multi-monitor
        }
        else {
          args.push('-i', 'desktop')
        }
        break
      case 'dshow':
        args.push('-f', 'dshow')
        args.push('-framerate', fps.toString())
        args.push('-i', `video="screen-capture-recorder"`)
        break
      default:
        // Fallback to gdigrab
        args.push('-f', 'gdigrab')
        args.push('-framerate', fps.toString())
        args.push('-i', 'desktop')
    }
  }
  else if (platform === 'linux') {
    // Linux - X11 or Wayland
    const displayServer = config.displayServer || detectDisplayServer()

    switch (displayServer) {
      case 'wayland':
        // Wayland capture using wf-recorder or similar
        // Note: This requires additional setup and may not work with standard FFmpeg
        if (existsSync('/usr/bin/wf-recorder')) {
          throw new Error('Wayland capture requires wf-recorder. Please use X11 session or install wf-recorder.')
        }
        else {
          // Try to use pipewire/portal for Wayland
          args.push('-f', 'kmsgrab')
          args.push('-i', '-')
          args.push('-r', fps.toString())
        }
        break
      case 'x11':
      default:
        // X11 capture
        args.push('-f', 'x11grab')
        args.push('-r', fps.toString())

        // Handle multiple screens
        {
          const display = process.env.DISPLAY || ':0.0'
          if (screenId > 0) {
            args.push('-i', `${display}.${screenId}`)
          }
          else {
            args.push('-i', display)
          }
        }

        // Add some optimizations for X11
        args.push('-show_region', '1') // Show capture region
        break
    }
  }
  else {
    throw new Error(`Unsupported platform for screen capture: ${platform}`)
  }
}

function addAudioInput(
  args: string[],
  platform: string,
  audioDevice?: string,
  config: PlatformConfig = {},
): void {
  if (platform === 'darwin') {
    // macOS - AVFoundation
    args.push('-f', 'avfoundation')
    args.push('-i', `:${audioDevice || '0'}`)
  }
  else if (platform === 'win32') {
    // Windows - DirectShow or WASAPI
    const preferredBackend = config.preferredAudioBackend || 'dshow'

    switch (preferredBackend) {
      case 'dshow':
        args.push('-f', 'dshow')
        args.push('-i', `audio=${audioDevice || 'Stereo Mix'}`)
        break
      case 'wasapi':
        args.push('-f', 'wasapi')
        args.push('-i', audioDevice || 'default')
        break
      default:
        args.push('-f', 'dshow')
        args.push('-i', `audio=${audioDevice || 'Stereo Mix'}`)
    }
  }
  else if (platform === 'linux') {
    // Linux - PulseAudio, ALSA, or JACK
    const preferredBackend = config.preferredAudioBackend || detectLinuxAudioBackend()

    switch (preferredBackend) {
      case 'pulse':
        args.push('-f', 'pulse')
        args.push('-i', audioDevice || 'default')
        break
      case 'alsa':
        args.push('-f', 'alsa')
        args.push('-i', audioDevice || 'default')
        break
      case 'jack':
        args.push('-f', 'jack')
        args.push('-i', audioDevice || 'default')
        break
      default:
        args.push('-f', 'pulse')
        args.push('-i', audioDevice || 'default')
    }
  }
  else {
    throw new Error(`Unsupported platform for audio capture: ${platform}`)
  }
}

function detectLinuxAudioBackend(): string {
  // Check for PulseAudio
  if (process.env.PULSE_RUNTIME_PATH || existsSync('/run/user/1000/pulse')) {
    return 'pulse'
  }

  // Check for JACK
  if (process.env.JACK_DEFAULT_SERVER || existsSync('/dev/shm/jack-1000')) {
    return 'jack'
  }

  // Fallback to ALSA
  return 'alsa'
}

interface QualityConfig {
  legacy?: QualityLevel
  videoQuality?: VideoQualityPreset
  audioQuality?: AudioQualityPreset
  encodingSpeed?: QualityLevel
  crf?: number
  videoBitrate?: string
  audioBitrate?: string
}

function addVideoCodec(args: string[], codec?: string, qualityConfig?: QualityConfig): void {
  if (codec) {
    args.push('-c:v', codec)
    // Still apply quality settings even with custom codec
    if (qualityConfig) {
      applyVideoQualitySettings(args, qualityConfig)
    }
  }
  else {
    // Auto-select codec based on hardware acceleration
    const hwAccel = detectHardwareAcceleration()
    const selectedCodec = hwAccel || 'libx264'

    args.push('-c:v', selectedCodec)

    // Apply quality settings
    if (qualityConfig) {
      applyVideoQualitySettings(args, qualityConfig)
    }
    else {
      // Default fallback
      args.push('-preset', 'medium', '-crf', '23')
    }
  }
}

function applyVideoQualitySettings(args: string[], config: QualityConfig): void {
  // Determine encoding speed preset
  const speed = getEncodingSpeed(config)
  if (speed) {
    args.push('-preset', speed)
  }

  // Determine quality settings
  if (config.crf !== undefined) {
    // Custom CRF value takes precedence
    args.push('-crf', config.crf.toString())
  }
  else if (config.videoBitrate) {
    // Custom bitrate
    args.push('-b:v', config.videoBitrate)
  }
  else if (config.videoQuality) {
    // Video quality preset
    const crf = getVideoQualityCRF(config.videoQuality)
    if (crf === 'lossless') {
      args.push('-crf', '0')
    }
    else {
      args.push('-crf', crf.toString())
    }
  }
  else if (config.legacy) {
    // Legacy quality mapping
    const crf = getLegacyVideoQuality(config.legacy)
    args.push('-crf', crf.toString())
  }
  else {
    // Default
    args.push('-crf', '23')
  }

  // Additional video settings based on quality
  if (config.videoQuality === 'lossless') {
    args.push('-qp', '0') // Lossless quantization parameter
  }
}

function getEncodingSpeed(config: QualityConfig): string | null {
  if (config.encodingSpeed) {
    return mapQualityLevelToPreset(config.encodingSpeed)
  }

  // Map legacy quality to speed
  if (config.legacy) {
    switch (config.legacy) {
      case 'low': return 'veryfast'
      case 'high': return 'slow'
      default: return 'medium'
    }
  }

  return 'medium'
}

function mapQualityLevelToPreset(level: QualityLevel): string {
  switch (level) {
    case 'ultrafast': return 'ultrafast'
    case 'superfast': return 'superfast'
    case 'veryfast': return 'veryfast'
    case 'faster': return 'faster'
    case 'fast': return 'fast'
    case 'medium': return 'medium'
    case 'slow': return 'slow'
    case 'slower': return 'slower'
    case 'veryslow': return 'veryslow'
    case 'placebo': return 'placebo'
    // Legacy mappings
    case 'low': return 'veryfast'
    case 'high': return 'slow'
    default: return 'medium'
  }
}

function getVideoQualityCRF(quality: VideoQualityPreset): number | 'lossless' {
  switch (quality) {
    case 'lossless': return 'lossless'
    case 'visually-lossless': return 15
    case 'high': return 18
    case 'medium': return 23
    case 'low': return 28
    case 'very-low': return 35
    default: return 23
  }
}

function getLegacyVideoQuality(quality: QualityLevel): number {
  switch (quality) {
    case 'ultrafast':
    case 'superfast':
    case 'veryfast':
    case 'low':
      return 35
    case 'faster':
    case 'fast':
      return 28
    case 'medium':
      return 23
    case 'slow':
    case 'high':
      return 18
    case 'slower':
    case 'veryslow':
      return 15
    case 'placebo':
      return 12
    default:
      return 23
  }
}

function detectHardwareAcceleration(): string | null {
  const currentPlatform = platform()

  // This is a simplified detection - in practice, you'd want to test
  // if the codec is actually available
  switch (currentPlatform) {
    case 'win32':
      return 'h264_nvenc' // NVIDIA, could also check for h264_amf (AMD) or h264_qsv (Intel)
    case 'darwin':
      return 'h264_videotoolbox' // Apple VideoToolbox
    case 'linux':
      return 'h264_vaapi' // Intel VAAPI, could also check for h264_nvenc
    default:
      return null
  }
}

function addAudioCodec(args: string[], codec?: string, qualityConfig?: QualityConfig): void {
  if (codec) {
    args.push('-c:a', codec)
    // Still apply quality settings even with custom codec
    if (qualityConfig) {
      applyAudioQualitySettings(args, qualityConfig, codec)
    }
  }
  else {
    // Auto-select codec based on quality
    const selectedCodec = getAudioCodec(qualityConfig)
    args.push('-c:a', selectedCodec)

    // Apply quality settings
    if (qualityConfig) {
      applyAudioQualitySettings(args, qualityConfig, selectedCodec)
    }
    else {
      // Default fallback
      args.push('-b:a', '128k')
    }
  }
}

function getAudioCodec(config?: QualityConfig): string {
  if (config?.audioQuality === 'lossless') {
    return 'flac'
  }
  return 'aac' // Default to AAC for good compatibility
}

function applyAudioQualitySettings(args: string[], config: QualityConfig, codec: string): void {
  // Determine audio quality settings
  if (config.audioBitrate) {
    // Custom bitrate takes precedence
    args.push('-b:a', config.audioBitrate)
  }
  else if (config.audioQuality) {
    // Audio quality preset
    const bitrate = getAudioQualityBitrate(config.audioQuality, codec)
    if (bitrate) {
      args.push('-b:a', bitrate)
    }
  }
  else if (config.legacy) {
    // Legacy quality mapping
    const bitrate = getLegacyAudioQuality(config.legacy)
    args.push('-b:a', bitrate)
  }
  else {
    // Default
    args.push('-b:a', '128k')
  }

  // Additional settings based on codec and quality
  if (codec === 'aac') {
    // AAC-specific settings
    if (config.audioQuality === 'high' || config.audioQuality === 'lossless') {
      args.push('-aac_coder', 'twoloop') // Better quality AAC encoder
    }
  }
  else if (codec === 'libopus') {
    // Opus-specific settings
    args.push('-application', 'audio') // Optimize for general audio
  }
  else if (codec === 'flac') {
    // FLAC-specific settings
    args.push('-compression_level', '8') // Maximum compression
  }
}

function getAudioQualityBitrate(quality: AudioQualityPreset, codec: string): string | null {
  if (codec === 'flac' && quality === 'lossless') {
    return null // FLAC doesn't use bitrate
  }

  switch (quality) {
    case 'lossless':
      return codec === 'aac' ? '320k' : '512k'
    case 'high':
      return '256k'
    case 'medium':
      return '128k'
    case 'low':
      return '96k'
    case 'very-low':
      return '64k'
    default:
      return '128k'
  }
}

function getLegacyAudioQuality(quality: QualityLevel): string {
  switch (quality) {
    case 'ultrafast':
    case 'superfast':
    case 'veryfast':
    case 'low':
      return '64k'
    case 'faster':
    case 'fast':
      return '96k'
    case 'medium':
      return '128k'
    case 'slow':
    case 'high':
      return '256k'
    case 'slower':
    case 'veryslow':
    case 'placebo':
      return '320k'
    default:
      return '128k'
  }
}

/**
 * Check if FFmpeg is available in the system
 */
export async function checkFfmpegAvailability(customPath?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const command = customPath || ffmpegPath || 'ffmpeg'
    const process = spawn(command, ['-version'], { stdio: 'ignore' })

    process.on('close', (code) => {
      resolve(code === 0)
    })

    process.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * Detect available capture methods for the current platform
 */
export async function detectCaptureMethods(): Promise<{
  video: string[]
  audio: string[]
  displayServer?: string
}> {
  const currentPlatform = platform()
  const result = {
    video: [] as string[],
    audio: [] as string[],
    displayServer: undefined as string | undefined,
  }

  switch (currentPlatform) {
    case 'darwin':
      result.video = ['avfoundation']
      result.audio = ['avfoundation']
      break
    case 'win32':
      result.video = ['gdigrab', 'dshow']
      result.audio = ['dshow', 'wasapi']
      break
    case 'linux':
      result.displayServer = detectDisplayServer()
      result.video = result.displayServer === 'wayland' ? ['kmsgrab'] : ['x11grab']
      result.audio = [detectLinuxAudioBackend()]
      break
  }

  return result
}

/**
 * Get platform-specific default audio device names
 */
export function getDefaultAudioDevice(): string {
  const currentPlatform = platform()

  switch (currentPlatform) {
    case 'darwin':
      return '0' // Default audio device index on macOS
    case 'win32':
      return 'Stereo Mix' // Common default on Windows
    case 'linux':
      return 'default' // PulseAudio default
    default:
      return 'default'
  }
}

/**
 * Get available audio devices for the current platform
 */
export async function getAvailableAudioDevices(): Promise<string[]> {
  const currentPlatform = platform()

  // This would require running FFmpeg with device listing commands
  // For now, return common defaults
  switch (currentPlatform) {
    case 'darwin':
      return ['0', '1', '2'] // Device indices
    case 'win32':
      return ['Stereo Mix', 'Microphone', 'Line In']
    case 'linux':
      return ['default', 'pulse', 'alsa']
    default:
      return ['default']
  }
}

/**
 * Get available quality presets and their descriptions
 */
export function getQualityPresets(): {
  encodingSpeed: Array<{ value: QualityLevel, description: string }>
  videoQuality: Array<{ value: VideoQualityPreset, description: string }>
  audioQuality: Array<{ value: AudioQualityPreset, description: string }>
} {
  return {
    encodingSpeed: [
      { value: 'ultrafast', description: 'Fastest encoding, largest file size' },
      { value: 'superfast', description: 'Very fast encoding' },
      { value: 'veryfast', description: 'Fast encoding' },
      { value: 'faster', description: 'Faster than default' },
      { value: 'fast', description: 'Fast encoding' },
      { value: 'medium', description: 'Default balanced speed' },
      { value: 'slow', description: 'Slower encoding, better compression' },
      { value: 'slower', description: 'Much slower encoding' },
      { value: 'veryslow', description: 'Slowest encoding, best compression' },
      { value: 'placebo', description: 'Extremely slow, diminishing returns' },
    ],
    videoQuality: [
      { value: 'lossless', description: 'Perfect quality, largest files (CRF 0)' },
      { value: 'visually-lossless', description: 'Visually perfect (CRF 15)' },
      { value: 'high', description: 'High quality (CRF 18)' },
      { value: 'medium', description: 'Good quality (CRF 23)' },
      { value: 'low', description: 'Lower quality (CRF 28)' },
      { value: 'very-low', description: 'Lowest quality (CRF 35)' },
    ],
    audioQuality: [
      { value: 'lossless', description: 'Perfect audio quality (FLAC or 320k+)' },
      { value: 'high', description: 'High quality (256k)' },
      { value: 'medium', description: 'Good quality (128k)' },
      { value: 'low', description: 'Lower quality (96k)' },
      { value: 'very-low', description: 'Lowest quality (64k)' },
    ],
  }
}

/**
 * Get recommended quality settings for different use cases
 */
export function getRecommendedQuality(useCase: 'streaming' | 'archival' | 'preview' | 'sharing'): {
  videoQuality: VideoQualityPreset
  audioQuality: AudioQualityPreset
  encodingSpeed: QualityLevel
  description: string
} {
  switch (useCase) {
    case 'streaming':
      return {
        videoQuality: 'medium',
        audioQuality: 'medium',
        encodingSpeed: 'veryfast',
        description: 'Optimized for real-time streaming with good quality',
      }
    case 'archival':
      return {
        videoQuality: 'visually-lossless',
        audioQuality: 'lossless',
        encodingSpeed: 'veryslow',
        description: 'Best quality for long-term storage',
      }
    case 'preview':
      return {
        videoQuality: 'low',
        audioQuality: 'low',
        encodingSpeed: 'ultrafast',
        description: 'Quick preview with small file size',
      }
    case 'sharing':
      return {
        videoQuality: 'high',
        audioQuality: 'high',
        encodingSpeed: 'medium',
        description: 'Good balance for sharing online',
      }
    default:
      return {
        videoQuality: 'medium',
        audioQuality: 'medium',
        encodingSpeed: 'medium',
        description: 'Default balanced settings',
      }
  }
}

/**
 * Validate recorder options
 */
export function validateRecorderOptions(options: RecorderOptions): void {
  if (!options.output) {
    throw new Error('Output path is required')
  }

  if (!['screen', 'audio', 'both'].includes(options.input)) {
    throw new Error('Input must be one of: screen, audio, both')
  }

  if (options.fps !== undefined && (options.fps < 1 || options.fps > 60)) {
    throw new Error('FPS must be between 1 and 60')
  }

  if (options.screenId !== undefined && options.screenId < 0) {
    throw new Error('Screen ID must be non-negative')
  }

  // Validate quality options
  const validQualityLevels = [
    'ultrafast',
    'superfast',
    'veryfast',
    'faster',
    'fast',
    'medium',
    'slow',
    'slower',
    'veryslow',
    'placebo',
    'low',
    'high',
  ]
  const validVideoQualities = ['lossless', 'visually-lossless', 'high', 'medium', 'low', 'very-low']
  const validAudioQualities = ['lossless', 'high', 'medium', 'low', 'very-low']

  if (options.quality && !validQualityLevels.includes(options.quality)) {
    throw new Error(`Quality must be one of: ${validQualityLevels.join(', ')}`)
  }

  if (options.videoQuality && !validVideoQualities.includes(options.videoQuality)) {
    throw new Error(`Video quality must be one of: ${validVideoQualities.join(', ')}`)
  }

  if (options.audioQuality && !validAudioQualities.includes(options.audioQuality)) {
    throw new Error(`Audio quality must be one of: ${validAudioQualities.join(', ')}`)
  }

  if (options.encodingSpeed && !validQualityLevels.includes(options.encodingSpeed)) {
    throw new Error(`Encoding speed must be one of: ${validQualityLevels.join(', ')}`)
  }

  if (options.crf !== undefined && (options.crf < 0 || options.crf > 51)) {
    throw new Error('CRF must be between 0 and 51')
  }

  if (options.platformConfig?.displayServer
    && !['x11', 'wayland', 'auto'].includes(options.platformConfig.displayServer)) {
    throw new Error('Display server must be one of: x11, wayland, auto')
  }

  if (options.platformConfig?.windowsCaptureMethod
    && !['gdigrab', 'dshow', 'auto'].includes(options.platformConfig.windowsCaptureMethod)) {
    throw new Error('Windows capture method must be one of: gdigrab, dshow, auto')
  }
}
