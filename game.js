
module.exports = class Game {
    constructor(){
        this.rooms = {}
        this.users = []
    }

    join(user,id,room){
        if(!this.rooms[room]){
            this.rooms[room]={}
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
            userId: id,
            userRole: role,
            userRoom: room 
        })
        console.log('create user')
        return role
        
    }

    createRole(room){
        let role
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
    }
    
    isRoomFull(room){
        return this.rooms[room]['warden'] && this.rooms[room]['prisoner']
    }

    createRoomObstacle(room){
        const oPositions = []
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

    createTunnel(room){
        while(true){
            let x = Math.floor(Math.random() * 5) +1
            let y = Math.floor(Math.random() * 5) +1
            const tPosition = "x" + x.toString() + "y" + y.toString()
            if(!this.rooms[room].notFree.find(nf => nf === tPosition)){
                console.log('tunnel ',tPosition)
                this.rooms[room].tunnel= tPosition
                this.rooms[room].notFree.push(tPosition)
                return tPosition
            }
        }
        
    }
    createUserPosition(id){
        while(true){
            let x = Math.floor(Math.random() * 5) +1;
            let y = Math.floor(Math.random() * 5) +1;
            const user = this.users.find(u => u.userId === id)
            const userPosition = "x" + x.toString() + "y" + y.toString()
            if(!this.rooms[user.userRoom].notFree.find(nf => nf === userPosition)){
                user.userPosition = userPosition
                console.log(this.users)
                return userPosition
            }
        }
    }

    fetchUser(id){
        const user = this.users.find(u => u.userId === id)
        return user
    }

    movePosition(id,controller){
        const user = this.fetchUser(id)
        let position = user.userPosition
        let x = +position.split('')[1]
        let y = +position.split('')[3]
        console.log(`Present positon, x: ${x}, y: ${y}`)
        if(user.userRole==='warden'){
            switch (direction){
                case "up":
                    y = +y + 1
                    break
                case "down":
                    y = +y - 1
                    break


            }
        }
        return position
    }
}