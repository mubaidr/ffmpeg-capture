# Cross-Platform Support Guide

This document provides detailed information about cross-platform support in ffmpeg-capture.

## Overview

ffmpeg-capture provides comprehensive cross-platform support for screen and audio recording across macOS, Windows, and Linux. The library automatically detects the platform and uses the most appropriate capture methods, while also allowing manual configuration for advanced use cases.

## Platform Support Matrix

| Platform | Video Capture | Audio Capture | Hardware Acceleration | Multi-Display |
|----------|---------------|---------------|----------------------|---------------|
| macOS    | ✅ AVFoundation | ✅ AVFoundation | ✅ VideoToolbox | ✅ |
| Windows  | ✅ GDI/DirectShow | ✅ DirectShow/WASAPI | ✅ NVENC/QuickSync/AMF | ✅ |
| Linux    | ✅ X11/Wayland | ✅ PulseAudio/ALSA/JACK | ✅ VAAPI | ✅ |

## macOS

### Video Capture
- **Method**: AVFoundation framework
- **Features**: Native hardware acceleration, multi-display support
- **Requirements**: Screen Recording permission in System Preferences

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'macos-recording.mp4',
  screenId: 0, // 0 = main display, 1+ = secondary displays
  fps: 30
})
```

### Audio Capture
- **Method**: AVFoundation framework
- **Device Format**: Numeric index (0, 1, 2, etc.)
- **Requirements**: Microphone permission for audio input

```ts
const recorder = await createRecorder({
  input: 'audio',
  output: 'macos-audio.mp3',
  audioDevice: '0' // Default audio device
})
```

### Combined Capture
macOS supports efficient combined capture using a single AVFoundation input:

```ts
const recorder = await createRecorder({
  input: 'both',
  output: 'macos-combined.mp4',
  screenId: 0,
  audioDevice: '0'
})
```

## Windows

### Video Capture Methods

#### GDI Grab (Default)
- **Best for**: General desktop recording
- **Performance**: Good, widely compatible
- **Limitations**: May not capture some DirectX applications

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'windows-gdi.mp4',
  platformConfig: {
    windowsCaptureMethod: 'gdigrab'
  }
})
```

#### DirectShow
- **Best for**: Application-specific capture
- **Performance**: Variable, depends on drivers
- **Requirements**: Screen capture drivers

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'windows-dshow.mp4',
  platformConfig: {
    windowsCaptureMethod: 'dshow'
  }
})
```

### Audio Capture Methods

#### DirectShow (Default)
- **Device Format**: `audio=DeviceName`
- **Common devices**: "Stereo Mix", "Microphone", "Line In"

```ts
const recorder = await createRecorder({
  input: 'audio',
  output: 'windows-audio.mp3',
  audioDevice: 'Stereo Mix',
  platformConfig: {
    preferredAudioBackend: 'dshow'
  }
})
```

#### WASAPI
- **Better quality**: Lower latency, better quality
- **Device Format**: Device ID or "default"

```ts
const recorder = await createRecorder({
  input: 'audio',
  output: 'windows-wasapi.mp3',
  audioDevice: 'default',
  platformConfig: {
    preferredAudioBackend: 'wasapi'
  }
})
```

### Hardware Acceleration
Windows supports multiple hardware acceleration methods:

- **NVENC**: NVIDIA GPUs (`h264_nvenc`, `hevc_nvenc`)
- **QuickSync**: Intel GPUs (`h264_qsv`, `hevc_qsv`)
- **AMF**: AMD GPUs (`h264_amf`, `hevc_amf`)

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'windows-hw-accel.mp4',
  videoCodec: 'h264_nvenc', // Use NVIDIA hardware encoding
  quality: 'high'
})
```

## Linux

### Display Server Detection

The library automatically detects whether you're running X11 or Wayland:

```ts
import { detectCaptureMethods } from '@mubaidr/ffmpeg-capture'

const methods = await detectCaptureMethods()
console.log(methods.displayServer) // 'x11' or 'wayland'
```

### X11 Capture
- **Method**: x11grab
- **Features**: Stable, widely supported
- **Requirements**: X11 session

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'linux-x11.mp4',
  platformConfig: {
    displayServer: 'x11'
  }
})
```

### Wayland Capture (Experimental)
- **Method**: kmsgrab or portal-based capture
- **Status**: Experimental, limited support
- **Requirements**: Specific Wayland compositors, additional permissions

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'linux-wayland.mp4',
  platformConfig: {
    displayServer: 'wayland'
  }
})
```

### Audio Backends

#### PulseAudio (Default)
- **Most common**: Default on most modern Linux distributions
- **Device format**: Device name or "default"

```ts
const recorder = await createRecorder({
  input: 'audio',
  output: 'linux-pulse.mp3',
  audioDevice: 'default',
  platformConfig: {
    preferredAudioBackend: 'pulse'
  }
})
```

#### ALSA
- **Lower level**: Direct hardware access
- **Device format**: hw:CARD,DEV format

```ts
const recorder = await createRecorder({
  input: 'audio',
  output: 'linux-alsa.mp3',
  audioDevice: 'hw:0,0',
  platformConfig: {
    preferredAudioBackend: 'alsa'
  }
})
```

#### JACK
- **Professional audio**: Low latency, professional workflows
- **Requirements**: JACK daemon running

```ts
const recorder = await createRecorder({
  input: 'audio',
  output: 'linux-jack.mp3',
  audioDevice: 'default',
  platformConfig: {
    preferredAudioBackend: 'jack'
  }
})
```

### Hardware Acceleration
Linux supports VAAPI for hardware acceleration:

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'linux-hw-accel.mp4',
  videoCodec: 'h264_vaapi',
  quality: 'high'
})
```

## Advanced Configuration

### Auto-Detection
The library can automatically detect the best capture methods:

```ts
import { detectCaptureMethods, getAvailableAudioDevices } from '@mubaidr/ffmpeg-capture'

// Detect available methods
const methods = await detectCaptureMethods()
console.log('Video methods:', methods.video)
console.log('Audio methods:', methods.audio)

// Get available audio devices
const audioDevices = await getAvailableAudioDevices()
console.log('Audio devices:', audioDevices)
```

### Quality Presets
Quality presets automatically adjust codec settings:

```ts
// Low quality - fast encoding, larger files
const lowQualityRecorder = await createRecorder({
  input: 'screen',
  output: 'low-quality.mp4',
  quality: 'low' // Uses ultrafast preset, CRF 35
})

// High quality - slow encoding, smaller files
const highQualityRecorder = await createRecorder({
  input: 'screen',
  output: 'high-quality.mp4',
  quality: 'high' // Uses slow preset, CRF 18
})
```

### Custom Codecs
Override automatic codec selection:

```ts
const recorder = await createRecorder({
  input: 'both',
  output: 'custom-codecs.mkv',
  videoCodec: 'libx265', // H.265 for better compression
  audioCodec: 'libopus', // Opus for better audio quality
})
```

## Troubleshooting

### Common Issues

#### macOS
- **Permission denied**: Grant Screen Recording permission in System Preferences
- **Audio not captured**: Grant Microphone permission
- **Multiple displays**: Use correct screenId (0, 1, 2, etc.)

#### Windows
- **No audio devices**: Enable "Stereo Mix" in Sound settings
- **Black screen**: Try different windowsCaptureMethod
- **Performance issues**: Enable hardware acceleration

#### Linux
- **X11 permission denied**: Run `xhost +local:` or check DISPLAY variable
- **Wayland not working**: Switch to X11 session or use portal-based capture
- **Audio issues**: Check PulseAudio/ALSA configuration

### Debug Mode
Enable debug output to troubleshoot issues:

```ts
const recorder = await createRecorder({
  input: 'screen',
  output: 'debug.mp4'
})

// Listen to FFmpeg stderr output
recorder.process?.stderr?.on('data', (data) => {
  console.log('FFmpeg:', data.toString())
})
```

## Performance Tips

1. **Use hardware acceleration** when available
2. **Lower FPS** for better performance (15-24 fps often sufficient)
3. **Choose appropriate quality** preset for your use case
4. **Use platform-native methods** (avoid forcing specific backends)
5. **Monitor system resources** during recording

## Examples

See the `examples/` directory for complete working examples:
- `basic-usage.ts` - Simple cross-platform examples
- `cross-platform-usage.ts` - Advanced platform-specific features
