import { checkFfmpegAvailability, createRecorder } from '../src'

async function basicExample() {
  // Check if FFmpeg is available
  const isAvailable = await checkFfmpegAvailability()
  if (!isAvailable) {
    console.error('FFmpeg is not available. Please install FFmpeg or ffmpeg-static.')
    return
  }

  console.log('Creating screen recorder...')

  const recorder = await createRecorder({
    input: 'screen',
    output: 'screen-recording.mp4',
    fps: 30,
    quality: 'medium',
  })

  console.log('Starting recording...')
  await recorder.start()

  // Record for 5 seconds
  setTimeout(async () => {
    console.log('Stopping recording...')
    await recorder.stop()
    console.log('Recording saved to screen-recording.mp4')
  }, 5000)
}

async function audioExample() {
  const recorder = await createRecorder({
    input: 'audio',
    output: 'audio-recording.mp3',
    quality: 'high',
  })

  console.log('Starting audio recording...')
  await recorder.start()

  setTimeout(async () => {
    console.log('Stopping audio recording...')
    await recorder.stop()
    console.log('Audio recording saved to audio-recording.mp3')
  }, 3000)
}

async function combinedExample() {
  const recorder = await createRecorder({
    input: 'both',
    output: 'combined-recording.mp4',
    fps: 24,
    quality: 'high',
  })

  console.log('Starting combined recording...')
  await recorder.start()

  setTimeout(async () => {
    console.log('Stopping combined recording...')
    await recorder.stop()
    console.log('Combined recording saved to combined-recording.mp4')
  }, 10000)
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = process.argv[2] || 'basic'

  switch (example) {
    case 'audio':
      audioExample().catch(console.error)
      break
    case 'combined':
      combinedExample().catch(console.error)
      break
    default:
      basicExample().catch(console.error)
  }
}
