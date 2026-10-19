import { Button, Card, Chip, Container, Icon, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import TelemetryTable from "./components/TelemetryTable/TelemetryTable";
import {
  getAllTelemetryData,
  getTelemetryAPIHealthCheck,
} from "./services/telemetryApi";

function App() {
  const [rows, setRows] = useState<[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [telemetryApiStatus, setTelemetryApiStatus] =
    useState<string>("offline");

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const data = await getAllTelemetryData();
      setRows(data);
    } catch (error) {
      //  set error here and update ui to show banner
      console.error("Failed to fetch telemetry data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFetchTelemetryData = () => {
    fetchTelemetry();
  };

  const checkHealth = async () => {
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
  };

  //  On component mount, grab the latest Telemetry data
  useEffect(() => {
    fetchTelemetry();
  }, []);

  useEffect(() => {
    checkHealth();

    //  check backend health status every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Satellite Telemetry
      </Typography>
      {/* TODO: Implement Table component */}
      {/* Implement add button to table*/}
      {/* Implement delete button to table */}
      <Typography color="text.secondary">
        Monitor and manage telemetry data.
      </Typography>
      <Typography>
        Backend API Health Status:
        {telemetryApiStatus === "Online" ? (
          <Chip label="Online" color="success" />
        ) : (
          <Chip label="Offline" color="error" />
        )}
      </Typography>

      <Typography>Telemetry data last refreshed: {lastRefreshed}</Typography>

      <Button
        onClick={handleFetchTelemetryData}
        disabled={loading}
        variant="contained"
      >
        {loading ? <CircularProgress size={24} /> : "Refresh"}
      </Button>
      <TelemetryTable rows={rows}></TelemetryTable>
    </Container>
  );
}

export default App;
