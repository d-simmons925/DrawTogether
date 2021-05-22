const socket = io();

var userId = ''
var paths = {}
var pickedSize = 10
var pickedColor = '#42445a'

socket.emit('new-user')

//track user paths by id
socket.on('connect', ()=>{
  userId = socket.id;
  console.log(socket.id)
})

//Get room and users
socket.on('roomUsers', ({room, users}) => {
  // console.log(room)
  console.log(users)
})

//draw other user paths
socket.on('startPath', (data, userId)=>{
	startPath(data.size, data.color, userId);
})

socket.on('continuePath', (data, userId)=>{
	continuePath(data.point, userId);
})

//mouse events
function onMouseDown(){
  startPath(pickedSize, pickedColor, userId)
  socket.emit('startPath', {size: pickedSize, color: pickedColor}, userId)
}

function onMouseDrag(event){
  continuePath(event.point, userId)
  socket.emit('continuePath', {point: [event.point.x, event.point.y]}, userId)
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