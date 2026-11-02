# ADR 0003: Cross-Platform Symbology Contracts

## Status
Accepted

## Context
Different language runtimes often generate subtle differences in barcode aspect ratios, check digit calculations, or bitstream patterns.

## Decision
Unify all barcode and QR symbologies under a single cross-platform specification:
1. Standard GS1 Modulo-10 calculation across TypeScript, PHP, and API.
2. Standard bitstream encoding for 1D symbologies:
   - CODE128 (Auto switching A/B/C)
   - EAN-13, EAN-8, UPC-A, ITF-14
   - MSI Plessey (Binary BCD patterns: Start `110`, Stop `1001`)
   - Codabar / NW-7 (Standard ratio 2:1 to 3:1 with delimiters A, B, C, D)
   - Pharmacode (Binary representation 3 to 131070)

## Consequences
- Any code generated in PHP renders bit-for-bit optical equivalence to one generated in Node.js or REST API.
