# ADR 0005: Fluent Builder Pattern for SDKs

## Status
Accepted

## Context
Developers prefer chaining methods for configuring complex graphic parameters (error correction, dot shapes, colors, dimensions, labels) rather than passing sprawling associative arrays.

## Decision
Provide fluent builder classes:
- `Omnicode\Builder\QrBuilder`
- `Omnicode\Builder\BarcodeBuilder`
- Accessible directly via `OmniCode::qr()->...->generate()` and `OmniCode::barcode()->...->generate()`.
- Retain static shorthand `OmniCode::qr($data, $options)` for backward compatibility.

## Consequences
- Intuitive IDE autocomplete and type safety.
- Clean syntax in both pure PHP and Laravel environments.
