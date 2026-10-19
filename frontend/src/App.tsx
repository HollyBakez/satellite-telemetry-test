import { Button, Container, Typography } from "@mui/material";
import { useState } from "react";
import TelemetryTable from "./components/TelemetryTable/TelemetryTable";

function App() {
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const handleFetchTelemetryData = () => {
    console.log("fetched data");
  };
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
      <Typography>Telemetry data last refreshed: {lastRefreshed}</Typography>
      <Button onClick={handleFetchTelemetryData} variant="contained">
        Refresh
      </Button>
      <TelemetryTable rows={[]}></TelemetryTable>
    </Container>
  );
}

export default App;
