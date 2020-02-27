window.onload = () => {
  console.log("onload...");
  const buttonID = document.getElementById("btn");
  const rangeInput = document.getElementById("speedSlider");
  const speedDisplay = document.getElementById("speedDisplay");
  const input = document.getElementById("inputbox");
  rangeInput.value = 1;
  btn.addEventListener("click", btnToggle);
  rangeInput.addEventListener("change", updateSpeed);
  sessionStorage.clear();

  var worker;
  let useWorker = false;
  //trying to understand workers
  //create 'blob' to hold worker code
  //it calls back to script id inside the html
  var workerData = new Blob([document.getElementById("worker").textContent], {
    type: "application/javascript"
  });
  
  function btnToggle() {
    //button should disable when worker starts, and re-enable when worker finds the word
    if(useWorker == false){
      useWorker = true;
      initWorker();
      console.log("worker started...");
      buttonID.disabled = true;
    }
    /*
    if (typeof(worker) == "undefined") {
      useWorker = true;
      initWorker();
      console.log("worker started...");
    } else {
      useWorker = false;
      worker.postMessage({ cmd: "stop" });
      //worker.terminate(); //removed since worker terminates itself using self.close()
      worker = undefined; //reset worker
    }
    */
  }
  
  function initWorker() {
    var input = inputbox.value;
    
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
    
    if (typeof(Worker) !== "undefined") {
      console.log("Web workers supported.");
      if (typeof(worker) == "undefined"){
        worker = new Worker(window.URL.createObjectURL(workerData));
      }
      
      worker.onmessage = function(event) {
        document.getElementById("title").innerHTML = event.data;
        
        if (useWorker == true) {          
          console.log(event.data);
          document.getElementById("title2").innerHTML = event.data;
        } else if (useWorker == false) {
          document.getElementById("title2").innerHTML = event.data;
          console.log("last received num from worker: " + event.data);
          //if good, store
          if (typeof Storage !== "undefined") {
            console.log("Web storage available.");
            sessionStorage.setItem("lastNum", event.data);
          } else {
            console.log("Web storage unavailable.");
          }
        }
      };
    } else {
      document.getElementById("title1").innerHTML =
        "Sorry! No web worker support.";
    }
    worker.postMessage({
      cmd: "start",
      word: input,
      speed: rangeInput.value
    });
  }

  function updateSpeed() {
    switch(rangeInput.value){
      case '1':{
        speedDisplay.innerHTML = "<br>Speed: Fast!";
        break;
      }
      case '10':{
        speedDisplay.innerHTML = "<br>Speed: Slow...";
        break;
      }
      default:{
        speedDisplay.innerHTML = "<br>Speed: " + rangeInput.value;
        break;
      }
    }
    
    if(useWorker != false){
      worker.postMessage({cmd: "updateSpeed", speed: rangeInput.value});
      console.log("Slider = " + rangeInput.value);
    }
    
  }
};

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
