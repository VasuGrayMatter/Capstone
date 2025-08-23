// src/pages/User.jsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText } from "@mui/material";
import { getProfile, getUserFlights } from "../api.js";
import { toast } from "react-toastify";

export default function UserPage() {
  const [profile, setProfile] = useState(null);
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, f] = await Promise.all([getProfile(), getUserFlights()]);
        setProfile(p.data);
        setFlights(f.data);
      } catch {
        toast.error("Failed to load user data");
      }
    })();
  }, []);

  if (!profile) return <Typography>Loading...</Typography>;

  return (
    <Card>
      <CardHeader title="My Profile" />
      <CardContent>
        <Typography>Name: {profile.name}</Typography>
        <Typography>Email: {profile.email}</Typography>
        <Typography>Role: {profile.role}</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>My Flights</Typography>
        <List>
          {flights.map(f => (
            <ListItem key={f._id}>
              <ListItemText primary={`Flight ${f.flightNo}`} secondary={`${f.origin} → ${f.destination}`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
