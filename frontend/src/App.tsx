import {
  Alert,
  Box,
  Chip,
  Container,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import TelemetryTable from "./components/TelemetryTable/TelemetryTable";
import {
  createTelemetry,
  deleteTelemetry,
  getAllTelemetryData,
  getTelemetryAPIHealthCheck,
} from "./services/telemetryApi";
import TelemetryForm from "./components/TelemetryForm/TelemetryForm";
import type { Telemetry, TelemetryCreate } from "./types/telemetry";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";

function App() {
  const [rows, setRows] = useState<Telemetry[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [telemetryApiStatus, setTelemetryApiStatus] =
    useState<string>("offline");

  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear any previous error
    try {
      const data = await getAllTelemetryData();
      setRows(data);
      setLastRefreshed(new Date());
    } catch (error) {
      setError(`Failed to fetch telemetry data: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const isApiHealthy = await getTelemetryAPIHealthCheck();
      if (isApiHealthy) {
        setTelemetryApiStatus("Online");
      } else {
        setTelemetryApiStatus("Offline");
      }
    } catch (error) {
      setTelemetryApiStatus("Offline");
    }
  }, []);

  const handleFetchTelemetryData = async () => {
    await fetchTelemetry();
  };
  const handleCreateTelemetry = async (telemetry: TelemetryCreate) => {
    await createTelemetry(telemetry);
    await fetchTelemetry();
    setIsFormOpen(false);
  };

  const handleDeleteTelemetry = async (ids: string[]) => {
    setDeleting(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        ids.map((id) => deleteTelemetry(id)),
      );

      const failedCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      await fetchTelemetry();

      if (failedCount > 0) {
        setError(
          `Failed to delete ${failedCount} of ${ids.length} selected entries.`,
        );
      }
    } catch {
      setError("Unable to complete telemetry deletion request.");
    } finally {
      setDeleting(false);
    }
  };
  //  On component mount, grab the latest Telemetry data
  useEffect(() => {
    void fetchTelemetry();
  }, [fetchTelemetry]);

  // On component mount, check backend server health connection
  useEffect(() => {
    void checkHealth();

    //  check backend health status every 30 seconds
    const interval = setInterval(() => {
      void checkHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <>
      <Box
        component="header"
        sx={{
          bgcolor: "#14283F",
          color: "#FFFFFF",
          px: 3,
          py: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SatelliteAltIcon sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4">Satellite Telemetry Dashboard</Typography>
            <Typography variant="body2" sx={{ color: "#D3DFEC", mt: 0.5 }}>
              Monitor and manage telemetry data
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F4F7FB",
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="subtitle1">
            Backend API Health Status:
            {telemetryApiStatus === "Online" ? (
              <Chip label="Online" color="success" />
            ) : (
              <Chip label="Offline" color="error" />
            )}
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TelemetryTable
              rows={rows}
              loading={loading || deleting}
              lastRefreshed={lastRefreshed}
              onRefresh={handleFetchTelemetryData}
              onAdd={() => setIsFormOpen(true)}
              onDelete={handleDeleteTelemetry}
            ></TelemetryTable>
          </Box>
          <Dialog
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogContent>
              <TelemetryForm onSubmit={handleCreateTelemetry} onClose={()=> setIsFormOpen(false)}></TelemetryForm>
            </DialogContent>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}

export default App;
