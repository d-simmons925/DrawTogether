const hostForm = document.getElementById('hostForm')

var hostRoom = generateRoomId(6)
document.getElementById("hostRoom").setAttribute('value', hostRoom)
document.getElementById("roomLabel").innerHTML = hostRoom

//generate string of random characters for room id
function generateRoomId(length){
  var roomId = '';
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charsLength = chars.length;
  for (var i = 0; i < length; i++){
    roomId += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return roomId;
}