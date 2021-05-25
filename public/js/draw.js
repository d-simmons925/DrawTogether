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

const pickr = Pickr.create({
  el: '.color-picker',
  theme: 'nano', // or 'monolith', or 'classic'
  comparison: false,
  appClass: 'custom-class',

  // swatches: [
  //     'rgba(244, 67, 54, 1)',
  //     'rgba(233, 30, 99, 0.95)',
  //     'rgba(156, 39, 176, 0.9)',
  //     'rgba(103, 58, 183, 0.85)',
  //     'rgba(63, 81, 181, 0.8)',
  //     'rgba(33, 150, 243, 0.75)',
  //     'rgba(3, 169, 244, 0.7)',
  //     'rgba(0, 188, 212, 0.7)',
  //     'rgba(0, 150, 136, 0.75)',
  //     'rgba(76, 175, 80, 0.8)',
  //     'rgba(139, 195, 74, 0.85)',
  //     'rgba(205, 220, 57, 0.9)',
  //     'rgba(255, 235, 59, 0.95)',
  //     'rgba(255, 193, 7, 1)'
  // ],

  components: {

      // Main components
      preview: true,
      opacity: false,
      hue: true,

      // Input / output Options
      interaction: {
          hex: false,
          rgba: false,
          hsla: false,
          hsva: false,
          cmyk: false,
          input: false,
          cancel: true,
          clear: false,
          save: false
      }
  }
});

pickr.on('change', (...args) => {
	let color = args[0].toRGBA();
	pickedColor = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`
  pickr.default = color;
});

