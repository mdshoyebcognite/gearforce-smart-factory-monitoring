---
appName: "GearForce Smart Factory Monitoring"
externalId: "Gear-box"
infra: "appsApi"
customer: "GearForce Manufacturing"
tier: "Tier 1: Monitoring & reporting"
owner: "Md Shoyeb <mdshoyeb@cognite.com>"
userCount: ""
businessValue: ""
milestones: ""
repoUrl: ""
userRole: "Maintenance Engineer at GearForce Manufacturing — responsible for responding to equipment health signals and supporting maintenance decisions across three production lines. Works primarily from a desktop in the maintenance office or control area. **(APPLICATION-LEVEL ASSUMPTION:** the implementation documentation describes maintenance decisions and threshold-based anomaly detection but does not name a specific UI persona or document user interviews; Maintenance Engineer is the proposed primary user for this monitoring and investigation experience.)"
currentProblem: "GearForce Manufacturing has an existing, verified contextualized monitoring backend on CDF — including factory/production-line/machine data-model nodes, 16 sensor time series, historical datapoints, and threshold-based anomaly detection. The Flows application should provide a unified operational interface where the maintenance engineer can inspect machines, linked sensors, sensor trends, and anomaly information without manually correlating these CDF resources across separate platform areas. **(APPLICATION-LEVEL ASSUMPTION:** today that investigation requires manual correlation across disparate CDF UI surfaces.)"
oneSentenceStory: "As a Maintenance Engineer, I want to investigate machines with abnormal sensor readings and understand their condition across the factory, so that I can prioritize maintenance actions based on threshold-based anomaly findings."
successCriteria: "Verifiable application outcomes: (1) identify machines requiring attention using machine health and anomaly information from the existing backend; (2) inspect machine information from the implemented data-model views; (3) inspect sensors linked to a machine via the implemented Sensor_View relationships; (4) view recent/latest sensor readings where available; (5) view historical sensor trends; (6) understand threshold breaches (temperature > 85 °C, vibration > 4.0 mm/s, motor current > 17 A) and structured anomaly output; (7) trace anomaly → sensor → machine; (8) distinguish normal, loading, empty, error, and no-access states; (9) complete a basic machine-health investigation within the application. **(PROPOSED APPLICATION BEHAVIOR:** investigation can be completed without opening the CDF Functions UI to read anomaly call results — not a documented backend requirement.)"
userEvidence: "No direct user interviews or field research are documented in the GearForce implementation documentation or this repository. The application need is derived from the documented GearForce monitoring scenario, implemented backend capabilities, and stated goals (contextualized assets and sensors, threshold-based anomaly detection, maintenance decision support)."
reviewedSections:
  - appDetails
  - who
  - problem
  - tasksAndSuccess
  - initialScope
  - outOfScope
  - sourceTraceability
---

# App Brief — GearForce Smart Factory Monitoring

## App details

- **Customer:** GearForce Manufacturing
- **Tier:** Tier 1: Monitoring & reporting
- **Owner:** Md Shoyeb <mdshoyeb@cognite.com>
- **Expected users:** *(not specified in implementation documentation — to be confirmed)*
- **Business value:** *(not specified in implementation documentation — to be confirmed)*
- **Milestones:** *(not specified in implementation documentation — to be confirmed)*
- **Repository:** *(not yet configured)*
- **App externalId:** Gear-box
- **Infra:** appsApi
- **CDF project context:** Flows app is a **read-only presentation and investigation layer** over an **already implemented and verified** GearForce Manufacturing CDF backend. The backend includes data modeling, transformations, threshold-based anomaly detection (CDF Python Function), hourly function schedule, and daily workflow orchestration.

## Who is this app for?

**Maintenance Engineer** at GearForce Manufacturing — responsible for responding to equipment health signals and supporting maintenance decisions across three production lines. Works primarily from a desktop in the maintenance office or control area.

**(APPLICATION-LEVEL ASSUMPTION:** the implementation documentation does not explicitly name a UI persona or document user interviews. Maintenance Engineer is the proposed primary user given the monitoring and maintenance-decision context.)

## What problem does this solve?

### Documented context (source-supported)

GearForce Manufacturing operates a contextualized Smart Factory Monitoring backend on CDF. The implemented solution links sensor streams to physical assets through Cognite Asset data-model nodes and contextualization, surfaces **threshold-based** anomalies (not ML-based predictive maintenance), and supports maintenance decisions.

### Application problem (product-level)

GearForce has an existing contextualized monitoring backend, but **no dedicated Flows operational interface**. The maintenance engineer must manually correlate machines, linked sensors, sensor trends, and anomaly information across separate CDF resources and UI surfaces.

**(APPLICATION-LEVEL ASSUMPTION:** a unified Flows application reduces that manual correlation effort during investigation.)

The Flows application does **not** replace or redesign the backend. It provides a read-only monitoring and investigation experience on top of what is already deployed.

## Tasks and success

**One-sentence story.** As a Maintenance Engineer, I want to investigate machines with abnormal sensor readings and understand their condition across the factory, so that I can prioritize maintenance actions based on threshold-based anomaly findings.

**Success criteria — verifiable application outcomes:**

1. **Identify machines requiring attention** using machine health and anomaly information from the existing backend.
2. **Inspect machine information** from the implemented data-model views (`Machine_View` and related hierarchy views).
3. **Inspect linked sensors** for a selected machine via `Sensor_View` and its relationship to machines.
4. **View recent/latest sensor readings** where available from CDF timeseries.
5. **View historical sensor trends** for investigation.
6. **Understand threshold breaches** using documented thresholds and structured anomaly output (`status`, `anomaly_count`, `anomalies` with timeseries externalId, sensor type, value, threshold).
7. **Trace anomaly → sensor → machine** using implemented data-model relationships.
8. **Distinguish normal, loading, empty, error, and no-access states** — no blank or ambiguous UI.
9. **Complete a basic machine-health investigation** within the application.

**Proposed application behavior (not a documented backend requirement):**

- A machine-health investigation can be completed in one application session without switching to the CDF Functions UI to read anomaly call results.

**User evidence.** No direct user interviews or field research are documented. The application need is derived from the implemented GearForce backend capabilities and documented monitoring/maintenance-decision goals.

## Initial application scope

This Flows application is a **read-only monitoring and investigation layer** over the completed GearForce CDF implementation.

| Capability area | Support | Notes |
| --- | --- | --- |
| Factory / production-line / machine visibility | **Supported** | `Factory_View`, `ProductionLine_View`, `Machine_View` in `gearforce_instances`; 1 factory, 3 production lines, 7 machines (11 assets total in hierarchy) |
| Machine selection | **Supported** | 7 `Machine_View` nodes |
| Sensor visibility | **Supported** | 16 `Sensor_View` nodes; linked to machines via inherited **CogniteTimeSeries `assets` relationship** |
| Sensor trend visualization | **Supported** | Historical datapoints written to CDF timeseries by backend transformations |
| Recent/latest sensor readings | **Supported** | Available from CDF timeseries; anomaly detector scans recent datapoints |
| Anomaly visibility | **Supported** | CDF Python Function (cognite-sdk); hourly schedule; structured output |
| Anomaly investigation | **Partially supported** | Backend provides breach details including when abnormal condition started (first threshold-crossing in scanned data); unified investigation workflow in Flows is **proposed application behavior** |
| Maintenance decision support | **Goal in documentation** | Specific UI workflow not defined in implementation documentation |

**Primary data access (source-supported):** Cognite Asset data-model nodes and views in `gearforce_model` / `gearforce_instances` — **not** the legacy Assets API as the primary implementation mechanism.

**Proposed application focus:** connect factory hierarchy, machine and sensor views, timeseries readings/trends, and threshold-based anomaly findings into one investigation workflow — without modifying the backend.

## Out of scope (initial)

The initial Flows application is **read-only**. It **must not** modify:

- CDF RAW data
- Data-model instances
- Timeseries datapoints
- Transformations
- Functions
- Schedules
- Workflows

Also out of scope unless explicitly required later:

- Equipment control or automated maintenance actions
- Work-order creation or CMMS integration
- SAP, historian, MES, SharePoint, Teams, or other external systems (not mentioned in implementation documentation)
- ML-based predictive maintenance (backend is **threshold-based** anomaly detection only)
- Redesign or extension of the existing CDF backend or data model
- **Asset 360 Investigation Workspace** (Flows certification tutorial — methodology reference only)

## Source-supported facts vs assumptions

### A. Source-supported facts

*(From GearForce implementation documentation — verified backend)*

**Facility and assets**

- GearForce Manufacturing: **1 factory**, **3 production lines**, **7 machines**, **11 assets total**
- **16 sensor time series**: temperature, vibration, motor current

**Data modeling**

- Spaces: **`gearforce_model`** (schema), **`gearforce_instances`** (instances)
- Implemented model includes: **`assets_extension`**, **`Factory_View`**, **`ProductionLine_View`**, **`Machine_View`**, **`Sensor_View`**, and relevant **Cognite Core Data Model** views
- **`Machine_View`** represents the **7 machines**
- **`Sensor_View`** represents the **16 sensors**
- Sensors associate to machines via the inherited **CogniteTimeSeries `assets` relationship** (contextualization) — not via a legacy Assets API as the primary mechanism

**Backend pipeline**

- Transformations populate asset/data-model nodes, machine and sensor views, contextualize sensors to machines, and write historical datapoints
- Backend is **already implemented and verified**
- Daily **workflow** orchestrates the backend pipeline
- Anomaly detector runs on an **hourly** schedule

**Anomaly detector (threshold-based — not ML)**

- CDF **Python Function** using **cognite-sdk**
- Scans **recent datapoints** per monitored timeseries
- Thresholds: temperature **> 85 °C**, vibration **> 4.0 mm/s**, motor current **> 17 A**
- Does **not** treat the latest datapoint as the only meaningful anomaly reading; because sensor spikes can return to baseline, the implementation identifies the **first threshold-crossing reading** in the scanned data to indicate when the abnormal condition started
- Produces: `status`, `anomaly_count`, `anomalies` — each anomaly includes timeseries externalId, sensor type, value, threshold

**Application role**

- Flows app is a **presentation/investigation layer** over this backend
- v1 is **read-only**

### B. Application-level assumptions

| Assumption | Rationale |
| --- | --- |
| **Primary user is a Maintenance Engineer** | Implementation docs do not name a UI persona or document interviews |
| **Desktop usage** in maintenance office or control area | Device/environment not specified |
| **Unified Flows UI reduces manual CDF correlation** | Backend exists; dedicated operational interface does not |
| **Read-only v1** | No write-back requirements in implementation documentation |
| **Tier 1: Monitoring & reporting** | From brief coaching; not in implementation documentation |
| **externalId `Gear-box`** | From brief coaching; `app.json` may still use scaffold value |
| **Investigation without CDF Functions UI** | Proposed application behavior, not a backend requirement |

### C. Proposed application behavior

- Single-session machine-health investigation across hierarchy, sensors, trends, and anomalies
- Clear UX for normal vs anomalous vs loading vs empty vs error vs no-access states
- Factory → production line → machine navigation using implemented data-model views

### D. Unresolved implementation questions

*(Material to product scope only — technical details deferred to SPEC / implementation planning)*

- Exact mechanism for retrieving anomaly detector results in the Flows app (not defined in implementation documentation)
- Confirmed CDF deployment project and function external ID for the deployed detector
- Stakeholder validation of Maintenance Engineer persona
- Expected users, business value, milestones, repository URL

---

*Do not treat items in §B–§D as source-supported backend facts.*
