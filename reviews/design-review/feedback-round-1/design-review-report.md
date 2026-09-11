# Design Review — GearForce Smart Factory Monitoring — round 1

> Scores are auto-derived from repo probes (grep/lint/build) per the `flows-design-review` rubric, cross-checked against the owner's confirmation that the deployed app works end-to-end. Any score can be overridden with lived task-walkthrough evidence.

## User and tasks

- **Primary user:** Maintenance Engineer at GearForce Manufacturing — responds to equipment health signals across three production lines, works from a desktop in the maintenance office/control area (from `App-Brief.md`).
- **Tasks evaluated:**
  1. Identify machines that need attention from factory/anomaly information.
  2. Inspect a machine's connected sensors and view latest reading + historical trend.
  3. Understand threshold breaches and trace anomaly → sensor → machine.
- **Context:** Desktop, read-only monitoring/investigation layer over an existing CDF backend (6 anomalies across L1-M1, L2-M1, L3-M1).

## Task walkthrough findings

- **Task 1 — Spot machines needing attention:** Overview KPIs + production hierarchy show breach badges; anomaly count surfaced in TopBar. Owner confirms the three breached machines display correctly.
- **Task 2 — Inspect sensors + trend:** Machine details lists connected sensors with per-sensor breach values and threshold; sensor trend chart renders per-series datapoints with the threshold line. Confirmed working after the detector-value display fix.
- **Task 3 — Trace anomalies:** Anomaly panel supports trace to machine/sensor. Confirmed navigable.

## Scores

| Question | Score | Rationale | Improvement note |
| --- | --- | --- | --- |
| Q1 Aura consistency | 4 | Aura is a dependency; 5 source files import Aura; **0 hard-coded hex, 0 rgb/hsl**. Minor: KPI accents use raw Tailwind palette (`bg-red-100`) rather than Aura semantic tokens. | Move accent colors to Aura tokens. |
| Q2 Navigation & hierarchy | 4 | TopBar tabs (Overview/Anomalies), "Factory › Line › Machine" cue, back/Close controls, collapsible hierarchy. Single-page; location generally clear. | Consider a persistent breadcrumb in machine/sensor drill-in. |
| Q3 Labels & language | 4 | 0 vague labels (`Submit`/`OK`/`Click here`); action-oriented copy (`Close`, `Retry`). | Keep verifying new copy stays specific. |
| Q4 Feedback & validation | 4 | `AsyncStateBoundary` (loading/error/empty) across 5 components; read-only app (no forms). | Add app-level ErrorBoundary + explicit error state on machine drill-in. |
| Q5 Clickability | 4 | **0 `div`/`span` onClick**; semantic `<button>`/Aura `Button`; hover states present. | Confirm hover/focus affordance on all sensor rows. |
| Q6 Error prevention | 5 | Read-only viewer — no destructive actions to guard. | N/A by design. |
| Q7 Responsive | 4 | Viewport meta present; responsive utilities (`sm/md/lg`) in 4 files; **no fixed-px sizing**. Desktop-first per brief. | Spot-check at 13" laptop width. |
| Q8 Empty states | 4 | Explicit empty copy ("No hierarchy data", "No Sensor_View instances returned…") + anomaly empty state. | Add a first-run hint on overview. |
| Q9 Performance | 4 | Build **804 KB** dist (JS ~206 KB gzip); React Query caching; bounded limits (DMS 100, datapoints 1000). Single chunk >500 KB warning; no code-splitting. | Consider `manualChunks`/lazy for the chart. |
| Q10 Accessibility | 4 | `aria-label` on icon buttons; `aria-live` on loading; **no `<img>`** (no alt gaps); no non-semantic click targets. | Verify WCAG AA contrast; confirm focus-visible rings. |

## Summary

- Average score: 4.1
- Quality level: Good — launch with minor fixes

## Must Fix (any score < 3)

- None.

## Should Fix (any score 3 – 3.7)

- None (all questions scored ≥ 4).

## Nice to Fix (any score 3.8 – 4.4)

- Q1: Replace raw Tailwind palette accents with Aura semantic tokens.
- Q4: Add a top-level `ErrorBoundary` and explicit error state on machine drill-in.
- Q9: Code-split/`manualChunks` to clear the 500 KB chunk warning.
- Q10: Verify AA contrast and visible focus rings on all interactive elements.
