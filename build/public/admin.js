const socket = io();





socket.emit('admin')

socket.on('population', (users)=>{
    console.log(users)
    const players = users.filter(user => user.userRole != 'spectator')
    const div = document.createElement('div');
    const pop = document.querySelector('.population')
    pop.innerHTML = 
    `<h3>Online Users: ${users.length}</h3>
    <h3>Online Players: ${players.length}</h3>
    <h3>Spectators: ${users.length - players.length}</h3>`
})

socket.on('adminRoom', rooms =>{
    const roomsDiv = document.querySelector('.rooms')
    roomsDiv.innerHTML = ''
    for (const roomName in rooms){
        console.log(roomName)
        const div = document.createElement('div')
        div.className = roomName
        div.innerHTML = `
        <h2>Room Name: ${roomName}</h2>
        <button id="${"rs" + roomName}" class="rs">Reset Game</button>
        `
        roomsDiv.appendChild(div)
    }    
    for(const control of document.querySelectorAll(".rs")){
        control.addEventListener("click", function(){
            handleReset(this.getAttribute('id'))
        })
    }
})

function  handleReset(room) {
    room = room.split("rs")[1]
    console.log('reset game',room)
    socket.emit('adminResetGame', room)
}

