const socket = io();
const params = new URLSearchParams(window.location.search)

for(const control of document.querySelectorAll(".control")){
    control.addEventListener("click", function(){
        handleClick(this.getAttribute('id'))
    })
}

const handleClick = (controller)=>{
    socket.emit('movePosition',controller)
    console.log(controller)
}

socket.emit('joinRoom' , params.get('user'),params.get('room'));


socket.on('pPosition', position =>{
    setPposition(position)
});

socket.on('wPosition', position =>{
    setWposition(position)
})
socket.on('oPositions', positions =>{
    setOpositions(positions)
})
socket.on('tPosition', position =>{
    setTposition(position)
})
socket.on('greeting', greeting =>{
    if(greeting === 'spectator'){
        alert('the room is full')
    }else{
        alert('Your role is '+ greeting)
        console.log('role:', greeting)
    }
    
})
socket.on('direction', direction => {
    console.log('recieve direction')
    if (direction.right) show('right');
    else hide('right');
    if (direction.down) show('down');
    else hide('down');
    if (direction.up) show('up');
    else hide('up');
    if (direction.left) show('left');
    else hide('left');
})

function hide(id) {
    document.getElementById(id).style.opacity = "0.5";
}

function show(id) {
    document.getElementById(id).style.opacity = "1";
}

const setPposition = (position) =>{
    const pastXY = document.querySelector(".ppresentXY");
    if(pastXY !== null){
        pastXY.innerHTML= '';
        pastXY.classList.remove('ppresentXY');
    }
    const xy = document.querySelector("." + position);
    xy.classList.add('ppresentXY')
    xy.innerHTML='<img class="prisonerImg" src="../images/prisoner.png">';
    console.log('prisoner position ', xy);
}

const setWposition = (position) =>{
    const pastXY = document.querySelector(".wpresentXY");
    if(pastXY !== null){
        pastXY.innerHTML= '';
        pastXY.classList.remove('wpresentXY');
    }
    const xy = document.querySelector("." + position);
    xy.classList.add('wpresentXY')
    xy.innerHTML='<img class="wardenImg" src="../images/warden.png">';
    console.log('warden position ', xy);
}

const setOpositions = (positions) =>{
    console.log(positions)
    positions.forEach(position =>{
        const xy = document.querySelector("." + position);
        xy.classList.add('obstacle')
        xy.innerHTML='<img class="obsatcleImg" src="../images/obstacle.png">';
        console.log('obstacle position ',xy);
    })
}

const setTposition = (position) =>{
    const xy = document.querySelector("." + position);
    xy.classList.add('tunnel')
    xy.innerHTML='<img class="tunnelImg" src="../images/tunnel.png">';
    console.log('tunnel position', xy);
}

window.addEventListener('keydown', (e) => {
    var key = e.keyCode;
    //down
    if (key == 40 || key == 83) console.log('down')
    //up 
    if (key == 38 || key == 87) console.log('up')
    //left
    if (key == 37 || key == 65) console.log('left')
    //right
    if (key == 39 || key == 68) console.log('right')
    //enter 
    if (key == 13) console.log('enter')
    //esc 
    if (key == 27) console.log('escape')
}, true)