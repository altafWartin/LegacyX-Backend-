/** @format */
const { isProtected, credentials } = require("./config/ssl");
const express = require("express");
const dbConnect = require("./database/index");
const instance = isProtected ? require("https") : require("http");
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
const cors = require("cors");
const app = express();

// Allow all origins
app.use(cors());

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.stripeWebhook
);
app.get("/success", subscriptionController.success);
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


let server = instance.createServer(credentials, app);

let PORT = 4400;

server.listen(
  PORT,
  console.log(`Server is running on http://localhost:${PORT}`)
);

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with your service account credentials

const serviceAccount = require("./lxdc-c7799-9c537a3a7148.json");

// Check if Firebase Admin SDK has been initialized before initializing it again
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function sendPushNotification(deviceToken, title, body) {
  try {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

app.get("/testt", async (req, res, next) => {
  try {
    const deviceToken =
      "ctlbW8pKSW65bVrgFguvlI:APA91bF0b5MuJmXDrA11zIjN6r-TZZ_8CP9bE1i_93-coywlONns_espyQL6SFAYGRzZuhXVwFLujPk358EwkgC62YfsKCOsjrKFq-crjTIyGqCP7sW3EZUjRjJTcQURsfe0no2Z6neL";
    const title = "Test Notification";
    const body = "This is a test notification from your Node.js server.";

    await sendPushNotification(deviceToken, title, body);

    res.status(200).send("Notification sent successfully!");
  } catch (error) {
    console.error("Failed to send push notification:", error);
    res.status(500).send("Failed to send push notification");
  }
});

// API endpoint for creating a user


const User = require("./models/user");


// // API endpoint to create user and save in MongoDB
// app.post('/createUser', async (req, res) => {
//   try {
//     const { email } = req.body;
//     const userData = await getUserData(email);

//     if (userData) {
//       const newUser = new User({ uid: userData.uid, email: userData.email, username: userData.displayName, profileImage: userData.photoURL });
//       await newUser.save();
//       console.log(newUser);
//       res.status(201).json({ message: 'User created successfully', user: newUser });
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Function to get user data by email
// async function getUserData(email) {
//   try {
//     const userRecord = await admin.auth().getUserByEmail(email);
//     return userRecord.toJSON();
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return null;
//   }
// }



// API endpoint to create user and save in MongoDB
app.post('/createUser', async (req, res) => {
  try {
    const { email } = req.body;
    let userData;
    try {
      userData = await admin.auth().getUserByEmail(email);
    } catch (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newUser = new User({ uid: userData.uid, email: userData.email, username: userData.displayName, profileImage: userData.photoURL });
    await newUser.save();
    console.log(newUser);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});