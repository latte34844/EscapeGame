
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const Game = require('./game')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req,res)=>{
    res.sendFile(__dirname+"/public/login.html")
});

app.post('/client', (req,res)=>{
    res.redirect('/client' + '?user=' + req.body.username + '&room=' + req.body.room)
    console.log(req.body.username)
})

app.get('/client', (req,res)=>{
    res.sendFile(__dirname+"/public/client.html")
})

const game = new Game()
io.on('connection', socket => {
    socket.on('joinRoom', (user,room) =>{
        socket.join(room)
        console.log('Client Join');
        console.log(user)
        console.log(socket.id);
        console.log(room)
        const greeting = game.join(user,socket.id,room)

        socket.emit('greeting',greeting)
        if(game.isRoomFull(room)){
            const oPositions = game.createRoomObstacle(room)
            const tPosition = game.createTunnel(room)
            let pPosition = "x0y0"
            let wPosition = "x0y0"
            while(true){
                pPosition = game.createUserPosition(game.rooms[room].prisoner.userId);
                wPosition = game.createUserPosition(game.rooms[room].warden.userId);
                if(pPosition != wPosition){
                    break
                }
            }
            io.to(room).emit('pPosition',pPosition);
            io.to(room).emit('wPosition',wPosition);
            io.to(room).emit('tPosition',tPosition);
            io.to(room).emit('oPositions',oPositions);
        }        
    })

    socket.on('movePosition', controller =>{
        const user = game.fetchUser(socket.id)
        const position = game.movePosition(user.userId,controller)

    })
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
