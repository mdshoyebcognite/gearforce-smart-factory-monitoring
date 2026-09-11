# Feature Specification: GearForce Smart Factory Monitoring

**Version:** 2.0  
**Status:** Product specification — Flows frontend pending; GearForce CDF backend implemented and verified  
**Related documents:** `App-Brief.md`, GearForce implementation documentation

---

## 1. Overview

GearForce Smart Factory Monitoring is a **read-only** Cognite Flows application that provides a monitoring and investigation interface over an **already implemented and verified** GearForce Manufacturing CDF backend.

The application allows a maintenance-oriented user to:

- identify machines requiring attention
- inspect machine context
- inspect linked sensors
- inspect sensor readings
- inspect historical trends
- understand threshold breaches
- trace anomalies to sensors and machines
- distinguish normal, loading, empty, error, and no-access states

The application **does not** rebuild, modify, or extend the CDF backend. It is a **presentation and investigation layer** over existing contextualized data-model views, CDF Time Series datapoints, and threshold-based anomaly detector output.

This specification defines **what** the application must do. It does **not** define React components, TypeScript services, charting libraries, DMS query payloads, or CDF API call signatures. Those belong in implementation planning.

### Flows repository status

| Area | Status |
| --- | --- |
| **GearForce CDF backend** | Implemented and verified per GearForce implementation documentation (deployed in CDF; not stored in this Flows repository) |
| **Flows frontend** | Scaffold only — GearForce-specific application code not yet built |
| **`app.json`** | May still contain scaffold values (`my-app`). `App-Brief.md` specifies `externalId: Gear-box` — alignment pending |
| **Authentication** | Apps API via `connectToHostApp` and `CogniteSdkProvider` (`infra: appsApi`) |

---

## 2. Problem Statement

### Source-supported context

GearForce Manufacturing operates a contextualized Smart Factory Monitoring backend on CDF. The implemented solution:

- represents the asset hierarchy through Cognite Asset data-model nodes and GearForce views/extensions
- links sensor streams to machines through contextualization
- stores historical readings in classic CDF Time Series
- runs **threshold-based** anomaly detection (not ML-based predictive maintenance)
- supports maintenance decisions through structured monitoring outputs

### Application problem

GearForce has an existing contextualized monitoring backend, but **no dedicated Flows operational interface**. The maintenance engineer must manually correlate machines, linked sensors, sensor trends, and anomaly information across separate CDF resources and UI surfaces.

**(APPLICATION-LEVEL ASSUMPTION:** a unified Flows application reduces that manual correlation effort during investigation.)

### What this application is not

- **Not** the Asset 360 Investigation Workspace (certification tutorial — methodology reference only)
- **Not** ML-based predictive maintenance
- **Not** a backend build, migration, or data-ingestion tool
- **Not** a replacement for SAP, historian, MES, CMMS, SharePoint, Teams, or other external systems (not mentioned in implementation documentation)

---

## 3. Primary User

**Maintenance Engineer** at GearForce Manufacturing.

| Attribute | Value |
| --- | --- |
| **Role** | Responds to equipment health signals; supports maintenance decisions across three production lines |
| **Environment** | Maintenance office or control area **(APPLICATION-LEVEL ASSUMPTION)** |
| **Device** | Desktop or laptop **(APPLICATION-LEVEL ASSUMPTION)** |
| **Validation** | No user interviews documented in implementation documentation |

---

## 4. Goals

1. **Identify machines requiring attention** using machine health and threshold-based anomaly information from the existing backend.
2. **Inspect machine context** from implemented data-model views (`Factory_View`, `ProductionLine_View`, `Machine_View`).
3. **Inspect linked sensors** via the implemented `Sensor_View` relationship to machines.
4. **Inspect sensor readings** from CDF Time Series using `timeseriesExternalId`.
5. **Inspect historical trends** with bounded time windows.
6. **Understand threshold breaches** using documented thresholds and detector output fields.
7. **Trace anomalies** from anomaly → timeseries → sensor → machine.
8. **Distinguish** normal, loading, empty, error, and no-access states.
9. Operate **read-only** over live CDF data with no static production fixtures.

---

## 5. User Stories

Tag key: **Supported** = backend capability exists · **Proposed** = application product decision · **Partial** = backend data exists; UI/integration TBD

### US-001 — Application entry *(Proposed)*

As a Maintenance Engineer, I want to open GearForce Smart Factory Monitoring from Fusion, so that I can begin monitoring machine health in one place.

### US-002 — Factory and production-line overview *(Supported / Partial UI)*

As a Maintenance Engineer, I want to see the factory structure and production lines with their machines, so that I can choose where to investigate.

*Backend:* `Factory_View`, `ProductionLine_View`, `Machine_View` in `gearforce_instances`; 1 factory, 3 production lines, 7 machines. Exact UI representation — **implementation decision / verification required**.

### US-003 — Machine discovery and selection *(Supported)*

As a Maintenance Engineer, I want to discover and select any of the seven machines, so that I can investigate its health.

*Backend:* 7 `Machine_View` nodes.

### US-004 — Machine details *(Supported)*

As a Maintenance Engineer, I want to view verified machine information for a selected machine, so that I have context before inspecting sensors.

*Backend:* `Machine_View` instance properties (exact property set — **implementation verification required**).

### US-005 — Linked sensors *(Supported)*

As a Maintenance Engineer, I want to see all sensors linked to a selected machine, so that I know which measurements are available.

*Backend:* 16 `Sensor_View` nodes; relationship to machines via the **implemented sensor-to-machine relation** (inherited CogniteTimeSeries `assets` contextualization). **Do not** reconstruct links from naming conventions.

### US-006 — Sensor metadata *(Supported)*

As a Maintenance Engineer, I want to see each sensor's type, unit, and identity, so that I interpret readings correctly.

*Backend:* `Sensor_View` metadata including `timeseriesExternalId`.

### US-007 — Recent/latest readings *(Supported / Partial)*

As a Maintenance Engineer, I want to see the recent or latest reading for a sensor, so that I understand current conditions.

*Backend:* CDF Time Series datapoints accessed via `timeseriesExternalId`. Retrieval method — **implementation decision / verification required**.

### US-008 — Historical trends *(Supported)*

As a Maintenance Engineer, I want to view a bounded historical trend for a sensor, so that I can see how readings changed over time.

*Backend:* Historical datapoints in classic CDF Time Series (written by backend transformations).

### US-009 — Anomaly visibility *(Supported / Partial integration)*

As a Maintenance Engineer, I want to see whether threshold-based anomalies have been detected, so that I can prioritize machines requiring attention.

*Backend:* Existing CDF Python Function (cognite-sdk). Result retrieval in Flows — **implementation decision / verification required**.

### US-010 — Anomaly details *(Supported)*

As a Maintenance Engineer, I want to view each anomaly's timeseries externalId, sensor type, anomaly value, and threshold, so that I understand what breached and when the abnormal condition began.

*Backend:* Detector identifies **first threshold-crossing reading** in scanned recent datapoints (not "latest value only" semantics).

### US-011 — Traceability *(Supported / Proposed workflow)*

As a Maintenance Engineer, I want to navigate from an anomaly to the affected sensor and machine, so that I can complete an investigation without manual cross-referencing.

*Backend:* Anomaly `timeseries externalId` → `Sensor_View.timeseriesExternalId` → implemented sensor-to-machine relation → `Machine_View`.

### US-012 — Normal health state *(Supported)*

As a Maintenance Engineer, I want to clearly see when no anomalies are reported, so that I do not confuse healthy state with missing data.

### US-013 — Investigation session *(Proposed)*

As a Maintenance Engineer, I want to complete a basic machine-health investigation in one application session, so that I can support maintenance prioritization.

---

## 6. Acceptance Scenarios

### Hierarchy and machines

**AS-001** — All machines discoverable  
Given the application loads and CDF data is available,  
When the user views the factory/machine overview,  
Then all **7 machines** can be discovered.

**AS-002** — Machine details  
Given the user selects a machine,  
When the machine detail view loads,  
Then verified properties from `Machine_View` are displayed.

**AS-003** — No machines  
Given no machine data can be retrieved,  
When the overview loads,  
Then a meaningful empty state is shown (not a blank screen).

### Sensors

**AS-004** — Linked sensors from relation  
Given a machine is selected,  
When sensor information loads,  
Then linked sensors are returned via the **existing implemented sensor-to-machine relation** (not naming conventions).

**AS-005** — Sensor metadata  
Given sensors are displayed,  
When metadata loads,  
Then sensor type, unit, and identifying information (including `timeseriesExternalId` where appropriate) are shown.

**AS-006** — No sensors  
Given a machine has no linked sensors,  
When the machine view loads,  
Then the sensor area shows a meaningful empty state.

### Timeseries

**AS-007** — Values from CDF Time Series  
Given a sensor has a valid `timeseriesExternalId`,  
When readings are requested,  
Then values are retrieved from the **actual CDF Time Series** object (not from the CogniteTimeSeries data-model node directly).

**AS-008** — Bounded historical trends  
Given historical datapoints exist,  
When the user views a trend,  
Then the query uses a **bounded time window** (not unbounded full history).

**AS-009** — No datapoints  
Given a sensor exists but no datapoints are available,  
When the user views readings or trends,  
Then a meaningful no-datapoints empty state is shown.

**AS-010** — Loading  
Given timeseries data is loading,  
When the user views a sensor panel,  
Then a loading indicator is shown until data arrives or an error is displayed.

### Anomalies

**AS-011** — Existing anomaly results displayed  
Given the anomaly detector has produced results,  
When the user views anomaly information,  
Then the application displays results from the **existing detector** (`status`, `anomaly_count`, `anomalies`).

**AS-012** — Thresholds correct  
Given anomalies are displayed,  
When threshold context is shown,  
Then documented thresholds are used: temperature **> 85 °C**, vibration **> 4.0 mm/s**, motor current **> 17 A**.

**AS-013** — Normal vs anomaly distinct  
Given `status` indicates all normal or zero anomalies,  
When the user views health state,  
Then normal state is clearly distinct from loading, empty, and error states.

**AS-014** — Anomaly traceability  
Given an anomaly includes a timeseries externalId,  
When the user investigates it,  
Then the user can trace **anomaly → timeseries → sensor → machine** using implemented relationships.

**AS-015** — Anomaly value semantics  
Given an anomaly is displayed,  
When the anomaly value is shown,  
Then the application displays the **detector-provided anomaly value** (threshold-crossing value from scanned data) and does **not** redefine it as "latest datapoint only" or recalculate in the frontend.

**AS-016** — Anomaly retrieval failure  
Given anomaly results cannot be retrieved,  
When the anomaly section loads,  
Then an error or unavailable state is shown; unrelated sections remain usable where feasible.

### Resilience, access, read-only

**AS-017** — Isolated errors  
Given one data request fails,  
When the page loads,  
Then the affected section shows error/retry state while independent sections remain usable where feasible.

**AS-018** — No unauthorized access  
Given the user lacks access to a resource,  
When the application requests it,  
Then unauthorized data is not exposed and a no-access state is shown where determinable.

**AS-019** — Read-only  
Given any user interaction,  
When data operations occur,  
Then the application performs no writes to RAW, instances, datapoints, transformations, functions, schedules, or workflows.

**AS-020** — Live data only  
Given production usage,  
When data is displayed,  
Then machines, sensors, readings, trends, and anomalies come from live CDF sources — not static fixture files.

---

## 7. Functional Requirements

### Application entry and data source

| ID | Requirement |
| --- | --- |
| **FR-001** | The application MUST load in Fusion using the standard Apps API authentication pattern (`connectToHostApp`, `CogniteSdkProvider`). |
| **FR-002** | The application MUST use live CDF data in production; MUST NOT use static JSON fixtures as the production data source. |
| **FR-003** | The application MUST present a task-oriented entry view (factory/machine overview). |

### Hierarchy and machines

| ID | Requirement |
| --- | --- |
| **FR-004** | The application MUST represent the hierarchy **Factory → Production Line → Machine** using implemented data-model views. |
| **FR-005** | The application MUST expose all **7** `Machine_View` instances. |
| **FR-006** | The application MUST NOT require the **legacy Assets API** as the authoritative mechanism for machine details. |
| **FR-007** | The application MUST NOT invent asset graph relationships not present in the implemented backend. |
| **FR-008** | The application MUST display verified properties from `Machine_View` for the selected machine. |

### Sensors

| ID | Requirement |
| --- | --- |
| **FR-009** | The application MUST list sensors linked to a machine via the **implemented Sensor_View sensor-to-machine relation**. |
| **FR-010** | The application MUST NOT reconstruct sensor-machine links from naming conventions alone. |
| **FR-011** | The application MUST display `Sensor_View` metadata including sensor type, unit, and `timeseriesExternalId`. |
| **FR-012** | The application MUST support the documented sensor measurement types present in backend data: temperature, vibration, motor current. |

### Timeseries

| ID | Requirement |
| --- | --- |
| **FR-013** | The application MUST use `timeseriesExternalId` from `Sensor_View` to access the **classic CDF Time Series** containing datapoints. |
| **FR-014** | The application MUST NOT assume that querying the CogniteTimeSeries data-model node directly returns datapoints. |
| **FR-015** | The application MUST NOT create a new datapoint storage mechanism. |
| **FR-016** | The application MUST NOT use RAW tables as the normal UI data source. |
| **FR-017** | The application MUST retrieve historical trends using a **bounded time window or limit**. |
| **FR-018** | The application MUST NOT load full history for all 16 sensors on initial page load. |
| **FR-019** | The application SHOULD display recent or latest readings where CDF Time Series data is available. |

### Anomalies

| ID | Requirement |
| --- | --- |
| **FR-020** | The application MUST treat the **existing anomaly detector** as the authoritative source of threshold-based anomaly status. |
| **FR-021** | The application MUST NOT independently recalculate anomaly status in the frontend. |
| **FR-022** | The application MUST NOT describe anomalies as ML-based predictions. |
| **FR-023** | The application MUST display detector output faithfully: `status`, `anomaly_count`, `anomalies`. |
| **FR-024** | For each anomaly, the application MUST display: timeseries externalId, sensor type, **anomaly value**, threshold. |
| **FR-025** | The application MUST NOT redefine anomaly semantics as "latest datapoint only." |
| **FR-026** | The application MUST present threshold context: temperature **> 85 °C**, vibration **> 4.0 mm/s**, motor current **> 17 A**. |
| **FR-027** | The application SHOULD indicate which machines are affected by current anomaly findings where determinable from detector output and data-model relationships. |

### States and resilience

| ID | Requirement |
| --- | --- |
| **FR-028** | The application MUST show loading indicators for sections awaiting data. |
| **FR-029** | The application MUST show meaningful empty states (no machines, no sensors, no datapoints, no anomalies). |
| **FR-030** | The application MUST show error/retry states for failed requests without blank sections. |
| **FR-031** | Independent panels SHOULD load without unnecessarily blocking the entire application. |
| **FR-032** | A failure in one section MUST NOT crash the entire application where isolation is feasible. |
| **FR-033** | The application MUST distinguish normal, anomalous, loading, empty, error, and no-access states. |

### Navigation and UX

| ID | Requirement |
| --- | --- |
| **FR-034** | The application MUST support task-oriented navigation: overview → machine → sensor → trend/anomaly without requiring users to understand CDF spaces, containers, or views. |
| **FR-035** | The application MUST support desktop/laptop layouts as the primary target. |

### Authentication, security, read-only

| ID | Requirement |
| --- | --- |
| **FR-036** | The application MUST authenticate via the Fusion host; MUST NOT embed credentials or secrets. |
| **FR-037** | The application MUST respect CDF permissions; MUST NOT expose unauthorized data. |
| **FR-038** | The application MUST NOT write to RAW, data-model instances, timeseries datapoints, transformations, functions, schedules, or workflows. |
| **FR-039** | The application MUST NOT create work orders, control equipment, trigger repairs, or modify the anomaly detector. |
| **FR-040** | The application MUST NOT create new backend CDF resources. |

---

## 8. Existing Backend Architecture

### Facility (source-supported)

| Element | Count |
| --- | --- |
| Factory | 1 |
| Production lines | 3 |
| Machines | 7 |
| Assets total (hierarchy) | 11 |
| Sensor time series | 16 |

Sensor types: **temperature**, **vibration**, **motor current**.

### Data model spaces

| Space | Role |
| --- | --- |
| **`gearforce_model`** | Schema space — view and extension definitions |
| **`gearforce_instances`** | Instance space — populated nodes used by the application |

### Implemented custom model (source-supported)

- **`assets_extension`**
- **`Factory_View`**
- **`ProductionLine_View`**
- **`Machine_View`** — 7 machine instances
- **`Sensor_View`** — 16 sensor instances

GearForce views extend/use the **Cognite Core Data Model** where implemented by the existing backend. **Do not invent additional GearForce views.**

### Sensor-to-machine relationship

- `Sensor_View` has the **implemented relation** to the associated machine.
- Relationship is established through **CogniteTimeSeries `assets` contextualization** (inherited).
- The application MUST use this existing relationship.

### Backend pipeline (source-supported)

Transformations:

- populate asset/data-model nodes
- populate machine and sensor views
- contextualize sensors to machines
- write historical datapoints to classic CDF Time Series

### Automation (source-supported)

| Resource | Schedule |
| --- | --- |
| Anomaly detector (CDF Python Function, cognite-sdk) | **Hourly** |
| Backend workflow | **Daily at midnight UTC** — orchestrates the implemented pipeline |

The Flows application **does not** create or modify schedules or workflows.

### Asset representation principle

The **legacy Assets API is not** the authoritative implementation mechanism. The completed backend uses **CogniteAsset data-model nodes** and GearForce views/extensions. The application MUST use the verified data-model representation.

---

## 9. Asset Hierarchy

### Documented structure

```
Factory (1)
├── Production Line 1
│   └── Machines (subset of 7)
├── Production Line 2
│   └── Machines (subset of 7)
└── Production Line 3
    └── Machines (subset of 7)
```

### View mapping

| Hierarchy level | Primary source |
| --- | --- |
| Factory | `Factory_View` |
| Production line | `ProductionLine_View` |
| Machine | `Machine_View` (7 nodes) |

The UI MUST represent **Factory → Production Line → Machine** without inventing relationships not in the implemented backend.

If factory/production-line display requires additional verified CDF surfaces beyond these views, that is an **implementation decision / verification required** (see §22).

---

## 10. Sensor and Timeseries Architecture

### Critical distinction (source-supported)

| Layer | Purpose |
| --- | --- |
| **`Sensor_View` (data model)** | Contextualized sensor metadata — type, unit, `timeseriesExternalId`, machine relation |
| **Classic CDF Time Series** | Actual datapoint storage and retrieval |
| **CogniteTimeSeries data-model node** | Contextualized modeling — **not** the same object as the classic timeseries containing datapoints |

### Application rules

1. Use **`Sensor_View`** for contextualized sensor metadata and machine linkage.
2. Use **`timeseriesExternalId`** to locate and query the **classic CDF Time Series** for latest/recent and historical datapoints.
3. **Do not** assume CogniteTimeSeries node queries return datapoints.
4. **Do not** query RAW as the normal UI source.
5. **Do not** load unbounded history for all 16 sensors on initial load.
6. Historical trend queries **MUST** be bounded.

### Charting

Trend visualization is required at the product level. Charting library/component choice is an **implementation decision** — not specified here.

---

## 11. Anomaly Detection

### Type

**Threshold-based** — **not** ML-based predictive maintenance.

### Implementation (source-supported)

- CDF **Python Function** using **cognite-sdk**
- Evaluates **recent datapoints** per monitored timeseries
- Thresholds:
  - temperature **> 85 °C**
  - vibration **> 4.0 mm/s**
  - motor current **> 17 A**

### Semantics (source-supported)

The detector does **not** simply treat the newest datapoint as the anomalous reading. Because sensor series can spike and return to baseline, the implementation identifies the **first threshold-crossing reading** within the scanned data to indicate when the abnormal condition began.

### Application rules

| Rule | Detail |
| --- | --- |
| Authoritative source | Existing detector only |
| Frontend recalculation | **MUST NOT** |
| Display | Faithful to detector output |
| Value field | Display detector-provided **anomaly value** (threshold-crossing value) |
| ML claims | **MUST NOT** |

### Detector output (source-supported)

| Field | Description |
| --- | --- |
| `status` | Overall anomaly status |
| `anomaly_count` | Count of anomalies |
| `anomalies` | List of breach entries |
| Per anomaly: timeseries externalId | Links to timeseries / sensor |
| Per anomaly: sensor type | e.g. temperature, vibration, current |
| Per anomaly: value | Threshold-crossing value from scanned data |
| Per anomaly: threshold | Applicable threshold |

### Retrieval in Flows

The application SHALL display anomaly results from the existing detector. The exact mechanism for retrieving historical function results is **not verified** in implementation documentation — **implementation decision / verification required** during planning. **Do not invent** a specific API endpoint or SDK method in this specification.

---

## 12. Navigation / User Workflow

**(APPLICATION-LEVEL PROPOSAL)** — task-oriented; users must not need to understand CDF schema concepts.

```
Open application
    ↓
Factory / machine overview
    ↓
Select machine
    ↓
Inspect machine details
    ↓
Inspect linked sensors
    ↓
Select sensor
    ↓
View latest/recent reading
    ↓
View historical trend
    ↓
Inspect anomaly information
    ↓
Trace anomaly → sensor → machine
    ↓
Support maintenance prioritization
```

Exact navigation structure (routes, panels, deep links) — **implementation decision**.

---

## 13. UI / UX Requirements

### Design principles

- Design around the **maintenance investigation workflow**
- Prioritize **machine health** and **abnormal conditions**
- Avoid unnecessary information density
- Provide clear loading, empty, error, and no-access feedback
- Maintain consistent interaction patterns
- Avoid unnecessary navigation away from investigation context
- Support **desktop/laptop** usage
- Follow **accessibility** best practices
- Follow **Cognite Flows / Aura** design practices (specific components — implementation decision)

### Required capabilities

| # | Capability |
| --- | --- |
| 1 | Clear machine / factory overview |
| 2 | Machine selection |
| 3 | Clear machine identity |
| 4 | Sensor type and unit |
| 5 | Historical trend visualization |
| 6 | Threshold context for breaches |
| 7 | Anomaly state indication |
| 8 | Loading states |
| 9 | Empty states |
| 10 | Error states |
| 11 | No-access states |
| 12 | Clear navigation |
| 13 | Responsive desktop/laptop layout |
| 14 | Accessible interactions |

Visual encoding of anomaly severity — **implementation decision** if not defined in source documentation.

---

## 14. Loading / Empty / Error / No-Access States

| State | Condition | Required behavior |
| --- | --- | --- |
| **Loading** | CDF request in progress | Loading indicator in affected section |
| **No machines** | No `Machine_View` data retrievable | Meaningful empty state |
| **No sensors** | Machine has no linked sensors | Meaningful empty state on sensor panel |
| **No datapoints** | Sensor exists; no timeseries datapoints | Meaningful empty state on reading/trend panel |
| **No anomalies** | Detector reports normal / zero count | Clear normal-health state (distinct from empty data) |
| **Anomaly present** | Detector reports breaches | Display count and breach details |
| **Data error** | Request failure | Error/retry; other sections usable where feasible |
| **No access** | Permission denied | No unauthorized exposure; no-access state |
| **Application error** | Unexpected UI failure | Recoverable error (retry or navigate back) |

---

## 15. Authentication / Authorization

| Requirement | Detail |
| --- | --- |
| Mechanism | Apps API: `connectToHostApp`, `CogniteSdkProvider`, `useCogniteSdk()` |
| Tokens | Host-provided; no credentials in source |
| Permissions | Respect user's CDF ACLs |
| Failure | Fail safely; show no-access where determinable |
| Secrets | MUST NOT embed in frontend or committed config |
| Scope | Read-only — no unnecessary write permissions |

---

## 16. Performance Requirements

No hard latency numbers are documented. Practical requirements:

| ID | Requirement |
| --- | --- |
| **PR-001** | Query only data needed for the current view |
| **PR-002** | Use bounded time windows for historical trends |
| **PR-003** | Do not load full history for all 16 sensors on initial load |
| **PR-004** | Use pagination/batching where CDF APIs support it |
| **PR-005** | Independent panels SHOULD load concurrently without unnecessary global blocking |

**Proposed validation target (not a source requirement):** overview and machine views become interactive within reasonable desktop network conditions — exact threshold set during implementation planning.

---

## 17. Security Requirements

| ID | Requirement |
| --- | --- |
| **SEC-001** | No secrets in source code or frontend bundles |
| **SEC-002** | Standard Flows host authentication only |
| **SEC-003** | Least privilege; respect CDF permissions |
| **SEC-004** | No direct credential handling in UI |
| **SEC-005** | No unauthorized data exposure |
| **SEC-006** | Read-only v1 — no write API calls |
| **SEC-007** | External navigation via host APIs if needed |

---

## 18. Testing / Verification Requirements

Tests are not written in this step. The following MUST be verifiable:

| Area | Verification |
| --- | --- |
| Machine discovery | All 7 machines discoverable |
| Machine details | Verified `Machine_View` properties displayed |
| Sensor relation | Linked sensors from implemented relation only |
| Sensor metadata | Type, unit, `timeseriesExternalId` correct |
| Timeseries values | Retrieved from classic CDF Time Series |
| Bounded trends | No unbounded full-history fetch by default |
| Missing datapoints | Meaningful empty state |
| Anomaly display | Existing detector results shown faithfully |
| Thresholds | 85 °C, 4.0 mm/s, 17 A presented correctly |
| Normal vs anomaly | States clearly distinct |
| Traceability | anomaly → timeseries → sensor → machine |
| Loading / error / no-access | Isolated where feasible |
| Read-only | No write operations |
| Authorization | No unauthorized exposure |
| Live data | No production static fixtures |

Mock CDF clients MAY be used in automated tests only.

---

## 19. Success Criteria

### Required (SC-001–SC-010)

| ID | Criterion |
| --- | --- |
| **SC-001** | User can identify a machine requiring attention from health/anomaly information |
| **SC-002** | User can navigate factory hierarchy to a selected machine |
| **SC-003** | User can inspect linked sensors via implemented relationships |
| **SC-004** | User can inspect recent/latest readings where available |
| **SC-005** | User can inspect bounded historical sensor trends |
| **SC-006** | User can understand threshold breaches and detector-provided anomaly values |
| **SC-007** | User can trace anomaly → timeseries → sensor → machine |
| **SC-008** | User can distinguish normal, loading, empty, error, and no-access states |
| **SC-009** | User can complete a basic machine-health investigation in one session |
| **SC-010** | Application remains read-only with live CDF data in production |

### Proposed validation metrics (not source requirements)

| ID | Metric |
| --- | --- |
| **SC-P01** | Investigation without opening CDF Functions UI for anomaly results |
| **SC-P02** | No quantitative downtime-reduction claims |

---

## 20. Out of Scope

- Equipment control or machine write-back
- Work-order creation; CMMS integration
- SAP, historian, MES, SharePoint, Teams, or other external systems
- ML-based predictive models
- Frontend recalculation of anomaly status
- Modifications to RAW, instances, datapoints, model, transformations, functions, schedules, workflows
- New backend CDF resources
- Legacy Assets API as primary machine model
- RAW tables as normal UI data source
- Asset 360 Investigation Workspace (tutorial reference only)
- Mobile/tablet-specific UI for v1

---

## 21. Assumptions

| ID | Assumption |
| --- | --- |
| **A-001** | Primary user is **Maintenance Engineer** (no documented interviews) |
| **A-002** | **Desktop/laptop** is primary device |
| **A-003** | Flows app provides a **unified investigation interface** |
| **A-004** | **v1 is read-only** |
| **A-005** | GearForce CDF backend is **deployed, populated, and verified** |
| **A-006** | `Machine_View`, `Sensor_View`, `Factory_View`, `ProductionLine_View` are primary contextual data sources |
| **A-007** | Existing detector is sole authoritative anomaly source |
| **A-008** | Unified UI reduces manual CDF correlation **(proposed)** |
| **A-009** | `externalId: Gear-box` per App Brief; `app.json` alignment pending |
| **A-010** | CDF deployment target connection to GearForce project — **verification required** |

**Do not present assumptions as backend facts.**

---

## 22. Open Questions / Implementation Decisions

| ID | Question | Status |
| --- | --- | --- |
| **OQ-001** | Exact verified mechanism to retrieve anomaly detector call results | **Verification required** |
| **OQ-002** | Deployed anomaly function external ID | **Verification required** |
| **OQ-003** | Exact DMS query patterns for `Factory_View`, `ProductionLine_View`, `Machine_View`, `Sensor_View` | **Verification required** |
| **OQ-004** | Exact view/version identifiers | **Verification required** |
| **OQ-005** | Exact `Machine_View` / `Sensor_View` property names for UI display | **Verification required** |
| **OQ-006** | Factory/production-line UI if views alone are insufficient | **Implementation decision** |
| **OQ-007** | Charting library/component | **Implementation decision** |
| **OQ-008** | Navigation structure (routes, panels, host-synced state) | **Implementation decision** |
| **OQ-009** | Default trend time window | **Implementation decision** |
| **OQ-010** | CDF deployment project for GearForce backend | **Verification required** |
| **OQ-011** | Stakeholder validation of Maintenance Engineer persona | **Verification required** |
| **OQ-012** | Align `app.json` with App Brief | **Verification required** |

**Backend capabilities in OQ list are already implemented; only Flows integration details remain open.**

---

## 23. Source-Supported Facts vs Application Assumptions

### Source-supported facts

*(GearForce implementation documentation — verified backend)*

- Facility: 1 factory, 3 production lines, 7 machines, 11 assets; 16 sensor timeseries (temperature, vibration, motor current)
- Spaces: `gearforce_model` (schema), `gearforce_instances` (instances)
- Model: `assets_extension`, `Factory_View`, `ProductionLine_View`, `Machine_View`, `Sensor_View`; Cognite Core Data Model extensions
- 7 `Machine_View` nodes; 16 `Sensor_View` nodes
- Sensor-to-machine via implemented relation (CogniteTimeSeries `assets` contextualization)
- Classic CDF Time Series hold datapoints; `Sensor_View.timeseriesExternalId` locates them
- Transformations populate nodes, contextualize sensors, write historical datapoints
- Threshold-based anomaly detector (cognite-sdk Python Function); recent datapoint scan; first threshold-crossing semantics
- Thresholds: > 85 °C, > 4.0 mm/s, > 17 A
- Output: `status`, `anomaly_count`, `anomalies` (timeseries externalId, sensor type, value, threshold)
- Anomaly schedule: hourly; workflow: daily midnight UTC
- Backend implemented and verified; Flows app is presentation layer; v1 read-only
- Legacy Assets API is not authoritative; CogniteAsset data-model nodes are

### Application-level assumptions

- Maintenance Engineer persona; desktop usage
- Unified Flows investigation UI; reduced manual CDF correlation
- Task-oriented navigation workflow (§12)
- Single-session investigation without Functions UI (proposed)
- Tier 1 certification tier; `Gear-box` externalId

### Open questions

See §22. Critical: anomaly result retrieval (OQ-001), function external ID (OQ-002), DMS query patterns (OQ-003).

---

*Specification v2.0 — reconciled with completed GearForce implementation documentation and `App-Brief.md`. Flows frontend implementation pending.*
