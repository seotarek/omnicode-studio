# OmniCode Studio: Circular Barcodes, Official Seals, and Design Overhaul Spec

## 1. Overview & Objectives
OmniCode Studio is an offline-first, zero-telemetry barcode and QR code studio.
This specification defines the additions and refinements requested by the user:
1. **Design Cleanup & Polish ("صلح التصميم")**: Refine visual hierarchy, clean monochrome/emerald professional palette without dark mode glitches, unified component spacing, responsive layouts, and crisp borders.
2. **Logo & Header Modernization ("شيل الاصدار من اللوجو")**: Remove the hardcoded `v1.0.0` version pill from the header, and replace the generic text character `Ω` with a custom vector SVG mark combining barcode lines and verification seal motifs.
3. **Full Circular Barcode & Seal Geometries ("باركود دائري مش دوائر على الحواف لا كله يبقى دائري أشكال زي الأختام وزي التوثيق")**: Implement true geometric circular structures:
   - **Radial Spoke Barcode (360° Sunburst)**: 1D barcode sequence mapped onto polar angular coordinates $\theta \in [0, 2\pi]$ radiating from an inner hub to outer radius.
   - **Concentric Ring Barcode (Bullseye Barcode)**: Concentric circular tracks mapping the binary sequence from inner radius outwards, readable from any 360° orientation.
   - **Official Verification Seal (ختم اعتماد وتوثيق رسمي)**: Circular notarization seal featuring scalloped rosette / guilloche border, curved `<textPath>` perimeter labels (top and bottom), authentication stars/ribbon, and inner circular barcode or QR code.
   - **Document Authentication Stamp (ختم توثيق مستندات)**: Scalloped/guilloche security border, document registration number, verification timestamp, and notary emblem.
4. **Dedicated Tab in UI**: Add an "Official Seals & Circular" (أختام التوثيق والباركود الدائري) tab in the main segmented control for seamless discovery and dedicated controls.

## 2. Architecture & File Structure

### New Files:
- `src/core/seal/types.ts`: TypeScript definitions for seal types, border styles, text paths, colors, and generator options.
- `src/core/seal/geometry.ts`: Mathematical helper functions for polar coordinates, circular arc paths, scalloped rosette boundaries, and concentric rings.
- `src/core/seal/generator.ts`: Pure SVG generator creating verified vector output for all seal styles and circular barcodes.
- `src/components/seal/SealForm.tsx`: Dedicated configuration panel for seal type, circular text, serial number, seal ink color palette, border styling, and center code data.
- `tests/unit/seal.test.ts`: Vitest test suite verifying circular geometry math, SVG output integrity, and textPath construction.

### Modified Files:
- `src/components/layout/Header.tsx`: Remove `v1.0.0` badge, replace `Ω` with bespoke vector SVG logo.
- `src/i18n/translations.ts`: Add Arabic and English translations for circular seals, radial barcodes, bullseye barcodes, and seal configuration fields.
- `src/App.tsx`: Integrate the new `seal` tab, wire seal state and live preview generation.
- `src/components/preview/PreviewPanel.tsx`: Handle seal preview, live vector scaling, and multi-format export.

## 3. Detailed Technical Requirements

### 3.1 Mathematical Geometry Engine (`src/core/seal/geometry.ts`)
- Polar coordinate translation: $x = c_x + r \cdot \cos(\theta)$, $y = c_y + r \cdot \sin(\theta)$.
- Radial spoke generator: For each binary bar $b_i = 1$, render an angular wedge or radial line extending from $r_{\text{inner}}$ to $r_{\text{outer}}$ at angle $\theta_i = \theta_{\text{start}} + i \cdot \Delta\theta$.
- Scalloped rosette generator: Generate smooth bezier curves or circular arcs around perimeter forming $N$ petals/scallops (typically $N = 36$ or $48$) simulating physical embossed notary seals.
- Concentric ring generator: For each binary track, render SVG `<circle cx="..." cy="..." r="..." stroke="..." stroke-width="..." fill="none" />`.

### 3.2 Pure Vector SVG Output (`src/core/seal/generator.ts`)
- Standalone valid SVG with `viewBox="0 0 500 500"`, `xmlns="http://www.w3.org/2000/svg"`.
- Use `<defs>` containing `<path id="top-curve" ... />` and `<path id="bottom-curve" ... />` for curved SVG `<textPath>`.
- Support classic seal ink color palettes:
  - Royal Navy (`#1e3a8a`)
  - Notary Crimson (`#991b1b`)
  - Security Emerald (`#065f46`)
  - Carbon Obsidian (`#0f172a`)
  - Imperial Gold / Bronze (`#b45309`)
- Full SVG text sanitization to prevent XSS / markup injection.

### 3.3 UI / UX Requirements
- Zero emoji in code, UI, or commit messages.
- Single unified clean high-contrast theme (slate-50 background, slate-900 typography, emerald primary accent, clean borders).
- Header: remove `v1.0.0`, replace `Ω` with crisp SVG logo mark.
- PreviewPanel: seamless support for 500x500 circular SVG view with instant download as SVG, PNG, PDF, and EPS.

## 4. Verification Plan
- Unit tests in `tests/unit/seal.test.ts` checking:
  1. Radial spoke SVG contains valid angles and paths.
  2. Concentric ring SVG generates correct number of ring elements.
  3. Official seal SVG generates `<textPath>` with sanitized text and correct radius.
  4. Scalloped rosette math produces continuous closed loop path.
- Existing tests in `tests/` pass with zero regressions.
- `npm run build` succeeds cleanly with TypeScript type-checking.
