const socket = io();
const params = new URLSearchParams(window.location.search)

for(var i = 0; i < document.querySelectorAll(".control").length; i++){
    document.querySelectorAll(".control")[i].addEventListener("click", function(){
        handleClick(this.getAttribute('id'));
    });
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
    if(greeting === 'the room is full'){
        alert('the room is full')
    }else{
        alert('Your role is '+ greeting)
    }
    
})

const setPposition = (position) =>{
    const pastXY = document.querySelector(".ppresentXY");
    if(!(pastXY === null)){
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
    if(!(pastXY === null)){
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


