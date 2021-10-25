"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var http_1 = __importDefault(require("http"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var game_1 = require("./game");
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
var io = require('socket.io')(server);
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "../public/login.html"));
});
app.post('/client', function (req, res) {
    res.redirect('/client' + '?user=' + req.body.username + '&room=' + req.body.room);
    console.log(req.body.username);
});
app.get('/client', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "../public/client.html"));
});
var game = new game_1.Game();
io.on('connection', function (socket) {
    console.log("connect: " + socket.id);
    socket.on('joinRoom', function (userName, room) {
        socket.join(room);
        console.log("Client Join\nsocket: " + socket.id + "\nuser: " + userName + "\nroom: " + room);
        var greeting = game.join(userName, socket.id, room);
        socket.emit('greeting', greeting);
        if (game.isRoomFull(room)) {
            var prisoner = game.fetchUser(game.rooms[room].prisoner.userId);
            var warden = game.fetchUser(game.rooms[room].warden.userId);
            var pPosition = prisoner.userPosition; //x6y6
            var wPosition = warden.userPosition; //x6y6
            var oPositions = [];
            var tPosition = '';
            game.setScore(room, 0, 0);
            if (greeting != 'spectator') {
                oPositions = game.createRoomObstacle(room);
                tPosition = game.createTunnel(room);
                while (true) {
                    pPosition = game.createUserPosition(prisoner); //x y
                    wPosition = game.createUserPosition(warden); //x y
                    if (pPosition != wPosition) {
                        break;
                    }
                }
            }
            else {
                oPositions = game.rooms[room].obstacle;
                tPosition = game.rooms[room].tunnel;
                game.rooms[room].spectators.forEach(function (spectator) {
                    var user = game.fetchUser(spectator.userId);
                    //io to everyone, who join
                    io.to(user.userId).emit('direction', game.getAvailableDirection(user));
                });
                // io.to(room).emit('spectator',userName)
            }
            //io to p and w , there rolw
            //io to p and w, who join
            io.to(room).emit('score', game.getScore(room));
            io.to(room).emit('pPosition', pPosition);
            io.to(room).emit('wPosition', wPosition);
            io.to(room).emit('tPosition', tPosition);
            io.to(room).emit('oPositions', oPositions);
            io.to(prisoner.userId).emit('direction', game.getAvailableDirection(prisoner));
            io.to(warden.userId).emit('direction', game.getAvailableDirection(warden));
            console.log('send direction');
        }
    });
    socket.on('disconnect', function () {
        console.log('disconnect: ', socket.id);
    });
    socket.on('movePosition', function (controller) {
        var user = game.fetchUser(socket.id);
        var position = game.movePosition(user, controller);
        var room = user.userRoom;
        var checkWin = false;
        if (user.userRole === 'prisoner') {
            checkWin = game.checkTunnel(user);
            io.to(user.userRoom).emit('pPosition', position);
        }
        if (user.userRole === 'warden') {
            checkWin = game.checkCatch(user);
            io.to(user.userRoom).emit('wPosition', position);
        }
        io.to(user.userId).emit('direction', game.getAvailableDirection(user));
        if (checkWin) {
            (function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, oPositions, tPosition, pPosition, wPosition, prisoner, warden, spectators;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, game.delay(50)];
                        case 1:
                            _b.sent();
                            // TODO
                            // cut scene here
                            game.win(user);
                            io.to(room).emit('win', user.userName + " win the game as " + user.userRole);
                            io.to(room).emit('clear', "clear object");
                            _a = game.restartGame(room), oPositions = _a.oPositions, tPosition = _a.tPosition, pPosition = _a.pPosition, wPosition = _a.wPosition;
                            prisoner = game.getPrisoner(room);
                            warden = game.getWarden(room);
                            spectators = game.getSpectator(room);
                            io.to(room).emit('score', game.getScore(room));
                            io.to(room).emit('tPosition', tPosition);
                            io.to(room).emit('oPositions', oPositions);
                            io.to(room).emit('pPosition', pPosition);
                            io.to(room).emit('wPosition', wPosition);
                            io.to(prisoner.userId).emit('direction', game.getAvailableDirection(prisoner));
                            io.to(warden.userId).emit('direction', game.getAvailableDirection(warden));
                            if (spectators) {
                                game.rooms[room].spectators.forEach(function (spectator) {
                                    var _spectator = game.fetchUser(spectator.userId);
                                    io.to(_spectator.userId).emit('direction', game.getAvailableDirection(_spectator));
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            }); })();
        }
    });
    socket.on('reset', function () {
        var user = game.fetchUser(socket.id);
        console.log(game.rooms[user.userRoom]);
        io.to(user.userRoom).emit('clear', game.rooms[user.userRoom]);
    });
});
var PORT = process.env.PORT || 3000;
server.listen(PORT, function () { return console.log("Server running on port " + PORT); });
//# sourceMappingURL=app.js.map