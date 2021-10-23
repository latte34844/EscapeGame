
import path from 'path'
import http, { Server } from 'http'
import express, {Request,Response} from 'express'
import socketIO from 'socket.io'
import bodyParser from 'body-parser'
import { Game } from './game'
import { createLogicalNot } from 'typescript'
import { emit } from 'process'

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
        socket.emit('greeting',greeting)
        if(game.isRoomFull(room)){ 
            const prisoner = game.fetchUser(game.rooms[room].prisoner.userId)
            const warden = game.fetchUser(game.rooms[room].warden.userId)
            let pPosition = prisoner.userPosition //x6y6
            let wPosition = warden.userPosition //x6y6
            let oPositions:string[] = []
            let tPosition = ''
            if(greeting != 'spectator'){
                oPositions = game.createRoomObstacle(room)
                tPosition = game.createTunnel(room)
                while(true){
                    pPosition = game.createUserPosition(prisoner); //x y
                    wPosition = game.createUserPosition(warden); //x y
                    if(pPosition != wPosition){
                        break
                    }
                }
            }else{
                oPositions = game.rooms[room].obstacle
                tPosition = game.rooms[room].tunnel
                game.rooms[room].spectators.forEach((spectator:any) =>{
                    const user = game.fetchUser(spectator.userId)
                    //io to everyone, who join
                    io.to(user.userId).emit('direction', game.getAvailableDirection(user))
                })
                // io.to(room).emit('spectator',userName)
            }
            //io to p and w , there rolw
            //io to p and w, who join
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

    socket.on('reset', () =>{
        const user = game.fetchUser(socket.id)
        console.log(game.rooms[user.userRoom])
        io.to(user.userRoom).emit('clear',game.rooms[user.userRoom])
    })
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
