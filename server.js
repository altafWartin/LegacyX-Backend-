/** @format */
const { isProtected, credentials } = require('./config/ssl')
const express = require("express");
const dbConnect = require("./database/index");
const instance = isProtected ? require('https') : require('http')
// const { PORT } = require("./config/index");
const authRouter = require("./routes/auth");
const entityRouter = require("./routes/entity");
const likeRouter = require("./routes/like");
const shareRouter = require("./routes/share");
const collectionRouter = require("./routes/collection");
const subscriptionRouter = require("./routes/subscription");
const subscriptionController = require("./controllers/subscriptionController");

const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const app = express();

// Allow all origins
app.use(cors());


app.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.stripeWebhook)
app.get('/success', subscriptionController.success)
app.use(express.static("uploads"));
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/entity", entityRouter);
app.use("/api/like", likeRouter);
app.use("/api/share", shareRouter);
app.use("/api/collection", collectionRouter);
app.use("/api/subscription", subscriptionRouter);
app.get("/", (req, res) => res.json({ msg: "Welcome to TEST page" }));

dbConnect();

   
app.use("/storage", express.static("storage"));
app.use(errorHandler);


// var admin = require("firebase-admin");

// var serviceAccount = require("./lxdc-c7799-firebase-adminsdk-brksr-bdbaaab111.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


// const User = require("./models/user");
// const { body, validationResult } = require("express-validator");

// const secretKey = 'demo_secret_key_for_testing_only';

// API endpoint for sending push notifications
// app.post(
//     "/send-notification",
//     [
//       body("notificationType").notEmpty(),
//       body("notificationText").notEmpty(),
//       body("userIds").isArray(),
//       body("userIds.*").isMongoId(),
//     ],
//     async (req, res) => {
//       try {
//         // Check for validation errors
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//           return res.status(400).json({ errors: errors.array() });
//         }
  
//         const { notificationType, notificationText, userIds } = req.body;
  
//         // Fetch users' device tokens from the database
//         const users = await User.find({ _id: { $in: userIds } });
//         const deviceTokens = users.flatMap((user) => user.device_tokens);
  
//         // Prepare the FCM message
//         const message = {
//           notification: {
//             title: notificationType,
//             body: notificationText,
//           },
//           tokens: deviceTokens
//         };
  
//         // Send the push notification
//         admin.messaging().sendMulticast(message)
//           .then((response) => {
//             console.log("Successfully sent message:", response);
//             return res.status(200).json({ message: "Notification sent successfully" });
//           })
//           .catch((error) => {
//             console.error("Error sending message:", error);
//             return res.status(500).json({ error: "Failed to send notification" });
//           });
//       } catch (err) {
//         console.error("Error:", err);
//         return res.status(500).json({ error: "Server error" });
//       }
//     }
//   );


let server = instance.createServer(credentials, app)

let PORT = 4400

server.listen(PORT, console.log(`Server is running on http://localhost:${PORT}`)
);

