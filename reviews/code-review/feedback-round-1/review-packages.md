## Package audit: GearForce Smart Factory Monitoring

### Dependencies

| Package | Used version | Latest | Deprecated | CVEs | Health |
| ------- | ------------ | ------ | ---------- | ---- | ------ |
| @cognite/app-sdk | 0.9.0 | 0.10.0 | no | none reported | Warn (1 minor behind) |
| @cognite/aura | ^0.3.5 | (not in outdated top list) | no | none | Pass |
| @cognite/sdk | ^10.10.0 | (not flagged outdated) | no | none | Pass |
| @tanstack/react-query | ^5.90.10 | (not flagged outdated) | no | none | Pass |
| react / react-dom | 18.3.1 | 19.x | no | none | Pass (React 19 is major; intentional 18) |
| zod | ^4.5.4 | (not flagged outdated) | no | none | Pass |

### Dev dependencies (noted)

| Package | Used version | Latest | CVEs | Health |
| ------- | ------------ | ------ | ---- | ------ |
| vitest | 4.1.10 | 5.0.0 | moderate (GHSA-82fw-gwwq-j7x9 via @vitest/mocker) | Warn — patch 4.1.11 available |
| @vitest/coverage-v8 | 4.1.10 | 5.0.0 | via vitest | Warn |
| eslint | 9.39.4 | 10.x | none high/critical | Pass (major upgrade optional) |

No production `dependencies` entry is ≥2 majors behind. No high or critical CVEs in runtime dependencies.

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
