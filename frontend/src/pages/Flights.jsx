import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, TableContainer, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Tooltip, Box, Typography, Avatar, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { listFlights, createFlight, updateFlight, deleteFlight } from "../api.js";
import { toast } from "react-toastify";
import { useAuth } from "../auth.jsx";
import Swal from "sweetalert2";
const FLIGHT_STATUSES = ["scheduled","boarding","departed","arrived","delayed","cancelled"];

export default function Flights() {
  const { user } = useAuth();
  const canCreate = ["admin","airline"].includes(user.role);
  const canEdit = ["admin","airline"].includes(user.role);
  const canDelete = user.role === "admin";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(null); // flight record

  async function refresh() {
    setLoading(true);
    try {
      const { data } = await listFlights();
      setRows(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(data) {
    await createFlight(data);
    toast.success("Flight created");
    setOpenCreate(false);
    refresh();
  }

  async function handleEdit(id, data) {
    await updateFlight(id, data);
    toast.success("Flight updated");
    setOpenEdit(null);
    refresh();
  }

async function handleDelete(id) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!"
  });

  if (result.isConfirmed) {
    try {
      await deleteFlight(id);
      toast.success("Flight deleted");
      refresh();
    } catch (err) {
      toast.error("Failed to delete flight");
    }
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
              <FlightTakeoffIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Flight Management
            </Typography>
          }
          subheader={
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Manage all airport flights and schedules
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
                New Flight
              </Button>
            )
          }
        />
        
        <Divider sx={{ mx: 3, borderColor: '#e2e8f0' }} />
        
        <CardContent sx={{ p: 3 }}>
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
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Flight No</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Origin</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Destination</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Gate</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Scheduled Dep</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Scheduled Arr</TableCell>
                  { (canEdit || canDelete) && <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Actions</TableCell> }
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={30} sx={{ color: '#6366f1' }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 500, py: 2 }}>{r.flightNo}</TableCell>
                      <TableCell sx={{ py: 2 }}>{r.origin}</TableCell>
                      <TableCell sx={{ py: 2 }}>{r.destination}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          size="small" 
                          label={r.status || "scheduled"} 
                          sx={{ 
                            fontWeight: 500,
                            backgroundColor: statusColor(r.status).bg,
                            color: statusColor(r.status).text,
                            minWidth: 80
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>{r.gate || "-"}</TableCell>
                      <TableCell sx={{ py: 2 }}>{formatMaybeDate(r.scheduledDep)}</TableCell>
                      <TableCell sx={{ py: 2 }}>{formatMaybeDate(r.scheduledArr)}</TableCell>
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
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No flights found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>

        <CreateFlightDialog open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={handleCreate} />
        {openEdit && (
          <EditFlightDialog
            open={!!openEdit}
            record={openEdit}
            onClose={() => setOpenEdit(null)}
            onSubmit={(payload)=>handleEdit(openEdit._id, payload)}
          />
        )}
      </Card>
    </Box>
  );
}

function statusColor(s) {
  switch (s) {
    case "boarding": return { bg: '#e0e7ff', text: '#3730a3' };
    case "departed": return { bg: '#dbeafe', text: '#1e40af' };
    case "arrived": return { bg: '#dcfce7', text: '#166534' };
    case "delayed": return { bg: '#fef3c7', text: '#92400e' };
    case "cancelled": return { bg: '#fee2e2', text: '#991b1b' };
    default: return { bg: '#f1f5f9', text: '#475569' };
  }
}

function formatMaybeDate(v) {
  if (!v) return "-";
  try { return new Date(v).toLocaleString(); } catch { return String(v); }
}

function CreateFlightDialog({ open, onClose, onSubmit }) {
  const [flightNo, setFlightNo] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("");

  function validate() {
    const iata = /^[A-Za-z]{3}$/;
    if (!flightNo.trim()) return "Flight number required";
    if (!iata.test(origin)) return "Origin must be 3-letter IATA code";
    if (!iata.test(destination)) return "Destination must be 3-letter IATA code";
    if (status && !FLIGHT_STATUSES.includes(status)) return "Invalid status";
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) return alert(err);
    await onSubmit({ flightNo: flightNo.trim(), origin: origin.toUpperCase(), destination: destination.toUpperCase(), status: status || undefined });
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
        New Flight
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} mt={1}>
          <TextField 
            label="Flight No" 
            value={flightNo} 
            onChange={(e)=>setFlightNo(e.target.value)} 
            required 
            sx={textFieldStyles}
          />
          <TextField 
            label="Origin (IATA)" 
            value={origin} 
            onChange={(e)=>setOrigin(e.target.value)} 
            inputProps={{ maxLength: 3 }} 
            required 
            sx={textFieldStyles}
          />
          <TextField 
            label="Destination (IATA)" 
            value={destination} 
            onChange={(e)=>setDestination(e.target.value)} 
            inputProps={{ maxLength: 3 }} 
            required 
            sx={textFieldStyles}
          />
          <TextField 
            label="Status" 
            select 
            value={status} 
            onChange={(e)=>setStatus(e.target.value)}
            sx={textFieldStyles}
          >
            <MenuItem value="">(default: scheduled)</MenuItem>
            {FLIGHT_STATUSES.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={buttonStyles}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={submit}
          sx={{
            ...buttonStyles,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditFlightDialog({ open, onClose, onSubmit, record }) {
  const [status, setStatus] = useState(record.status || "");
  const [gate, setGate] = useState(record.gate || "");
  const [scheduledDep, setScheduledDep] = useState(record.scheduledDep ? toLocalInputValue(record.scheduledDep) : "");
  const [scheduledArr, setScheduledArr] = useState(record.scheduledArr ? toLocalInputValue(record.scheduledArr) : "");

  function toLocalInputValue(dateStr) {
    try {
      const d = new Date(dateStr);
      const pad = (n)=>String(n).padStart(2,"0");
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return ""; }
  }

  function validate() {
    if (status && !FLIGHT_STATUSES.includes(status)) return "Invalid status";
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) return alert(err);
    const payload = {
      ...(status ? { status } : {}),
      ...(gate ? { gate } : { gate: "" }),
      ...(scheduledDep ? { scheduledDep: new Date(scheduledDep).toISOString() } : { scheduledDep: null }),
      ...(scheduledArr ? { scheduledArr: new Date(scheduledArr).toISOString() } : { scheduledArr: null }),
    };
    await onSubmit(payload);
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
        Edit Flight — {record.flightNo}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} mt={1}>
          <TextField 
            label="Status" 
            select 
            value={status} 
            onChange={(e)=>setStatus(e.target.value)}
            sx={textFieldStyles}
          >
            <MenuItem value="">(leave unchanged)</MenuItem>
            {FLIGHT_STATUSES.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField 
            label="Gate" 
            value={gate} 
            onChange={(e)=>setGate(e.target.value)} 
            sx={textFieldStyles}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Scheduled Departure"
              type="datetime-local"
              value={scheduledDep}
              onChange={(e)=>setScheduledDep(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
            />
            <TextField
              label="Scheduled Arrival"
              type="datetime-local"
              value={scheduledArr}
              onChange={(e)=>setScheduledArr(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={buttonStyles}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={submit}
          sx={{
            ...buttonStyles,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          Save Changes
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




// import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
// import {
//   Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent,
//   DialogActions, TextField, MenuItem, IconButton, TableContainer, Paper, Table, TableHead,
//   TableRow, TableCell, TableBody, Chip, Tooltip, Box, Typography, Avatar, Divider, CircularProgress
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
// import { listFlights, createFlight, updateFlight, deleteFlight } from "../api.js";
// import { toast } from "react-toastify";
// import { useAuth } from "../auth.jsx";

// const FLIGHT_STATUSES = ["scheduled","boarding","departed","arrived","delayed","cancelled"];

// // Memoized components to prevent unnecessary re-renders
// const StatusChip = memo(({ status }) => (
//   <Chip 
//     size="small" 
//     label={status || "scheduled"} 
//     sx={{ 
//       fontWeight: 500,
//       backgroundColor: statusColor(status).bg,
//       color: statusColor(status).text,
//       minWidth: 80
//     }} 
//   />
// ));

// const ActionButtons = memo(({ canEdit, canDelete, onEdit, onDelete }) => (
//   <TableCell align="right" sx={{ py: 2 }}>
//     {canEdit && (
//       <Tooltip title="Edit">
//         <IconButton 
//           onClick={onEdit}
//           sx={{ 
//             color: '#6366f1',
//             '&:hover': { 
//               backgroundColor: 'rgba(99, 102, 241, 0.1)',
//               transform: 'scale(1.1)'
//             },
//             transition: 'all 0.2s ease'
//           }}
//         >
//           <EditIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//     )}
//     {canDelete && (
//       <Tooltip title="Delete">
//         <IconButton 
//           onClick={onDelete}
//           sx={{ 
//             color: '#ef4444',
//             '&:hover': { 
//               backgroundColor: 'rgba(239, 68, 68, 0.1)',
//               transform: 'scale(1.1)'
//             },
//             transition: 'all 0.2s ease'
//           }}
//         >
//           <DeleteIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//     )}
//   </TableCell>
// ));

// export default function Flights() {
//   const { user } = useAuth();
//   const canCreate = ["admin","airline"].includes(user.role);
//   const canEdit = ["admin","airline"].includes(user.role);
//   const canDelete = user.role === "admin";

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [openCreate, setOpenCreate] = useState(false);
//   const [openEdit, setOpenEdit] = useState(null); // flight record

//   // Memoize user permissions to prevent unnecessary re-renders
//   const userPermissions = useMemo(() => ({ canEdit, canDelete }), [canEdit, canDelete]);

//   // Use useCallback to memoize the refresh function
//   const refresh = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await listFlights();
//       setRows(data || []);
//     } catch (error) {
//       toast.error("Failed to load flights");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { 
//     refresh(); 
//   }, [refresh]);

//   // Memoize handlers to prevent unnecessary re-renders of child components
//   const handleCreate = useCallback(async (data) => {
//     try {
//       await createFlight(data);
//       toast.success("Flight created");
//       setOpenCreate(false);
//       refresh();
//     } catch (error) {
//       toast.error("Failed to create flight");
//     }
//   }, [refresh]);

//   const handleEdit = useCallback(async (id, data) => {
//     try {
//       await updateFlight(id, data);
//       toast.success("Flight updated");
//       setOpenEdit(null);
//       refresh();
//     } catch (error) {
//       toast.error("Failed to update flight");
//     }
//   }, [refresh]);

//   const handleDelete = useCallback(async (id) => {
//     if (!confirm("Delete this flight?")) return;
//     try {
//       await deleteFlight(id);
//       toast.success("Flight deleted");
//       refresh();
//     } catch (error) {
//       toast.error("Failed to delete flight");
//     }
//   }, [refresh]);

//   // Memoize table rows to prevent unnecessary re-renders
//   const tableRows = useMemo(() => {
//     if (loading) {
//       return (
//         <TableRow>
//           <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
//             <CircularProgress size={30} sx={{ color: '#6366f1' }} />
//           </TableCell>
//         </TableRow>
//       );
//     }
    
//     if (!rows.length) {
//       return (
//         <TableRow>
//           <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#64748b' }}>
//             No flights found
//           </TableCell>
//         </TableRow>
//       );
//     }
    
//     return rows.map((r) => (
//       <TableRow key={r._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
//         <TableCell sx={{ fontWeight: 500, py: 2 }}>{r.flightNo}</TableCell>
//         <TableCell sx={{ py: 2 }}>{r.origin}</TableCell>
//         <TableCell sx={{ py: 2 }}>{r.destination}</TableCell>
//         <TableCell sx={{ py: 2 }}>
//           <StatusChip status={r.status} />
//         </TableCell>
//         <TableCell sx={{ py: 2 }}>{r.gate || "-"}</TableCell>
//         <TableCell sx={{ py: 2 }}>{formatMaybeDate(r.scheduledDep)}</TableCell>
//         <TableCell sx={{ py: 2 }}>{formatMaybeDate(r.scheduledArr)}</TableCell>
//         {(canEdit || canDelete) && (
//           <ActionButtons 
//             canEdit={canEdit} 
//             canDelete={canDelete}
//             onEdit={() => setOpenEdit(r)}
//             onDelete={() => handleDelete(r._id)}
//           />
//         )}
//       </TableRow>
//     ));
//   }, [rows, loading, canEdit, canDelete, handleDelete]);

//   return (
//     <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
//       <Card 
//         sx={{ 
//           borderRadius: 3,
//           border: '1px solid #f1f5f9',
//           boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
//           background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
//         }}
//       >
//         <CardHeader
//           avatar={
//             <Avatar 
//               sx={{ 
//                 background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//                 width: 48,
//                 height: 48
//               }}
//             >
//               <FlightTakeoffIcon />
//             </Avatar>
//           }
//           title={
//             <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
//               Flight Management
//             </Typography>
//           }
//           subheader={
//             <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
//               Manage all airport flights and schedules
//             </Typography>
//           }
//           action={
//             canCreate && (
//               <Button 
//                 startIcon={<AddIcon />} 
//                 variant="contained" 
//                 onClick={() => setOpenCreate(true)}
//                 sx={{
//                   background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//                   borderRadius: 2,
//                   marginRight:'10px',
//                   textTransform: 'none',
//                   fontWeight: 600,
//                   '&:hover': {
//                     background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
//                     transform: 'translateY(-1px)',
//                     boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
//                   },
//                   transition: 'all 0.2s ease-in-out',
//                 }}
//               >
//                 New Flight
//               </Button>
//             )
//           }
//         />
        
//         <Divider sx={{ mx: 3, borderColor: '#e2e8f0' }} />
        
//         <CardContent sx={{ p: 3 }}>
//           <TableContainer 
//             component={Paper} 
//             elevation={0}
//             sx={{
//               borderRadius: 2,
//               border: '1px solid #e2e8f0',
//               background: '#ffffff',
//               overflow: 'hidden'
//             }}
//           >
//             <Table size="small">
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#f8fafc' }}>
//                   <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Flight No</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Origin</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Destination</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Status</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Gate</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Scheduled Dep</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Scheduled Arr</TableCell>
//                   { (canEdit || canDelete) && <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Actions</TableCell> }
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {tableRows}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </CardContent>

//         <CreateFlightDialog open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={handleCreate} />
//         {openEdit && (
//           <EditFlightDialog
//             open={!!openEdit}
//             record={openEdit}
//             onClose={() => setOpenEdit(null)}
//             onSubmit={(payload)=>handleEdit(openEdit._id, payload)}
//           />
//         )}
//       </Card>
//     </Box>
//   );
// }

// function statusColor(s) {
//   switch (s) {
//     case "boarding": return { bg: '#e0e7ff', text: '#3730a3' };
//     case "departed": return { bg: '#dbeafe', text: '#1e40af' };
//     case "arrived": return { bg: '#dcfce7', text: '#166534' };
//     case "delayed": return { bg: '#fef3c7', text: '#92400e' };
//     case "cancelled": return { bg: '#fee2e2', text: '#991b1b' };
//     default: return { bg: '#f1f5f9', text: '#475569' };
//   }
// }

// function formatMaybeDate(v) {
//   if (!v) return "-";
//   try { return new Date(v).toLocaleString(); } catch { return String(v); }
// }

// // Memoize dialog components to prevent unnecessary re-renders
// const CreateFlightDialog = memo(({ open, onClose, onSubmit }) => {
//   const [flightNo, setFlightNo] = useState("");
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [status, setStatus] = useState("");

//   function validate() {
//     const iata = /^[A-Za-z]{3}$/;
//     if (!flightNo.trim()) return "Flight number required";
//     if (!iata.test(origin)) return "Origin must be 3-letter IATA code";
//     if (!iata.test(destination)) return "Destination must be 3-letter IATA code";
//     if (status && !FLIGHT_STATUSES.includes(status)) return "Invalid status";
//     return null;
//   }

//   async function submit() {
//     const err = validate();
//     if (err) return alert(err);
//     await onSubmit({ flightNo: flightNo.trim(), origin: origin.toUpperCase(), destination: destination.toUpperCase(), status: status || undefined });
//   }

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose} 
//       fullWidth 
//       maxWidth="sm"
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//           background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
//         }
//       }}
//     >
//       <DialogTitle sx={{ 
//         background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
//         color: 'white',
//         fontWeight: 600
//       }}>
//         New Flight
//       </DialogTitle>
//       <DialogContent sx={{ p: 3 }}>
//         <Stack spacing={3} mt={1}>
//           <TextField 
//             label="Flight No" 
//             value={flightNo} 
//             onChange={(e)=>setFlightNo(e.target.value)} 
//             required 
//             sx={textFieldStyles}
//           />
//           <TextField 
//             label="Origin (IATA)" 
//             value={origin} 
//             onChange={(e)=>setOrigin(e.target.value)} 
//             inputProps={{ maxLength: 3 }} 
//             required 
//             sx={textFieldStyles}
//           />
//           <TextField 
//             label="Destination (IATA)" 
//             value={destination} 
//             onChange={(e)=>setDestination(e.target.value)} 
//             inputProps={{ maxLength: 3 }} 
//             required 
//             sx={textFieldStyles}
//           />
//           <TextField 
//             label="Status" 
//             select 
//             value={status} 
//             onChange={(e)=>setStatus(e.target.value)}
//             sx={textFieldStyles}
//           >
//             <MenuItem value="">(default: scheduled)</MenuItem>
//             {FLIGHT_STATUSES.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
//           </TextField>
//         </Stack>
//       </DialogContent>
//       <DialogActions sx={{ p: 3, pt: 0 }}>
//         <Button 
//           onClick={onClose}
//           sx={buttonStyles}
//         >
//           Cancel
//         </Button>
//         <Button 
//           variant="contained" 
//           onClick={submit}
//           sx={{
//             ...buttonStyles,
//             background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//             color: 'white',
//             '&:hover': {
//               background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
//             }
//           }}
//         >
//           Create
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// });

// const EditFlightDialog = memo(({ open, onClose, onSubmit, record }) => {
//   const [status, setStatus] = useState(record.status || "");
//   const [gate, setGate] = useState(record.gate || "");
//   const [scheduledDep, setScheduledDep] = useState(record.scheduledDep ? toLocalInputValue(record.scheduledDep) : "");
//   const [scheduledArr, setScheduledArr] = useState(record.scheduledArr ? toLocalInputValue(record.scheduledArr) : "");

//   function toLocalInputValue(dateStr) {
//     try {
//       const d = new Date(dateStr);
//       const pad = (n)=>String(n).padStart(2,"0");
//       return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
//     } catch { return ""; }
//   }

//   function validate() {
//     if (status && !FLIGHT_STATUSES.includes(status)) return "Invalid status";
//     return null;
//   }

//   async function submit() {
//     const err = validate();
//     if (err) return alert(err);
//     const payload = {
//       ...(status ? { status } : {}),
//       ...(gate ? { gate } : { gate: "" }),
//       ...(scheduledDep ? { scheduledDep: new Date(scheduledDep).toISOString() } : { scheduledDep: null }),
//       ...(scheduledArr ? { scheduledArr: new Date(scheduledArr).toISOString() } : { scheduledArr: null }),
//     };
//     await onSubmit(payload);
//   }

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose} 
//       fullWidth 
//       maxWidth="sm"
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//           background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
//         }
//       }}
//     >
//       <DialogTitle sx={{ 
//         background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
//         color: 'white',
//         fontWeight: 600
//       }}>
//         Edit Flight — {record.flightNo}
//       </DialogTitle>
//       <DialogContent sx={{ p: 3 }}>
//         <Stack spacing={3} mt={1}>
//           <TextField 
//             label="Status" 
//             select 
//             value={status} 
//             onChange={(e)=>setStatus(e.target.value)}
//             sx={textFieldStyles}
//           >
//             <MenuItem value="">(leave unchanged)</MenuItem>
//             {FLIGHT_STATUSES.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
//           </TextField>
//           <TextField 
//             label="Gate" 
//             value={gate} 
//             onChange={(e)=>setGate(e.target.value)} 
//             sx={textFieldStyles}
//           />
//           <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
//             <TextField
//               label="Scheduled Departure"
//               type="datetime-local"
//               value={scheduledDep}
//               onChange={(e)=>setScheduledDep(e.target.value)}
//               InputLabelProps={{ shrink: true }}
//               sx={textFieldStyles}
//             />
//             <TextField
//               label="Scheduled Arrival"
//               type="datetime-local"
//               value={scheduledArr}
//               onChange={(e)=>setScheduledArr(e.target.value)}
//               InputLabelProps={{ shrink: true }}
//               sx={textFieldStyles}
//             />
//           </Box>
//         </Stack>
//       </DialogContent>
//       <DialogActions sx={{ p: 3, pt: 0 }}>
//         <Button 
//           onClick={onClose}
//           sx={buttonStyles}
//         >
//           Cancel
//         </Button>
//         <Button 
//           variant="contained" 
//           onClick={submit}
//           sx={{
//             ...buttonStyles,
//             background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//             color: 'white',
//             '&:hover': {
//               background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
//             }
//           }}
//         >
//           Save Changes
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// });

// const textFieldStyles = {
//   '& .MuiOutlinedInput-root': {
//     borderRadius: 2,
//     backgroundColor: '#ffffff',
//     '& fieldset': {
//       borderColor: '#e2e8f0',
//     },
//     '&:hover fieldset': {
//       borderColor: '#cbd5e1',
//     },
//     '&.Mui-focused fieldset': {
//       borderColor: '#6366f1',
//       borderWidth: 2,
//     },
//   },
// };

// const buttonStyles = {
//   borderRadius: 2,
//   textTransform: 'none',
//   fontWeight: 600,
//   px: 3,
//   py: 1,
//   transition: 'all 0.2s ease-in-out',
// };