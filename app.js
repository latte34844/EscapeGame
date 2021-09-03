
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res)=>{
    res.sendFile(__dirname+"/public/client.html")
});

io.on('connection', socket => {
    socket.on('fromClient', ()=>{
        console.log('Client Join');
        const position = randomPposition();
        io.emit('pPosition',position);
    })
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const randomPposition = () =>{
    let x = Math.floor(Math.random() * 5) +1;
    let y = Math.floor(Math.random() * 5) +1;
    return "x" + x.toString() + "y" + y.toString();
};