# Circular Barcodes, Official Seals & Design Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement true circular barcodes (radial spoke & concentric bullseye), official notarization/verification seals with curved text paths and scalloped rosettes, remove the version badge from the logo, and polish OmniCode Studio UI/UX.

**Architecture:** A standalone mathematical geometry engine in `src/core/seal/` computes polar coordinates, scalloped bezier curves, concentric rings, and SVG textPaths. A dedicated UI panel `SealForm.tsx` configures styles and parameters, integrated into `App.tsx` and `PreviewPanel.tsx` with zero external runtime dependencies.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide icons, Vitest, pure vector SVG.

## Global Constraints
- Zero emoji rule: Never include emojis in UI markup, components, tests, or commit messages.
- Single unified high-contrast light theme: slate-50 background, slate-900 typography, emerald accents, clean borders.
- Pure SVG vector generation: All circular codes and seals must be valid standalone SVGs with sanitized text.
- Comprehensive testing: All geometry and SVG generation must be covered with Vitest unit tests.

---

### Task 1: Clean up Header & Modernize Logo

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `HeaderProps` from `src/components/layout/Header.tsx`
- Produces: Polished header without `v1.0.0` pill and with custom vector SVG mark.

- [ ] **Step 1: Inspect and edit Header.tsx**
  - Remove `<span ...>v1.0.0</span>`.
  - Replace `<div ...>Ω</div>` with a precision SVG vector logo (interlocking geometric bars inside a seal silhouette).
- [ ] **Step 2: Run build to verify Header compiles**
  - Run: `npm run build`
  - Expected: PASS
- [ ] **Step 3: Commit**
  - Git commit: `refactor(header): remove version badge and update logo with custom vector mark`

---

### Task 2: Pure Geometry Engine for Circular Barcodes & Seals

**Files:**
- Create: `src/core/seal/types.ts`
- Create: `src/core/seal/geometry.ts`
- Test: `tests/unit/geometry.test.ts`

**Interfaces:**
- Produces: `polarToCartesian`, `generateScallopedPath`, `generateArcPath`, `calculateConcentricRings` in `src/core/seal/geometry.ts`

- [ ] **Step 1: Write unit tests for geometry calculations**
  - Create `tests/unit/geometry.test.ts` testing polar conversions, circular arc angles, and scalloped loop closure.
- [ ] **Step 2: Run test to verify it fails**
  - Run: `npx vitest run tests/unit/geometry.test.ts`
  - Expected: FAIL (module not found)
- [ ] **Step 3: Implement `types.ts` and `geometry.ts`**
  - Write pure math functions for polar projections and SVG path data.
- [ ] **Step 4: Run test to verify it passes**
  - Run: `npx vitest run tests/unit/geometry.test.ts`
  - Expected: PASS
- [ ] **Step 5: Commit**
  - Git commit: `feat(seal): implement circular polar geometry engine and tests`

---

### Task 3: Core Seal & Circular Barcode SVG Generator

**Files:**
- Create: `src/core/seal/generator.ts`
- Test: `tests/unit/seal.test.ts`

**Interfaces:**
- Consumes: Geometry functions from `src/core/seal/geometry.ts`, types from `src/core/seal/types.ts`
- Produces: `generateSealSVG(options: SealOptions): string`

- [ ] **Step 1: Write unit tests for seal SVG generation**
  - Create `tests/unit/seal.test.ts` testing radial barcode output, concentric ring SVG, curved textPath generation, and XSS sanitization.
- [ ] **Step 2: Run test to verify it fails**
  - Run: `npx vitest run tests/unit/seal.test.ts`
  - Expected: FAIL
- [ ] **Step 3: Implement `generator.ts`**
  - Build SVG tree with `<defs>`, `<textPath>`, radial bars, concentric tracks, and rosette borders.
- [ ] **Step 4: Run test to verify it passes**
  - Run: `npx vitest run tests/unit/seal.test.ts`
  - Expected: PASS
- [ ] **Step 5: Commit**
  - Git commit: `feat(seal): implement SVG seal generator supporting radial spoke and bullseye codes`

---

### Task 4: Translations for Circular Seals & UI Polish

**Files:**
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Produces: New translation keys for `tabSeal`, seal styles, border types, text fields, and color labels in both Arabic and English.

- [ ] **Step 1: Add translation keys in translations.ts**
  - Define labels for `tabSeal`, `sealType`, `radialSpoke`, `concentricBullseye`, `officialSeal`, `notaryStamp`, etc.
- [ ] **Step 2: Run build to ensure type safety**
  - Run: `npm run build`
  - Expected: PASS
- [ ] **Step 3: Commit**
  - Git commit: `feat(i18n): add seal and circular barcode translations`

---

### Task 5: Seal Form Component (`SealForm.tsx`)

**Files:**
- Create: `src/components/seal/SealForm.tsx`

**Interfaces:**
- Consumes: Translations, `SealOptions`
- Produces: React form component allowing full configuration of circular barcodes and verification seals.

- [ ] **Step 1: Implement `SealForm.tsx`**
  - Create clean, accessible form with preset selector, text inputs, color palette pickers, and border style toggles.
- [ ] **Step 2: Run build to verify component compiles**
  - Run: `npm run build`
  - Expected: PASS
- [ ] **Step 3: Commit**
  - Git commit: `feat(ui): add SealForm component for circular barcode and seal customization`

---

### Task 6: Studio Integration in `App.tsx` & `PreviewPanel.tsx`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/preview/PreviewPanel.tsx`

**Interfaces:**
- Consumes: `SealForm`, `generateSealSVG`, `SealOptions`
- Produces: Integrated studio experience with 4 tabs (QR, Barcode, Seals, Batch, Scanner).

- [ ] **Step 1: Wire seal state and SVG generation in `App.tsx`**
  - Add `activeTab === "seal"`, manage seal state options, compute `sealSvg`.
- [ ] **Step 2: Update `PreviewPanel.tsx` to display and export seal SVGs**
  - Support high-resolution rendering and export of circular seal SVGs.
- [ ] **Step 3: Run build and tests**
  - Run: `npm test && npm run build`
  - Expected: PASS
- [ ] **Step 4: Commit**
  - Git commit: `feat(app): integrate circular seals tab into main studio and preview panel`

---

### Task 7: Full Verification & Regression Testing

**Files:**
- Entire codebase

- [ ] **Step 1: Run complete test suite**
  - Run: `npm test`
  - Expected: All test suites PASS (unit tests for QR, Barcode, Geometry, Seal, Validator).
- [ ] **Step 2: Run production build**
  - Run: `npm run build`
  - Expected: Exit code 0, dist/ generated with no TypeScript errors.
- [ ] **Step 3: Push changes and verify deployment**
  - Push commit to GitHub `main` branch to trigger GitHub Actions Pages deployment.
