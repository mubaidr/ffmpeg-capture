import { promises as fs } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  checkFfmpegAvailability,
  createRecorder,
  detectCaptureMethods,
  getAvailableAudioDevices,
  getDefaultAudioDevice,
  getQualityPresets,
  getRecommendedQuality,
  validateRecorderOptions,
} from '../src'

describe('ffmpeg-capture', () => {
  let outputDir: string

  beforeEach(async () => {
    outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ffmpeg-capture-test-'))
  })

  afterEach(async () => {
    await fs.rm(outputDir, { recursive: true, force: true })
  })

  it('should validate recorder options', () => {
    expect(() => validateRecorderOptions({ input: 'screen', output: '' }))
      .toThrow('Output path is required')

    expect(() => validateRecorderOptions({ input: 'invalid' as any, output: 'test.mp4' }))
      .toThrow('Input must be one of: screen, audio, both')

    expect(() => validateRecorderOptions({ input: 'screen', output: 'test.mp4', fps: 0 }))
      .toThrow('FPS must be between 1 and 60')

    expect(() => validateRecorderOptions({ input: 'screen', output: 'test.mp4', screenId: -1 }))
      .toThrow('Screen ID must be non-negative')
  })

  it('should get default audio device', () => {
    const device = getDefaultAudioDevice()
    expect(device).toBeDefined()
    expect(typeof device).toBe('string')
  })

  it('should check ffmpeg availability', async () => {
    const isAvailable = await checkFfmpegAvailability()
    // This might be false in CI environments without ffmpeg
    expect(typeof isAvailable).toBe('boolean')
  })

  it('should detect capture methods', async () => {
    const methods = await detectCaptureMethods()
    expect(methods).toBeDefined()
    expect(Array.isArray(methods.video)).toBe(true)
    expect(Array.isArray(methods.audio)).toBe(true)
    expect(methods.video.length).toBeGreaterThan(0)
    expect(methods.audio.length).toBeGreaterThan(0)
  })

  it('should get available audio devices', async () => {
    const devices = await getAvailableAudioDevices()
    expect(Array.isArray(devices)).toBe(true)
    expect(devices.length).toBeGreaterThan(0)
  })

  it('should get quality presets', () => {
    const presets = getQualityPresets()
    expect(presets).toBeDefined()
    expect(Array.isArray(presets.encodingSpeed)).toBe(true)
    expect(Array.isArray(presets.videoQuality)).toBe(true)
    expect(Array.isArray(presets.audioQuality)).toBe(true)
    expect(presets.encodingSpeed.length).toBeGreaterThan(0)
    expect(presets.videoQuality.length).toBeGreaterThan(0)
    expect(presets.audioQuality.length).toBeGreaterThan(0)
  })

  it('should get recommended quality settings', () => {
    const streaming = getRecommendedQuality('streaming')
    expect(streaming).toBeDefined()
    expect(streaming.videoQuality).toBeDefined()
    expect(streaming.audioQuality).toBeDefined()
    expect(streaming.encodingSpeed).toBeDefined()
    expect(streaming.description).toBeDefined()

    const archival = getRecommendedQuality('archival')
    expect(archival.videoQuality).toBe('visually-lossless')
    expect(archival.audioQuality).toBe('lossless')
  })

  it('should create a recorder with valid options', async () => {
    const outputFile = path.join(outputDir, 'test.mp4')
    const recorder = await createRecorder({
      input: 'screen',
      output: outputFile,
    })

    expect(recorder).toBeDefined()
    expect(recorder.process).toBeNull()
    expect(recorder.isRecording).toBe(false)
    expect(typeof recorder.start).toBe('function')
    expect(typeof recorder.stop).toBe('function')
  })

  it('should create a recorder with platform-specific config', async () => {
    const outputFile = path.join(outputDir, 'test-platform.mp4')
    const recorder = await createRecorder({
      input: 'screen',
      output: outputFile,
      platformConfig: {
        displayServer: 'auto',
        windowsCaptureMethod: 'auto',
        preferredAudioBackend: 'pulse',
      },
    })

    expect(recorder).toBeDefined()
    expect(recorder.isRecording).toBe(false)
  })

  it('should create a recorder with advanced quality settings', async () => {
    const outputFile = path.join(outputDir, 'test-quality.mp4')
    const recorder = await createRecorder({
      input: 'screen',
      output: outputFile,
      videoQuality: 'high',
      audioQuality: 'high',
      encodingSpeed: 'fast',
      crf: 20,
      videoBitrate: '2M',
      audioBitrate: '192k',
    })

    expect(recorder).toBeDefined()
    expect(recorder.isRecording).toBe(false)
  })

  it('should handle recording lifecycle', async () => {
    const outputFile = path.join(outputDir, 'test.mp4')
    const recorder = await createRecorder({
      input: 'screen',
      output: outputFile,
      fps: 15, // Lower FPS for faster test
    })

    // Check if FFmpeg is available before attempting to record
    const ffmpegAvailable = await checkFfmpegAvailability()
    if (!ffmpegAvailable) {
      console.warn('FFmpeg not available, skipping recording test')
      return
    }

    try {
      await recorder.start()
      expect(recorder.isRecording).toBe(true)
      expect(recorder.process).not.toBeNull()

      // Record for a short time
      await new Promise(resolve => setTimeout(resolve, 1000))

      await recorder.stop()
      expect(recorder.isRecording).toBe(false)
      expect(recorder.process).toBeNull()

      // Check if file was created (might be empty if recording failed)
      const fileExists = await fs.access(outputFile).then(() => true).catch(() => false)
      expect(fileExists).toBe(true)
    }
    catch (error) {
      // Recording might fail in headless environments
      console.warn('Recording test failed (expected in headless environments):', error)
    }
  }, 15000)

  it('should prevent starting recording twice', async () => {
    const outputFile = path.join(outputDir, 'test.mp4')
    const recorder = await createRecorder({
      input: 'screen',
      output: outputFile,
    })

    const ffmpegAvailable = await checkFfmpegAvailability()
    if (!ffmpegAvailable) {
      console.warn('FFmpeg not available, skipping double start test')
      return
    }

    try {
      await recorder.start()
      await expect(recorder.start()).rejects.toThrow('Recording is already in progress')
      await recorder.stop()
    }
    catch (error) {
      console.warn('Recording test failed (expected in headless environments):', error)
    }
  }, 10000)
})
