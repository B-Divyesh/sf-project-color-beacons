# Project Color Beacons — visual system

## Direction: glacial minimal ceramics

The product gives a project a physical-feeling marker before attention shifts. Its surfaces borrow from pale porcelain tiles set into blue glacial light: quiet enough to sit beside code, distinct enough to stop a wrong edit. The beacon itself is a small ceramic lozenge with a cut symbol, never a generic colored dot. Hairline seams and offset shadows make each project feel like a labelled object rather than a dashboard row.

The visual metaphor supports the accommodation: a stable object, color, name, and symbol all repeat together. No state relies on color alone.

## Palette

Light treatment is the main product mode. Dark treatment follows the operating-system preference.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| frost | `#F3F7F6` | `#101A1D` | page field |
| porcelain | `#FFFCF5` | `#172327` | raised work surface |
| ink | `#14282D` | `#F5F1E8` | main text |
| silt | `#53666A` | `#B5C5C5` | supporting text |
| seam | `#B7C9C9` | `#41565B` | boundaries |
| glacial | `#176B78` | `#7ED6DF` | action and focus |
| glacial-ink | `#FFFFFF` | `#102225` | action text |
| safe | `#286B45` | `#8BD5A6` | confirmed state |
| warning | `#8A4B12` | `#F2BB7B` | attention state |
| danger | `#A33736` | `#FFAAA4` | destructive/error state |

Beacon palette: Fjord `#176B78`, Ember `#B34835`, Lichen `#4B7043`, Saffron `#9A6813`, Iris `#66538C`, Slate `#485E68`. Every swatch ships with a cut symbol and a text label. The palette avoids red/green dependence and retains distinct luminance or shape pairings in common color-vision simulations.

## Type

Display: Georgia, then the platform serif. Its restrained wedges feel engraved into ceramic and keep the identity distinct without a font download.

Body and controls: Inter-like platform UI stack (`ui-sans-serif`, `system-ui`, sans-serif). It stays familiar inside a utility. Names and paths use `ui-monospace`, with tabular figures. No third-party font requests.

Scale: 14, 16, 18, 24, 36, 56 px. Body is never below 16 px. Reading measure is capped at 66 characters.

## Spacing and shape

An 8 px base grid with 4 px only for optical corrections. Main intervals: 8, 16, 24, 32, 48, 72, 96 px. Touch targets are at least 44 px. Surfaces use asymmetric `18px 18px 28px 18px` radii, like a hand-finished tile. Buttons use 12 px corners. Shadows are cool, short, and offset down-right; they never glow.

## Interaction grammar

- Selecting a project lifts its ceramic tile by 2 px and moves the same beacon into the confirmation strip.
- A focus-sensitive action needs a direct `Confirm [project]` press. The app never infers intent or watches typing.
- Project rows expose all controls by keyboard. Arrow keys move among beacon swatches.
- Destructive removal asks for the named project and offers a short undo.
- Loading uses a quiet skeleton seam. Offline and errors use written status plus a symbol.

## Motion policy

The signature motion is a 220 ms “tile set”: the selected beacon moves upward by 4 px, then settles into its seam. Only transform and opacity animate. There is no looping motion. Under `prefers-reduced-motion: reduce`, all movement becomes an instant border and opacity change.

## Responsive intent

At 390 px, navigation condenses, project controls stack, the folder path truncates in the middle, and the confirmation strip remains in normal flow. The landing illustration moves below the first action. Nothing depends on hover.

## Asset plan and provenance

One original hero still life shows six ceramic project beacons on a frost-blue workbench beside abstract window frames. It explains stable visual identity without faking a product screen. A wide crop supplies the Open Graph card. Product symbols are hand-authored SVG paths (arch, bars, cross, diamond, moon, wave).

Prompt sheet: “Editorial product still life, six small hand-finished porcelain marker tiles arranged beside overlapping translucent desktop window panes, each tile has one simple geometric cutout shape, glacial blue studio field, warm off-white ceramic, subtle mineral speckles, cool directional daylight, precise soft shadows, slight top-down 50mm lens, minimal Nordic material study, teal rust ochre violet accents, generous negative space, no people, no hands, no letters, no words, no text, no logos, no watermark, no UI screenshot, no gradients.”

Generated assets are original to this product, created with the factory Azure image deployment on 2026-08-28. Source prompts sit beside source images in `assets/src/`. Final raster files are reviewed for stray marks, symbols, seams, and palette fit, then exported to WebP below 300 KB. The footer discloses generated imagery.
