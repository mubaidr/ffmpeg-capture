# 🎥 FFmpeg Capture

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]
[![CI][ci-src]][ci-href]

> **A high-level, cross-platform screen/audio recording utility for Node.js and Electron apps using FFmpeg under the hood. Simple API. No native dependencies.**

✨ **Perfect for building screen recording features, automated testing, content creation tools, and more!**

---

## ⚙️ Features

### 🌍 **Cross-Platform Excellence**
- ✅ **macOS**: AVFoundation with VideoToolbox acceleration
- ✅ **Windows**: GDI/DirectShow with NVENC/QuickSync/AMF support
- ✅ **Linux**: X11/Wayland with VAAPI acceleration

### 🎯 **Capture Modes**
- 🖥️ **Screen recording** with multi-display support
- 🎙️ **Audio recording** with multiple backend support
- 🎬 **Combined capture** with synchronized audio/video
- 📱 **Flexible input sources** and device selection

### ⚡ **Performance & Quality**
- 🚀 **Hardware acceleration** auto-detection
- 🎛️ **Professional quality controls** (CRF, bitrates, presets)
- ⚡ **FFmpeg preset system** (ultrafast to placebo)
- 🎨 **Custom codec support** (H.264, H.265, VP9, AV1)
- 🔊 **Advanced audio** (AAC, Opus, FLAC, lossless)

### 🛠️ **Developer Experience**
- 🧠 **Zero native dependencies** (pure Node.js + FFmpeg)
- 📦 **TypeScript support** with full type definitions
- 🧵 **Promise-based API** with async/await
- 🎯 **Quality presets** for different use cases
- 📚 **Comprehensive documentation** and examples
- 🧪 **Extensive test coverage**

---

## 🚀 Quick Start

### Installation

```bash
npm install @mubaidr/ffmpeg-capture
```

### Basic Usage

```typescript
import { createRecorder } from '@mubaidr/ffmpeg-capture'

// Simple screen recording
const recorder = await createRecorder({
  input: 'screen',
  output: 'my-recording.mp4'
})

await recorder.start()
// ... record for some time
await recorder.stop()
```

### FFmpeg Setup

The library requires FFmpeg to be available. You have several options:

#### Option 1: Use bundled FFmpeg (Recommended)
```bash
npm install ffmpeg-static
```

#### Option 2: System FFmpeg
Install FFmpeg on your system and ensure it's in your PATH:
- **macOS**: `brew install ffmpeg`
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- **Linux**: `sudo apt install ffmpeg` (Ubuntu/Debian)

---

## 📖 Examples

### Basic Screen Recording

```typescript
import { createRecorder } from '@mubaidr/ffmpeg-capture'

const recorder = await createRecorder({
  input: 'screen',
  output: 'screen-recording.mp4',
  fps: 30,
  videoQuality: 'high'
})

await recorder.start()
console.log('Recording started...')

// Stop after 10 seconds
setTimeout(async () => {
  await recorder.stop()
  console.log('Recording saved!')
}, 10000)
```

### Audio Recording

```typescript
const audioRecorder = await createRecorder({
  input: 'audio',
  output: 'audio-recording.mp3',
  audioQuality: 'high',
  audioDevice: 'default'
})

await audioRecorder.start()
// Record audio...
await audioRecorder.stop()
```

### Combined Audio + Video

```typescript
const recorder = await createRecorder({
  input: 'both',
  output: 'presentation.mp4',
  fps: 24,
  videoQuality: 'high',
  audioQuality: 'high',
  encodingSpeed: 'medium'
})

await recorder.start()
// Record presentation...
await recorder.stop()
```

### Advanced Quality Control

```typescript
// Custom quality settings
const recorder = await createRecorder({
  input: 'screen',
  output: 'high-quality.mp4',
  crf: 18, // Custom quality (lower = better)
  videoBitrate: '4M', // 4 Mbps video
  audioBitrate: '256k', // 256 kbps audio
  encodingSpeed: 'slow', // Better compression
  videoCodec: 'libx265', // H.265 codec
  audioCodec: 'libopus' // Opus audio
})
```

### Platform-Specific Configuration

```typescript
import { createRecorder, detectCaptureMethods } from '@mubaidr/ffmpeg-capture'

// Detect available capture methods
const methods = await detectCaptureMethods()
console.log('Available methods:', methods)

// Platform-specific settings
const recorder = await createRecorder({
  input: 'screen',
  output: 'recording.mp4',
  platformConfig: {
    displayServer: 'x11', // Linux: force X11
    windowsCaptureMethod: 'gdigrab', // Windows: use GDI
    preferredAudioBackend: 'pulse' // Linux: use PulseAudio
  }
})
```

### Quality Presets

```typescript
import { getQualityPresets, getRecommendedQuality } from '@mubaidr/ffmpeg-capture'

// Get quality presets
const presets = getQualityPresets()
console.log('Video qualities:', presets.videoQuality)

// Use recommended settings
const streamingQuality = getRecommendedQuality('streaming')
const archivalQuality = getRecommendedQuality('archival')

const recorder = await createRecorder({
  input: 'both',
  output: 'stream.mp4',
  ...streamingQuality // Apply recommended settings
})
```

---

## 🔧 Options

| Option           | Type     | Description                           |
|------------------|----------|---------------------------------------|
| `input`          | string   | `'screen' | 'audio' | 'both'`         |
| `output`         | string   | Path to save the recording            |
| `fps`            | number   | Frames per second (default: 30)       |
| `screenId`       | number   | Specific screen to capture            |
| `audioDevice`    | string   | Audio input device name (platform-specific) |
| `ffmpegPath`     | string   | Custom FFmpeg binary path             |
| `videoCodec`     | string   | Custom video codec (e.g., 'libx265') |
| `audioCodec`     | string   | Custom audio codec (e.g., 'libopus') |
| `quality`        | string   | Legacy quality setting (deprecated)  |
| `videoQuality`   | string   | Video quality preset (see below)     |
| `audioQuality`   | string   | Audio quality preset (see below)     |
| `encodingSpeed`  | string   | Encoding speed preset (see below)    |
| `crf`            | number   | Custom CRF value (0-51, lower = better) |
| `videoBitrate`   | string   | Custom video bitrate (e.g., '2M')    |
| `audioBitrate`   | string   | Custom audio bitrate (e.g., '128k')  |
| `platformConfig` | object   | Platform-specific configuration      |

### Quality Settings

The library now supports FFmpeg's comprehensive quality system:

#### Video Quality Presets
- `lossless` - Perfect quality, largest files (CRF 0)
- `visually-lossless` - Visually perfect (CRF 15)
- `high` - High quality (CRF 18)
- `medium` - Good quality (CRF 23)
- `low` - Lower quality (CRF 28)
- `very-low` - Lowest quality (CRF 35)

#### Audio Quality Presets
- `lossless` - Perfect audio quality (FLAC or 320k+)
- `high` - High quality (256k)
- `medium` - Good quality (128k)
- `low` - Lower quality (96k)
- `very-low` - Lowest quality (64k)

#### Encoding Speed Presets
- `ultrafast` - Fastest encoding, largest file size
- `superfast` - Very fast encoding
- `veryfast` - Fast encoding
- `faster` - Faster than default
- `fast` - Fast encoding
- `medium` - Default balanced speed
- `slow` - Slower encoding, better compression
- `slower` - Much slower encoding
- `veryslow` - Slowest encoding, best compression
- `placebo` - Extremely slow, diminishing returns

### Platform Configuration

The `platformConfig` option allows fine-tuning for specific platforms:

```ts
{
  displayServer?: 'x11' | 'wayland' | 'auto'        // Linux only
  windowsCaptureMethod?: 'gdigrab' | 'dshow' | 'auto' // Windows only
  preferredAudioBackend?: string                     // Platform-specific
}
```

### Quality Examples

```ts
import { createRecorder, getQualityPresets, getRecommendedQuality } from '@mubaidr/ffmpeg-capture'

// Get available quality presets
const presets = getQualityPresets()
console.log(presets.videoQuality) // Array of video quality options

// Get recommended settings for different use cases
const streamingQuality = getRecommendedQuality('streaming')
const archivalQuality = getRecommendedQuality('archival')

// Use detailed quality settings
const recorder = await createRecorder({
  input: 'both',
  output: 'high-quality.mp4',
  videoQuality: 'high', // CRF 18
  audioQuality: 'high', // 256k bitrate
  encodingSpeed: 'medium' // Balanced speed
})

// Custom quality with CRF and bitrates
const customRecorder = await createRecorder({
  input: 'screen',
  output: 'custom.mp4',
  crf: 20, // Custom CRF value
  videoBitrate: '2M', // 2 Mbps video
  audioBitrate: '192k', // 192 kbps audio
  encodingSpeed: 'fast'
})

// Lossless recording
const losslessRecorder = await createRecorder({
  input: 'both',
  output: 'lossless.mkv',
  videoQuality: 'lossless', // CRF 0
  audioQuality: 'lossless', // FLAC codec
  encodingSpeed: 'veryslow'
})
```

---

## 🌍 Cross-Platform Support

### macOS
- **Video**: AVFoundation framework
- **Audio**: AVFoundation framework
- **Features**: Native hardware acceleration, multi-display support

### Windows
- **Video**: GDI grab (default), DirectShow
- **Audio**: DirectShow (default), WASAPI
- **Features**: Hardware acceleration (NVENC, QuickSync, AMF)

### Linux
- **Video**: X11 grab, Wayland (experimental)
- **Audio**: PulseAudio (default), ALSA, JACK
- **Features**: Multiple display server support, hardware acceleration (VAAPI)

### Advanced Usage

```ts
import { createRecorder, detectCaptureMethods } from '@mubaidr/ffmpeg-capture'

// Detect available methods
const methods = await detectCaptureMethods()
console.log(methods) // { video: ['x11grab'], audio: ['pulse'], displayServer: 'x11' }

// Platform-specific configuration
const recorder = await createRecorder({
  input: 'both',
  output: 'recording.mp4',
  platformConfig: {
    displayServer: 'x11', // Linux: force X11 over Wayland
    windowsCaptureMethod: 'gdigrab', // Windows: use GDI grab
    preferredAudioBackend: 'pulse' // Linux: use PulseAudio
  }
})
```

---

## 📚 API Reference

### `createRecorder(options: RecorderOptions): Promise<Recorder>`

Creates a new recorder instance with the specified options.

```typescript
interface RecorderOptions {
  input: 'screen' | 'audio' | 'both'
  output: string
  fps?: number
  screenId?: number
  audioDevice?: string
  ffmpegPath?: string
  videoCodec?: string
  audioCodec?: string

  // Quality options
  videoQuality?: VideoQualityPreset
  audioQuality?: AudioQualityPreset
  encodingSpeed?: QualityLevel
  crf?: number
  videoBitrate?: string
  audioBitrate?: string

  // Platform configuration
  platformConfig?: PlatformConfig
}
```

### `Recorder` Interface

```typescript
interface Recorder {
  start: () => Promise<void>
  stop: () => Promise<void>
  process: ChildProcess | null
  isRecording: boolean
}
```

### Utility Functions

#### `getQualityPresets(): QualityPresets`
Returns all available quality presets with descriptions.

#### `getRecommendedQuality(useCase): RecommendedSettings`
Returns optimized settings for specific use cases:
- `'streaming'` - Fast encoding for real-time streaming
- `'archival'` - Best quality for long-term storage
- `'preview'` - Quick encoding for previews
- `'sharing'` - Balanced quality for sharing online

#### `detectCaptureMethods(): Promise<CaptureMethods>`
Detects available capture methods for the current platform.

#### `checkFfmpegAvailability(path?): Promise<boolean>`
Checks if FFmpeg is available in the system.

#### `getAvailableAudioDevices(): Promise<string[]>`
Returns list of available audio devices (platform-specific).

#### `validateRecorderOptions(options): void`
Validates recorder options and throws descriptive errors.

---

## 💡 Use Cases

### 🎬 **Content Creation**
- Screen recording for tutorials and demos
- Game recording and streaming
- Video documentation and training materials
- Live streaming with screen capture

### 🛠️ **Development & Testing**
- Automated UI testing with video evidence
- Bug reproduction and debugging
- CI/CD integration for visual regression testing
- User session recording for analytics

### 📱 **Applications**
- Electron app screen recording features
- Desktop applications with capture functionality
- Remote desktop and support tools
- Educational software with recording capabilities

### 🎙️ **Audio Applications**
- Podcast recording and production
- Voice memo applications
- Audio transcription pipelines
- Music and sound recording tools

---

## 🔧 Advanced Configuration

### Custom FFmpeg Path

```typescript
import ffmpegPath from 'ffmpeg-static'

const recorder = await createRecorder({
  input: 'screen',
  output: 'recording.mp4',
  ffmpegPath: ffmpegPath || '/custom/path/to/ffmpeg'
})
```

### Error Handling

```typescript
try {
  const recorder = await createRecorder({
    input: 'screen',
    output: 'recording.mp4'
  })

  await recorder.start()

  // Handle recording errors
  recorder.process?.on('error', (error) => {
    console.error('Recording error:', error)
  })

  await recorder.stop()
}
catch (error) {
  console.error('Failed to create recorder:', error.message)
}
```

### Multi-Display Setup

```typescript
// Record from specific display (macOS/Windows)
const recorder = await createRecorder({
  input: 'screen',
  output: 'display-1.mp4',
  screenId: 1 // Second display
})
```

---

## 🐛 Troubleshooting

### Common Issues

#### FFmpeg Not Found
```bash
Error: FFmpeg path not found
```
**Solution**: Install ffmpeg-static or ensure FFmpeg is in your PATH.

#### Permission Denied (macOS)
```bash
Error: Screen recording permission denied
```
**Solution**: Grant Screen Recording permission in System Preferences > Security & Privacy.

#### Audio Device Not Found
```bash
Error: Audio device not available
```
**Solution**: Check available devices with `getAvailableAudioDevices()`.

#### High CPU Usage
**Solution**: Use hardware acceleration or lower quality settings:
```typescript
const recorder = await createRecorder({
  input: 'screen',
  output: 'recording.mp4',
  encodingSpeed: 'ultrafast', // Faster encoding
  videoQuality: 'medium' // Lower quality
})
```

### Debug Mode

Enable debug output to troubleshoot issues:

```typescript
const recorder = await createRecorder({
  input: 'screen',
  output: 'recording.mp4'
})

// Listen to FFmpeg output
recorder.process?.stderr?.on('data', (data) => {
  console.log('FFmpeg:', data.toString())
})
```

---

## 🧪 Roadmap

- [ ] **Real-time streaming** support via RTMP/WebRTC
- [ ] **Audio level metering** and visualization
- [ ] **Stream mode** via Node.js Readable streams
- [ ] **Capture regions** for partial screen recording
- [ ] **Webcam integration** for picture-in-picture
- [ ] **Browser extension** compatibility
- [ ] **Cloud storage** integration (AWS S3, Google Cloud)
- [ ] **Live transcription** with speech-to-text
- [ ] **Video editing** features (trim, merge, effects)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/mubaidr/ffmpeg-capture.git
cd ffmpeg-capture

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run examples
npm run start examples/basic-usage.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📄 License

MIT © [Muhammad Ubaid Raza](https://mubaidr.js.org)

---

## 🙏 Acknowledgments

- **FFmpeg team** for the amazing multimedia framework
- **Node.js community** for the excellent ecosystem
- **Contributors** who help make this project better

---

## 🔗 Related Projects

- [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) - Static FFmpeg binaries
- [node-ffmpeg](https://github.com/damianociarla/node-ffmpeg) - FFmpeg wrapper for Node.js
- [electron-screen-recorder](https://github.com/electron/electron/blob/main/docs/api/desktop-capturer.md) - Electron's built-in screen capture

---

## 💬 Support

- 📖 [Documentation](https://github.com/mubaidr/ffmpeg-capture/tree/main/docs)
- 🐛 [Issue Tracker](https://github.com/mubaidr/ffmpeg-capture/issues)
- 💬 [Discussions](https://github.com/mubaidr/ffmpeg-capture/discussions)
- 📧 [Email Support](mailto:mubaidr@gmail.com)

---

## 📜 License

MIT © [Muhammad Ubaid Raza](https://mubaidr.js.org)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@mubaidr/ffmpeg-capture?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@mubaidr/ffmpeg-capture
[npm-downloads-src]: https://img.shields.io/npm/dm/@mubaidr/ffmpeg-capture?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@mubaidr/ffmpeg-capture
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@mubaidr/ffmpeg-capture?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@mubaidr/ffmpeg-capture
[license-src]: https://img.shields.io/github/license/mubaidr/ffmpeg-capture.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/mubaidr/ffmpeg-capture/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@mubaidr/ffmpeg-capture
[ci-src]: https://img.shields.io/github/actions/workflow/status/mubaidr/ffmpeg-capture/ci.yml?style=flat&colorA=080f12&colorB=1fa669
[ci-href]: https://github.com/mubaidr/ffmpeg-capture/actions/workflows/ci.yml
