import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Flight from '../models/Flight.js';
import Baggage from '../models/Baggage.js';
import { producer } from '../config/kafka.js';
import { redis } from '../config/redis.js';

const router = Router();

// Delay notification (publishes flight-event + relies on dashboard socket)
router.post('/flights/:id/delay', authRequired(['admin','airline']), async (req, res) => {
  const { id } = req.params;
  const { reason, newTime } = req.body;

  const f = await Flight.findByIdAndUpdate(id, { status: 'delayed', scheduledDep: newTime || undefined }, { new: true });
  if (!f) return res.status(404).json({ error: 'Not found' });

  await producer.send({
    topic: 'flight-events',
    messages: [{ key: f.flightNo, value: JSON.stringify({
      type: 'flight', subtype: 'delayed', flightId: f._id, flightNo: f.flightNo, payload: { reason, newTime }
    }) }]
  });

  await redis.set(`flight:${f._id}:status`, JSON.stringify({
    flightNo: f.flightNo, gate: f.gate, status: f.status,
    scheduledDep: f.scheduledDep, scheduledArr: f.scheduledArr
  }), { EX: 3600 });

  res.json({ message: 'Delay notification sent' });
});

// Simple analytics (today)
router.get('/analytics', authRequired(['admin','airline']), async (req, res) => {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);

  const totalFlightsToday = await Flight.countDocuments({ createdAt: { $gte: start, $lte: end } });
  const totalBaggageProcessed = await Baggage.countDocuments({ updatedAt: { $gte: start, $lte: end }, status: { $in: ['loaded','unloaded','atBelt'] } });

  res.json({ totalFlightsToday, totalBaggageProcessed });
});

export default router;
