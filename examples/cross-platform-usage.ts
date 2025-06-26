import { platform } from 'node:os'
import {
  checkFfmpegAvailability,
  createRecorder,
  detectCaptureMethods,
  getAvailableAudioDevices,
  getDefaultAudioDevice,
} from '../src'

async function demonstrateCrossPlatformCapture() {
  console.log(`Running on: ${platform()}`)

  // Check FFmpeg availability
  const isAvailable = await checkFfmpegAvailability()
  if (!isAvailable) {
    console.error('FFmpeg is not available. Please install FFmpeg or ffmpeg-static.')
    return
  }
  console.log('✓ FFmpeg is available')

  // Detect available capture methods
  const methods = await detectCaptureMethods()
  console.log('Available capture methods:', methods)

  // Get available audio devices
  const audioDevices = await getAvailableAudioDevices()
  console.log('Available audio devices:', audioDevices)

  // Get default audio device
  const defaultAudio = getDefaultAudioDevice()
  console.log('Default audio device:', defaultAudio)

  // Platform-specific examples
  await demonstratePlatformSpecificCapture()
}

async function demonstratePlatformSpecificCapture() {
  const currentPlatform = platform()

  switch (currentPlatform) {
    case 'darwin':
      await macOSExample()
      break
    case 'win32':
      await windowsExample()
      break
    case 'linux':
      await linuxExample()
      break
    default:
      console.log('Unsupported platform for specific examples')
  }
}

async function macOSExample() {
  console.log('\n=== macOS Example ===')

  const recorder = await createRecorder({
    input: 'both',
    output: 'macos-recording.mp4',
    fps: 30,
    screenId: 0, // Main display
    audioDevice: '0', // Default audio device
    quality: 'high',
  })

  console.log('Starting macOS recording with AVFoundation...')
  await recorder.start()

  setTimeout(async () => {
    await recorder.stop()
    console.log('macOS recording completed')
  }, 3000)
}

async function windowsExample() {
  console.log('\n=== Windows Example ===')

  // Example 1: Using GDI grab (most compatible)
  const gdiRecorder = await createRecorder({
    input: 'screen',
    output: 'windows-gdi-recording.mp4',
    fps: 24,
    quality: 'medium',
    platformConfig: {
      windowsCaptureMethod: 'gdigrab',
    },
  })

  console.log('Starting Windows recording with GDI grab...')
  await gdiRecorder.start()

  setTimeout(async () => {
    await gdiRecorder.stop()
    console.log('Windows GDI recording completed')
  }, 3000)

  // Example 2: Using DirectShow for audio
  const audioRecorder = await createRecorder({
    input: 'audio',
    output: 'windows-audio.mp3',
    audioDevice: 'Stereo Mix',
    quality: 'high',
    platformConfig: {
      preferredAudioBackend: 'dshow',
    },
  })

  console.log('Starting Windows audio recording with DirectShow...')
  await audioRecorder.start()

  setTimeout(async () => {
    await audioRecorder.stop()
    console.log('Windows audio recording completed')
  }, 2000)
}

async function linuxExample() {
  console.log('\n=== Linux Example ===')

  // Example 1: X11 capture
  const x11Recorder = await createRecorder({
    input: 'screen',
    output: 'linux-x11-recording.mp4',
    fps: 25,
    quality: 'medium',
    platformConfig: {
      displayServer: 'x11',
    },
  })

  console.log('Starting Linux recording with X11 grab...')
  await x11Recorder.start()

  setTimeout(async () => {
    await x11Recorder.stop()
    console.log('Linux X11 recording completed')
  }, 3000)

  // Example 2: PulseAudio capture
  const pulseRecorder = await createRecorder({
    input: 'audio',
    output: 'linux-pulse-audio.mp3',
    audioDevice: 'default',
    quality: 'high',
    platformConfig: {
      preferredAudioBackend: 'pulse',
    },
  })

  console.log('Starting Linux audio recording with PulseAudio...')
  await pulseRecorder.start()

  setTimeout(async () => {
    await pulseRecorder.stop()
    console.log('Linux PulseAudio recording completed')
  }, 2000)

  // Example 3: Wayland attempt (may not work without additional setup)
  try {
    const waylandRecorder = await createRecorder({
      input: 'screen',
      output: 'linux-wayland-recording.mp4',
      fps: 25,
      platformConfig: {
        displayServer: 'wayland',
      },
    })

    console.log('Attempting Wayland recording...')
    await waylandRecorder.start()

    setTimeout(async () => {
      await waylandRecorder.stop()
      console.log('Wayland recording completed')
    }, 3000)
  }
  catch (error) {
    console.log('Wayland recording failed (expected):', error instanceof Error ? error.message : String(error))
  }
}

async function demonstrateAdvancedFeatures() {
  console.log('\n=== Advanced Features ===')

  // Hardware acceleration example
  const hwAccelRecorder = await createRecorder({
    input: 'screen',
    output: 'hardware-accelerated.mp4',
    fps: 60,
    quality: 'high',
    // Let the library auto-detect hardware acceleration
  })

  console.log('Starting hardware-accelerated recording...')
  await hwAccelRecorder.start()

  setTimeout(async () => {
    await hwAccelRecorder.stop()
    console.log('Hardware-accelerated recording completed')
  }, 5000)

  // Custom codec example
  const customCodecRecorder = await createRecorder({
    input: 'both',
    output: 'custom-codec.mkv',
    fps: 30,
    videoCodec: 'libx265', // H.265 for better compression
    audioCodec: 'libopus', // Opus for better audio quality
    quality: 'high',
  })

  console.log('Starting recording with custom codecs...')
  await customCodecRecorder.start()

  setTimeout(async () => {
    await customCodecRecorder.stop()
    console.log('Custom codec recording completed')
  }, 4000)
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = process.argv[2] || 'basic'

  switch (demo) {
    case 'advanced':
      demonstrateAdvancedFeatures().catch(console.error)
      break
    default:
      demonstrateCrossPlatformCapture().catch(console.error)
  }
}
