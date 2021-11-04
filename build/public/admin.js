$(document).ready(function() {
    $('#mask-img').hide();
    $("#admin").animate({ "top": 0 }, 2000);
    $('#mask-img').delay(3000).fadeTo('slow',1);
  }); 

const socket = io();

socket.emit('admin')

socket.on('population', (users)=>{
    const players = users.filter(user => user.userRole != 'spectator')
    const div = document.createElement('div');
    const pop = document.querySelector('.population')
    pop.innerHTML = 
    `<h3 style="font-size:25px;">Online Users: ${users.length}</h3>
    <h3 style="font-size:25px;">Online Players: ${players.length}</h3>
    <h3 style="font-size:25px;">Spectators: ${users.length - players.length}</h3>
    <h3 id='rooms' style="font-size:40px;">Current Rooms</h3>`
})
socket.on('adminRoom', rooms =>{
    
    const roomsDiv = document.querySelector('.rooms')
    roomsDiv.innerHTML = ''
   
    for (const roomName in rooms){
        const div = document.createElement('div')
        div.className = "allRooms"
        div.innerHTML = `
        <h2 style="font-size:25px;">Room Number: ${roomName}</h2>
        <button id="${"rs" + roomName}" class="rs" style="font-family: 'Games', sans-serif;">Reset Game</button>
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

