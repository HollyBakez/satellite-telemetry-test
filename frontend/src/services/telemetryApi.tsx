const BASE_URL = "http://localhost";
const PORT = "5173";
export const getAllTelemetryData = async () => {
  const response = await fetch(`${BASE_URL}:${PORT}/telemetry`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GET Error ${response.status}: ${errorText || response.text}`,
    );
  }

  return response.json();
};
