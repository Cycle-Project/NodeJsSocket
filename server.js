const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const { socketAuth } = require("./security/middleware/auth");

// load environment  vars
dotenv.config({ path: './config/config.env' });

//Connect to Database
connectDB();

const app = express();

//Body Parser
app.use(express.json({ limit: "5mb" }));

//Enable Cors
app.use(cors());

const server = require('http').Server(app);
const socketio = require('socket.io')(server);
const { Client } = require('./controllers/friends.js')

socketio
    .use(socketAuth)
    .on('connection', (client) => {
        console.log(`Socket connected: ${client.id}`)
        Client(socketio, client)
    })

const SOCKETIO_PORT = process.env.SOCKETIO_PORT || 5652;
server.listen(SOCKETIO_PORT, () =>
    console.log(`Socket.io Server running in ${process.env.NODE_ENV} mode on port ${SOCKETIO_PORT}`)
)