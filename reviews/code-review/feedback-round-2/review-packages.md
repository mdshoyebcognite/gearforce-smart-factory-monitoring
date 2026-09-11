## Package audit: GearForce Smart Factory Monitoring — round 2

Unchanged from round 1 (no dependency edits this round).

### Dependencies

| Package | Used version | Latest | Deprecated | CVEs | Health |
| ------- | ------------ | ------ | ---------- | ---- | ------ |
| @cognite/app-sdk | 0.9.0 | 0.10.0 | no | none | Warn (1 minor behind) |
| @cognite/aura | ^0.3.5 | — | no | none | Pass |
| @cognite/sdk | ^10.10.0 | — | no | none | Pass |
| @tanstack/react-query | ^5.90.10 | — | no | none | Pass |
| react / react-dom | 18.3.1 | 19.x | no | none | Pass (18 intentional) |
| zod | ^4.5.4 | — | no | none | Pass |

### Security audit

| Severity | Count |
| -------- | ----- |
| Critical | 0 |
| High | 0 |
| Moderate | 4 |
| Low | 0 |

#### Vulnerabilities

| Package | Severity | Title | Patched in | Advisory |
| ------- | -------- | ----- | ---------- | -------- |
| vitest / @vitest/mocker | moderate | Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock | 4.1.11 | https://github.com/advisories/GHSA-82fw-gwwq-j7x9 |

No high/critical CVEs; no runtime dependency ≥2 majors behind. All advisories are dev-only (Vitest toolchain).
