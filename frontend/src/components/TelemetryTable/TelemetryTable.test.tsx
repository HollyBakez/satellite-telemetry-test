import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TelemetryTable from "./TelemetryTable";
import type { Telemetry } from "../../types/telemetry";

const mockRows: Telemetry[] = [
  {
    id: "telemetry-1",
    satelliteId: "SAT-001",
    timestamp: "2026-10-18T12:00:00Z",
    altitude: 550,
    velocity: 7.6,
    status: "nominal",
  },
  {
    id: "telemetry-2",
    satelliteId: "SAT-002",
    timestamp: "2026-10-18T12:05:00Z",
    altitude: 650,
    velocity: 7.8,
    status: "warning",
  },
];

const renderTable = () =>
  render(
    <TelemetryTable
      rows={mockRows}
      loading={false}
      lastRefreshed={new Date("2026-10-18T12:10:00Z")}
      onRefresh={vi.fn()}
      onAdd={vi.fn()}
      onDelete={vi.fn().mockResolvedValue(undefined)}
    />,
  );

describe("TelemetryTable", () => {
  it("renders telemetry rows", async () => {
    renderTable();

    expect(await screen.findByText("SAT-001")).toBeInTheDocument();

    expect(await screen.findByText("SAT-002")).toBeInTheDocument();
  });

  it("calls onRefresh when Refresh is clicked", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(
      <TelemetryTable
        rows={mockRows}
        loading={false}
        lastRefreshed={null}
        onRefresh={onRefresh}
        onAdd={vi.fn()}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: /refresh/i }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("calls onAdd when Add Telemetry is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <TelemetryTable
        rows={mockRows}
        loading={false}
        lastRefreshed={null}
        onRefresh={vi.fn()}
        onAdd={onAdd}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole("button", { name: /add telemetry/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("filters rows by satellite ID", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("combobox", { name: /satellite id/i }));

    await user.click(screen.getByRole("option", { name: "SAT-001" }));

    // Scope assertions to the Data Grid, excluding the filter dropdown.
    const grid = screen.getByRole("grid");

    await waitFor(() => {
      expect(within(grid).getByText("SAT-001")).toBeInTheDocument();
      expect(within(grid).queryByText("SAT-002")).not.toBeInTheDocument();
    });
  });

  it("shows a confirmation dialog before deleting", async () => {
    const user = userEvent.setup();
    renderTable();

    const deleteButton = screen.getByRole("button", {
      name: /delete selected/i,
    });

    // No rows selected yet.
    expect(deleteButton).toBeDisabled();

    // Select the first row using its checkbox.
    const row = screen.getByRole("row", { name: /SAT-001/ });
    const checkbox = within(row).getByRole("checkbox");

    await user.click(checkbox);

    await user.click(screen.getByRole("button", { name: /delete selected/i }));

    expect(
      screen.getByRole("dialog", { name: /confirm deletion/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/delete 1 selected telemetry entry/i),
    ).toBeInTheDocument();
  });
});
