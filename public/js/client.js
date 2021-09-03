const socket = io();

socket.emit('fromClient');

socket.on('pPosition', position =>{
    setPposition(position);
});

const setPposition = (position) =>{
    const pastXY = document.querySelector(".presentXY");
    if(!(pastXY === null)){
        pastXY.innerHTML= '';
        pastXY.classList.remove('presentXY');
    }
    const xy = document.querySelector("." + position);
    xy.classList.add('presentXY')
    xy.innerHTML='<img class="prisonerImg" src="../images/prisoner.png">';
    console.log(xy);
}