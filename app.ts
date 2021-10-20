
import path from 'path'
import http, { Server } from 'http'
import express, {Request,Response} from 'express'
import socketIO from 'socket.io'
import bodyParser from 'body-parser'
import { Game } from './game'
import { createLogicalNot } from 'typescript'

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req:Request,res:Response)=>{
    res.sendFile(__dirname+ "/public/login.html")
});

app.post('/client', (req:Request,res:Response)=>{
    res.redirect('/client' + '?user=' + req.body.username + '&room=' + req.body.room)
    console.log(req.body.username)
})

app.get('/client', (req:Request,res:Response)=>{
    res.sendFile(__dirname+"/public/client.html")
})

const game = new Game()
io.on('connection', (socket: socketIO.Socket) => {
    console.log("connect: " + socket.id)
    socket.on('joinRoom', (userName:string,room:string) =>{
        socket.join(room)
        console.log(`Client Join\nsocket: ${socket.id}\nuser: ${userName}\nroom: ${room}`);
        const greeting = game.join(userName,socket.id,room)
        const user = game.fetchUser(socket.id)
        socket.emit('greeting',greeting)
        if(game.isRoomFull(room) && (user.userRole==='prisoner'|| user.userRole==='warden')){
            const prisoner = game.fetchUser(game.rooms[room].prisoner.userId)
            const warden = game.fetchUser(game.rooms[room].warden.userId)
            const oPositions = game.createRoomObstacle(room)
            const tPosition = game.createTunnel(room)
            let pPosition = "x0y0"
            let wPosition = "x0y0"
            while(true){
                pPosition = game.createUserPosition(prisoner);
                wPosition = game.createUserPosition(warden);
                if(pPosition != wPosition){
                    break
                }
            }
            io.to(room).emit('pPosition',pPosition);
            io.to(room).emit('wPosition',wPosition);
            io.to(room).emit('tPosition',tPosition);
            io.to(room).emit('oPositions',oPositions);
            io.to(prisoner.userId).emit('direction', game.getAvailableDirection(prisoner))
            io.to(warden.userId).emit('direction', game.getAvailableDirection(warden))
            console.log('send direction')
        }        
    })

    socket.on('disconnect', () => {
        console.log('disconnect: ', socket.id)
        console.log('hello latte')
    })

    socket.on('movePosition', (controller:string) =>{
        const user = game.fetchUser(socket.id)
        const position = game.movePosition(user,controller)
        if(user.userRole === 'prisoner'){
            // const checkWin = game.checkTunnel(user)
            io.to(user.userRoom).emit('pPosition', position)
        }
        if(user.userRole === 'warden'){
            // const checkWin = game.checkCatch(user)
            io.to(user.userRoom).emit('wPosition', position)
        }
        io.to(user.userId).emit('direction', game.getAvailableDirection(user))
    })
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
