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
        //alert with chat box
        alert('the room is full')
    }else{
        //alert with chat box => wait for another player
        alert('Your role is '+ greeting)
        console.log('role:', greeting)
    }  
})

socket.on('role', role => {
    document.getElementById("role").innerHTML = `your role: ${role}`
})

socket.on('score', score => {
    document.getElementById("scoreboard").innerHTML = `${score.player1}: ${score.player1Score} ${score.player2}: ${score.player2Score}`
})

socket.on('win', e => {
    alert(e)
})

socket.on('direction', direction => {
    console.log('recieve direction')
    console.log(direction.right, direction.left, direction.up, direction.down)
    if (direction.right) show('right');
    else hide('right');
    if (direction.down) show('down');
    else hide('down');
    if (direction.up) show('up');
    else hide('up');
    if (direction.left) show('left');
    else hide('left');
})

const redOpacity = 0.2;
const incOpacity = 1;
function hide(id) {
    document.getElementById(id).disabled = true;
    document.getElementById(id).style.opacity = redOpacity;
}

function sendMessage() {
    var input = document.getElementById('input');
    if (input.value) {
        let message = {
            message: input.value,
            from: socket.id
        }
        socket.emit('message', message)
        addChat({
            message: input.value,
            from: "you"
        }, true)
    }
    input.value = ''
}

socket.on('chat', message => {
    addChat(message, false)
})

function addChat(message, mychat) {
    var item = document.createElement('li')
    if (mychat) {
        item.className="mchat";
    } else {
        item.className="chat";
    }
    item.textContent = message.from+": "+message.message
    document.getElementById('messages').appendChild(item)
    scrollChatWindow()
}

const scrollChatWindow = () => {
    $('#messages').animate({
        scrollTop: $('#messages li:last-child').position().top,
    }, 500);
    setTimeout(() => {
        let messagesLength = $('#messages li');
        if (messagesLength.length > 10) {
            messagesLength.eq(0).remove();
        }
    }, 500);
};

socket.on('clear', room => {
    const pXY = document.querySelector(".ppresentXY");
    if(pXY !== null){
        pXY.innerHTML= '';
        pXY.classList.remove('ppresentXY');
    }
    const wXY = document.querySelector(".wpresentXY");
    if(wXY !== null){
        wXY.innerHTML= '';
        wXY.classList.remove('wpresentXY');
    }
    const pastObstacles = document.querySelectorAll(".obstacle");
    console.log('pastobstacle', pastObstacles)
    if (pastObstacles !== null) {
        pastObstacles.forEach(pastObstacle => {
            pastObstacle.innerHTML = ''
            pastObstacle.classList.remove('obstacle')
        })
    }
    const tXY = document.querySelector(".tunnel");
    if(tXY !== null){
        tXY.innerHTML= '';
        tXY.classList.remove('tunnel');
    }
})

socket.on('yourTurn', (direction, role)=>{
    var counter = 11;
    let pastXY,curXY;
    if(role == 'prisoner'){
        pastXY = document.querySelector(".ppresentXY").classList[2];
        console.log('role is prisoner' + pastXY);
    }else{
        pastXY = document.querySelector(".wpresentXY").classList[2];
        console.log('role is warden' + pastXY);
    }
    
    let arrayDir = [];
    console.log('yourturn activated');
    var interval = setInterval(function(){
        console.log(counter);
        if(role == 'prisoner'){
            curXY = document.querySelector(".ppresentXY").classList[2]; 
            console.log('pastXY = '+ pastXY);
            console.log('curXY = '+ curXY);
        }else{
            curXY = document.querySelector(".wpresentXY").classList[2]; 
            console.log('pastXY = ' + pastXY);
            console.log('curXY = ' + curXY);
        }
        counter--;
        if(pastXY != curXY) clearInterval(interval);
        if (counter == 0 && (pastXY == curXY)){
            console.log('pastXY = ' + pastXY);
            console.log('curXY = ' + curXY);
            if (direction.right) arrayDir.push('right');
            if (direction.down) arrayDir.push('down');
            if (direction.up) arrayDir.push('up');
            if (direction.left) arrayDir.push('left');
            const randomDir = arrayDir[Math.floor(Math.random() * arrayDir.length)];
            console.log(randomDir + ' randomed');
            socket.emit('movePosition', randomDir);
            clearInterval(interval);
        }
        if(counter==0) clearInterval(interval);
    },1000)
})

socket.on('turn',(e)=>{
    document.getElementById('turn').innerHTML = e;
})
function show(id) {
    document.getElementById(id).disabled = false;
    document.getElementById(id).style.opacity = incOpacity;
}

const setPposition = (position) =>{
    const pastXY = document.querySelector(".ppresentXY");
    if(pastXY !== null){
        pastXY.innerHTML= '';
        pastXY.classList.remove('ppresentXY');
    }
    const xy = document.querySelector("." + position);
    xy.classList.add('ppresentXY')
    xy.innerHTML='<img class="prisonerImg" src="images/prisoner.png">';
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
    xy.innerHTML='<img class="wardenImg" src="images/warden.png">';
    console.log('warden position ', xy);
}

const setOpositions = (positions) =>{
    console.log(positions)
    positions.forEach(position =>{
        const xy = document.querySelector("." + position);
        xy.classList.add('obstacle')
        xy.innerHTML='<img class="obsatcleImg" src="images/obstacle.png">';
        console.log('obstacle position ',xy);
    })
}

const setTposition = (position) =>{
    const xy = document.querySelector("." + position);
    xy.classList.add('tunnel')
    xy.innerHTML='<img class="tunnelImg" src="images/tunnel.png">';
    console.log('tunnel position', xy);
}

window.addEventListener('keydown', (e) => {
    var key = e.keyCode;
    //down
    if (key == 40 || key == 83) socket.emit('movePosition','down')
    //up 
    if (key == 38 || key == 87) socket.emit('movePosition','up')
    //left
    if (key == 37 || key == 65) socket.emit('movePosition','left')
    //right
    if (key == 39 || key == 68) socket.emit('movePosition','right')
    //enter 
    if (key == 13) sendMessage()
    //esc 
    if (key == 27) console.log('escape')
}, true)