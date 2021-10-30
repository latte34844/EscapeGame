
import path from 'path'
import http from 'http'
import express, {Request,Response} from 'express'
import socketIO from 'socket.io'
import bodyParser from 'body-parser'
import { Game } from './game'
import { Message } from './interface'

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req:Request,res:Response)=>{
    res.sendFile(path.join(__dirname,"../public/login.html"))
});

app.post('/client', (req:Request,res:Response)=>{
    res.redirect('/client' + '?user=' + req.body.username + '&room=' + req.body.room)
    console.log(req.body.username)
})

app.get('/client', (req:Request,res:Response)=>{
    res.sendFile(path.join(__dirname,"../public/client.html"))
})

app.get('/admin', (req:Request, res:Response)=>{
    res.sendFile(path.join(__dirname,"../public/admin.html"))
})

const game = new Game()
io.on('connection', (socket: socketIO.Socket) => {
    console.log("connect: " + socket.id)
    socket.on('joinRoom', (userName:string,room:string) =>{
        socket.join(room)
        console.log(`Client Join\nsocket: ${socket.id}\nuser: ${userName}\nroom: ${room}`);
        const greeting = game.join(userName,socket.id,room)
        socket.emit('greeting',greeting)
        io.emit('population' ,game.users)
        if(game.isRoomFull(room)){ 
            const prisoner = game.fetchUser(game.rooms[room].prisoner.userId)
            const warden = game.fetchUser(game.rooms[room].warden.userId)
            let pPosition = prisoner.userPosition //x6y6
            let wPosition = warden.userPosition //x6y6
            let oPositions:string[] = []
            let tPosition = ''
            game.setScore(room, 0,0)
            game.setLastWinner(room,'warden')
            game.setTurn(room, 1)
            
            if(greeting != 'spectator'){
                io.emit('adminRoom' ,game.rooms)
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
            io.to(room).emit('score', game.getScore(room))

            io.to(room).emit('pPosition',pPosition);
            io.to(room).emit('wPosition',wPosition);
            io.to(room).emit('tPosition',tPosition);
            io.to(room).emit('oPositions',oPositions);

            io.to(prisoner.userId).emit('role', prisoner.userRole)
            io.to(warden.userId).emit('role', warden.userRole)

            io.to(prisoner.userId).emit('direction', game.getAvailableDirection(prisoner))
            io.to(warden.userId).emit('direction', game.getAvailableDirection(warden))
            
            io.to(prisoner.userId).emit('turn', game.getTurn(prisoner,warden))
            io.to(warden.userId).emit('turn', game.getTurn(prisoner,warden))
            
            console.log('send direction')
        }       
    })

    socket.on('disconnect', () => {
        console.log('disconnect: ', socket.id)

        io.emit('population' ,game.users)
    })



    socket.on('movePosition', (controller:string) =>{

        const user = game.fetchUser(socket.id)

        if(!game.checkMove(user,controller)) {
            console.log('cant move');
            return;
        }
        const position = game.movePosition(user,controller)
        const room = user.userRoom

        let checkWin = false

        if(user.userRole === 'prisoner'){
            checkWin = game.checkTunnel(user)
            io.to(user.userRoom).emit('pPosition', position)
        }
        if(user.userRole === 'warden'){
            checkWin = game.checkCatch(user)
            io.to(user.userRoom).emit('wPosition', position)
        }

        let prisoner = game.getPrisoner(room)
        let warden = game.getWarden(room)

        io.to(prisoner.userId).emit('role', prisoner.userRole)
        io.to(warden.userId).emit('role', warden.userRole)

        io.to(prisoner.userId).emit('direction', game.getAvailableDirection(prisoner))
        io.to(warden.userId).emit('direction', game.getAvailableDirection(warden))
        
        io.to(prisoner.userId).emit('turn', game.getTurn(prisoner,warden))
        io.to(warden.userId).emit('turn', game.getTurn(prisoner,warden))

        if (checkWin) {

            (async () => { 

        
                await game.delay(50);

                // TODO
                // cut scene here

                console.log("win: "+user.userName)
                game.win(user)

                io.to(room).emit('win', `${user.userName} win the game as ${user.userRole}`)
                // io.to(room).emit('clear', "clear object")
                let {oPositions,tPosition, pPosition, wPosition} = game.restartGame(room)

                let spectators = game.getSpectator(room)

                io.to(room).emit('score', game.getScore(room))
                io.to(room).emit('clear', game.rooms[room])
                await game.delay(100);
                io.to(room).emit('oPositions',oPositions);
                io.to(room).emit('tPosition',tPosition);
                io.to(room).emit('pPosition',pPosition);
                io.to(room).emit('wPosition',wPosition);

                io.to(prisoner.userId).emit('role', prisoner.userRole)
                io.to(warden.userId).emit('role', warden.userRole)

                io.to(prisoner.userId).emit('direction', game.getAvailableDirection(prisoner))
                io.to(warden.userId).emit('direction', game.getAvailableDirection(warden))

                io.to(prisoner.userId).emit('turn', game.getTurn(prisoner,warden))
                io.to(warden.userId).emit('turn', game.getTurn(prisoner,warden))

                if (spectators) {
                    game.rooms[room].spectators.forEach((spectator:any) =>{
                        const _spectator = game.fetchUser(spectator.userId)
                        io.to(_spectator.userId).emit('direction', game.getAvailableDirection(_spectator))
                    })
                }

            })();
        }
    })
    socket.on('reset', () =>{
        const user = game.fetchUser(socket.id)
        console.log(game.rooms[user.userRoom])
        io.to(user.userRoom).emit('clear',game.rooms[user.userRoom])
    })
<<<<<<< HEAD

    socket.on('admin', ()=>{
        io.emit('population', game.users)
        io.emit('adminRoom', game.rooms)
    })

    socket.on('adminResetGame', room =>{
        (async () => { 

        
            await game.delay(50);

        game.resetRole(room)
        let {oPositions,tPosition, pPosition, wPosition} = game.restartGame(room)

                let prisoner = game.getPrisoner(room)
                let warden = game.getWarden(room)
                let spectators = game.getSpectator(room)

                io.to(room).emit('score', game.getScore(room))
                io.to(room).emit('clear', game.rooms[room])
                await game.delay(100);
                io.to(room).emit('oPositions',oPositions);
                io.to(room).emit('tPosition',tPosition);
                io.to(room).emit('pPosition',pPosition);
                io.to(room).emit('wPosition',wPosition);

                io.to(prisoner.userId).emit('role', prisoner.userRole)
                io.to(warden.userId).emit('role', warden.userRole)

                io.to(prisoner.userId).emit('direction', game.getAvailableDirection(prisoner))
                io.to(warden.userId).emit('direction', game.getAvailableDirection(warden))

                io.to(prisoner.userId).emit('turn', game.getTurn(prisoner,warden))
                io.to(warden.userId).emit('turn', game.getTurn(prisoner,warden))

                if (spectators) {
                    game.rooms[room].spectators.forEach((spectator:any) =>{
                        const _spectator = game.fetchUser(spectator.userId)
                        io.to(_spectator.userId).emit('direction', game.getAvailableDirection(_spectator))
                    })
                }
        })();        
=======
    socket.on('message', (message: Message)=> {
        let user = game.fetchUser(message.from)
        console.log('message',message.message, user.userName+'end')
        socket.to(user.userRoom).emit('chat', <Message>{
            message: message.message,
            from: user.userName
        })
>>>>>>> 10be353521bf988a1c85e36e1d699a82bad9d0c1
    })
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
