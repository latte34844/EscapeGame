import e from "cors";
import { isError } from "util";
import { User, Direction, Score, Room } from "./interface";

export class Game {
  users: User[];
  rooms: any;

  constructor() {
    this.rooms = {};
    this.users = [];
  }

  join(userName: string, id: string, room: string) {
    if (!this.rooms[room]) {
      this.rooms[room] = {};
    }

    const role = this.createRole(room);
    if (role === "spectator") {
      if (!this.rooms[room].spectators) {
        this.rooms[room].spectators = [];
      }
      this.rooms[room].spectators.push({
        userId: id,
      });
    } else {
      this.rooms[room][role] = {
        userId: id,
      };

      if (role === "prisoner") this.rooms[room].player1 = id;
      else this.rooms[room].player2 = id;
    }

    this.users.push({
      userName: userName,
      userId: id,
      userRole: role,
      userRoom: room,
      userPosition: "x6y6",
    });
    return role;
  }

  createRole(room: string) {
    let role = "";
    let random = Math.floor(Math.random() * 2);

    if (random === 0) {
      role = "prisoner";
    } else {
      role = "warden";
    }
    if (this.rooms[room][role] === "") {
      return role;
    }
    if (!this.rooms[room][role]) {
      return role;
    } else if (
      role === "prisoner" &&
      (!this.rooms[room]["warden"] || this.rooms[room]["warden"] === "")
    ) {
      return "warden";
    } else if (
      role === "warden" &&
      (!this.rooms[room]["prisoner"] || this.rooms[room]["prisoner"] === "")
    ) {
      return "prisoner";
    }
    return "spectator";
  }

  isRoomFull(room: string) {
    return this.rooms[room]["warden"] && this.rooms[room]["prisoner"];
  }

  createRoomObstacle(room: string) {
    var oPositions: string[] = [];
    var checker: boolean = true;
    var attempt: number = 1;
    while (true) {
      oPositions = [];

      while (oPositions.length < 5) {
        let x = Math.floor(Math.random() * 5) + 1;
        let y = Math.floor(Math.random() * 5) + 1;

        const oPosition = "x" + x.toString() + "y" + y.toString();
        if (!oPositions.find((o) => o === oPosition)) {
          oPositions.push(oPosition);
        }
      }
      this.rooms[room].obstacle = oPositions;
      
      if(!this.checkInvalidObstacle(room)){
        break;
      }
      attempt++;
    }
    this.rooms[room].notFree = [...oPositions];
    return oPositions;
  }

  checkInvalidObstacle(room: string) {
    //check if all obstacles are in same row or colums
    const oPositions: string[] = this.rooms[room].obstacle;

    const rows: string[] = [];
    const columns: string[] = [];

    for (let i = 0; i < 5; i++) {
      rows.push(oPositions[i].charAt(1));
      columns.push(oPositions[i].charAt(3));
    }
    const sameRows: boolean = rows.every((v) => v === rows[0]);
    const sameColumns: boolean = columns.every((v) => v === columns[0]);


    if (sameRows) return true;
    if (sameColumns) return true;

    //check if all obstcles are in same diagonal
    const diagonal_level2: string[][] = [
      ["x2y1", "x1y2"],
      ["x5y4", "x4y5"],
      ["x4y1", "x5y2"],
      ["x1y4", "x2y5"],
    ];
    const diagonal_level3: string[][] = [
      ["x3y1", "x2y2", "x1y3"],
      ["x5y3", "x4y4", "x3y5"],
      ["x3y1", "x4y2", "x5y3"],
      ["x1y3", "x2y4", "x3y5"],
    ];
    const diagonal_level4: string[][] = [
      ["x4y1", "x3y2", "x2y3", "x1y1"],
      ["x3y2", "x4y3", "x3y4", "x2y5"],
      ["x2y1", "x3y2", "x4y3", "x5y4"],
      ["x1y2", "x2y3", "x3y4", "x4y5"],
    ];
    const diagonal_level5: string[][] = [
      ["x5y1", "x4y2", "x3y3", "x2y4", "x1y5"],
      ["x1y1", "x2y2", "x3y3", "x4y4", "x5y5"],
    ];
    const diagonal: string[][] = [[]].concat(
      diagonal_level2,
      diagonal_level3,
      diagonal_level4,
      diagonal_level5
    );
    const sameDiagonal = diagonal.every((vals) =>
      vals.every((val) => oPositions.includes(val))
    );

    if (sameDiagonal) return true;

    return false;
  }

  createTunnel(room: string) {
    while (true) {
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 5) + 1;
      const tPosition = "x" + x.toString() + "y" + y.toString();

      if (!this.rooms[room].notFree.find((nf: string) => nf === tPosition)) {
        this.rooms[room].tunnel = tPosition;
        this.rooms[room].notFree.push(tPosition);
        return tPosition;
      }
    }
  }

  createHiddenTreasure(room: string) {
    this.rooms[room].foundHiddenTreasure = false;
    while (true) {
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 5) + 1;
      const hPosition = "x" + x.toString() + "y" + y.toString();

      if (!this.rooms[room].notFree.find((nf: string) => nf === hPosition)) {
        this.rooms[room].hiddenTreasure = hPosition;
        this.rooms[room].notFree.push(hPosition);
        return hPosition;
      }
    }
  }

  createUserPosition(user: User) {
    while (true) {
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 5) + 1;
      const userPosition = "x" + x.toString() + "y" + y.toString();

      if (
        !this.rooms[user.userRoom].notFree.find(
          (nf: string) => nf === userPosition
        )
      ) {
        user.userPosition = userPosition;
        return userPosition;
      }
    }
  }

  fetchUser(id: string) {
    let user = this.users.find((u: User) => u.userId === id);
    if (user === undefined) {
      throw new TypeError("Error On Fetcing User");
    }
    return user;
  }

  movePosition(user: User, controller: string) {
    let position = user.userPosition;
    let x = +position.split("")[1];
    let y = +position.split("")[3];
    let pastPosition = "x" + x.toString() + "y" + y.toString();
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
    let presentPosition = "x" + x.toString() + "y" + y.toString();
    if (this.isYourTurn && presentPosition != pastPosition) {
      this.rooms[user.userRoom].currentTurn++;
    }
    position = "x" + x.toString() + "y" + y.toString();
    user.userPosition = position;

    return position;
  }

  isYourTurn(user: User): boolean {
    let room = user.userRoom;
    let thisRoom = this.rooms[room];
    let turn = thisRoom.currentTurn;
    let lastWinner = thisRoom.lastWinner;
    if (user.userRole == "prisoner") {
      if (lastWinner == "prisoner") {
        if (turn % 2 == 1) {
          return true;
        } else {
          return false;
        }
      } else {
        if (turn % 2 == 1) {
          return false;
        } else {
          return true;
        }
      }
    }
    if (user.userRole == "warden") {
      if (lastWinner == "warden") {
        if (turn % 2 == 1) {
          return true;
        } else {
          return false;
        }
      } else {
        if (turn % 2 == 1) {
          return false;
        } else {
          return true;
        }
      }
    }
    return false;
  }

  getTurn(user1: User, user2: User) {
    if (this.isYourTurn(user1)) return user1.userName + "'s turn";
    return user2.userName + "'s turn";
  }

  checkSpecialTurn(room: string) {
    let currentTurn: number = this.rooms[room].currentTurn;
    // console.log("turn:", currentTurn);

    if (currentTurn === 20) return true;
    return false;
  }

  //move tunnel if proceed to turn 20th
  moveTunnel(room: string) {
    const oldTunnel: string = this.rooms[room].tunnel;
    
    while(true){
      this.removeTunnel(oldTunnel, room)
      this.createTunnel(room);
      
      if(oldTunnel !== this.rooms[room].tunnel){
        break;
      }
    }
    return this.rooms[room].tunnel;
  }
  removeTunnel(oldTunnel: string, room: string) {
    this.rooms[room].tunnel = undefined;

    let notFree: string[] = this.rooms[room].notFree;

    const index: number = notFree.indexOf(oldTunnel, 0);
    notFree.splice(index, 1);
  }

  isWarden(user: User) {
    return user.userRole === "warden";
  }

  isPrisoner(user: User) {
    return user.userRole === "prisoner";
  }

  //check that can move or not
  checkMove(user: User, direction: string): boolean {
    if (!this.isYourTurn(user)) return false;
    let position = user.userPosition;
    let room = user.userRoom;
    let x = +position.split("")[1];
    let y = +position.split("")[3];
    let pos: string;
    switch (direction) {
      case "up":
        pos = `x${x}y${y + 1}`;
        break;
      case "down":
        pos = `x${x}y${y - 1}`;
        break;
      case "left":
        pos = `x${x - 1}y${y}`;
        break;
      case "right":
        pos = `x${x + 1}y${y}`;
        break;
      default:
        pos = "";
    }
    let _x = +pos.split("")[1];
    let _y = +pos.split("")[3];
    if (_x <= 0 || _x > 5 || _y <= 0 || _y > 5) return false;
    if (this.isWarden(user) && pos === this.rooms[room].tunnel) return false;
    if (this.rooms[room].obstacle.includes(pos)) return false;
    if (pos === this.getWarden(room).userPosition) return false;
    return true;
  }

  getAvailableDirection(user: User): Direction {
    return {
      right: this.checkMove(user, "right"),
      up: this.checkMove(user, "up"),
      down: this.checkMove(user, "down"),
      left: this.checkMove(user, "left"),
    };
  }

  getWarden(room: string): User {
    return this.fetchUser(this.rooms[room].warden.userId);
  }
  getPrisoner(room: string): User {
    return this.fetchUser(this.rooms[room].prisoner.userId);
  }
  getSpectator(room: string) {
    return this.rooms[room].spectators;
  }
  getPlayer1Name(room: string): string {
    return this.fetchUser(this.rooms[room].player1).userName;
  }
  getPlayer2Name(room: string): string {
    return this.fetchUser(this.rooms[room].player2).userName;
  }

  setScore(room: string, player1Score: number, player2Score: number) {
    this.rooms[room].score = {
      player1: this.getPlayer1Name(room),
      player2: this.getPlayer2Name(room),
      player1Score: player1Score,
      player2Score: player2Score,
    };
  }

  setLastWinner(room: string, input: string) {
    this.rooms[room].lastWinner = input;
  }
  setTurn(room: string, input: number) {
    this.rooms[room].currentTurn = input;
  }
  getScore(room: string): Score {
    return this.rooms[room].score;
  }

  checkTunnel(user: User) {
    // check that prisoner arrive tunnel or not
    // assume user is prisoner
    return user.userPosition === this.rooms[user.userRoom].tunnel;
  }
  checkCatch(user: User) {
    // check that warden catch the prisoner or not
    // assume user is warden
    return user.userPosition === this.getPrisoner(user.userRoom).userPosition;
  }

  checkHiddenTreasure(user: User) {
    return (
      user.userPosition === this.rooms[user.userRoom].hiddenTreasure &&
      !this.rooms[user.userRoom].hasFoundTreasure
    );
  }

  foundTreasure(user: User) {
    this.rooms[user.userRoom].hasFoundTreasure = true;
    let room = user.userRoom;
    let currentScore = this.getScore(room);
    if (user.userId == this.rooms[room].player1) {
      this.setScore(
        room,
        ++currentScore.player1Score,
        currentScore.player2Score
      );
    } else {
      this.setScore(
        room,
        currentScore.player1Score,
        ++currentScore.player2Score
      );
    }
  }

  swapRole(room: string) {
    let temp1 = this.getWarden(room);
    let temp2 = this.getPrisoner(room);
    this.rooms[room].prisoner.userId = temp1.userId;
    temp1.userRole = "prisoner";
    this.rooms[room].warden.userId = temp2.userId;
    temp2.userRole = "warden";
  }

  init(room: string, prisoner: User, warden: User) {
    let oPositions = this.createRoomObstacle(room);
    let tPosition = this.createTunnel(room);
    let pPosition = prisoner.userPosition; //x6y6
    let wPosition = warden.userPosition;
    let hPosition = this.createHiddenTreasure(room);
    while (true) {
      pPosition = this.createUserPosition(prisoner); //x y
      wPosition = this.createUserPosition(warden); //x y
      if (pPosition != wPosition) {
        break;
      }
    }
    return { oPositions, tPosition, pPosition, wPosition, hPosition };
  }

  win(user: User) {
    let room = user.userRoom;
    let currentScore = this.getScore(room);
    this.rooms[room].currentTurn = 1;
    this.rooms[user.userRoom].hasFoundTreasure = false;
    if (user.userId == this.rooms[room].player1) {
      this.setScore(
        room,
        ++currentScore.player1Score,
        currentScore.player2Score
      );
    } else {
      this.setScore(
        room,
        currentScore.player1Score,
        ++currentScore.player2Score
      );
    }
    if (user.userRole == "prisoner") {
      this.setLastWinner(room, "prisoner");
    } else {
      this.setLastWinner(room, "warden");
    }
  }

  restartGame(room: string) {
    return this.init(room, this.getPrisoner(room), this.getWarden(room));
  }

  resetRole(room: string) {
    console.log("reset role");
    let temp1 = this.getWarden(room);
    let temp2 = this.getPrisoner(room);
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
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  checkDistant(user1: User, user2: User) {
    //if distant between warden and prisoner is less than 1 rerandom map
    let user1Position = user1.userPosition;
    let user2Position = user2.userPosition;

    let user1_x: number = +user1Position.split("")[1];
    let user1_y: number = +user1Position.split("")[3];
    let user2_x: number = +user2Position.split("")[1];
    let user2_y: number = +user2Position.split("")[3];

    const distant: number = user1_x - user2_x + (user1_y - user2_y);
    if (distant % 2) return true;
    return false;
  }

  deleteUser(userId: string) {
    let user = this.users.find((u: User) => u.userId === userId);
    if (!user) {
      // console.log("does not exist");
    } else {
      if (user.userRole != "spectator") {
        this.rooms[user.userRoom][user.userRole] = "";
      } else {
        this.rooms[user.userRoom].spectators = this.rooms[
          user.userRoom
        ].spectators.filter((usr) => usr.userId != userId);
      }
      this.users = this.users.filter((usr) => usr.userId != userId);
    }
  }
}
