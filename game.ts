import {User, Room} from './interface'

export class Game {
    users: User[]
    rooms: any
    constructor(){
        this.rooms = []
        this.users = []
    }

    join(userName:string,id:string,room:string){
        if(!this.rooms[room]){
            this.rooms[room]= {}
            console.log('create new room')
        }
        if(this.rooms[room]['warden'] && this.rooms[room]['prisoner']){
            console.log(`the room ${room} is full`)
            return 'the room is full'
        }
        const role = this.createRole(room)
         this.rooms[room][role]={
             userId:id,
        }
        this.users.push({
            userName: userName,
            userId: id,
            userRole: role,
            userRoom: room, 
            userPosition: 'x0y0'
        })
        console.log('create user')
        return role
        
    }

    createRole(room:string){
        let role = ''
        let random = Math.floor( Math.random() * 2)
        if(random === 0){
            role = 'prisoner'
        }else{
            role = 'warden'
        }
        if(!this.rooms[room][role]){
            return role
        }else if(role === 'prisoner'){
            return 'warden'
        }else if(role === 'warden'){
            return 'prisoner'
        }
        return role
    }
    
    isRoomFull(room:string){
        return this.rooms[room]['warden'] && this.rooms[room]['prisoner']
    }

    createRoomObstacle(room:string){
        const oPositions:string[] = []
        while(oPositions.length < 5){
            let x = Math.floor(Math.random() * 5) +1
            let y = Math.floor(Math.random() * 5) +1
            const oPosition = "x" + x.toString() + "y" + y.toString()
            if(!oPositions.find(o => o === oPosition)){
                oPositions.push(oPosition)
            }
        }
        console.log('obstacles ',oPositions)
        this.rooms[room].obstacle = oPositions
        this.rooms[room].notFree = [...oPositions]
        return oPositions
    }

    createTunnel(room:string){
        while(true){
            let x = Math.floor(Math.random() * 5) +1
            let y = Math.floor(Math.random() * 5) +1
            const tPosition = "x" + x.toString() + "y" + y.toString()
            if(!this.rooms[room].notFree.find((nf:string) => nf === tPosition)){
                console.log('tunnel ',tPosition)
                this.rooms[room].tunnel= tPosition
                this.rooms[room].notFree.push(tPosition)
                return tPosition
            }
        }
        
    }
    createUserPosition(user:User){
        while(true){
            let x = Math.floor(Math.random() * 5) +1;
            let y = Math.floor(Math.random() * 5) +1;
            const userPosition = "x" + x.toString() + "y" + y.toString()
            if(!this.rooms[user.userRoom].notFree.find((nf:string) => nf === userPosition)){
                user.userPosition = userPosition
                console.log(this.users)
                return userPosition
            }
        }
    }

    fetchUser(id:string){
        let user = this.users.find((u:User) => u.userId === id)
        if(user === undefined){
            throw new TypeError('Error')
        }
        return user
    }

    movePosition(user:User,controller:string){
        let position = user.userPosition
        let x = +position.split('')[1]
        let y = +position.split('')[3]
        console.log(`Present positon, x: ${x}, y: ${y} will move ${controller}`)
        switch (controller){
            case "up":
                if (this.checkMove(user,controller)){
                    y = +y + 1
                }
                break
                
            case "down":
                if( this.checkMove(user,controller)){
                    y = +y - 1
                }
                break
            case "left":
                if(this.checkMove(user,controller)){
                x = +x - 1
                }
                break
            case "right":
                if(this.checkMove(user,controller)){
                x = +x + 1
                }
                break
        }
        position = "x" + x.toString() + "y" + y.toString()
        user.userPosition = position
        console.log(position)
        return position
    }

    isWarden(user: User){
        return user.userRole === "warden"
    }

    isPrisoner(user: User){
        return user.userRole === "prisoner"
    }

    //check that can move or not
    checkMove(user:User,direction: string) {
        let position = user.userPosition
        let room = user.userRoom
        let x = +position.split('')[1]
        let y = +position.split('')[3]
        let pos: string
        switch (direction){
            case "up":
                pos = `x${x}y${y+1}`  
                break 
            case "down":
                pos = `x${x}y${y-1}`  
                break
            case "left":
                pos = `x${x-1}y${y}`
                break
            case "right":
                pos = `x${x+1}y${y}`
                break
            default: pos=""
        }
        if (this.isWarden(user) && pos === this.rooms[room].tunnel) return false
        if (pos in this.rooms[room].notFree) return false 
        return true
        
    }
    //check that prisoner arrive tunnel or not
    checkTunnel(user:User){
        return user.userPosition === this.rooms[user.userRoom].tunnel
    
    }

    checkCatch(user:User){
      //check that warden catch prisoner or not  
    }
}
