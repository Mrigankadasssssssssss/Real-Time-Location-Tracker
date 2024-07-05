const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket) {
    console.log('Client connected:', socket.id);

    socket.on("send-location", (data) => {
        console.log('Received location from client:', socket.id, data);

        if (data.lat !== undefined && data.lng !== undefined) {
            // Broadcast the location to all connected clients
            io.emit("received-location", { id: socket.id, ...data });
        } else {
            console.error('Invalid location data received from client:', socket.id, data);
        }
    });

    socket.on('disconnect', () => {
        io.emit('client-disconnected', socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(3000, () => {
    console.log('App is listening on port 3000...');
});
