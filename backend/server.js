import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import baggageRoutes from './src/routes/baggage.js';
import opsRoutes from './src/routes/ops.js';
import authRoutes from './src/routes/auth.js';
import flightsRoutes from './src/routes/flights.js';
// import userRoutes from './src/routes/user.js'
import dashBoardRoute from './src/routes/dashboard.js'


import { connectMongo } from './src/config/db.js';
import { connectRedis } from './src/config/redis.js';
import { connectkafka, consumer } from './src/config/kafka.js';
import { runRealtimeBridge } from './src/realtime/streamToSocket.js';

const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/baggage', baggageRoutes);
app.use('/api/ops', opsRoutes);
app.use('/api/flights', flightsRoutes);
// app.use('/api/user', userRoutes);
app.use("/api/dashboard",dashBoardRoute)


// health
app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectMongo(process.env.MONGO_URI);
    await connectRedis();
    await connectkafka();

    //  Subscribe BEFORE running consumer
    await consumer.subscribe({ topic: 'flight-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'baggage-events', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(` [${topic}] ${message.key?.toString()} => ${message.value?.toString()}`);
      },
    });

    // Bridge Kafka -> Socket.io (after consumer is ready)
    await runRealtimeBridge();

    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error(' Server start failed:', err);
  }
};

start();
