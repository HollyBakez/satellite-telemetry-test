import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TelemetryForm from "./TelemetryForm";
import type { TelemetryCreate } from "../types/telemetry";

function getInput(id: string): HTMLInputElement {
  const input = document.getElementById(id);

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Input #${id} was not found`);
  }

  return input;
}

describe("TelemetryForm", () => {
  const onSubmit =
    vi.fn<(telemetry: TelemetryCreate) => Promise<void> | void>();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderForm() {
    return render(<TelemetryForm onSubmit={onSubmit} onClose={onClose} />);
  }

  async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(getInput("telemetry-satellite-id"), "SAT-001");

    await user.clear(getInput("telemetry-timestamp"));
    await user.type(getInput("telemetry-timestamp"), "2026-10-17T12:00");
    await user.type(getInput("telemetry-altitude"), "400");
    await user.type(getInput("telemetry-velocity"), "7.8");
    await user.type(getInput("telemetry-status"), "nominal");
  }

  it("renders all form fields and buttons", () => {
    renderForm();

    expect(
      screen.getByRole("textbox", { name: "Satellite ID" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Altitude")).toBeInTheDocument();
    expect(screen.getByText("Velocity")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add Telemetry" }),
    ).toBeInTheDocument();
  });

  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Add Telemetry" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error when altitude is zero", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);

    await user.clear(getInput("telemetry-altitude"));
    await user.type(getInput("telemetry-altitude"), "0");

    await user.click(screen.getByRole("button", { name: "Add Telemetry" }));

    expect(
      await screen.findByText("Altitude must be greater than 0."),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error when velocity is negative", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);

    await user.clear(getInput("telemetry-velocity"));
    await user.type(getInput("telemetry-velocity"), "-1");

    await user.click(screen.getByRole("button", { name: "Add Telemetry" }));

    expect(
      await screen.findByText("Velocity must be greater than 0."),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid telemetry data", async () => {
    const user = userEvent.setup();
    onSubmit.mockResolvedValue(undefined);
    renderForm();

    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Add Telemetry" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      satelliteId: "SAT-001",
      timestamp: new Date("2026-10-17T12:00").toISOString(),
      altitude: 400,
      velocity: 7.8,
      status: "nominal",
    });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("displays an error when submission fails", async () => {
    const user = userEvent.setup();

    onSubmit.mockRejectedValue(new Error("Failed to create telemetry entry."));

    renderForm();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Add Telemetry" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to create telemetry entry.",
    );
  });
});
