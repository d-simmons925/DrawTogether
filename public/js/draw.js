const socket = io();

var cursor = document.querySelector('.cursor')
var colorPicker = document.getElementById('colorPicker')
var erase = document.getElementById('erase')
var canvas = document.getElementById('myCanvas')
var setSize = document.querySelectorAll('.size')
var userList = document.getElementById('users')
var roomCode = document.getElementById('roomCode')
roomCode.innerHTML = roomName

var userId = ''
var paths = {}
var pickedSize = 10
var pickedColor = colorPicker.value

//select path size
setSize.forEach((size)=>{
  size.addEventListener('click', ()=>{
    pickedSize = size.value
  })
})

//select path color
colorPicker.addEventListener('input', e =>{
  pickedColor = e.target.value;
})

//eraser tool onclick
erase.addEventListener('click', ()=>{
  pickedColor = '#EAEAEA'
})

//lets user switch back to previously selected color from eraser tool
colorPicker.addEventListener('click', e =>{
  pickedColor = e.target.value;
})

//custom cursor event
canvas.addEventListener('mousemove', e =>{
  cursor.setAttribute('style', 'top: '+(e.pageY - pickedSize/2)+
                      'px; left: '+(e.pageX - pickedSize/2)+
                      'px; visibility: visible; width: '+pickedSize+
                      'px; height: '+pickedSize+'px;')
})


//hide customer cursor when moving cursor off canvas
canvas.addEventListener('mouseleave', ()=>{
  cursor.setAttribute('style', 'visibility: hidden;')
})

//track user paths by id
socket.on('connect', ()=>{
  userId = socket.id;
  console.log(socket.id)
})

//Get room and users
socket.on('roomUsers', ({room, users}) => {
  userList.innerHTML = 
  `${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
})

//draw other user paths
socket.on('startPath', (data, userId)=>{
	startPath(data.size, data.color, userId);
})

socket.on('continuePath', (data, userId)=>{
	continuePath(data.point, userId);
})

socket.on('endPath', (data, userId)=>{
  endPath(data.point, data.color, data.size, userId)
})

//mouse events
function onMouseDown(){
  startPath(pickedSize, pickedColor, userId)
  socket.emit('startPath', {size: pickedSize, color: pickedColor}, userId)
}

function onMouseDrag(e){
  continuePath(e.point, userId)
  socket.emit('continuePath', {point: [e.point.x, e.point.y]}, userId)
}

function onMouseUp(e){
  endPath(e.point, pickedColor, pickedSize, userId)
  socket.emit('endPath', {point: [e.point.x, e.point.y], color: pickedColor, size: pickedSize},userId)
}

//draw functions
function startPath(size, color, userId){
  paths[userId] = new Path()
  paths[userId].strokeColor = color
  paths[userId].strokeWidth = size
  paths[userId].strokeCap = 'round'
}

function continuePath(point, userId){
  var path = paths[userId]
  path.add(point)
  path.smooth()
}

function endPath(point, color, size, userId){
  paths[userId] = new Path.Circle({
    center: point,
    radius: size/2,
    strokeColor: color,
    fillColor: color
  })
}

function changeColor(event){
  pickedColor = event.target.value
}