import { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import type { TelemetryCreate } from "../types/telemetry";

interface TelemetryFormProps {
  onSubmit: (telemetry: TelemetryCreate) => Promise<void> | void;
  onClose: () => void;
}

interface FormValues {
  satelliteId: string;
  timestamp: string;
  altitude: string;
  velocity: string;
  status: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const validateForm = (form: FormValues): FormErrors => {
  const errors: FormErrors = {};

  if (!form.satelliteId.trim()) {
    errors.satelliteId = "Satellite ID is required.";
  }

  if (!form.timestamp || Number.isNaN(new Date(form.timestamp).getTime())) {
    errors.timestamp = "Enter a valid date and time.";
  }

  const altitude = Number(form.altitude);

  if (!form.altitude.trim() || !Number.isFinite(altitude) || altitude <= 0) {
    errors.altitude = "Altitude must be greater than 0.";
  }

  const velocity = Number(form.velocity);

  if (!form.velocity.trim() || !Number.isFinite(velocity) || velocity <= 0) {
    errors.velocity = "Velocity must be greater than 0.";
  }

  if (!form.status.trim()) {
    errors.status = "Status is required.";
  }

  return errors;
};
const getCurrentLocalTimestamp = (): string => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

  return localTime.toISOString().slice(0, 16);
};

const createInitialValues = (): FormValues => ({
  satelliteId: "",
  timestamp: getCurrentLocalTimestamp(),
  altitude: "",
  velocity: "",
  status: "",
});

export default function TelemetryForm({
  onSubmit,
  onClose,
}: TelemetryFormProps) {
  const [form, setForm] = useState<FormValues>(createInitialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setFormErrors(validationErrors);
    setError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const telemetry: TelemetryCreate = {
        satelliteId: form.satelliteId.trim(),
        timestamp: new Date(form.timestamp).toISOString(),
        altitude: Number(form.altitude),
        velocity: Number(form.velocity),
        status: form.status.trim(),
      };

      await onSubmit(telemetry);
      setForm(createInitialValues());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create telemetry entry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <Paper sx={{ p: 3, width: "100%" }}>
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add Telemetry
      </Typography>

      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField
          id="telemetry-satellite-id"
          label="Satellite ID"
          value={form.satelliteId}
          onChange={(e) => handleChange("satelliteId", e.target.value)}
          error={!!formErrors.satelliteId}
          helperText={formErrors.satelliteId}
          required
          fullWidth
        />

        <TextField
          id="telemetry-timestamp"
          label="Timestamp"
          type="datetime-local"
          value={form.timestamp}
          onChange={(e) => handleChange("timestamp", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!formErrors.timestamp}
          helperText={
            formErrors.timestamp ??
            "Date and time must be valid ISO 8601 datetime."
          }
          required
          fullWidth
        />

        <TextField
          id="telemetry-altitude"
          label="Altitude"
          type="number"
          value={form.altitude}
          onChange={(e) => handleChange("altitude", e.target.value)}
          slotProps={{ htmlInput: { step: "any" } }}
          error={!!formErrors.altitude}
          helperText={
            formErrors.altitude ?? "Altitude must be a number greater than 0."
          }
          required
          fullWidth
        />

        <TextField
          id="telemetry-velocity"
          label="Velocity"
          type="number"
          value={form.velocity}
          onChange={(e) => handleChange("velocity", e.target.value)}
          slotProps={{ htmlInput: { step: "any" } }}
          error={!!formErrors.velocity}
          helperText={
            formErrors.velocity ?? "Velocity must be a number greater than 0."
          }
          required
          fullWidth
        />

        <TextField
          id="telemetry-status"
          label="Status"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
          error={!!formErrors.status}
          helperText={formErrors.status}
          required
          fullWidth
        />

        {error && (
          <Typography color="error" role="alert">
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Telemetry"}
          </Button>
        </Stack>
      </Stack>
    </>
    // </Paper>
  );
}
