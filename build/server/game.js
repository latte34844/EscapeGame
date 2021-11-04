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
        }
        var role = this.createRole(room);
        if (role === "spectator") {
            if (!this.rooms[room].spectators) {
                this.rooms[room].spectators = [];
            }
            this.rooms[room].spectators.push({
                userId: id,
            });
        }
        else {
            this.rooms[room][role] = {
                userId: id,
            };
            if (role === "prisoner")
                this.rooms[room].player1 = id;
            else
                this.rooms[room].player2 = id;
        }
        this.users.push({
            userName: userName,
            userId: id,
            userRole: role,
            userRoom: room,
            userPosition: "x6y6",
        });
        return role;
    };
    Game.prototype.createRole = function (room) {
        var role = "";
        var random = Math.floor(Math.random() * 2);
        if (random === 0) {
            role = "prisoner";
        }
        else {
            role = "warden";
        }
        if (this.rooms[room][role] === "") {
            return role;
        }
        if (!this.rooms[room][role]) {
            return role;
        }
        else if (role === "prisoner" &&
            (!this.rooms[room]["warden"] || this.rooms[room]["warden"] === "")) {
            return "warden";
        }
        else if (role === "warden" &&
            (!this.rooms[room]["prisoner"] || this.rooms[room]["prisoner"] === "")) {
            return "prisoner";
        }
        return "spectator";
    };
    Game.prototype.isRoomFull = function (room) {
        return this.rooms[room]["warden"] && this.rooms[room]["prisoner"];
    };
    Game.prototype.createRoomObstacle = function (room) {
        var oPositions = [];
        var checker = true;
        var attempt = 1;
        while (true) {
            oPositions = [];
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
            this.rooms[room].obstacle = oPositions;
            if (!this.checkInvalidObstacle(room)) {
                break;
            }
            attempt++;
        }
        this.rooms[room].notFree = __spreadArray([], oPositions, true);
        return oPositions;
    };
    Game.prototype.checkInvalidObstacle = function (room) {
        //check if all obstacles are in same row or colums
        var oPositions = this.rooms[room].obstacle;
        var rows = [];
        var columns = [];
        for (var i = 0; i < 5; i++) {
            rows.push(oPositions[i].charAt(1));
            columns.push(oPositions[i].charAt(3));
        }
        var sameRows = rows.every(function (v) { return v === rows[0]; });
        var sameColumns = columns.every(function (v) { return v === columns[0]; });
        if (sameRows)
            return true;
        if (sameColumns)
            return true;
        //check if all obstcles are in same diagonal
        var diagonal_level2 = [
            ["x2y1", "x1y2"],
            ["x5y4", "x4y5"],
            ["x4y1", "x5y2"],
            ["x1y4", "x2y5"],
        ];
        var diagonal_level3 = [
            ["x3y1", "x2y2", "x1y3"],
            ["x5y3", "x4y4", "x3y5"],
            ["x3y1", "x4y2", "x5y3"],
            ["x1y3", "x2y4", "x3y5"],
        ];
        var diagonal_level4 = [
            ["x4y1", "x3y2", "x2y3", "x1y1"],
            ["x3y2", "x4y3", "x3y4", "x2y5"],
            ["x2y1", "x3y2", "x4y3", "x5y4"],
            ["x1y2", "x2y3", "x3y4", "x4y5"],
        ];
        var diagonal_level5 = [
            ["x5y1", "x4y2", "x3y3", "x2y4", "x1y5"],
            ["x1y1", "x2y2", "x3y3", "x4y4", "x5y5"],
        ];
        var diagonal = [[]].concat(diagonal_level2, diagonal_level3, diagonal_level4, diagonal_level5);
        var sameDiagonal = diagonal.every(function (vals) {
            return vals.every(function (val) { return oPositions.includes(val); });
        });
        if (sameDiagonal)
            return true;
        return false;
    };
    Game.prototype.createTunnel = function (room) {
        var _loop_2 = function () {
            var x = Math.floor(Math.random() * 5) + 1;
            var y = Math.floor(Math.random() * 5) + 1;
            var tPosition = "x" + x.toString() + "y" + y.toString();
            if (!this_1.rooms[room].notFree.find(function (nf) { return nf === tPosition; })) {
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
    Game.prototype.createHiddenTreasure = function (room) {
        this.rooms[room].foundHiddenTreasure = false;
        var _loop_3 = function () {
            var x = Math.floor(Math.random() * 5) + 1;
            var y = Math.floor(Math.random() * 5) + 1;
            var hPosition = "x" + x.toString() + "y" + y.toString();
            if (!this_2.rooms[room].notFree.find(function (nf) { return nf === hPosition; })) {
                this_2.rooms[room].hiddenTreasure = hPosition;
                this_2.rooms[room].notFree.push(hPosition);
                return { value: hPosition };
            }
        };
        var this_2 = this;
        while (true) {
            var state_2 = _loop_3();
            if (typeof state_2 === "object")
                return state_2.value;
        }
    };
    Game.prototype.createUserPosition = function (user) {
        var _loop_4 = function () {
            var x = Math.floor(Math.random() * 5) + 1;
            var y = Math.floor(Math.random() * 5) + 1;
            var userPosition = "x" + x.toString() + "y" + y.toString();
            if (!this_3.rooms[user.userRoom].notFree.find(function (nf) { return nf === userPosition; })) {
                user.userPosition = userPosition;
                return { value: userPosition };
            }
        };
        var this_3 = this;
        while (true) {
            var state_3 = _loop_4();
            if (typeof state_3 === "object")
                return state_3.value;
        }
    };
    Game.prototype.fetchUser = function (id) {
        var user = this.users.find(function (u) { return u.userId === id; });
        if (user === undefined) {
            throw new TypeError("Error On Fetcing User");
        }
        return user;
    };
    Game.prototype.movePosition = function (user, controller) {
        var position = user.userPosition;
        var x = +position.split("")[1];
        var y = +position.split("")[3];
        var pastPosition = "x" + x.toString() + "y" + y.toString();
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
        var presentPosition = "x" + x.toString() + "y" + y.toString();
        if (this.isYourTurn && presentPosition != pastPosition) {
            this.rooms[user.userRoom].currentTurn++;
        }
        position = "x" + x.toString() + "y" + y.toString();
        user.userPosition = position;
        return position;
    };
    Game.prototype.isYourTurn = function (user) {
        var room = user.userRoom;
        var thisRoom = this.rooms[room];
        var turn = thisRoom.currentTurn;
        var lastWinner = thisRoom.lastWinner;
        if (user.userRole == "prisoner") {
            if (lastWinner == "prisoner") {
                if (turn % 2 == 1) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (turn % 2 == 1) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
        if (user.userRole == "warden") {
            if (lastWinner == "warden") {
                if (turn % 2 == 1) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (turn % 2 == 1) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
        return false;
    };
    Game.prototype.getTurn = function (user1, user2) {
        if (this.isYourTurn(user1))
            return user1.userName + "'s turn";
        return user2.userName + "'s turn";
    };
    Game.prototype.checkSpecialTurn = function (room) {
        var currentTurn = this.rooms[room].currentTurn;
        // console.log("turn:", currentTurn);
        if (currentTurn === 20)
            return true;
        return false;
    };
    //move tunnel if proceed to turn 20th
    Game.prototype.moveTunnel = function (room) {
        var oldTunnel = this.rooms[room].tunnel;
        while (true) {
            this.removeTunnel(oldTunnel, room);
            this.createTunnel(room);
            var wPosition = this.rooms[room].warden;
            var pPosition = this.rooms[room].prisoner;
            var tPosition = this.rooms[room].tunnel;
            if (tPosition !== oldTunnel && tPosition !== wPosition && tPosition !== pPosition) {
                break;
            }
        }
        return this.rooms[room].tunnel;
    };
    Game.prototype.removeTunnel = function (oldTunnel, room) {
        this.rooms[room].tunnel = undefined;
        var notFree = this.rooms[room].notFree;
        var index = notFree.indexOf(oldTunnel, 0);
        notFree.splice(index, 1);
    };
    Game.prototype.isWarden = function (user) {
        return user.userRole === "warden";
    };
    Game.prototype.isPrisoner = function (user) {
        return user.userRole === "prisoner";
    };
    //check that can move or not
    Game.prototype.checkMove = function (user, direction) {
        if (!this.isYourTurn(user))
            return false;
        var position = user.userPosition;
        var room = user.userRoom;
        var x = +position.split("")[1];
        var y = +position.split("")[3];
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
            default:
                pos = "";
        }
        var _x = +pos.split("")[1];
        var _y = +pos.split("")[3];
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
            right: this.checkMove(user, "right"),
            up: this.checkMove(user, "up"),
            down: this.checkMove(user, "down"),
            left: this.checkMove(user, "left"),
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
            player2Score: player2Score,
        };
    };
    Game.prototype.setLastWinner = function (room, input) {
        this.rooms[room].lastWinner = input;
    };
    Game.prototype.setTurn = function (room, input) {
        this.rooms[room].currentTurn = input;
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
    Game.prototype.checkHiddenTreasure = function (user) {
        return (user.userPosition === this.rooms[user.userRoom].hiddenTreasure &&
            !this.rooms[user.userRoom].hasFoundTreasure);
    };
    Game.prototype.foundTreasure = function (user) {
        this.rooms[user.userRoom].hasFoundTreasure = true;
        var room = user.userRoom;
        var currentScore = this.getScore(room);
        if (user.userId == this.rooms[room].player1) {
            this.setScore(room, ++currentScore.player1Score, currentScore.player2Score);
        }
        else {
            this.setScore(room, currentScore.player1Score, ++currentScore.player2Score);
        }
    };
    Game.prototype.swapRole = function (room) {
        var temp1 = this.getWarden(room);
        var temp2 = this.getPrisoner(room);
        this.rooms[room].prisoner.userId = temp1.userId;
        temp1.userRole = "prisoner";
        this.rooms[room].warden.userId = temp2.userId;
        temp2.userRole = "warden";
    };
    Game.prototype.init = function (room, prisoner, warden) {
        var oPositions = this.createRoomObstacle(room);
        var tPosition = this.createTunnel(room);
        var pPosition = prisoner.userPosition; //x6y6
        var wPosition = warden.userPosition;
        var hPosition = this.createHiddenTreasure(room);
        while (true) {
            pPosition = this.createUserPosition(prisoner); //x y
            wPosition = this.createUserPosition(warden); //x y
            if (pPosition != wPosition) {
                break;
            }
        }
        return { oPositions: oPositions, tPosition: tPosition, pPosition: pPosition, wPosition: wPosition, hPosition: hPosition };
    };
    Game.prototype.win = function (user) {
        var room = user.userRoom;
        var currentScore = this.getScore(room);
        this.rooms[room].currentTurn = 1;
        this.rooms[user.userRoom].hasFoundTreasure = false;
        if (user.userId == this.rooms[room].player1) {
            this.setScore(room, ++currentScore.player1Score, currentScore.player2Score);
        }
        else {
            this.setScore(room, currentScore.player1Score, ++currentScore.player2Score);
        }
        if (user.userRole == "prisoner") {
            this.setLastWinner(room, "prisoner");
        }
        else {
            this.setLastWinner(room, "warden");
        }
    };
    Game.prototype.restartGame = function (room) {
        return this.init(room, this.getPrisoner(room), this.getWarden(room));
    };
    Game.prototype.resetRole = function (room) {
        console.log("reset role");
        var temp1 = this.getWarden(room);
        var temp2 = this.getPrisoner(room);
        this.rooms[room].prisoner = "";
        this.rooms[room].warden = "";
        temp1.userRole = this.createRole(room);
        this.rooms[room][temp1.userRole] = {
            userId: temp1.userId,
        };
        temp2.userRole = this.createRole(room);
        this.rooms[room][temp2.userRole] = {
            userId: temp2.userId,
        };
    };
    Game.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    Game.prototype.checkDistant = function (user1, user2) {
        //if distant between warden and prisoner is less than 1 rerandom map
        var user1Position = user1.userPosition;
        var user2Position = user2.userPosition;
        var user1_x = +user1Position.split("")[1];
        var user1_y = +user1Position.split("")[3];
        var user2_x = +user2Position.split("")[1];
        var user2_y = +user2Position.split("")[3];
        var distant = user1_x - user2_x + (user1_y - user2_y);
        if (distant % 2)
            return true;
        return false;
    };
    Game.prototype.deleteUser = function (userId) {
        var user = this.users.find(function (u) { return u.userId === userId; });
        if (!user) {
            // console.log("does not exist");
        }
        else {
            if (user.userRole != "spectator") {
                this.rooms[user.userRoom][user.userRole] = "";
            }
            else {
                this.rooms[user.userRoom].spectators = this.rooms[user.userRoom].spectators.filter(function (usr) { return usr.userId != userId; });
            }
            this.users = this.users.filter(function (usr) { return usr.userId != userId; });
        }
    };
    return Game;
}());
exports.Game = Game;
//# sourceMappingURL=game.js.map