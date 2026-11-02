# ADR 0001: Modular Monorepo Architecture

## Status
Accepted

## Context
OmniCode Studio started as a browser-first React app. To transform it into a global enterprise code generation ecosystem, multiple integration targets must be supported:
1. Headless JavaScript/TypeScript (`@omnicode/core`)
2. Pure PHP Composer package (`omnicode/omnicode-php`)
3. Laravel integration package (`omnicode/omnicode-laravel`)
4. Containerized self-hosted REST API (`@omnicode/api`)
5. Interactive Web Studio (React + Vite)

## Decision
Maintain a clean monorepo where:
- `packages/core` provides isomorphic, headless 1D/2D generation without DOM dependencies.
- `packages/php` provides standalone PSR-12/PSR-4 code generation without Laravel dependencies.
- `packages/laravel` provides ServiceProvider, Facade, Blade components, and Storage/Queue integration on top of `omnicode/omnicode-php`.
- `packages/api` provides Docker-containerized Express microservice wrapping `@omnicode/core`.
- `src/` provides the interactive web interface.

## Consequences
- Clean separation of concerns with zero framework lock-in.
- CI/CD can independently test and build each package in isolation.
