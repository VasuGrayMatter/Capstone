// import express from 'express'
// import User from '../models/User.js';
// import Baggage from '../models/Baggage.js';
// import Flight from '../models/Flight.js';

// import { authRequired } from '../middleware/auth.js';


// const router = express.Router();

// // 👉 Get user profile (basic info)
// router.get('/me',authRequired(["admin", "baggage", "airline"]), async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password').populate('flights');
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // 👉 Get user flights
// router.get('/flights',   authRequired(["admin", "baggage", "airline"]), async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('flights');
//     res.json(user.flights);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // 👉 Get baggage status for a specific flight
// router.get('/flights/:flightId/baggage',   authRequired(["admin", "baggage", "airline"]), async (req, res) => {
//   try {
//     const { flightId } = req.params;

//     // check if flight belongs to user
//     const user = await User.findById(req.user.id);
//     if (!user.flights.includes(flightId)) {
//       return res.status(403).json({ error: 'Not your flight' });
//     }

//     const baggage = await Baggage.find({ flight: flightId, passenger: req.user.id });
//     res.json(baggage);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// export default router;