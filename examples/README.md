# Examples

This directory contains example usage of the ffmpeg-capture library.

## Running Examples

Make sure you have built the project first:

```bash
npm run build
```

Then run the examples:

```bash
# Basic screen recording
npm run start examples/basic-usage.ts

# Audio only recording
npm run start examples/basic-usage.ts audio

# Combined screen + audio recording
npm run start examples/basic-usage.ts combined
```

## Requirements

- FFmpeg must be installed and available in your PATH, or you can use the bundled ffmpeg-static
- For screen recording: appropriate permissions may be required on some platforms
- For audio recording: microphone access permissions may be required

## Platform Notes

### macOS
- Screen recording requires Screen Recording permission in System Preferences > Security & Privacy
- Audio recording requires Microphone permission

### Windows
- May require running as administrator for some capture methods
- Audio device names can be found using `ffmpeg -list_devices true -f dshow -i dummy`

### Linux
- Requires X11 for screen capture
- Audio capture uses PulseAudio by default
- May need to install additional packages depending on your distribution
