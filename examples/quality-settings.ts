import {
  checkFfmpegAvailability,
  createRecorder,
  getQualityPresets,
  getRecommendedQuality,
} from '../src'

async function demonstrateQualitySettings() {
  console.log('🎥 FFmpeg Quality Settings Demo\n')

  // Check FFmpeg availability
  const isAvailable = await checkFfmpegAvailability()
  if (!isAvailable) {
    console.error('FFmpeg is not available. Please install FFmpeg or ffmpeg-static.')
    return
  }

  // Show available quality presets
  console.log('📊 Available Quality Presets:')
  const presets = getQualityPresets()

  console.log('\n🎬 Video Quality Presets:')
  presets.videoQuality.forEach((preset) => {
    console.log(`  ${preset.value.padEnd(20)} - ${preset.description}`)
  })

  console.log('\n🎵 Audio Quality Presets:')
  presets.audioQuality.forEach((preset) => {
    console.log(`  ${preset.value.padEnd(20)} - ${preset.description}`)
  })

  console.log('\n⚡ Encoding Speed Presets:')
  presets.encodingSpeed.forEach((preset) => {
    console.log(`  ${preset.value.padEnd(20)} - ${preset.description}`)
  })

  // Show recommended settings for different use cases
  console.log('\n🎯 Recommended Settings by Use Case:')
  const useCases = ['streaming', 'archival', 'preview', 'sharing'] as const

  useCases.forEach((useCase) => {
    const recommended = getRecommendedQuality(useCase)
    console.log(`\n${useCase.toUpperCase()}:`)
    console.log(`  Video Quality: ${recommended.videoQuality}`)
    console.log(`  Audio Quality: ${recommended.audioQuality}`)
    console.log(`  Encoding Speed: ${recommended.encodingSpeed}`)
    console.log(`  Description: ${recommended.description}`)
  })

  // Demonstrate different quality examples
  await demonstrateQualityExamples()
}

async function demonstrateQualityExamples() {
  console.log('\n🔧 Quality Examples:\n')

  // Example 1: Legacy simple quality
  console.log('1. Legacy Simple Quality (backward compatibility):')
  const legacyRecorder = await createRecorder({
    input: 'screen',
    output: 'legacy-quality.mp4',
    quality: 'high', // Maps to slow preset + CRF 18
  })
  console.log('   ✅ Created with legacy quality setting')

  // Example 2: New detailed quality system
  console.log('\n2. Detailed Quality System:')
  const detailedRecorder = await createRecorder({
    input: 'screen',
    output: 'detailed-quality.mp4',
    videoQuality: 'visually-lossless',
    audioQuality: 'high',
    encodingSpeed: 'medium',
  })
  console.log('   ✅ Created with detailed quality presets')

  // Example 3: Custom CRF and bitrates
  console.log('\n3. Custom CRF and Bitrates:')
  const customRecorder = await createRecorder({
    input: 'both',
    output: 'custom-quality.mp4',
    crf: 15, // Custom CRF value
    videoBitrate: '4M', // 4 Mbps video
    audioBitrate: '256k', // 256 kbps audio
    encodingSpeed: 'slow',
  })
  console.log('   ✅ Created with custom CRF and bitrates')

  // Example 4: Lossless recording
  console.log('\n4. Lossless Recording:')
  const losslessRecorder = await createRecorder({
    input: 'both',
    output: 'lossless-recording.mkv', // Use MKV for better lossless support
    videoQuality: 'lossless',
    audioQuality: 'lossless',
    encodingSpeed: 'veryslow',
  })
  console.log('   ✅ Created lossless recorder (FLAC audio + CRF 0 video)')

  // Example 5: Fast streaming quality
  console.log('\n5. Fast Streaming Quality:')
  const streamingSettings = getRecommendedQuality('streaming')
  const streamingRecorder = await createRecorder({
    input: 'screen',
    output: 'streaming-quality.mp4',
    ...streamingSettings,
  })
  console.log('   ✅ Created with optimized streaming settings')

  // Example 6: Custom codec with quality
  console.log('\n6. Custom Codec with Quality Settings:')
  const codecRecorder = await createRecorder({
    input: 'both',
    output: 'custom-codec.mkv',
    videoCodec: 'libx265', // H.265 codec
    audioCodec: 'libopus', // Opus codec
    videoQuality: 'high',
    audioQuality: 'high',
    encodingSpeed: 'medium',
  })
  console.log('   ✅ Created with custom codecs and quality settings')

  console.log('\n🎉 All quality examples created successfully!')
  console.log('\nNote: These examples create recorder instances but do not start recording.')
  console.log('To actually record, call recorder.start() and later recorder.stop()')
}

async function demonstrateQualityComparison() {
  console.log('\n📈 Quality vs File Size vs Speed Comparison:\n')

  const qualities = [
    { name: 'Ultra Fast (Preview)', videoQuality: 'very-low', encodingSpeed: 'ultrafast' },
    { name: 'Fast (Streaming)', videoQuality: 'medium', encodingSpeed: 'veryfast' },
    { name: 'Balanced (Default)', videoQuality: 'medium', encodingSpeed: 'medium' },
    { name: 'High Quality', videoQuality: 'high', encodingSpeed: 'slow' },
    { name: 'Archival Quality', videoQuality: 'visually-lossless', encodingSpeed: 'veryslow' },
  ] as const

  qualities.forEach((quality, index) => {
    console.log(`${index + 1}. ${quality.name}:`)
    console.log(`   Video Quality: ${quality.videoQuality}`)
    console.log(`   Encoding Speed: ${quality.encodingSpeed}`)

    // Estimate relative characteristics
    const speedScore = getSpeedScore(quality.encodingSpeed)
    const qualityScore = getQualityScore(quality.videoQuality)
    const sizeScore = getSizeScore(quality.videoQuality, quality.encodingSpeed)

    console.log(`   Encoding Speed: ${'⚡'.repeat(speedScore)} (${speedScore}/5)`)
    console.log(`   Quality Level:  ${'⭐'.repeat(qualityScore)} (${qualityScore}/5)`)
    console.log(`   File Size:      ${'📦'.repeat(sizeScore)} (${sizeScore}/5)`)
    console.log('')
  })
}

function getSpeedScore(speed: string): number {
  const speedMap: Record<string, number> = {
    ultrafast: 5,
    superfast: 5,
    veryfast: 4,
    faster: 4,
    fast: 3,
    medium: 3,
    slow: 2,
    slower: 1,
    veryslow: 1,
    placebo: 1,
  }
  return speedMap[speed] || 3
}

function getQualityScore(quality: string): number {
  const qualityMap: Record<string, number> = {
    'very-low': 1,
    'low': 2,
    'medium': 3,
    'high': 4,
    'visually-lossless': 5,
    'lossless': 5,
  }
  return qualityMap[quality] || 3
}

function getSizeScore(quality: string, speed: string): number {
  const qualitySize = getQualityScore(quality)
  const speedSize = 6 - getSpeedScore(speed) // Inverse of speed
  return Math.min(5, Math.max(1, Math.round((qualitySize + speedSize) / 2)))
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = process.argv[2] || 'basic'

  switch (demo) {
    case 'comparison':
      demonstrateQualityComparison().catch(console.error)
      break
    default:
      demonstrateQualitySettings().catch(console.error)
  }
}
