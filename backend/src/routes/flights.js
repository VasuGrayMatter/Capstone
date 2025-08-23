// import { Router } from 'express';
// import { body, validationResult } from 'express-validator';
// import { authRequired } from '../middleware/auth.js';
// import Flight from '../models/Flight.js';
// import { producer } from '../config/kafka.js';
// import { redis } from '../config/redis.js';
// const router = Router();
// router.post('/',
//   authRequired(['admin','airline']),
//   body('flightNo').notEmpty(),
//   body('origin').notEmpty(),
//   body('destination').notEmpty(),
//   body('status').optional().toLowerCase().isIn(['scheduled','boarding','departed','arrived','delayed','cancelled']),
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
//     const payload = { ...req.body, createdBy: req.user.sub };
//     const f = await Flight.create(payload);
//     await producer.send({
//       topic: 'flight-events',
//       messages: [{ key: f.flightNo, value: JSON.stringify({ type:'flight', subtype:'created', flightId: f._id, flightNo: f.flightNo, payload }) }]
//     });
//     // cache quick status
//     await redis.set(`flight:${f._id}:status`, JSON.stringify({
//       flightNo: f.flightNo, gate: f.gate, status: f.status,
//       scheduledDep: f.scheduledDep, scheduledArr: f.scheduledArr
//     }), { EX: 3600 });
//     res.status(201).json({ message: 'Flight created', flightId: f._id });
//   }
// );
// router.get('/', authRequired(['admin','airline','baggage']), async (req, res) => {
//   const flights = await Flight.find().sort({ createdAt: -1 }).lean();
//   res.json(flights);
// });
// router.patch('/:id',
//   authRequired(['admin','airline']),
//   body('status').optional().isIn(['scheduled','boarding','departed','arrived','delayed','cancelled']),
//   body('gate').optional().trim().escape(),
//   async (req, res, next) => {
//     try {
//       // Validate request
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }
//       const { id } = req.params;
//       const updates = req.body;
//       // Prevent modification of protected fields
//       const protectedFields = ['flightNo', 'createdBy', '_id'];
//       protectedFields.forEach(field => delete updates[field]);
//       // Update flight
//       const updatedFlight = await Flight.findByIdAndUpdate(
//         id, 
//         updates, 
//         { new: true, runValidators: true }
//       );
//       if (!updatedFlight) {
//         return res.status(404).json({ error: 'Flight not found' });
//       }
    
//       await producer.send({
//         topic: 'flight-events',
//         messages: [{
//           key: updatedFlight.flightNo,
//           value: JSON.stringify({
//             type: 'flight',
//             subtype: 'updated',
//             flightId: updatedFlight._id,
//             flightNo: updatedFlight.flightNo,
//             payload: updates,
//             timestamp: new Date().toISOString()
//           })
//         }]
//       });
//       // Update Redis cache
//       await redis.set(
//         `flight:${updatedFlight._id}:status`, 
//         JSON.stringify({
//           flightNo: updatedFlight.flightNo,
//           gate: updatedFlight.gate,
//           status: updatedFlight.status,
//           scheduledDep: updatedFlight.scheduledDep?.toISOString(),
//           scheduledArr: updatedFlight.scheduledArr?.toISOString(),
//           lastUpdated: new Date().toISOString()
//         }), 
//         { EX: 3600 } // Expire after 1 hour
//       );
//       res.json({ 
//         message: 'Flight updated successfully',
//         flightId: updatedFlight._id 
//       });
//     } catch (error) {
//       next(error); // Pass to error handler middleware
//     }
//   }
// );
// //delete Flight
// router.delete('/:id',
//   authRequired(['admin']), // Only admin can delete flights
//   async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       // Find and delete the flight
//       const deletedFlight = await Flight.findByIdAndDelete(id);
      
//       if (!deletedFlight) {
//         return res.status(404).json({ error: 'Flight not found' });
//       }
//       // Publish deletion event to Kafka
//       await producer.send({
//         topic: 'flight-events',
//         messages: [{
//           key: deletedFlight.flightNo,
//           value: JSON.stringify({
//             type: 'flight',
//             subtype: 'deleted',
//             flightId: deletedFlight._id,
//             flightNo: deletedFlight.flightNo,
//             timestamp: new Date().toISOString()
//           })
//         }]
//       });
//       // Remove from Redis cache
//       await redis.del(`flight:${deletedFlight._id}:status`);
//       res.json({ 
//         message: 'Flight deleted successfully',
//         flightNo: deletedFlight.flightNo,
//         deletedAt: new Date().toISOString()
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );
// export default router;
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import Flight from '../models/Flight.js';
import User from '../models/User.js';
import { producer } from '../config/kafka.js';
import { redis } from '../config/redis.js';
import nodemailer from 'nodemailer';

const router = Router();

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // your password or app password
  },
});

// Function to send flight deletion email
const sendFlightDeletionEmail = async (userEmail, userName, flightNo, deletedBy) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: `Flight ${flightNo} has been deleted - Airport Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Flight Deletion Notification</h2>
          <p>Dear ${userName},</p>
          <p>This is to inform you that the flight you created has been deleted from our system:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Flight Details:</h3>
            <p><strong>Flight Number:</strong> ${flightNo}</p>
            <p><strong>Deleted By:</strong> ${deletedBy}</p>
            <p><strong>Deletion Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>If you believe this deletion was made in error, please contact the system administrator immediately.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            This is an automated notification from the Airport Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Flight Deletion Notification
        
        Dear ${userName},
        
        This is to inform you that the flight you created has been deleted from our system:
        
        Flight Number: ${flightNo}
        Deleted By: ${deletedBy}
        Deletion Time: ${new Date().toLocaleString()}
        
        If you believe this deletion was made in error, please contact the system administrator immediately.
        
        This is an automated notification from the Airport Management System.
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Flight deletion email sent to ${userEmail} for flight ${flightNo}`);
  } catch (error) {
    console.error('Error sending flight deletion email:', error);
    // Don't throw error here to avoid breaking the deletion process
  }
};

router.post('/',
  authRequired(['admin','airline']),
  body('flightNo').notEmpty(),
  body('origin').notEmpty(),
  body('destination').notEmpty(),
  body('status').optional().toLowerCase().isIn(['scheduled','boarding','departed','arrived','delayed','cancelled']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const payload = { ...req.body, createdBy: req.user.sub };
    const f = await Flight.create(payload);
    await producer.send({
      topic: 'flight-events',
      messages: [{ key: f.flightNo, value: JSON.stringify({ type:'flight', subtype:'created', flightId: f._id, flightNo: f.flightNo, payload }) }]
    });
    // cache quick status
    await redis.set(`flight:${f._id}:status`, JSON.stringify({
      flightNo: f.flightNo, gate: f.gate, status: f.status,
      scheduledDep: f.scheduledDep, scheduledArr: f.scheduledArr
    }), { EX: 3600 });
    res.status(201).json({ message: 'Flight created', flightId: f._id });
  }
);

router.get('/', authRequired(['admin','airline','baggage']), async (req, res) => {
  const flights = await Flight.find().sort({ createdAt: -1 }).lean();
  res.json(flights);
});

router.patch('/:id',
  authRequired(['admin','airline']),
  body('status').optional().isIn(['scheduled','boarding','departed','arrived','delayed','cancelled']),
  body('gate').optional().trim().escape(),
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const updates = req.body;
      // Prevent modification of protected fields
      const protectedFields = ['flightNo', 'createdBy', '_id'];
      protectedFields.forEach(field => delete updates[field]);
      // Update flight
      const updatedFlight = await Flight.findByIdAndUpdate(
        id, 
        updates, 
        { new: true, runValidators: true }
      );
      if (!updatedFlight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
    
      await producer.send({
        topic: 'flight-events',
        messages: [{
          key: updatedFlight.flightNo,
          value: JSON.stringify({
            type: 'flight',
            subtype: 'updated',
            flightId: updatedFlight._id,
            flightNo: updatedFlight.flightNo,
            payload: updates,
            timestamp: new Date().toISOString()
          })
        }]
      });
      // Update Redis cache
      await redis.set(
        `flight:${updatedFlight._id}:status`, 
        JSON.stringify({
          flightNo: updatedFlight.flightNo,
          gate: updatedFlight.gate,
          status: updatedFlight.status,
          scheduledDep: updatedFlight.scheduledDep?.toISOString(),
          scheduledArr: updatedFlight.scheduledArr?.toISOString(),
          lastUpdated: new Date().toISOString()
        }), 
        { EX: 3600 } // Expire after 1 hour
      );
      res.json({ 
        message: 'Flight updated successfully',
        flightId: updatedFlight._id 
      });
    } catch (error) {
      next(error); // Pass to error handler middleware
    }
  }
);

// Delete Flight with Email Notification
router.delete('/:id',
  authRequired(['admin']), // Only admin can delete flights
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Find the flight with populated createdBy user details
      const flightToDelete = await Flight.findById(id).populate('createdBy', 'name email');
      
      if (!flightToDelete) {
        return res.status(404).json({ error: 'Flight not found' });
      }

      // Store flight details before deletion
      const flightNo = flightToDelete.flightNo;
      const createdBy = flightToDelete.createdBy;
      
      // Delete the flight
      const deletedFlight = await Flight.findByIdAndDelete(id);
      
      // Send email notification to the user who created the flight
      if (createdBy && createdBy.email) {
        // Get the name of the admin who deleted the flight
        const deletingAdmin = await User.findById(req.user.sub).select('name email');
        const deletedByName = deletingAdmin ? deletingAdmin.name : 'Administrator';
        
        // Send email notification (non-blocking)
        sendFlightDeletionEmail(
          createdBy.email,
          createdBy.name,
          flightNo,
          deletedByName
        ).catch(emailError => {
          console.error('Failed to send deletion email:', emailError);
        });
      }

      // Publish deletion event to Kafka
      await producer.send({
        topic: 'flight-events',
        messages: [{
          key: deletedFlight.flightNo,
          value: JSON.stringify({
            type: 'flight',
            subtype: 'deleted',
            flightId: deletedFlight._id,
            flightNo: deletedFlight.flightNo,
            deletedBy: req.user.sub,
            timestamp: new Date().toISOString()
          })
        }]
      });

      // Remove from Redis cache
      await redis.del(`flight:${deletedFlight._id}:status`);

      res.json({ 
        message: 'Flight deleted successfully',
        flightNo: deletedFlight.flightNo,
        deletedAt: new Date().toISOString(),
        notificationSent: createdBy && createdBy.email ? true : false
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
