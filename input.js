function initialize(){
	var w;
	initWebWorker();
	initSlider();
	clear();
}

function submitInput(){
	var input = document.getElementById("inputbox").value;
	
	if(input == "")
		input = "scramble / de-scramble";
	
	console.log(input);

	//todo: check for char legitimacy

	//if good, store
	if(typeof(Storage) !== "undefined"){
		console.log('Web storage available.');
		sessionStorage.setItem("in", input);
  }else{
    console.log('Web storage unavailable.');
  }

  //initWebWorker();
	if(typeof(w) == "undefined"){
		w = new Worker("scramble.js");
	}

	var scramble = [];
	for(var i = 0; i < input.length; i++){
		scramble.push("x");
	}

	w.postMessage({'cmd': 'initInput', 'msg': scramble.join(''), 'in': input});
}

function initWebWorker(){

	//check for worker support, start new if available
	if(typeof(Worker) !== "undefined"){
		console.log("Web worker support.");
		
		if(typeof(w) == "undefined"){
			w = new Worker("scramble.js");
		}
		else{
	  	console.log('No web worker support.');
		}
	}	

	//event listener for web worker
	w.addEventListener('message', function(e){
		//output
		document.getElementById('title').innerHTML = e.data;

		//check for correctness, if matched stop worker and clear data
		if(e.data == sessionStorage.getItem('in')){
			console.log("Input found. Stopping worker.");
			clear();
			w.terminate();
			w = undefined;
			initWebWorker();
		}
	}, false);
}

function initSlider(){
	//slider bar
	var slider = document.getElementById("speedSlider");
	var output = document.getElementById("speedDisplay");
	output.innerHTML = "<br>" + "Speed: " + slider.value;
	//w.postMessage({'cmd': 'sliderInput', 'msg': this.value});


	slider.oninput = function(){
		output.innerHTML = "<br>" + "Speed: " + this.value;
		if(w !== "undefined"){
			w.postMessage({'cmd': 'sliderInput', 'msg': this.value});
		}
	}
}

function clear(){
	document.getElementById("inputbox").value = "";
	sessionStorage.clear();
}
