// src/pages/OpsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Stack, Grid, Card, CardHeader, CardContent, Typography,
  Avatar, TextField, Button, CircularProgress, Divider,
  MenuItem, Select, FormControl, InputLabel, Paper
} from "@mui/material";
import { FlightTakeoff, Luggage, Schedule, Warning } from "@mui/icons-material";
import { delayFlight, getAnalytics, listFlights } from "../api.js";
import { toast } from "react-toastify";

export default function OpsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ flightId: "", reason: "", newTime: "", flightNo: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [a, f] = await Promise.all([getAnalytics(), listFlights()]);
      setAnalytics(a.data);
      setFlights(f.data || []);
    } catch {
      
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flightId || !form.reason || !form.newTime) return toast.error("All fields required");
    setSubmitting(true);
    try {
      await delayFlight(form.flightId, { reason: form.reason, newTime: form.newTime });
      toast.success("Delay notification sent");
      setForm({ flightId: "", reason: "", newTime: "", flightNo: "" });
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch {
      toast.error("Failed to send delay notification");
    } finally { setSubmitting(false); }
  };

  const handleFlightChange = (id) => {
    const flight = flights.find(f => f._id === id);
    setForm(prev => ({ ...prev, flightId: id, flightNo: flight?.flightNo || "" }));
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress sx={{ color: "#6366f1" }} />
    </Box>
  );

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <Card sx={statCardStyle}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Avatar sx={{ bgcolor: `${color}20`, color, width: 44, height: 44 }}>
            <Icon />
          </Avatar>
          <Typography fontWeight={600} fontSize="1rem">{title}</Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={pageWrapper}>
      <Stack spacing={6}>
        {/* Analytics */}
        <Grid container spacing={8}>
          <Grid item xs={12} md={8}>
            <StatCard icon={FlightTakeoff} title="Flights  Today" value={analytics?.totalFlightsToday || 0} color="#6366f1" subtitle="Scheduled today" />
          </Grid>
          <Grid item xs={12} md={8}>
            <StatCard icon={Luggage} title="Baggages  Today" value={analytics?.totalBaggageProcessed || 0} color="#10b981" subtitle="Bags handled" />
          </Grid>
          <Grid item xs={12} md={8}>
            <StatCard icon={Schedule} title="Flights  Total " value={flights.length} color="#f59e0b" subtitle="Total flights" />
          </Grid>
        </Grid>

        {/* Delay Notification Form */}
        <Card sx={cardGlass}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "#6366f1" }}><Warning /></Avatar>}
            title={<Typography fontWeight={600}>Send Delay Notification</Typography>}
            subheader="Notify passengers about delays"
          />
          <Divider />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Select Flight</InputLabel>
                  <Select value={form.flightId} onChange={(e) => handleFlightChange(e.target.value)}>
                    <MenuItem value="">Choose flight</MenuItem>
                    {flights.map(f => (
                      <MenuItem key={f._id} value={f._id}>{f.flightNo} – {f.origin} → {f.destination}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {form.flightNo && (
                  <Paper sx={infoBox}>
                    <Typography variant="subtitle2" fontWeight={600}>Selected Flight: {form.flightNo}</Typography>
                  </Paper>
                )}

                <TextField label="Reason" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} multiline rows={3} required fullWidth />
                <TextField type="datetime-local" label="New Departure" InputLabelProps={{ shrink: true }} value={form.newTime} onChange={e => setForm(p => ({ ...p, newTime: e.target.value }))} required fullWidth />

                <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={20} /> : <Warning />} sx={btnStyle}>
                  {submitting ? "Sending..." : "Send Notification"}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* Flights List */}
        <Card sx={cardGlass}>
          <CardHeader title={<Typography fontWeight={600}>Available Flights</Typography>} subheader="Recent flights in system" />
          <Divider />
          <CardContent>
            {flights.length ? (
              <Grid container spacing={2}>
                {flights.slice(0, 6).map(f => (
                  <Grid item xs={12} sm={6} md={4} key={f._id}>
                    <Paper sx={flightBox}>
                      <Typography fontWeight={600}>{f.flightNo}</Typography>
                      <Typography variant="body2">{f.origin} → {f.destination}</Typography>
                      <Typography variant="caption" color="text.secondary">Status: {f.status} | Gate: {f.gate || "N/A"}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : <Typography align="center" py={3} color="text.secondary">No flights available</Typography>}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

/* === Styles === */
const pageWrapper = {
  maxWidth: 1280,
  mx: "auto",
  p: 3,
  background: "linear-gradient(135deg, #ffffff, #f8fafc)",
  borderRadius: 3,
};

const statCardStyle = {
  borderRadius: 3,
  width:"300px",
  backdropFilter: "blur(8px)",
  background: "rgba(255, 255, 255, 0.7)",
  border: "1px solid rgba(255,255,255,0.3)",
  boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
};

const cardGlass = {
  borderRadius: 3,
  backdropFilter: "blur(12px)",
  background: "rgba(255, 255, 255, 0.6)",
  border: "1px solid rgba(255,255,255,0.3)",
  boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
};

const btnStyle = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 600,
  "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }
};

const infoBox = {
  p: 2,
  bgcolor: "rgba(248, 250, 252, 0.7)",
  border: "1px solid #e2e8f0",
  borderRadius: 2
};

const flightBox = {
  p: 2,
  border: "1px solid #e2e8f0",
  borderRadius: 2,
  backdropFilter: "blur(6px)",
  background: "rgba(255,255,255,0.65)",
  transition: "0.2s",
  "&:hover": { boxShadow: "0 6px 12px rgba(0,0,0,0.12)", transform: "translateY(-3px)" }
};
