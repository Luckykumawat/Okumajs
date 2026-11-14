# Verification — 14 November 2026

- Browser, ESM and CommonJS bundles built successfully with pinned dependencies.
- Five Node unit tests passed: style mapping, input ranges, partial updates, progress validation and SSR-safe imports.
- Seventeen in-browser integration assertions passed at `/qa.html`: preset loading; shared WebGL canvas; delayed source hiding; debug panel; duplicate rejection; config/gooey/progress updates; next/previous; pause/play; destroy restoration; renderer preservation; early destruction; final cleanup; reinitialization; destroyAll; invalid-preset fallback.
- Main demo: WebGL ready, zero captured console errors/warnings on initial rendering.
- Manually verified effect selector (wobble and cyber), next-image navigation, pause toggle, code-copy success state and scroll progress changes.
- Preset export downloaded `flowfx-preset.json` through the browser.
- Responsive check at a 390×844 viewport override: content width matched document viewport width; no horizontal page overflow. This is viewport testing, not a physical mobile-device test.
- npm pack dry run succeeded, with only dist artifacts, presets, package metadata and documentation/licenses in the publish payload.

The first browser QA run exposed an asynchronous context-loss event destroying replacement instances. The engine now ignores context-loss events after intentional shutdown; reinitialization checks pass.

Also corrected shared-canvas sizing to use its actual CSS client dimensions, including scrollbar layout.

Limitations: no multi-browser/device performance sweep; OS reduced-motion behavior is implemented but was not toggled via the host OS during this run; preset import UI was not separately exercised. Rendering limitations and the fixed canvas z-index contract are documented in README.md.

No npm publication or public CDN deployment was performed. Replace the placeholder npm scope before publishing.

## 0.2 update — scroll studies and hover silhouettes

- Added depth dolly, ribbon twist, staggered shutter and portal lens scroll modes; modes also work with a single image.
- Added wave, blob and scallop alpha silhouettes on hover/focus, and edgeStrength configuration.
- Every collection/edge gallery now has three images and a visible counter; image click navigation was checked in the live demo (01 → 02).
- Seven Node tests passed. Twenty-six browser integration assertions passed, including single-image scroll modes, pointer activation, mode preset export, actual click events, keyboard opt-out and invalid mode validation.
- Viewed all four new scroll studies in-browser with no captured console errors/warnings. Ribbon progress increased on scrolling down and decreased on scrolling up.
- Viewed organic edge masking while an actual pointer click changed the displayed image. Saved proof in the outputs folder.
- Responsive check at 390×844: the new ribbon study fit the viewport, and content width equaled document viewport width (375 CSS px excluding scrollbar).
- Browser bundle, ESM, CommonJS and declarations rebuilt for 0.2.0. Publishing guide/CDN version examples updated; package remains unpublished.

## 0.3 update — independent card presets and cursor followers

- Ten image-card presets now each specify their own shader tuning, hover geometry, silhouette and click transition. The seven collection cards have seven distinct hover motions, edge modes and transitions. Four scroll cards also have independently assigned hover treatments.
- Added seven hover geometry modes and seven transition modes, stored in presets and exposed through the public API/type declarations.
- Added ten Canvas 2D follower styles, shared overlay, per-region previews, page-wide activation, palette/size controls, code copying, native-cursor restoration and cleanup.
- Twelve Node unit tests passed.
- Fifty-four browser checks passed. These include actual nontransparent canvas pixels from all ten follower renderers, shared overlay behavior, invalid/duplicate validation, option changes, disable/enable, touch suppression, native cursor restoration, destruction and all ten image presets applying independently.
- No captured browser console errors/warnings in the updated demo or QA page.
- Verified live UI: activate Violet orbit on page; adjust size 32 → 33; generated code reflects the new size; copy success; stop follower restores preview mode.
- Verified Open Wind sculpture applies hover=lift, edge=curtain, transition=slide and that card's intensity/speed/frequency values in the main playground.
- Responsive checks: 1440×1000 uses three follower columns with no page overflow; 390×844 uses one column with no page overflow. Temporary viewport overrides were reset.
- Browser/ESM/CommonJS builds and type declarations rebuilt for 0.3.0. npm pack dry run succeeded. No npm publication performed.

The existing user-requested local demo server was retained for live use.

## Demo category tabs

- Split the demo into Hover & Click, Mouse Followers, Scroll Animations and Get Started panels. Only one panel is visible at a time.
- Checked mouse selection across categories, End/Home/ArrowRight keyboard activation, selected/visible panel consistency and browser Back restoration.
- Existing section hashes map to their category, with canonical category hashes for new navigation.
- Checked mobile at 390×844: two-column tab layout, document and content widths both 375 CSS pixels. Restored the original viewport afterward.
- Found and fixed an empty-anchor fallback in tab auto-scrolling; verified category positioning and panel rendering after reloading the correction. Captured console entries from the pre-fix version remained in the browser log; none were newly added during the corrected interaction run.
- Saved a live screenshot with the Scroll Animations tab selected and a rendered Depth dolly demo. Animation library code and bundles were not changed by this UI-only update.

## npm publication completed

On 14 November 2026, okumajs@0.3.0 was published and became available in the npm registry. Canonical jsDelivr npm CDN retrieval and exact bundle checksum/API smoke checks passed. See PUBLICATION.md for URLs and digests. This supersedes the earlier unpublished status entries.
