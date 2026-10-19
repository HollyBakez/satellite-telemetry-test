import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTelemetry,
  deleteTelemetry,
  getAllTelemetryData,
  getTelemetry,
  getTelemetryAPIHealthCheck,
} from "./telemetryApi";
import type {
  DeleteTelemetryResponse,
  Telemetry,
  TelemetryCreate,
} from "../types/telemetry";

const mockTelemetry: Telemetry = {
  id: "telemetry-001",
  satelliteId: "SAT-001",
  timestamp: "2026-10-17T12:00:00.000Z",
  altitude: 400,
  velocity: 7.8,
  status: "nominal",
};

const mockTelemetryCreate: TelemetryCreate = {
  satelliteId: "SAT-001",
  timestamp: "2026-10-17T12:00:00.000Z",
  altitude: 400,
  velocity: 7.8,
  status: "nominal",
};

const mockDeleteResponse: DeleteTelemetryResponse = {
  status: "ok",
};

const mockFetch = vi.fn();

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const errorResponse = (message: string, status = 500) =>
  new Response(message, {
    status,
    statusText: "Internal Server Error",
  });

describe("telemetryApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getAllTelemetryData", () => {
    it("returns all telemetry records", async () => {
      mockFetch.mockResolvedValue(jsonResponse([mockTelemetry]));

      const result = await getAllTelemetryData();

      expect(result).toEqual([mockTelemetry]);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/telemetry?limit=all",
      );
    });

    it("throws an error when the request fails", async () => {
      mockFetch.mockResolvedValue(errorResponse("Server error", 500));

      await expect(getAllTelemetryData()).rejects.toThrow(
        "GET Error 500: Server error",
      );
    });

    it("throws an error when a network failure occurs", async () => {
      mockFetch.mockRejectedValue(new Error("Network unavailable"));

      await expect(getAllTelemetryData()).rejects.toThrow(
        "Network unavailable",
      );
    });
  });

  describe("createTelemetry", () => {
    it("creates a telemetry record with the correct request body", async () => {
      mockFetch.mockResolvedValue(jsonResponse(mockTelemetry, 201));

      const result = await createTelemetry(mockTelemetryCreate);

      expect(result).toEqual(mockTelemetry);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/telemetry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockTelemetryCreate),
        },
      );
    });

    it("throws an error when creation fails", async () => {
      mockFetch.mockResolvedValue(errorResponse("Invalid telemetry", 422));

      await expect(createTelemetry(mockTelemetryCreate)).rejects.toThrow(
        "POST Error 422: Invalid telemetry",
      );
    });
  });

  describe("deleteTelemetry", () => {
    it("deletes a telemetry record", async () => {
      mockFetch.mockResolvedValue(jsonResponse(mockDeleteResponse));

      const result = await deleteTelemetry("telemetry-001");

      expect(result).toEqual(mockDeleteResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/telemetry/telemetry-001",
        { method: "DELETE" },
      );
    });

    it("encodes special characters in the telemetry ID", async () => {
      mockFetch.mockResolvedValue(jsonResponse(mockDeleteResponse));

      await deleteTelemetry("satellite/001");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/telemetry/satellite%2F001",
        { method: "DELETE" },
      );
    });

    it("throws an error when deletion fails", async () => {
      mockFetch.mockResolvedValue(errorResponse("Telemetry not found", 404));

      await expect(deleteTelemetry("missing-id")).rejects.toThrow(
        "DELETE Error 404: Telemetry not found",
      );
    });
  });

  describe("getTelemetry", () => {
    it("returns a telemetry record by ID", async () => {
      mockFetch.mockResolvedValue(jsonResponse(mockTelemetry));

      const result = await getTelemetry("telemetry-001");

      expect(result).toEqual(mockTelemetry);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/telemetry/telemetry-001",
      );
    });

    it("throws an error when the record is not found", async () => {
      mockFetch.mockResolvedValue(errorResponse("Telemetry not found", 404));

      await expect(getTelemetry("missing-id")).rejects.toThrow(
        "GET Error 404: Telemetry not found",
      );
    });
  });

  describe("getTelemetryAPIHealthCheck", () => {
    it("returns true when the API responds successfully", async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

      await expect(getTelemetryAPIHealthCheck()).resolves.toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/");
    });

    it("returns false when the API responds with an error status", async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 500 }));

      await expect(getTelemetryAPIHealthCheck()).resolves.toBe(false);
    });

    it("returns false when the request fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network unavailable"));

      await expect(getTelemetryAPIHealthCheck()).resolves.toBe(false);
    });
  });
});
