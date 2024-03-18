/** @format */
const { isProtected, credentials } = require('./config/ssl')
const express = require("express");
const dbConnect = require("./database/index");
const instance = isProtected ? require('https') : require('http')
const { PORT } = require("./config/index");
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

dbConnect();

app.use("/storage", express.static("storage"));
app.use(errorHandler);

let server = instance.createServer(credentials, app)

server.listen(PORT, console.log(`Backend is running on port: ${PORT}`));