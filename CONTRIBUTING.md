# Contributing to OmniCode Studio

We welcome contributions from developers worldwide!

## Guidelines
1. **Zero External Backend**: Any PR introducing server telemetry or external API calls for generation will be rejected.
2. **Deterministic Scannability**: New dot styles or corner geometries must pass automated tests and real-world scanner readability.
3. **Tests Required**: Every bug fix or new symbology must include corresponding unit tests in `tests/unit/`.
4. **Bilingual Parity**: Any new UI string must be added to both `en` and `ar` dictionaries in `src/i18n/translations.ts`.

## Pull Request Workflow
1. Fork the repo and create your feature branch: `git checkout -b feature/awesome-shape`.
2. Ensure all tests pass: `npm test`.
3. Ensure production build succeeds: `npm run build`.
4. Open a Pull Request with a clear description and screenshots.
