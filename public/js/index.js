var hostForm = document.getElementById('hostForm')
var title = document.getElementById('title')
var titleArr = ['D','r','a','w',' ','T','o','g','e','t','h','e','r']
var roomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
var colorChars = 'ABCDEF0123456789'

for(i = 0;i < titleArr.length; i++){
  var span = document.createElement('span')
  span.innerHTML = titleArr[i]
  span.setAttribute('style', 'color: #'+generateRandomString(colorChars, 6)+
                    '; -webkit-text-stroke: 1px black;')
  title.appendChild(span)
}


var hostRoom = generateRandomString(roomChars, 6)
document.getElementById("hostRoom").setAttribute('value', hostRoom)
document.getElementById("roomLabel").innerHTML = hostRoom

//generate string of random characters for room id
function generateRandomString(chars, length){
  var roomId = '';
  var charsLength = chars.length;
  for (var i = 0; i < length; i++){
    roomId += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return roomId;
}