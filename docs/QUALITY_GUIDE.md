# Quality Settings Guide

This guide explains the comprehensive quality system in ffmpeg-capture, which provides fine-grained control over video and audio encoding quality to match FFmpeg's capabilities.

## Overview

The library supports three levels of quality control:

1. **Simple Legacy Quality** - Basic `low`, `medium`, `high` settings (deprecated but still supported)
2. **Preset-Based Quality** - Separate video and audio quality presets
3. **Custom Quality** - Direct control over CRF, bitrates, and encoding parameters

## Quality Presets

### Video Quality Presets

| Preset | CRF Value | Description | Use Case |
|--------|-----------|-------------|----------|
| `lossless` | 0 | Perfect quality, largest files | Archival, professional work |
| `visually-lossless` | 15 | Visually perfect quality | High-end production |
| `high` | 18 | High quality, good compression | Content creation, sharing |
| `medium` | 23 | Balanced quality/size | General recording |
| `low` | 28 | Lower quality, smaller files | Quick captures |
| `very-low` | 35 | Lowest quality, smallest files | Previews, drafts |

### Audio Quality Presets

| Preset | Bitrate/Codec | Description | Use Case |
|--------|---------------|-------------|----------|
| `lossless` | FLAC/320k+ | Perfect audio quality | Music, professional audio |
| `high` | 256k | High quality audio | Content creation |
| `medium` | 128k | Good quality audio | General recording |
| `low` | 96k | Lower quality audio | Voice recording |
| `very-low` | 64k | Lowest quality audio | Minimal file size |

### Encoding Speed Presets

| Preset | Speed | Compression | Description |
|--------|-------|-------------|-------------|
| `ultrafast` | ⚡⚡⚡⚡⚡ | ⭐ | Fastest encoding, largest files |
| `superfast` | ⚡⚡⚡⚡ | ⭐⭐ | Very fast encoding |
| `veryfast` | ⚡⚡⚡ | ⭐⭐ | Fast encoding |
| `faster` | ⚡⚡⚡ | ⭐⭐⭐ | Faster than default |
| `fast` | ⚡⚡ | ⭐⭐⭐ | Fast encoding |
| `medium` | ⚡⚡ | ⭐⭐⭐ | Default balanced speed |
| `slow` | ⚡ | ⭐⭐⭐⭐ | Slower encoding, better compression |
| `slower` | ⚡ | ⭐⭐⭐⭐ | Much slower encoding |
| `veryslow` | ⚡ | ⭐⭐⭐⭐⭐ | Slowest encoding, best compression |
| `placebo` | ⚡ | ⭐⭐⭐⭐⭐ | Extremely slow, diminishing returns |

## Usage Examples

### Basic Quality Settings

```typescript
import { createRecorder } from '@mubaidr/ffmpeg-capture'

// Simple preset-based quality
const recorder = await createRecorder({
  input: 'screen',
  output: 'recording.mp4',
  videoQuality: 'high',
  audioQuality: 'medium',
  encodingSpeed: 'fast'
})
```

### Custom Quality Control

```typescript
// Direct CRF and bitrate control
const customRecorder = await createRecorder({
  input: 'both',
  output: 'custom.mp4',
  crf: 20, // Custom CRF value (0-51)
  videoBitrate: '2M', // 2 Mbps video bitrate
  audioBitrate: '192k', // 192 kbps audio bitrate
  encodingSpeed: 'medium'
})
```

### Lossless Recording

```typescript
// Perfect quality recording
const losslessRecorder = await createRecorder({
  input: 'both',
  output: 'lossless.mkv', // MKV supports lossless better
  videoQuality: 'lossless', // CRF 0
  audioQuality: 'lossless', // FLAC codec
  encodingSpeed: 'veryslow' // Best compression
})
```

### Use Case Recommendations

```typescript
import { getRecommendedQuality } from '@mubaidr/ffmpeg-capture'

// Get optimized settings for specific use cases
const streamingSettings = getRecommendedQuality('streaming')
const archivalSettings = getRecommendedQuality('archival')
const previewSettings = getRecommendedQuality('preview')
const sharingSettings = getRecommendedQuality('sharing')

// Use recommended settings
const recorder = await createRecorder({
  input: 'screen',
  output: 'stream.mp4',
  ...streamingSettings
})
```

## Quality vs Performance Trade-offs

### File Size Comparison (approximate)

For a 10-minute 1080p screen recording:

| Quality Setting | File Size | Encoding Time | Quality |
|----------------|-----------|---------------|---------|
| `very-low` + `ultrafast` | ~50 MB | 30 seconds | Poor |
| `low` + `veryfast` | ~100 MB | 1 minute | Acceptable |
| `medium` + `medium` | ~200 MB | 3 minutes | Good |
| `high` + `slow` | ~400 MB | 8 minutes | Excellent |
| `lossless` + `veryslow` | ~2 GB | 20 minutes | Perfect |

### Recommended Settings by Use Case

#### Real-time Streaming
```typescript
{
  videoQuality: 'medium',
  audioQuality: 'medium',
  encodingSpeed: 'veryfast'
}
```
- **Priority**: Speed over quality
- **File size**: Medium
- **Encoding time**: Very fast

#### Content Creation
```typescript
{
  videoQuality: 'high',
  audioQuality: 'high',
  encodingSpeed: 'medium'
}
```
- **Priority**: Good balance of quality and time
- **File size**: Large
- **Encoding time**: Moderate

#### Archival/Professional
```typescript
{
  videoQuality: 'visually-lossless',
  audioQuality: 'lossless',
  encodingSpeed: 'veryslow'
}
```
- **Priority**: Maximum quality
- **File size**: Very large
- **Encoding time**: Very slow

#### Quick Previews
```typescript
{
  videoQuality: 'low',
  audioQuality: 'low',
  encodingSpeed: 'ultrafast'
}
```
- **Priority**: Speed and small file size
- **File size**: Small
- **Encoding time**: Very fast

## Advanced Quality Features

### Hardware Acceleration

The library automatically detects and uses hardware acceleration when available:

- **Windows**: NVENC (NVIDIA), QuickSync (Intel), AMF (AMD)
- **macOS**: VideoToolbox (Apple Silicon/Intel)
- **Linux**: VAAPI (Intel), NVENC (NVIDIA)

Hardware acceleration provides:
- Faster encoding times
- Lower CPU usage
- Similar quality to software encoding

### Codec-Specific Optimizations

#### H.264 (libx264)
- Uses CRF for quality control
- Supports all encoding speed presets
- Best compatibility

#### H.265 (libx265)
- Better compression than H.264
- Slower encoding
- Requires modern players

#### Audio Codecs
- **AAC**: Default, good compatibility
- **Opus**: Better quality at low bitrates
- **FLAC**: Lossless compression

### Custom Codec Examples

```typescript
// H.265 with high quality
const h265Recorder = await createRecorder({
  input: 'screen',
  output: 'h265.mp4',
  videoCodec: 'libx265',
  videoQuality: 'high',
  encodingSpeed: 'medium'
})

// Opus audio for better compression
const opusRecorder = await createRecorder({
  input: 'audio',
  output: 'audio.webm',
  audioCodec: 'libopus',
  audioQuality: 'high'
})
```

## Quality Validation

The library validates quality settings and provides helpful error messages:

```typescript
// This will throw an error
try {
  await createRecorder({
    input: 'screen',
    output: 'test.mp4',
    crf: 60 // Invalid: CRF must be 0-51
  })
}
catch (error) {
  console.log(error.message) // "CRF must be between 0 and 51"
}
```

## Getting Quality Information

```typescript
import { getQualityPresets } from '@mubaidr/ffmpeg-capture'

// Get all available quality presets with descriptions
const presets = getQualityPresets()

console.log(presets.videoQuality)
// [
//   { value: 'lossless', description: 'Perfect quality, largest files (CRF 0)' },
//   { value: 'high', description: 'High quality (CRF 18)' },
//   ...
// ]
```

## Migration from Legacy Quality

If you're using the old `quality` option, here's how to migrate:

```typescript
// Old way (still works but deprecated)
const oldRecorder = await createRecorder({
  input: 'screen',
  output: 'old.mp4',
  quality: 'high' // Maps to: encodingSpeed: 'slow', CRF: 18
})

// New way (recommended)
const newRecorder = await createRecorder({
  input: 'screen',
  output: 'new.mp4',
  videoQuality: 'high', // CRF 18
  audioQuality: 'high', // 256k bitrate
  encodingSpeed: 'slow' // Better compression
})
```

## Best Practices

1. **Start with presets**: Use `getRecommendedQuality()` for your use case
2. **Test settings**: Try different quality levels to find the right balance
3. **Consider hardware**: Use hardware acceleration when available
4. **Monitor resources**: Higher quality settings use more CPU/time
5. **Choose appropriate codecs**: H.265 for better compression, H.264 for compatibility
6. **Use lossless sparingly**: Only when perfect quality is required
7. **Optimize for target**: Different settings for streaming vs archival

## Troubleshooting

### Common Issues

**Encoding too slow**
- Use faster encoding speed preset
- Lower video quality preset
- Enable hardware acceleration

**File size too large**
- Use lower video quality preset
- Increase encoding speed (trades compression for speed)
- Use H.265 codec for better compression

**Quality not good enough**
- Use higher video quality preset
- Use slower encoding speed preset
- Increase custom CRF value (lower = better)

**Audio quality issues**
- Use higher audio quality preset
- Increase audio bitrate
- Use lossless audio for critical applications
