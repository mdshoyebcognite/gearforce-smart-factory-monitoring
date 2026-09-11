# CDF Verification Notes — GearForce Smart Factory Monitoring

**Status:** Configuration aligned to GearForce implementation documentation. Live CDF probe required on first Fusion deploy.

## Application configuration

| Setting | Value | Notes |
| --- | --- | --- |
| App name | GearForce Smart Factory Monitoring | Updated in `app.json` |
| externalId | `Gear-box` | Per App-Brief.md |
| infra | `appsApi` | Unchanged |
| Deployment | `farhan-test` / `cog-farhan-dogfooding` | **VERIFY** contains GearForce resources on first deploy |

## Data model (from implementation documentation)

| Item | Expected value |
| --- | --- |
| Schema space | `gearforce_model` |
| Instance space | `gearforce_instances` |
| Views | `Factory_View`, `ProductionLine_View`, `Machine_View`, `Sensor_View` |
| View version | `v1` (`dmVersion` in toolkit `config.dev.yaml`) |
| Machine nodes | 7 |
| Sensor nodes | 16 |
| Machine properties | `location`, `type` (+ inherited `name`, `parent` from CogniteAsset) |
| Sensor properties | `sensorType`, `sourceUnit` (+ inherited `name`, `assets` relation from CogniteTimeSeries) |
| Line grouping | Derived from machine `parent` → production line, or parsed from externalId (`gearforce.machine.L1-M1` → `L1`) |
| Sensor-machine link | CogniteTimeSeries `assets` contextualization |

## Hierarchy strategy

**Selected:** View-native list + `lineId` grouping (Approach A/B hybrid)

- List `Machine_View` instances; group by `lineId` for production lines
- List `Factory_View` and `ProductionLine_View` for display names when available
- Does not use legacy Assets API

## Timeseries access

- Metadata: sensor node `externalId` equals classic time series `externalId` (e.g. `gearforce.L1.M1.temperature`)
- Datapoints: `client.datapoints.retrieveLatest` / `client.datapoints.retrieve` on classic Time Series externalId

## Anomaly detector

| Item | Value |
| --- | --- |
| Type | Threshold-based CDF Python Function (cognite-sdk) |
| Thresholds | temp > 85 °C, vibration > 4.0 mm/s, current > 17 A |
| Retrieval | Latest completed call via REST `GET .../functions/{id}/calls` + `.../calls/{callId}/response` |
| Function external ID | `fn_gearforce_anomaly_detector` (see `gearforce_anomaly_detector.Function.yaml`) |

**Does not re-invoke** the function on page load.
