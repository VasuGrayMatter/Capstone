// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Stack,
  Paper,
  LinearProgress,
  useTheme
} from "@mui/material";
import {
  FlightTakeoff,
  FlightLand,
  Luggage,
  Warning,
  Schedule,
  CheckCircle,
  Error,
  TrendingUp,
  Notifications
} from "@mui/icons-material";
import { getOverview, getActiveFlights, getNotifications, getFlightStats, getBaggageOverview, getSystemHealth } from "../api.js";
import { toast } from "react-toastify";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const theme = useTheme();
  const [overview, setOverview] = useState(null);
  const [activeFlights, setActiveFlights] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [flightStats, setFlightStats] = useState(null);
  const [baggageOverview, setBaggageOverview] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [
        overviewRes,
        activeFlightsRes,
        notificationsRes,
        flightStatsRes,
        baggageOverviewRes,
        systemHealthRes
      ] = await Promise.all([
        getOverview(),
        getActiveFlights(),
        getNotifications(10),
        getFlightStats(),
        getBaggageOverview(),
        getSystemHealth()
      ]);

      setOverview(overviewRes.data);
      setActiveFlights(activeFlightsRes.data);
      setNotifications(notificationsRes.data);
      setFlightStats(flightStatsRes.data);
      setBaggageOverview(baggageOverviewRes.data);
      setSystemHealth(systemHealthRes.data);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "error";
      case "high": return "warning";
      default: return "info";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy": return <CheckCircle color="success" />;
      case "degraded": return <Warning color="warning" />;
      default: return <Error color="error" />;
    }
  };

  // Flight Status Chart Data
  const flightStatusData = {
    labels: flightStats?.byStatus ? Object.keys(flightStats.byStatus) : [],
    datasets: [
      {
        data: flightStats?.byStatus ? Object.values(flightStats.byStatus) : [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(167, 139, 250, 0.8)',
          'rgba(79, 70, 229, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(167, 139, 250, 1)',
          'rgba(79, 70, 229, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Baggage Status Chart Data
  const baggageStatusData = {
    labels: baggageOverview?.byStatus ? Object.keys(baggageOverview.byStatus) : [],
    datasets: [
      {
        label: 'Baggage Count',
        data: baggageOverview?.byStatus ? Object.values(baggageOverview.byStatus) : [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const flightStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '60%',
  };

  const baggageStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Stack spacing={3} sx={{ background: 'linear-gradient(to bottom, #ffffff, #f8fafc)', p: 2, borderRadius: 2 }}>
      {/* Overview Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            height:"10rem",
            width:"15rem",
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <FlightTakeoff sx={{ color: 'white' }} />
                <Typography variant="h6">Total Flights</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{overview?.flights?.total || 0}</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">{overview?.flights?.today || 0} today</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            height:"10rem",
            width:"15rem",
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Luggage sx={{ color: 'white' }} />
                <Typography variant="h6">Total Baggage</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{overview?.baggage?.total || 0}</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">{overview?.baggage?.today || 0} today</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            height:"10rem",
            width:"15rem",
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Schedule sx={{ color: 'white' }} />
                <Typography variant="h6">Active Flights</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{overview?.flights?.active || 0}</Typography>
              <Typography variant="body2">{overview?.flights?.delayed || 0} delayed</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: systemHealth?.status === 'healthy' 
              ? 'linear-gradient(135deg, #10b981, #047857)' 
              : systemHealth?.status === 'degraded'
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            height:"10rem",
            width:"15rem",
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                {getStatusIcon(systemHealth?.status)}
                <Typography variant="h6">System Health</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                {systemHealth?.status}
              </Typography>
              <Typography variant="body2">Uptime: {systemHealth?.uptime}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Flights and Notifications */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2,width:'1000px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardHeader 
              title="Active Flights" 
              sx={{ 
                background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {activeFlights?.flights?.map((flight) => (
                  <ListItem 
                    key={flight._id} 
                    divider
                    sx={{ 
                      borderRadius: 2, 
                      mb: 1, 
                      background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #f1f5f9, #f8fafc)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      {flight.status === "departed" ? 
                        <FlightLand color="primary" /> : 
                        <FlightTakeoff color="secondary" />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {flight.flightNo}
                          </Typography>
                          <Chip 
                            label={flight.status} 
                            size="small" 
                            color={flight.status === "on time" ? "success" : "warning"}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {flight.origin} → {flight.destination}
                          </Typography>
                          <Box display="flex" gap={2} mt={0.5}>
                            <Typography variant="caption" display="flex" alignItems="center">
                              Gate: {flight.gate}
                            </Typography>
                            <Typography variant="caption" display="flex" alignItems="center">
                              Bags: {flight.baggageCount}
                            </Typography>
                            <Typography variant="caption">
                              Dep: {new Date(flight.scheduledDep).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {(!activeFlights?.flights || activeFlights.flights.length === 0) && (
                  <ListItem>
                    <ListItemText primary="No active flights" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2,width:'1000px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Notifications color="primary" />
                  <span>Notifications</span>
                </Box>
              } 
              sx={{ 
                background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {notifications?.notifications?.map((notification, index) => (
                  <ListItem 
                    key={index} 
                    divider
                    sx={{ 
                      borderRadius: 2, 
                      mb: 1,
                      background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                    }}
                  >
                    <ListItemIcon>
                      <Warning color={getSeverityColor(notification.severity)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="medium">
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {new Date(notification.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {(!notifications?.notifications || notifications.notifications.length === 0) && (
                  <ListItem>
                    <ListItemText primary="No notifications" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Flight Stats and Baggage Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardHeader 
              title="Flight Statistics" 
              sx={{ 
                background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Doughnut data={flightStatusData} options={flightStatusOptions} />
              </Box>
              <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                <Typography variant="h6" textAlign="center">
                  Total: {flightStats?.total || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2,width:"640px", boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardHeader 
              title="Baggage Overview" 
              sx={{ 
                background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Bar data={baggageStatusData} options={baggageStatusOptions} />
              </Box>
              <Box mt={2} pt={2} borderTop={1} borderColor="divider" textAlign="center">
                <Typography variant="body1" fontWeight="medium">
                  Total: {baggageOverview?.total || 0} | Today: {baggageOverview?.today || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}