# ADR 0002: Standalone Reed-Solomon Galois Field \(GF(2^8)\) Engine

## Status
Accepted

## Context
ISO/IEC 18004 QR codes require rigorous algebraic error correction using Reed-Solomon codes over Galois Field \(GF(2^8)\). Incomplete error correction or relying on SVG visual appearance cannot guarantee scannability when codes suffer optical damage or partial occlusion.

## Decision
Implement a pure, independent ISO/IEC 18004 Galois Field \(GF(2^8)\) arithmetic and Reed-Solomon decoding engine:
- Field generator polynomial: \(P(x) = x^8 + x^4 + x^3 + x^2 + 1\) (decimal 285).
- Error locator discovery via Berlekamp-Massey algorithm.
- Error root detection via Chien search.
- Error value computation via Forney algorithm with generator starting power \(b = 0\):
  \[
  Y_k = X_k \frac{\Omega(X_k^{-1})}{\Lambda'(X_k^{-1})}
  \]

## Consequences
- Every generated QR code has provable 0-syndrome pristine validity.
- Damaged and occluded matrices can mathematically recover corrupted codewords up to the capacity limit \(t\).
- Verified by automated cross-engine tests against ZXing.
