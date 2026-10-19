import Paper from "@mui/material/Paper";
import { type GridColDef, DataGrid } from "@mui/x-data-grid";

interface Telemetry {
  id: string;
  satelliteId: string;
  timestamp: string;
  altitude: number;
  velocity: number;
  status: string;
}

interface Props {
  rows: Telemetry[];
}

const cols: GridColDef<Telemetry>[] = [
  { field: "satelliteId", headerName: "Satellite Id", flex: 1 },
  {
    field: "timestamp",
    headerName: "Timestamp",
    type: "dateTime",
    flex: 1.5,
    valueGetter: (value) => (value ? new Date(value) : null),
  },
  {
    field: "altitude",
    headerName: "Altitude",
    type: "number",
    flex: 1,
  },
  { field: "velocity", headerName: "Velocity", type: "number", flex: 1 },
  { field: "status", headerName: "Health Status", flex: 1 },
];

const TelemetryTable = ({ rows }: Props) => {
  return (
    <Paper sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={cols}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        sx={{ border: 0 }}
      />
    </Paper>
  );
};

export default TelemetryTable;
