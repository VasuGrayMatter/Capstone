// import React from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { Container, Box } from "@mui/material";
// import { motion, AnimatePresence } from "framer-motion";
// import { useAuth, Protected } from "./auth.jsx";
// import Navbar from "./components/Navbar.jsx";
// import Login from "./pages/Login.jsx";
// import OpsPage from "./pages/Ops.jsx";
// import DashboardPage from "./pages/Dashboard.jsx";
// import BaggagePage from "./pages/Baggage.jsx";
// // import UserPage from "./pages/Profile.jsx";
// import Flights from "./pages/Flights.jsx";
// import Users from "./pages/Users.jsx";
// import React, { Suspense, lazy } from "react";
// const SIDEBAR_WIDTH = 0;

// const pageVariants = {
//   initial: { opacity: 0, y: 12 },
//   in: { opacity: 1, y: 0 },
//   out: { opacity: 0, y: -12 }
// };
// const pageTransition = { type: "spring", stiffness: 110, damping: 18, duration: 0.25 };

// export default function App() {
//   const { user } = useAuth();
//   const location = useLocation();
     
//   // Show login page without navbar if not authenticated
//   if (!user && location.pathname !== "/login") {
//     return <Navigate to="/login" replace />;
//   }

//   // Login page - no navbar, full screen
//   if (location.pathname === "/login") {
//     return <Login />;
//   }

//   // Authenticated routes - with sidebar layout
//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//       {/* Left Sidebar */}
      
//       <Navbar />
      
//       {/* Main Content Area */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           ml: `${SIDEBAR_WIDTH}px`,
//           background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
//           minHeight: "100vh",
//           position: "relative",
//           overflow: "auto",
//         }}
//       >
//         {/* Background pattern overlay */}
//         <Box
//           sx={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: `
//               radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
//               radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
//             `,
//             pointerEvents: "none",
//             zIndex: 0,
//           }}
//         />
        
//         {/* Content Container */}
//         <Container 
//           maxWidth="xl" 
//           sx={{ 
//             position: "relative", 
//             zIndex: 1,
//             py: 4,
//           }}
//         >
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={location.pathname}
//               initial="initial"
//               animate="in"
//               exit="out"
//               variants={pageVariants}
//               transition={pageTransition}
//             >
//              <Routes location={location} key={location.pathname}>
//   {/* Landing redirect based on role */}
//   <Route path="/" element={<HomeRedirect />} />

//   <Route
//     path="/flights"
//     element={
//       <Protected roles={["admin", "airline", "baggage"]}>
//         <Flights />
//       </Protected>
//     }
//   />
//   <Route
//     path="/baggage"
//     element={
//       <Protected roles={["admin", "baggage", "airline"]}>
//         <BaggagePage />
//       </Protected>
//     }
//   />
//   <Route
//     path="/users"
//     element={
//       <Protected roles={["admin"]}>
//         <Users />
//       </Protected>
//     }
//   />
//   {/* <Route
//     path="/profile"
//     element={
//       <Protected roles={["admin", "airline", "baggage"]}>
//         <UserPage />
//       </Protected>
//     }
//   /> */}
//   <Route
//     path="/ops"
//     element={
//       <Protected roles={["admin", "airline", "baggage"]}>
//         <OpsPage />
//       </Protected>
//     }
//   />
//   <Route
//     path="/dashboard"
//     element={
//       <Protected roles={["admin", "airline", "baggage"]}>
//         <DashboardPage />
//       </Protected>
//     }
//   />

//   {/* instead of looping back to "/" which triggers HomeRedirect,
//       send to a NotFound or just to /flights */}
//   <Route path="*" element={<Navigate to="/flights" replace />} />
// </Routes>
//             </motion.div>
//           </AnimatePresence>
//         </Container>
//       </Box>
//     </Box>
//   );
// }

// function HomeRedirect() {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/login" replace />;
//   // Simple role-based landing
//   if (user.role === "baggage") return <Navigate to="/baggage" replace />;
//   if (user.role === "airline") return <Navigate to="/flights" replace />;
//   return <Navigate to="/dashboard" replace />;
// }

import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Container, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, Protected } from "./auth.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import landingImg from "./assets/landing.png";
const SIDEBAR_WIDTH = 0;

// ✅ Lazy load pages so fallback works
const OpsPage = lazy(() => import("./pages/Ops.jsx"));
const DashboardPage = lazy(() => import("./pages/Dashboard.jsx"));
const BaggagePage = lazy(() => import("./pages/Baggage.jsx"));
const Flights = lazy(() => import("./pages/Flights.jsx"));
const Users = lazy(() => import("./pages/Users.jsx"));

// Your landing/airport waiting image
const LandingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
    }}
  >
    <img src={landingImg} alt="Loading..."  />
  </Box>
);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -12 }
};
const pageTransition = { type: "spring", stiffness: 110, damping: 18, duration: 0.25 };

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  // Show login page without navbar if not authenticated
  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  // Login page - no navbar
  if (location.pathname === "/login") {
    return <Login />;
  }

  // Authenticated routes
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Sidebar */}
      <Navbar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "100vh",
          position: "relative",
          overflow: "auto",
        }}
      >
        {/* Background pattern overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
            `,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Content Container */}
        <Container 
          maxWidth="xl" 
          sx={{ position: "relative", zIndex: 1, py: 4 }}
        >
          {/* Wrap all routes in Suspense with image fallback */}
          <Suspense fallback={<LandingFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomeRedirect />} />

                  <Route
                    path="/flights"
                    element={
                      <Protected roles={["admin", "airline", "baggage"]}>
                        <Flights />
                      </Protected>
                    }
                  />
                  <Route
                    path="/baggage"
                    element={
                      <Protected roles={["admin", "baggage", "airline"]}>
                        <BaggagePage />
                      </Protected>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <Protected roles={["admin"]}>
                        <Users />
                      </Protected>
                    }
                  />
                  <Route
                    path="/ops"
                    element={
                      <Protected roles={["admin", "airline", "baggage"]}>
                        <OpsPage />
                      </Protected>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <Protected roles={["admin", "airline", "baggage"]}>
                        <DashboardPage />
                      </Protected>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/flights" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </Container>
      </Box>
    </Box>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "baggage") return <Navigate to="/baggage" replace />;
  if (user.role === "airline") return <Navigate to="/flights" replace />;
  return <Navigate to="/dashboard" replace />;
}
