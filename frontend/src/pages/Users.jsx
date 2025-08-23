import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Stack, 
  TextField, 
  MenuItem, 
  Button,
  Box,
  Typography,
  Avatar,
  Divider,
  Chip,
  CircularProgress
} from "@mui/material";
import { Person, Email, Lock } from "@mui/icons-material";
import { registerApi } from "../api.js";
import { toast } from "react-toastify";

const ROLES = [
  { value: "admin", label: "Administrator", color: "#ef4444", icon: "👑" },
  { value: "airline", label: "Airline Staff", color: "#6366f1", icon: "✈️" },
  { value: "baggage", label: "Baggage Handler", color: "#10b981", icon: "🧳" }
];

export default function Users() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "airline" 
  });
  const [busy, setBusy] = useState(false);

  function setField(k, v) { 
    setForm(prev => ({ ...prev, [k]: v })); 
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await registerApi(form);
      toast.success("User registered successfully");
      setForm({ name: "", email: "", password: "", role: "airline" });
    } finally {
      setBusy(false);
    }
  }

  const selectedRole = ROLES.find(r => r.value === form.role);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
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
              <Person />
            </Avatar>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Create New User
            </Typography>
          }
          subheader={
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Add a new user to the airport management system
            </Typography>
          }
        />
        
        <Divider sx={{ mx: 3, borderColor: '#e2e8f0' }} />
        
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={submit}>
            <Stack spacing={5}>
              {/* Role Selection Preview */}
              
      
              {/* Name Field */}
              <TextField 
                label="Full Name" 
                value={form.name} 
                onChange={(e) => setField("name", e.target.value)} 
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Person sx={{ color: '#64748b', mr: 1 }} />
                  ),
                }}
                sx={{
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
                }}
                placeholder="Enter user's full name"
              />

              {/* Email Field */}
              <TextField 
                label="Email Address" 
                type="email" 
                value={form.email} 
                onChange={(e) => setField("email", e.target.value)} 
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Email sx={{ color: '#64748b', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                  },
                }}
                placeholder="user@example.com"
              />

              {/* Password Field */}
              <TextField 
                label="Password" 
                type="password" 
                value={form.password} 
                onChange={(e) => setField("password", e.target.value)} 
                inputProps={{ minLength: 6 }} 
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Lock sx={{ color: '#64748b', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                  },
                }}
                placeholder="Minimum 6 characters"
                helperText="Password must be at least 6 characters long"
              />

              {/* Role Selection */}
              <TextField 
                label="User Role" 
                select 
                value={form.role} 
                onChange={(e) => setField("role", e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Person sx={{ color: '#64748b', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                  },
                }}
              >
                {ROLES.map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <Box sx={{ fontSize: '1.2rem' }}>{role.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {role.label}
                        </Typography>
                      </Box>
                      <Chip 
                        size="small" 
                        label={role.value} 
                        sx={{ 
                          backgroundColor: `${role.color}15`,
                          color: role.color,
                          fontWeight: 500,
                          fontSize: '0.7rem'
                        }} 
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="contained" 
                disabled={busy}
                size="large"
                fullWidth
                startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <Person />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: busy 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: busy 
                      ? '#94a3b8' 
                      : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: busy ? 'none' : 'translateY(-1px)',
                    boxShadow: busy 
                      ? 'none' 
                      : '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                }}
              >
                {busy ? "Creating User..." : "Create User Account"}
              </Button>

              {/* Info Box */}
             
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}