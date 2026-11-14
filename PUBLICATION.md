# FlowFX / okumajs publication

Published on 14 November 2026 under npm account `lucky_1010`.

- npm: https://www.npmjs.com/package/okumajs
- Version: 0.3.0
- npm CDN: https://cdn.jsdelivr.net/npm/okumajs@0.3.0/dist/flowfx.min.js
- GitHub: https://github.com/Luckykumawat/Okumajs
- GitHub release: https://github.com/Luckykumawat/Okumajs/releases/tag/v0.3.0
- GitHub CDN: https://cdn.jsdelivr.net/gh/Luckykumawat/Okumajs@v0.3.0/dist/flowfx.min.js

## Use in a website

```html
<script src="https://cdn.jsdelivr.net/npm/okumajs@0.3.0/dist/flowfx.min.js"></script>
<script>
  const cursor = FlowFX.mouseFollower({ style: 'orbit' });
  // For image effects, call after the target images exist:
  // const fx = FlowFX.imageEffect('.your-gallery', FlowFX.imagePresets['liquid-silk']);
  // fx.ready.catch(console.error);
</script>
```

Or install using `npm install okumajs@0.3.0` and import `{ imageEffect, mouseFollower }` from `okumajs`.

## Verification

- npm publish completed successfully after interactive 2FA authorization.
- npm registry exposes okumajs@0.3.0 with tarball SHA-1 `3a5c652b4a114d05ac08019122424334f4e5cd90`.
- The canonical npm CDN URL downloaded successfully: 522,539 bytes.
- CDN browser bundle exactly matches the local build (SHA-256 `1493eb619b4d27342d291f8e9f5377a33b10dc366b9f658dc8bb06ef1fce8f00`).
- Executing the downloaded IIFE in a JavaScript smoke check exposes FlowFX version 0.3.0, imageEffect, mouseFollower and ten image presets.
- Twelve unit tests and the production build passed during publication.
