# ffmpeg-capture

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

_A high-level, cross-platform screen/audio recording utility for Node.js and Electron apps using FFmpeg under the hood. Simple API. No native dependencies._

---

## ⚙️ Features

- ✅ Cross-platform (macOS, Windows, Linux)
- 🧠 Zero native dependencies (pure Node.js + FFmpeg binary)
- 🎙 Screen, audio, or combined capture
- 🐚 Streams or saves output directly
- 🧵 Async, Promise-based API
- ⚡️ Fast integration into Electron or Node.js

---

## 🚀 Installation

```bash
npm install @mubaidr/ffmpeg-capture
# or
yarn add @mubaidr/ffmpeg-capture
```

Make sure `ffmpeg` is available in your `PATH`. You can bundle it or install it globally.

---

## ✨ Usage

```ts
import { createRecorder } from '@mubaidr/ffmpeg-capture'

const recorder = await createRecorder({
	input: 'screen', // or 'audio' or 'both'
	output: 'recording.mp4',
	fps: 30,
	audioDevice: 'default', // optional
	screenId: 0, // optional, platform-specific
})

await recorder.start()

setTimeout(async () => {
	await recorder.stop()
	console.log('Recording saved.')
}, 10000)
```

---

## 🔧 Options

| Option        | Type     | Description                           |
|---------------|----------|---------------------------------------|
| `input`       | string   | `'screen' | 'audio' | 'both'`         |
| `output`      | string   | Path to save the recording            |
| `fps`         | number   | Frames per second (default: 30)       |
| `screenId`    | number   | Specific screen to capture            |
| `audioDevice` | string   | Audio input device name (platform-specific) |

---

## 💡 Use Cases

- Build in-app screen recording in Electron
- Remote debugging / user session recording
- Audio transcription pipelines
- Automated UI/QA capture in CI

---

## 📦 Bundling FFmpeg

You can optionally bundle static FFmpeg binaries using [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static):

```bash
npm install ffmpeg-static
```

And pass its path:

```ts
import ffmpegPath from 'ffmpeg-static'

createRecorder({ ffmpegPath, ... })
```

---

## 🧪 Roadmap

- [ ] Audio level metering
- [ ] Stream mode via `Readable`
- [ ] Capture system + mic audio separately
- [ ] Browser extension compatibility

---

## 🧠 Inspiration

Built to replace clunky native modules and democratize cross-platform capture for modern apps. One API. Zero friction.

---

## 📜 License

MIT © [Muhammad Ubaid Raza](https://mubaidr.js.org)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/ffmpeg-capture?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/ffmpeg-capture
[npm-downloads-src]: https://img.shields.io/npm/dm/ffmpeg-capture?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/ffmpeg-capture
[bundle-src]: https://img.shields.io/bundlephobia/minzip/ffmpeg-capture?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=ffmpeg-capture
[license-src]: https://img.shields.io/github/license/mubaidr/ffmpeg-capture.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/mubaidr/ffmpeg-capture/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/ffmpeg-capture
