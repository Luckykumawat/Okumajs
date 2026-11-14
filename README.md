# FlowFX

**Live demo:** https://luckykumawat.github.io/Okumajs/ · **Documentation:** https://luckykumawat.github.io/Okumajs/guide.html

**Published:** [`okumajs@0.3.0`](https://www.npmjs.com/package/okumajs). [Verified npm CDN](https://cdn.jsdelivr.net/npm/okumajs@0.3.0/dist/flowfx.min.js). Browser API remains `FlowFX`.

A working, framework-independent Three.js image-effects MVP. Original GLSL shaders, image hover response, click ripples, multi-image transitions and scroll control. This is inspired by the supplied interaction brief; it does not wrap or copy Shery.js.

## Run the lab

Requires Node.js 20+ and npm. From this folder:

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Keep the terminal running; Ctrl+C stops it. The included demo and browser bundle are prebuilt, so `npm run dev` alone works without installing dependencies. `file://` is not supported; use HTTP for image/preset loading.

The demo uses original local SVG artworks. There are no runtime image, font or third-party script requests. Replace them with your own photographs to use the same effects with photography.

## Live card customization

Every animation card now includes independent speed, intensity and color controls, a live full-code preview, Copy my settings and Reset. Image and scroll cards apply intensity directly to the shader and use the selected color for the HTML frame and transparent edge cutouts. That frame color is exported as CSS in the snippet, not as an unsupported library option. Cursor cards use color for the actual follower and map intensity to size/spread; speed controls following response. Changes also apply to a selected page-wide cursor. Reset restores only the selected card. All copied snippets continue to use the published okumajs@0.3.0 CDN.

The demo and documentation use a midnight-blue, cyan and coral interface theme.

## Demo categories

The lab now uses separate tabs: **Hover & Click** (10 image card designs and playground), **Mouse Followers** (10 cursor styles), **Scroll Animations** (4 studies + multi-image scroll), and **Get Started** (integration and publishing).

Only the selected panel is visible. Switch with the tab buttons or Left/Right/Home/End keys. Category selection is reflected in the URL and supports browser Back/Forward. Direct links: `/#hover`, `/#mouse-followers`, `/#scroll-animations`, `/#get-started`. Older section links such as `/#followers`, `/#edge-lab` and `/#study-ribbon` automatically select the correct category.

Hidden image and scoped cursor previews stop rendering until their panel becomes visible again. A page-wide cursor explicitly enabled with Use on page remains active across categories until stopped.

## Script-tag integration

Copy `dist/flowfx.min.js` into your website. Three.js is bundled; no separate Three/GSAP dependency scripts and no required CSS file.

```html
<script src="./lib/flowfx.min.js"></script>
<img class="art" src="./your-image.jpg" width="1200" height="900"
     alt="Describe your image" style="width:100%;height:500px;object-fit:cover">
<script>
  const fx = FlowFX.imageEffect('.art', {
    style: 'liquid',
    debug: true,
    config: { intensity: 0.85, speed: 0.9, zoom: 0.5 }
  });
  fx.ready.catch(error => console.error('FlowFX could not start', error));
</script>
```

Call after the elements exist. `ready` resolves after textures load and setup completes; catch failures. Source images remain in the DOM with their alternative text and are hidden visually only after setup. `destroy()` restores original inline opacity/display values.

## New in 0.3: individual card designs and ten mouse followers

Each of the seven collection cards has its own shader, hover motion, edge shape, transition and tuning. The three edge-study cards also have independent presets, and the four scroll studies retain distinct scroll treatments with their own hover behaviors. Copy a card's exact setup from its Copy button or use a named preset:

```js
const image = FlowFX.imageEffect('.your-gallery', {
  ...FlowFX.imagePresets['cyber-mosaic']
});
image.ready.catch(console.error);
```

| Preset | Hover motion | Edge | Image transition |
| --- | --- | --- | --- |
| `liquid-silk` | Tilt | Wave | Liquid |
| `vortex-distortion` | Swirl | Orbit | Radial |
| `elastic-terrain` | Fold | Diamond | Ribbon |
| `wind-sculpture` | Lift | Curtain | Slide |
| `radial-ripple` | Ripple | Blob | Zoom |
| `perlin-drift` | Stretch | Scallop | Diagonal |
| `cyber-mosaic` | Glitch | Cut | Pixel |
| `tidal-edges` | Stretch | Wave | Radial |
| `living-silhouette` | Swirl | Blob | Liquid |
| `scalloped-frame` | Tilt | Scallop | Diagonal |

`hoverMotion` and `transition` are top-level imageEffect options. `hoverMotion: 'none'` disables extra hover geometry; a missing `transition` retains the original liquid/crossfade behavior. Explicit non-liquid transitions take priority over the gooey blend mask. Exported presets include both names. Older JSON presets still load.

### Mouse followers

Use the same browser bundle, with no extra CSS:

```html
<script src="./lib/flowfx.min.js"></script>
<script>
  const cursor = FlowFX.mouseFollower({
    style: 'orbit',
    color: '#b29aff',
    accent: '#f5ceff',
    size: 32,
    speed: 12
  });
  // cursor.destroy(); // Remove when unmounting.
</script>
```

| Style | Default palette | Distinct behavior |
| --- | --- | --- |
| `aura` | Mint / pale lime | Elastic ring with radial glow |
| `orbit` | Violet / lavender | Three orbital paths and satellites |
| `comet` | Coral / warm gold | Tapered trail with glowing head |
| `ribbon` | Cyan / lilac | Two weaving, continuous strands |
| `magnetic` | Amber / cream | Velocity-stretched ring and poles |
| `fireflies` | Lime / yellow | Eight independently orbiting luminous motes |
| `pixel` | Pink / ice blue | Grid-snapped square trail |
| `ink` | Navy / steel | Overlapping droplets and brush-like pooling |
| `compass` | Cobalt / periwinkle | Directional diamond and north marker |
| `text` | Rose / blush | Rotating circular text halo |

```js
const cursor = FlowFX.mouseFollower({
  target: '.interactive-region', // Optional; omit for page-wide.
  style: 'text',
  text: 'EXPLORE WITH ME · ',
  color: '#ff9caf', accent: '#ffe0e7',
  size: 40, speed: 12, trail: 22
});
cursor.setOptions({ style: 'comet', color: '#ff8363' });
cursor.setEnabled(false);
cursor.setEnabled(true);
const preset = cursor.exportPreset(); // Serializable options, without target.
cursor.destroy();
FlowFX.destroyFollowers(); // All cursor followers only.
```

- `target`: one Element or a selector matching an element. Default: document root (page-wide). One follower per target; destroy it before creating another on the same target.
- `size`: 12–100, default 32. `speed`: smoothing response rate 1–30, default 12. `trail`: 6–40 points, default 22.
- `color` / `accent`: 3- or 6-digit hex colors. Changing style picks that style's palette unless explicitly overridden. `text`: max 40 characters, used by the text style.
- `idleAnimation: true`: autonomous preview movement for **scoped targets only**; this powers the ten demo cards. Omit for a normal follower.
- `hideCursor: true`: opt-in to hiding the target's native cursor on fine-pointer devices; default false. Original cursor styling is restored on disable/destroy. Descendant cursor overrides can still show native cursors.
- Mouse and pen pointer input supported; touch input does not activate a follower. Under OS reduced motion, follower drawing is disabled and native cursor styling restored. Native cursor remains enabled by default.
- Followers share a separate Canvas 2D overlay, require no WebGL context, clip scoped previews to their rectangular target, and render only visible/active previews. The canvas does not intercept clicks. `FlowFX.destroyAll()` now destroys both image effects and followers.
- The demo's **Use on page** button disables the scoped previews while the chosen page-wide follower is active. **Stop follower** restores preview mode. Color/size controls and Copy code use the selected style.

## New in 0.2: scroll studies, living edges and click galleries

Four independent scroll treatments can be combined with the existing seven image shaders:

| `scrollEffect` | Behavior |
| --- | --- |
| `depth` | Vertex perspective shear, parallax texture drift and a dolly push |
| `ribbon` | Scroll-driven mesh twist and ribbon-like UV displacement |
| `shutter` | Twelve staggered alpha shutters with sliding texture strips |
| `lens` | Expanding circular aperture with a warped zoom lens |

These work on **single images too**. To drive progress from the target's normal viewport traversal:

```js
const fx = FlowFX.imageEffect('.art', {
  style: 'wobble',
  scroll: true,
  scrollEffect: 'ribbon',
  hoverEdge: 'wave',
  config: { edgeStrength: 1.2, damping: 9 }
});
fx.ready.catch(console.error);
```

For sticky surfaces, use `scroll: false` and feed `setProgress(0..1)` from your section timeline. The demo's four new studies do this. `scrollEffect: 'none'` or `false` disables scroll treatment.

`hoverEdge` supports `wave`, `blob`, `scallop`, `diamond`, `curtain`, `cut`, `orbit`, `none` or `false`. The shader changes the actual alpha silhouette on pointer entry or keyboard focus and smoothly restores the rectangle on pointer exit. `config.edgeStrength` controls how deeply the outline changes (0–2, default 1). These are shader masks; CSS layout and the clickable target rectangle remain unchanged. Transparent edge cutouts show the target's background. Reduced motion disables the edge animation and scroll treatment.

```html
<div class="gallery" tabindex="0" aria-label="Hover to reshape; click for next image"
     style="width:100%;height:450px">
  <img src="one.jpg" alt="First scene" style="width:100%;height:100%;object-fit:cover">
  <img src="two.jpg" alt="Second scene" style="display:none">
  <img src="three.jpg" alt="Third scene" style="display:none">
</div>
<script>
  const gallery = FlowFX.imageEffect('.gallery', {
    style: 'liquid', hoverEdge: 'blob', gooey: true,
    config: { edgeStrength: 1.2 }
  });
  gallery.ready.catch(console.error);
</script>
```

Click, Enter/Space or arrow keys advance multi-image galleries. All seven collection cards and the three new edge-study cards now include three images and visible image counters. A single `<img>` needs a multi-image container to switch between distinct pictures. `click: false` disables both click and keyboard image navigation; it does not disable the click ripple.

Edge and scroll modes are saved in exported presets. Older v1 presets still load, with no edge/scroll treatment unless supplied as explicit options. `setOptions` validates the mode names before applying them.

## Effects

| ID | Name | Implementation |
| --- | --- | --- |
| 1 | `liquid` | Soft sinusoidal UV flow + pointer ripples |
| 2 | `distortion` | Pointer-localized vortex field |
| 3 | `wobble` | Subdivided plane with animated vertex depth |
| 4 | `wind` | Anchored flag-like vertex displacement |
| 5 | `ripple` | Concentric radial UV distortion |
| 6 | `perlin` | Interpolated 3D gradient-noise displacement |
| 7 | `cyber` | Quantized cell displacement + grid highlights |

Style 7 is cyber; style 6 is Perlin. This resolves the duplicate style 6 in the supplied examples. Styles 3/4 change actual mesh vertices; other styles primarily distort texture coordinates. These are 3D image surfaces, not volumetric 3D models.

Every effect reacts to pointer movement; click adds a decaying ripple. A multi-image container also advances on click, Enter/Space or arrows when focusable. Use semantic controls or add a meaningful `tabindex` and accessible description to interactive wrappers.

## Multiple images, gooey and scroll

```html
<div class="gallery" tabindex="0" aria-label="Interactive landscape gallery">
  <img src="one.jpg" width="1200" height="900" alt="First landscape">
  <img src="two.jpg" width="1200" height="900" alt="Second landscape">
  <img src="three.jpg" width="1200" height="900" alt="Third landscape">
</div>
<script>
  const gallery = FlowFX.imageEffect('.gallery', {
    style: 3,
    gooey: true,
    scroll: true,
    scrollSnapping: false,
    scrollSpeed: 6,
    touchSpeed: 6,
    config: { damping: 7, intensity: 0.8 }
  });
  gallery.ready.catch(console.error);
</script>
```

Give the container an explicit width/height. Size its first image to fill it. Additional images are hidden from layout while the effect is active. Textures use centered `object-fit: cover` cropping.

`scroll: true` maps the target's viewport traversal to a 0–1 image timeline. `scrollSpeed` changes the timeline sensitivity. `scrollSnapping` rounds progress to image stops (it does not hijack or snap page scrolling). `touchSpeed` scales swipe steps. Native page scrolling is never prevented. For touch scrolling, the scroll timeline is the most reliable control; browser touch gesture cancellation can prevent a swipe-up event.

For a **sticky image and a longer scroll section**, leave `scroll: false` and drive progress yourself (as in `demo/app.js`):

```js
const fx = FlowFX.imageEffect('.gallery', { style: 3, gooey: true, click: false });
function onScroll() {
  const section = document.querySelector('.story').getBoundingClientRect();
  const travel = section.height - window.innerHeight;
  fx.setProgress(Math.max(0, Math.min(1, -section.top / Math.max(1, travel))));
}
window.addEventListener('scroll', onScroll, { passive: true });
// Remove this listener and call fx.destroy() when unmounting.
```

When built-in `scroll` is enabled it owns progress; do not also drive `next()` or `setProgress()` on that instance. Use `scroll: false` for manual navigation.

## Configuration and presets

| Config | Default | Range | Meaning |
| --- | --- | --- | --- |
| `intensity` | 0.8 | 0–2 | Distortion / vertex amplitude |
| `speed` | 1 | 0–3 | Shader clock rate; zero freezes the clock |
| `frequency` | 5 | 1–15 | Spatial frequency / grid density |
| `zoom` | 0.45 | 0–2 | Pointer/focus zoom amount; zero disables |
| `chromatic` | 0.7 | 0–2 | Color-channel separation |
| `damping` | 7 | 1–20 | Response rate; larger means faster settling |
| `edgeStrength` | 1 | 0–2 | Depth of the hover silhouette cutout |

All seven values live inside `config`. Numbers are clamped to these ranges. Invalid number types are rejected. `hoverMotion`, `transition`, `hoverEdge`, `scrollEffect`, `gooey`, `debug`, `scroll`, `click`, `scrollSnapping`, `scrollSpeed` and `touchSpeed` are top-level options. `onProgress(progress)` receives smoothed timeline progress when a visible instance renders.

```js
const fx = FlowFX.imageEffect('.art', {
  preset: './presets/wigglewobble.json',
  debug: true,
  config: { intensity: 1.1 } // Explicit values override the preset.
});
await fx.ready;
fx.setOptions({ style: 'wind', gooey: true, config: { speed: 1.4 } });
const preset = fx.exportPreset(); // Save as JSON.
```

`debug: true` creates an isolated panel with live ranges and an export text area. Use the demo's Export/Import buttons to download/reload JSON. `preset` is read at initialization, and `debug` creates a panel at initialization; use destroy/reinitialize to change these. `setOptions` changes style, gooey, hoverEdge, hoverMotion, transition, scrollEffect, config and interaction options.

## Runtime API

```js
const fx = FlowFX.imageEffect('.art', { style: 2 });
await fx.ready;
fx.setOptions({ config: { intensity: 1.2 } });
fx.setProgress(0.5); // 0–1 across all images, manual mode.
fx.next();
fx.previous();
fx.pause();
fx.play();
fx.refresh();
fx.exportPreset();
fx.destroy();
FlowFX.destroyAll();
```

A selector may match several targets; commands apply to the group. `instances` exposes individual handles. `exportPreset()` exports the first instance's settings. Duplicate initialization on the same target is rejected. Destroy before reinitializing.

## npm / framework integration

After the npm package is published:

```sh
npm install okumajs
```

```js
import { imageEffect } from 'okumajs';
// React: call in useEffect after mount; return () => fx.destroy().
// Vue: call in onMounted; destroy in onBeforeUnmount.
const fx = imageEffect(element, { style: 'wobble' });
fx.ready.catch(console.error);
```

Importing the module in SSR is safe; call `imageEffect` only in the browser after mount. Browser IIFE, bundled ESM and CommonJS outputs all include Three.js. This makes integration simple but the first bundle is comparatively large; this MVP does not yet provide a lean external-Three build.

## Publishing and CDN

Package name: `okumajs`. JavaScript API: `FlowFX`. Source repository: [Luckykumawat/Okumajs](https://github.com/Luckykumawat/Okumajs).

### CDN installation

The verified npm distribution URL for version 0.3.0:

```html
<script src="https://cdn.jsdelivr.net/npm/okumajs@0.3.0/dist/flowfx.min.js"></script>
<script>
  const cursor = FlowFX.mouseFollower({ style: 'orbit' });
  const images = FlowFX.imageEffect('.your-gallery', FlowFX.imagePresets['liquid-silk']);
  images.ready.catch(console.error);
</script>
```

For a single image, `.your-gallery` can be an `<img>`; for click image transitions use a container containing multiple images, as shown above. No extra Three.js or CSS script tags are needed. Scope image selectors to the elements that should animate.

A GitHub-backed CDN URL is also available when the matching release tag is pushed:

```html
<script src="https://cdn.jsdelivr.net/gh/Luckykumawat/Okumajs@v0.3.0/dist/flowfx.min.js"></script>
```

The npm and GitHub CDN variants expose the same `FlowFX` API. Pin a release version. Check the release notes for verification/publication status before sharing a distribution URL.

### Maintainer release commands

```sh
npm ci
npm test
npm run build
npm pack --dry-run
npm login
npm whoami
npm publish --access public
```

Complete npm login and any two-factor approval in your own browser. Do not commit `.npmrc`, access tokens or node_modules. Once published, the same name/version cannot be overwritten. For subsequent changes increment the package version, rebuild and publish, then create a matching Git tag.

Official references: [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/), [jsDelivr](https://www.jsdelivr.com/documentation).

## Performance, accessibility and MVP boundaries

- One shared transparent fixed WebGL canvas serves all instances; only viewport-visible instances render. The shader clock pauses when the page is hidden. Device pixel ratio is capped at 2.
- WebGL2-capable browser/device required by the pinned Three.js version. Runtime image loading needs same-origin images or CORS-enabled remote images. Otherwise `ready` rejects and originals remain visible.
- The canvas is a root overlay at z-index 10. Place intentional overlays above 10. Arbitrary CSS stacking contexts, rotated elements, ancestor clipping, custom object-position, arbitrary CSS rounded masks and modal occlusion are not generalized by this MVP. Use simple rectangular surfaces as demonstrated. Do not use a target inside a CSS-transformed ancestor without further integration work.
- Resizing the surface is supported. To change image sources or add images, destroy and reinitialize.
- WebGL context loss destroys effects and restores originals. Reinitialize to resume after context restoration.
- OS `prefers-reduced-motion` disables ongoing distortion/zoom and snaps transitions to requested progress. Source alternative text remains available. This is not a complete accessibility audit.
- Click adds a shader ripple; this MVP does not include arbitrary DOM click animations, page transitions, text animations, physics or a no-code builder.
- `pause()` freezes the selected instance; the other demo surfaces keep moving. The built-in speed setting is separate from pause.
- Browser rendering/performance should be tested on your actual target mobile devices before a production release.

## Verification

```sh
npm test
npm run build
npm run dev
```

Visit `/qa.html` for automated browser integration checks (preset loading, shared canvas, updates, manual navigation, pause/play, destroy/reinitialize, cleanup and invalid preset fallback). Shader compilation errors appear in the browser console. The main demo provides visual checks for all 7 styles, click/keyboard navigation, copy/export/import, scroll progress and responsive layout.

MIT license. See `THIRD_PARTY_NOTICES.md` for bundled Three.js attribution.

## GitHub Pages deployment

The `Deploy Okumajs demo and documentation` workflow publishes only `demo/` to GitHub Pages after demo, README, documentation generator or workflow changes are pushed to main. It regenerates documentation from README, checks browser script syntax, and deploys the static artifact. No npm token is required. Demo Copy buttons include the pinned public npm CDN and complete example markup. The library itself remains version 0.3.0; documentation/site updates do not republish npm.
