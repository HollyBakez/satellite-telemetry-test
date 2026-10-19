import Paper from "@mui/material/Paper";
import {
  type GridColDef,
  type GridRowSelectionModel,
  DataGrid,
} from "@mui/x-data-grid";
import type { Telemetry } from "../../types/telemetry";
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Props {
  rows: Telemetry[];
  loading: boolean;
  lastRefreshed: Date | null;
  onRefresh: () => void;
  onAdd: () => void;
  onDelete: (ids: string[]) => Promise<void>;
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

const TelemetryTable = ({
  rows,
  loading,
  lastRefreshed,
  onRefresh,
  onAdd,
  onDelete,
}: Props) => {
  // user satellite and status filters
  const [satelliteFilter, setSatelliteFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const selectedIds = Array.from(selection.ids).map(String);

  // apply satelliteFilter and statusFilter to our rows if there are any
  const filteredRows = rows.filter((row) => {
    const matchesSatellite =
      !satelliteFilter || row.satelliteId === satelliteFilter;
    const matchesStatus = !statusFilter || row.status === statusFilter;

    return matchesSatellite && matchesStatus;
  });

  const handleConfirmDelete = async () => {
    setDeleting(true);

    try {
      await onDelete(selectedIds);
      setDeleteConfirmOpen(false);
      setSelection({ type: "include", ids: new Set() });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
          pl: 2,
          pt: 2,
          pr: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Last refreshed:{" "}
          {lastRefreshed ? lastRefreshed.toLocaleString() : "Not yet refreshed"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void onRefresh()}
            disabled={loading || deleting}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={loading}
          >
            Add Telemetry
          </Button>
          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={selectedIds.length === 0 || loading || deleting}
          >
            Delete Selected ({selectedIds.length})
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          ml: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Table filters */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="satellite-filter-label">Satellite ID</InputLabel>

          <Select
            labelId="satellite-filter-label"
            value={satelliteFilter}
            label="Satellite ID"
            onChange={(event) => setSatelliteFilter(event.target.value)}
          >
            <MenuItem value="">All Satellites</MenuItem>

            {[...new Set(rows.map((row) => row.satelliteId))]
              .sort()
              .map((satelliteId) => (
                <MenuItem key={satelliteId} value={satelliteId}>
                  {satelliteId}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Health Status</InputLabel>

          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Health Status"
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {[...new Set(rows.map((row) => row.status))]
              .sort()
              .map((rowStatus) => (
                <MenuItem key={rowStatus} value={rowStatus}>
                  {rowStatus}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Delete confirmation modal */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>

        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete {selectedIds.length} selected
            telemetry {selectedIds.length === 1 ? "entry" : "entries"}? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancel
          </Button>

          <Button
            onClick={() => void handleConfirmDelete()}
            color="error"
            variant="contained"
            disabled={deleting}
            autoFocus
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid
        rows={filteredRows}
        columns={cols}
        loading={loading}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        pageSizeOptions={[5, 10, 25, { value: -1, label: "All" }]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        sx={{ border: 0 }}
      />
    </Paper>
  );
};

export default TelemetryTable;
