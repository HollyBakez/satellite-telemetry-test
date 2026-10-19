export interface Telemetry {
  id: string;
  satelliteId: string;
  timestamp: string;
  altitude: number;
  velocity: number;
  status: string;
}

export interface TelemetryCreate {
  satelliteId: string;
  timestamp: string;
  altitude: number;
  velocity: number;
  status: string;
}

export interface DeleteTelemetryResponse {
  status: "ok";
}
