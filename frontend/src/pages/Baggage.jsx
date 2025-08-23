import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, TableContainer, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Tooltip, Box, CircularProgress, Alert, Avatar,
  Typography, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LuggageIcon from "@mui/icons-material/Luggage";
import { listBaggage, createBaggage, updateBaggage, deleteBaggage, listFlights } from "../api.js";
import { toast } from "react-toastify";
import { useAuth } from "../auth.jsx";

const BAGGAGE_STATUSES = ["checkin", "loaded", "intransit", "unloaded", "atbelt", "lost"];

export default function Baggage() {
  const { user } = useAuth();
  const canCreate = ["admin", "baggage", "airline"].includes(user.role);
  const canEdit = ["admin", "baggage"].includes(user.role);
  const canDelete = ["admin", "baggage"].includes(user.role);

  const [rows, setRows] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [baggageRes, flightsRes] = await Promise.all([
        listBaggage(),
        listFlights()
      ]);
      setRows(baggageRes.data || []);
      setFlights(flightsRes.data || []);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(data) {
    try {
      await createBaggage(data);
      toast.success("Baggage created successfully");
      setOpenCreate(false);
      refresh();
    } catch (err) {
      toast.error("Failed to create baggage");
      console.error("Create error:", err);
    }
  }

  async function handleEdit(idOrTag, data) {
    try {
      await updateBaggage(idOrTag, data);
      toast.success("Baggage updated successfully");
      setOpenEdit(null);
      refresh();
    } catch (err) {
      toast.error("Failed to update baggage");
      console.error("Update error:", err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this baggage record?")) return;
    
    try {
      await deleteBaggage(id);
      toast.success("Baggage deleted successfully");
      refresh();
    } catch (err) {
      toast.error("Failed to delete baggage");
      console.error("Delete error:", err);
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Card 
        sx={{ 
          borderRadius: 3,
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <CardHeader
          avatar={
            <Avatar 
              sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                width: 48,
                height: 48
              }}
            >
              <LuggageIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Baggage Management
            </Typography>
          }
          subheader={
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Track and manage passenger baggage
            </Typography>
          }
          action={
            canCreate && (
              <Button 
                startIcon={<AddIcon />} 
                variant="contained" 
                onClick={() => setOpenCreate(true)}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: 2,
                  marginRight:'10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                New Baggage
              </Button>
            )
          }
        />
        
        <Divider sx={{ mx: 3, borderColor: '#e2e8f0' }} />
        
        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              overflow: 'hidden'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Tag ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Flight</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Weight (kg)</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Last Location</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Created</TableCell>
                  {(canEdit || canDelete) && <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={30} sx={{ color: '#6366f1' }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 500, py: 2 }}>{r.tagId}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {r.flightId?.flightNo || (r.flightId ? `Flight ${r.flightId}` : "-")}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>{r.weight || "-"}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          size="small" 
                          label={r.status || "checkin"} 
                          sx={{ 
                            fontWeight: 500,
                            backgroundColor: statusColor(r.status).bg,
                            color: statusColor(r.status).text,
                            minWidth: 80
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>{r.lastLocation || "-"}</TableCell>
                      <TableCell sx={{ py: 2 }}>{formatMaybeDate(r.createdAt)}</TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell align="right" sx={{ py: 2 }}>
                          {canEdit && (
                            <Tooltip title="Edit">
                              <IconButton 
                                onClick={() => setOpenEdit(r)}
                                sx={{ 
                                  color: '#6366f1',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDelete && (
                            <Tooltip title="Delete">
                              <IconButton 
                                onClick={() => handleDelete(r._id)}
                                sx={{ 
                                  color: '#ef4444',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
                {!rows.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No baggage records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>

        <CreateBaggageDialog 
          open={openCreate} 
          onClose={() => setOpenCreate(false)} 
          onSubmit={handleCreate}
          flights={flights}
        />
        
        {openEdit && (
          <EditBaggageDialog
            open={!!openEdit}
            record={openEdit}
            onClose={() => setOpenEdit(null)}
            onSubmit={(payload) => handleEdit(openEdit._id, payload)}
            flights={flights}
          />
        )}
      </Card>
    </Box>
  );
}

function statusColor(s) {
  switch (s) {
    case "loaded": return { bg: '#e0e7ff', text: '#3730a3' };
    case "intransit": return { bg: '#dbeafe', text: '#1e40af' };
    case "unloaded": return { bg: '#fef3c7', text: '#92400e' };
    case "atbelt": return { bg: '#dcfce7', text: '#166534' };
    case "lost": return { bg: '#fee2e2', text: '#991b1b' };
    case "checkin":
    default: return { bg: '#f1f5f9', text: '#475569' };
  }
}

function formatMaybeDate(v) {
  if (!v) return "-";
  try { 
    return new Date(v).toLocaleString(); 
  } catch { 
    return String(v); 
  }
}

function CreateBaggageDialog({ open, onClose, onSubmit, flights }) {
  const [tagId, setTagId] = useState("");
  const [flightId, setFlightId] = useState("");
  const [weight, setWeight] = useState("");
  const [status, setStatus] = useState("");
  const [lastLocation, setLastLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!tagId.trim()) return "Tag ID is required";
    if (!/^[A-Za-z0-9]+$/.test(tagId)) return "Tag ID must be alphanumeric";
    if (!flightId) return "Flight is required";
    if (weight && (parseFloat(weight) < 0.1 || parseFloat(weight) > 100)) {
      return "Weight must be between 0.1–100 kg";
    }
    if (status && !BAGGAGE_STATUSES.includes(status)) return "Invalid status";
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        tagId: tagId.trim(),
        flightId,
        ...(weight && { weight: parseFloat(weight) }),
        ...(status && { status }),
        ...(lastLocation.trim() && { lastLocation: lastLocation.trim() })
      };
      
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setTagId("");
    setFlightId("");
    setWeight("");
    setStatus("");
    setLastLocation("");
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm" 
      onExited={reset}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
        color: 'white',
        fontWeight: 600
      }}>
        Create New Baggage
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} mt={1}>
          <TextField 
            label="Tag ID" 
            value={tagId} 
            onChange={(e) => setTagId(e.target.value)} 
            required 
            helperText="Alphanumeric characters only"
            disabled={submitting}
            sx={textFieldStyles}
          />
          <TextField 
            label="Flight" 
            select 
            value={flightId} 
            onChange={(e) => setFlightId(e.target.value)} 
            required
            disabled={submitting}
            sx={textFieldStyles}
          >
            <MenuItem value="">Select Flight</MenuItem>
            {flights.map(f => (
              <MenuItem key={f._id} value={f._id}>
                {f.flightNo} ({f.origin} → {f.destination})
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Weight (kg)" 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)}
            inputProps={{ min: 0.1, max: 100, step: 0.1 }}
            helperText="Optional: 0.1-100 kg"
            disabled={submitting}
            sx={textFieldStyles}
          />
          <TextField 
            label="Status" 
            select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            disabled={submitting}
            sx={textFieldStyles}
          >
            <MenuItem value="">(default: checkin)</MenuItem>
            {BAGGAGE_STATUSES.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Last Location" 
            value={lastLocation} 
            onChange={(e) => setLastLocation(e.target.value)}
            helperText="Optional"
            disabled={submitting}
            sx={textFieldStyles}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          disabled={submitting}
          sx={buttonStyles}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={submit} 
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
          sx={{
            ...buttonStyles,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          {submitting ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditBaggageDialog({ open, onClose, onSubmit, record, flights }) {
  const [status, setStatus] = useState(record.status || "");
  const [lastLocation, setLastLocation] = useState(record.lastLocation || "");
  const [flightId, setFlightId] = useState(record.flightId?._id || record.flightId || "");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (status && !BAGGAGE_STATUSES.includes(status)) return "Invalid status";
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...(status && { status }),
        ...(lastLocation.trim() && { lastLocation: lastLocation.trim() }),
        ...(flightId && { flightId })
      };
      
      // Remove empty strings to avoid overwriting with empty values
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") delete payload[key];
      });
      
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
        color: 'white',
        fontWeight: 600
      }}>
        Edit Baggage — {record.tagId}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} mt={1}>
          <TextField 
            label="Status" 
            select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            disabled={submitting}
            sx={textFieldStyles}
          >
            <MenuItem value="">(leave unchanged)</MenuItem>
            {BAGGAGE_STATUSES.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Last Location" 
            value={lastLocation} 
            onChange={(e) => setLastLocation(e.target.value)}
            helperText="Current location of the baggage"
            disabled={submitting}
            sx={textFieldStyles}
          />
          <TextField 
            label="Reassign to Flight" 
            select 
            value={flightId} 
            onChange={(e) => setFlightId(e.target.value)}
            helperText="Select a flight to reassign this baggage"
            disabled={submitting}
            sx={textFieldStyles}
          >
            <MenuItem value="">(leave unchanged)</MenuItem>
            {flights.map(f => (
              <MenuItem key={f._id} value={f._id}>
                {f.flightNo} ({f.origin} → {f.destination})
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Current Details:</Typography>
            <Typography variant="body2">Tag ID: {record.tagId}</Typography>
            <Typography variant="body2">Flight: {record.flightId?.flightNo || record.flightId || "Not assigned"}</Typography>
            <Typography variant="body2">Weight: {record.weight || "Not specified"} kg</Typography>
            <Typography variant="body2">Created: {formatMaybeDate(record.createdAt)}</Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          disabled={submitting}
          sx={buttonStyles}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={submit} 
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
          sx={{
            ...buttonStyles,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6366f1',
      borderWidth: 2,
    },
  },
};

const buttonStyles = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  px: 3,
  py: 1,
  transition: 'all 0.2s ease-in-out',
};