
var array = [
	"a", "b", "c", "d", "e", "f", "g", "h", 
	"i", "j", "k", "l", "m", "n", "o", "p",
	"q", "r", "s", "t", "u", "v", "w", "x", 
	"y", "z", 
	"A", "B", "C", "D", "E", "F", "G", "H",
	"I", "J", "K", "L", "M", "N", "O", "P", 
	"Q", "R", "S", "T", "U", "V", "W", "X",
	"Y", "Z",
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
	"!", "@", "#", "$", "%", "^", "&", "*", 
	"(", ")", "_", "-", "+", "=", ":", ";",
	//"<", open bracket will cause html to hide the rest of the line
	">", ".", "?", "/", "|", "{", "[", "]", "}", 
	" ", "\\", "\'", "\"", "å", "ß", "Ø", "Ö", "Õ"
	];

var slider = 5;

function loop(data){
	var guess = [];
	for(var i = 0; i < data.msg.length; i++){
		//if guess letter at current element matches name at current 
		//element, push it on array and continue loop
		//otherwise, push on a random char
		if(data.msg[i] == data.in[i]){
			guess.push(data.msg[i]);
			continue;
		}
		else
			guess.push(array[Math.floor(Math.random() * array.length)]);
	}
	data.msg = guess.join('');
	postMessage(guess.join(''));

	var speed = slider * 10;
	console.log("slider " + slider);
	console.log("speed " + speed);
	setTimeout(function(){loop(data);}, speed);
}

self.addEventListener('message', function(e){
	switch(e.data.cmd){
		case 'initInput':{
			console.log(e.data.msg);
			loop(e.data);
			break;
		}
		case 'sliderInput':{
			slider = e.data.msg;
			console.log(e.data.msg);
			break;
		}
	}
}, false);
