import type {
  DeleteTelemetryResponse,
  Telemetry,
  TelemetryCreate,
} from "../types/telemetry";

const BASE_URL = "http://localhost";
const PORT = "8000";

export const getAllTelemetryData = async (): Promise<Telemetry[]> => {
  const response = await fetch(`${BASE_URL}:${PORT}/telemetry?limit=all`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GET Error ${response.status}: ${errorText || response.text}`,
    );
  }

  return response.json();
};

export const createTelemetry = async (
  telemetry: TelemetryCreate,
): Promise<Telemetry> => {
  const response = await fetch(`${BASE_URL}:${PORT}/telemetry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(telemetry),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `POST Error ${response.status}: ${errorText || response.statusText}`,
    );
  }

  return response.json() as Promise<Telemetry>;
};

export const deleteTelemetry = async (
  id: string,
): Promise<DeleteTelemetryResponse> => {
  const response = await fetch(
    `${BASE_URL}:${PORT}/telemetry/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `DELETE Error ${response.status}: ${errorText || response.statusText}`,
    );
  }

  return response.json() as Promise<DeleteTelemetryResponse>;
};

export const getTelemetry = async (id: string): Promise<Telemetry> => {
  const response = await fetch(
    `${BASE_URL}:${PORT}/telemetry/${encodeURIComponent(id)}`,
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `GET Error ${response.status}: ${errorText || response.statusText}`,
    );
  }

  return response.json() as Promise<Telemetry>;
};

export const getTelemetryAPIHealthCheck = async () => {
  try {
    const response = await fetch(`${BASE_URL}:${PORT}/`);
    if (!response.ok) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
