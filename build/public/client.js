const socket = io();
const params = new URLSearchParams(window.location.search)

var aud = document.getElementById("audio")
aud.volume = 0.8

$(document).ready(function() {
    $('#cross').hide();		
    $("#navbar").animate({ "top": "0" }, 2000);
   window.onbeforeunload = function () {
       window.scrollTo(0, 0);
   }

   $('#menu').on('click',function(){
        $('.chatPanel').animate({ "opacity": 1 }, 'fast');
        $('#menu').hide();	   
        $('#cross').show();
    });
    $('#cross').on('click',function(){
        $('.chatPanel').animate({ "opacity": 0 }, 'fast');
        $('#cross').hide();	   
        $('#menu').show();
    });
}); 
for(const control of document.querySelectorAll(".control")){
    control.addEventListener("click", function(){
        handleClick(this.getAttribute('id'))
    })
}

const handleClick = (controller)=>{
    move(controller)
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

socket.on('hPosition', position => {
    console.log('hidden treasure', position)
})

socket.on('greeting', greeting =>{
    if(greeting === 'spectator'){
        sendActivity('The room is full.')
        sendActivity('You will be a spectator.')
    }else{
        sendActivity('Your role is '+ greeting+'.')
    }  
})

socket.on('role', role => {
    document.getElementById("role").innerHTML = `You are a <span style="color:red">${role}</span>`
})

socket.on('score', score => {
    document.getElementById("scoreboard").innerHTML = `${score.player1}: ${score.player1Score} ${score.player2}: ${score.player2Score}`
})

socket.on('win', e => {
    sendActivity(e)
})

socket.on('foundTreasure', e =>{
    sendActivity(e)
})

socket.on('direction', direction => {
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

function sendActivity(message) {
    var item = document.createElement('li')
    item.className="mchat"
    item.style.color="rgb(139,236,108)"
    item.textContent = message
    document.getElementById('messages').appendChild(item)
    scrollChatWindow()
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
        if (messagesLength.length > 27) {
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
    console.log('your turn')
    const enterTURN = new Audio("musics/enterturn.mp3")
    enterTURN.play()
    var counter = 11;
    let pastXY,curXY;
    if(role == 'prisoner'){
        pastXY = document.querySelector(".ppresentXY").classList[2];
    }else{
        pastXY = document.querySelector(".wpresentXY").classList[2];
    }
    
    let arrayDir = [];
    console.log('start timer');
    var interval = setInterval(function(){
        if(role == 'prisoner'){
            curXY = document.querySelector(".ppresentXY").classList[2]; 
        }else{
            curXY = document.querySelector(".wpresentXY").classList[2]; 
        }
        counter--;
        document.getElementById('timer').innerHTML = counter
        if(pastXY != curXY) {
            clearInterval(interval);
            document.getElementById('timer').innerHTML = "--"
        }
        if (counter == 0 && (pastXY == curXY)){
            if (direction.right) arrayDir.push('right');
            if (direction.down) arrayDir.push('down');
            if (direction.up) arrayDir.push('up');
            if (direction.left) arrayDir.push('left');
            const randomDir = arrayDir[Math.floor(Math.random() * arrayDir.length)];
            move(randomDir)
            clearInterval(interval);
        }
        if(counter==0) {
            document.getElementById('timer').innerHTML = "--"
            clearInterval(interval);
        }
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
    console.log('prisoner position', position);
    const pastXY = document.querySelector(".ppresentXY");
    if(pastXY !== null){
        pastXY.innerHTML= '';
        pastXY.classList.remove('ppresentXY');
        const footStep = new Audio("musics/footstep.mp3")
        footStep.play()
    }
    const xy = document.querySelector("." + position);
    xy.classList.add('ppresentXY')
    xy.innerHTML='<img class="prisonerImg" src="images/prisoner.png">';
}


const setWposition = (position) =>{
    console.log('warden position', position);
    const pastXY = document.querySelector(".wpresentXY");
    if(pastXY !== null){
        pastXY.innerHTML= '';
        pastXY.classList.remove('wpresentXY');
        const footStep = new Audio("musics/footstep.mp3")
        footStep.play()
    }
    const xy = document.querySelector("." + position);
    xy.classList.add('wpresentXY')
    xy.innerHTML='<img class="wardenImg" src="images/warden.png">';
    console.log('warden position ', xy);
    setTimeout(function() {
        console.log('delay')
    }, 1000);
}

const setOpositions = (positions) =>{
    console.log('obstacles position', positions)
    positions.forEach(position =>{
        const xy = document.querySelector("." + position);
        xy.classList.add('obstacle')
        xy.innerHTML='<img class="obsatcleImg" src="images/obstacle.png">';
    })
}

const setTposition = (position) =>{
    console.log('tunnel position', position)
    const xy = document.querySelector("." + position);
    xy.classList.add('tunnel')
    xy.innerHTML='<img class="tunnelImg" src="images/tunnel.png">';
}

window.addEventListener('keydown', (e) => {
    var key = e.keyCode;
    if (key == 40 || key == 83) move('down')
    if (key == 38 || key == 87) move('up')
    if (key == 37 || key == 65) move('left')
    if (key == 39 || key == 68) move('right')
    if (key == 13) sendMessage()
    if (key == 27) console.log('escape')
}, true)

const move = (controller) => {
    socket.emit('movePosition',controller)
    document.getElementById('timer').innerHTML = "--"
}

const music = (e) => {
    const source = document.getElementById("musicsource")
    const audio = document.getElementById("audio")
    switch (e) {
        case 1: {
            source.setAttribute("src","./musics/music1.mp3")
            hide("music1")
            show("music2")
            show("music3")
            break
        }
        case 2: {
            source.setAttribute("src","./musics/music2.mp3")
            show("music1")
            hide("music2")
            show("music3")
            break
        }
        case 3: {
            source.setAttribute("src","./musics/music3.mp3")
            show("music1")
            show("music2")
            hide("music3")
            break
        }
    }
    audio.load()
    audio.play()

}
