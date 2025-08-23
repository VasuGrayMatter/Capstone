import React from "react";
import { 
  Drawer, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import LuggageIcon from "@mui/icons-material/Luggage";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const SIDEBAR_WIDTH = 185;

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const menuItems = [
    {
      text: "Flights",
      icon: <FlightTakeoffIcon />,
      path: "/flights",
      roles: ["admin", "airline"]
    },
    {
      text: "Baggage",
      icon: <LuggageIcon />,
      path: "/baggage",
      roles: ["admin", "baggage"]
    },
    {
      text: "Users",
      icon: <GroupAddIcon />,
      path: "/users",
      roles: ["admin"]},{
    // },{
    //   text: "Profile",
    //   icon: <AccountCircleIcon />,
    //   path: "/profile",
    //   roles: ["admin", "airline", "baggage"]
    // },{
      text: "Ops",
      icon: <WorkspacesIcon />,
      path: "/ops",
      roles: ["admin", "airline"]
    },{
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
      roles: ["admin", "airline", "baggage"]
    }
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
          borderRight: "none",
          color: "white",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* Animated background overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>
        {/* Header/Logo Section */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                border: "2px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography sx={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
                ✈
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  fontFamily: "'Poppins', sans-serif",
                  lineHeight: 1.2,
                }}
              >
                AirOps
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 400,
                  fontSize: "0.875rem",
                }}
              >
                Console
              </Typography>
            </Box>
          </Box>

          {/* User Info */}
          {user && (
            <Box
              sx={{
                borderRadius: 3,
                p: 1.5,
                border: "0px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  mb: 1,
                  fontSize: "0.875rem",
                  lineHeight: 1.2,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {user?.name || user?.email || "User"}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "0.75rem",
                  height: "22px",
                  textTransform: "capitalize",
                  alignSelf: "flex",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.15)", mx: 2 }} />

        {/* Navigation Menu */}
        <List sx={{ px: 2, py: 2 }}>
          {filteredItems.map((item) => {
            const isActive = loc.pathname.startsWith(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    color: "white",
                    transition: "all 0.3s ease",
                    ...(isActive ? {
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                      transform: "translateX(4px)",
                    } : {
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.1)",
                        transform: "translateX(2px)",
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "white",
                      minWidth: 40,
                      "& .MuiSvgIcon-root": {
                        fontSize: "1.25rem",
                        filter: isActive ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "0.875rem",
                        textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Logout Button - Fixed at bottom */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: "linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%)",
          }}
        >
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 3,
              p: 1,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ListItemButton
              onClick={logout}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(255, 82, 82, 0.2)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(255, 82, 82, 0.3)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
                  minWidth: 40,
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.25rem",
                  },
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  "& .MuiListItemText-primary": {
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  },
                }}
              />
            </ListItemButton>
          </Box>
          
          {/* Copyright */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.6)",
              mt: 2,
              fontSize: "0.7rem",
            }}
          >
            © 2006 GrayMatter
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}