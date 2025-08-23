import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import { loginApi } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await loginApi(email, password);
      login(data.token, data.role, data.name);
      toast.success("Welcome!");
      nav(from, { replace: true });
    } catch (e) {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#00A2FF",
      }}
    >
      {/* Animated gradient background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none", // This prevents the canvas from blocking clicks
        }}
      >
        <canvas
          ref={(canvas) => {
            if (canvas && !canvas.hasAttribute('data-initialized')) {
              canvas.setAttribute('data-initialized', 'true');
              
              const ctx = canvas.getContext('2d');
              const resizeCanvas = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
              };
              
              resizeCanvas();
              window.addEventListener('resize', resizeCanvas);
              
              const colors = [
                '#FFFFFF',
                '#0c0a07ff', 
                '#D5ECEB',
                '#834545ff',
                '#D5ECEB'
              ];
              
              let time = 0;
              const speed = 4;
              const waveFreqX = 4;
              const waveFreqY = 3;
              const amplitude = 2;
              
              const animate = () => {
                time += speed * 0.01;
                
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                
                colors.forEach((color, index) => {
                  const offset = (index / (colors.length - 1)) + Math.sin(time + index) * 0.1;
                  gradient.addColorStop(Math.max(0, Math.min(1, offset)), color);
                });
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add wave effect
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let y = 0; y < canvas.height; y += 2) {
                  for (let x = 0; x < canvas.width; x += 2) {
                    const waveX = Math.sin((x / canvas.width) * waveFreqX + time) * amplitude;
                    const waveY = Math.sin((y / canvas.height) * waveFreqY + time) * amplitude;
                    
                    const index = (y * canvas.width + x) * 4;
                    if (data[index] !== undefined) {
                      data[index] = Math.min(255, data[index] + waveX + waveY); // R
                      data[index + 1] = Math.min(255, data[index + 1] + waveX); // G  
                      data[index + 2] = Math.min(255, data[index + 2] + waveY); // B
                    }
                  }
                }
                
                ctx.putImageData(imageData, 0, 0);
                requestAnimationFrame(animate);
              };
              
              animate();
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.8,
            pointerEvents: "none", // This also prevents canvas from blocking clicks
          }}
        />
      </Box>

      {/* Sky background overlay with clouds effect */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(250, 250, 250, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)
          `,
          zIndex: 1,
          pointerEvents: "none", // This prevents the overlay from blocking clicks
        }}
      />

      {/* Airplane wing illustration */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "60%",
          height: "40%",
          background: "linear-gradient(45deg, #2C3E50 0%, #34495E 100%)",
          clipPath: "polygon(0% 100%, 100% 60%, 100% 100%)",
          zIndex: 1,
          pointerEvents: "none", // This prevents the wing from blocking clicks
        }}
      />

      {/* Wing details */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          right: "10%",
          width: "40%",
          height: "25%",
          background: "linear-gradient(45deg, #34495E 0%, #5D6D7E 100%)",
          clipPath: "polygon(0% 100%, 100% 70%, 100% 100%)",
          zIndex: 2,
          pointerEvents: "none", // This prevents the wing detail from blocking clicks
        }}
      />

      {/* Main content container */}
      <Stack
        direction="row"
        sx={{
          width: "100%",
          maxWidth: 1200,
          height: "100vh",
          position: "relative",
          zIndex: 10, // Higher z-index to ensure it's above background elements
        }}
      >
        {/* Left side - Welcome text */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            pr: 8,
            color: "white",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 300,
                mb: 1,
                textAlign: "right",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Fly high,
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                textAlign: "right",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              above the sky.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "right",
                opacity: 0.9,
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              connecting dreams to destinations
            </Typography>
          </motion.div>
        </Box>

        {/* Right side - Login form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            pl: 8,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              elevation={0}
              sx={{
                width: 380,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                position: "relative",
                zIndex: 11, // Even higher z-index for the form
              }}
            >
              <CardHeader
                sx={{ pb: 1 }}
                title={
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    {/* Skyair logo/icon */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          background: "linear-gradient(45deg, #667eea, #764ba2)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                        }}
                      >
                        <Typography sx={{ color: "white", fontSize: "14px", fontWeight: "bold" }}>
                          ✈
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#2C3E50",
                        }}
                      >
                        GrayMatter
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 500,
                        color: "#2C3E50",
                        mb: 1,
                      }}
                    >
                      Login
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <form onSubmit={onSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      fullWidth
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.12)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.12)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "1rem",
                        borderRadius: 6,
                        background: "linear-gradient(90deg, #4A90E2, #357ABD)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "linear-gradient(90deg, #357ABD, #2E6DA4)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(74, 144, 226, 0.4)",
                        },
                        "&:disabled": {
                          background: "rgba(0, 0, 0, 0.12)",
                        },
                      }}
                    >
                      {submitting ? (
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      ) : (
                        "LOG IN "
                      )}
                    </Button>

                    {/* Additional info section */}
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        background: "rgba(74, 144, 226, 0.1)",
                        border: "1px solid rgba(74, 144, 226, 0.2)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4A90E2",
                          fontWeight: 500,
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#4A90E2",
                            mr: 1,
                            flexShrink: 0,
                          }}
                        />
                        For Registration
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          fontSize: "0.75rem",
                          lineHeight: 1.4,
                        }}
                      >
                        Registration is disabled for non-admin users.Please contact admins for user registration
                      </Typography>
                    </Box>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Stack>

      {/* Bottom copyright */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "0.75rem",
          zIndex: 4,
        }}
      >
        legal notice | © 2006 GrayMatter
      </Box>
    </Box>
  );
}