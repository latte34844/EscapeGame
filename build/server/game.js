"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var Game = /** @class */ (function () {
    function Game() {
        this.rooms = {};
        this.users = [];
    }
    Game.prototype.join = function (userName, id, room) {
        if (!this.rooms[room]) {
            this.rooms[room] = {};
            console.log('create new room');
        }
        var role = this.createRole(room);
        if (role === 'spectator') {
            if (!this.rooms[room].spectators) {
                this.rooms[room].spectators = [];
            }
            this.rooms[room].spectators.push({
                userId: id
            });
        }
        else {
            this.rooms[room][role] = {
                userId: id
            };
            if (role === 'prisoner')
                this.rooms[room].player1 = id;
            else
                this.rooms[room].player2 = id;
        }
        this.users.push({
            userName: userName,
            userId: id,
            userRole: role,
            userRoom: room,
            userPosition: 'x6y6'
        });
        console.log('create user');
        return role;
    };
    Game.prototype.createRole = function (room) {
        var role = '';
        var random = Math.floor(Math.random() * 2);
        if (random === 0) {
            role = 'prisoner';
        }
        else {
            role = 'warden';
        }
        if (!this.rooms[room][role]) {
            return role;
        }
        else if (role === 'prisoner' && !this.rooms[room]['warden']) {
            return 'warden';
        }
        else if (role === 'warden' && !this.rooms[room]['prisoner']) {
            return 'prisoner';
        }
        return 'spectator';
    };
    Game.prototype.isRoomFull = function (room) {
        return this.rooms[room]['warden'] && this.rooms[room]['prisoner'];
    };
    Game.prototype.createRoomObstacle = function (room) {
        var oPositions = [];
        var _loop_1 = function () {
            var x = Math.floor(Math.random() * 5) + 1;
            var y = Math.floor(Math.random() * 5) + 1;
            var oPosition = "x" + x.toString() + "y" + y.toString();
            if (!oPositions.find(function (o) { return o === oPosition; })) {
                oPositions.push(oPosition);
            }
        };
        while (oPositions.length < 5) {
            _loop_1();
        }
        console.log('obstacles ', oPositions);
        this.rooms[room].obstacle = oPositions;
        this.rooms[room].notFree = __spreadArray([], oPositions, true);
        return oPositions;
    };
    Game.prototype.createTunnel = function (room) {
        var _loop_2 = function () {
            var x = Math.floor(Math.random() * 5) + 1;
            var y = Math.floor(Math.random() * 5) + 1;
            var tPosition = "x" + x.toString() + "y" + y.toString();
            if (!this_1.rooms[room].notFree.find(function (nf) { return nf === tPosition; })) {
                console.log('tunnel ', tPosition);
                this_1.rooms[room].tunnel = tPosition;
                this_1.rooms[room].notFree.push(tPosition);
                return { value: tPosition };
            }
        };
        var this_1 = this;
        while (true) {
            var state_1 = _loop_2();
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    Game.prototype.createUserPosition = function (user) {
        var _loop_3 = function () {
            var x = Math.floor(Math.random() * 5) + 1;
            var y = Math.floor(Math.random() * 5) + 1;
            var userPosition = "x" + x.toString() + "y" + y.toString();
            if (!this_2.rooms[user.userRoom].notFree.find(function (nf) { return nf === userPosition; })) {
                user.userPosition = userPosition;
                console.log(this_2.users);
                return { value: userPosition };
            }
        };
        var this_2 = this;
        while (true) {
            var state_2 = _loop_3();
            if (typeof state_2 === "object")
                return state_2.value;
        }
    };
    Game.prototype.fetchUser = function (id) {
        var user = this.users.find(function (u) { return u.userId === id; });
        if (user === undefined) {
            throw new TypeError('Error On Fetcing User');
        }
        return user;
    };
    Game.prototype.movePosition = function (user, controller) {
        var position = user.userPosition;
        var x = +position.split('')[1];
        var y = +position.split('')[3];
        console.log("Present positon, x: " + x + ", y: " + y + " will move " + controller);
        switch (controller) {
            case "up":
                if (this.checkMove(user, controller)) {
                    y = +y + 1;
                }
                break;
            case "down":
                if (this.checkMove(user, controller)) {
                    y = +y - 1;
                }
                break;
            case "left":
                if (this.checkMove(user, controller)) {
                    x = +x - 1;
                }
                break;
            case "right":
                if (this.checkMove(user, controller)) {
                    x = +x + 1;
                }
                break;
        }
        position = "x" + x.toString() + "y" + y.toString();
        user.userPosition = position;
        console.log(position);
        return position;
    };
    Game.prototype.isWarden = function (user) {
        return user.userRole === "warden";
    };
    Game.prototype.isPrisoner = function (user) {
        return user.userRole === "prisoner";
    };
    //check that can move or not
    Game.prototype.checkMove = function (user, direction) {
        var position = user.userPosition;
        var room = user.userRoom;
        var x = +position.split('')[1];
        var y = +position.split('')[3];
        var pos;
        switch (direction) {
            case "up":
                pos = "x" + x + "y" + (y + 1);
                break;
            case "down":
                pos = "x" + x + "y" + (y - 1);
                break;
            case "left":
                pos = "x" + (x - 1) + "y" + y;
                break;
            case "right":
                pos = "x" + (x + 1) + "y" + y;
                break;
            default: pos = "";
        }
        var _x = +pos.split('')[1];
        var _y = +pos.split('')[3];
        if (_x <= 0 || _x > 5 || _y <= 0 || _y > 5)
            return false;
        if (this.isWarden(user) && pos === this.rooms[room].tunnel)
            return false;
        if (this.rooms[room].obstacle.includes(pos))
            return false;
        if (pos === this.getWarden(room).userPosition)
            return false;
        return true;
    };
    Game.prototype.getAvailableDirection = function (user) {
        return {
            right: this.checkMove(user, 'right'),
            up: this.checkMove(user, 'up'),
            down: this.checkMove(user, 'down'),
            left: this.checkMove(user, 'left')
        };
    };
    Game.prototype.getWarden = function (room) {
        return this.fetchUser(this.rooms[room].warden.userId);
    };
    Game.prototype.getPrisoner = function (room) {
        return this.fetchUser(this.rooms[room].prisoner.userId);
    };
    Game.prototype.getSpectator = function (room) {
        return this.rooms[room].spectators;
    };
    Game.prototype.getPlayer1Name = function (room) {
        return this.fetchUser(this.rooms[room].player1).userName;
    };
    Game.prototype.getPlayer2Name = function (room) {
        return this.fetchUser(this.rooms[room].player2).userName;
    };
    Game.prototype.setScore = function (room, player1Score, player2Score) {
        this.rooms[room].score = {
            player1: this.getPlayer1Name(room),
            player2: this.getPlayer2Name(room),
            player1Score: player1Score,
            player2Score: player2Score
        };
    };
    Game.prototype.getScore = function (room) {
        return this.rooms[room].score;
    };
    Game.prototype.checkTunnel = function (user) {
        // check that prisoner arrive tunnel or not
        // assume user is prisoner
        return user.userPosition === this.rooms[user.userRoom].tunnel;
    };
    Game.prototype.checkCatch = function (user) {
        // check that warden catch the prisoner or not
        // assume user is warden
        return user.userPosition === this.getPrisoner(user.userRoom).userPosition;
    };
    Game.prototype.init = function (room, prisoner, warden) {
        var oPositions = this.createRoomObstacle(room);
        var tPosition = this.createTunnel(room);
        var pPosition = prisoner.userPosition; //x6y6
        var wPosition = warden.userPosition;
        while (true) {
            pPosition = this.createUserPosition(prisoner); //x y
            wPosition = this.createUserPosition(warden); //x y
            if (pPosition != wPosition) {
                break;
            }
        }
        return { oPositions: oPositions, tPosition: tPosition, pPosition: pPosition, wPosition: wPosition };
    };
    Game.prototype.win = function (user) {
        var room = user.userRoom;
        var currentScore = this.getScore(room);
        if (user.userId == this.rooms[room].player1) {
            this.setScore(room, ++currentScore.player1Score, currentScore.player2Score);
        }
        else {
            this.setScore(room, currentScore.player1Score, ++currentScore.player2Score);
        }
    };
    Game.prototype.restartGame = function (room) {
        return this.init(room, this.getPrisoner(room), this.getWarden(room));
    };
    Game.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return Game;
}());
exports.Game = Game;
//# sourceMappingURL=game.js.map