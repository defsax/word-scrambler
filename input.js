window.onload = () => {
  const buttonID = document.getElementById("btn");
  const rangeInput = document.getElementById("speedSlider");
  const speedDisplay = document.getElementById("speedDisplay");
  const input = document.getElementById("inputbox");
  
  initialize();

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
    }
    else{
     console.log("worker already running..."); 
    }
  }
  
  function initWorker() {
    var input = inputbox.value;
    
    //if go button is pressed when text field is blank...
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
      
      //on every postmessage from worker:
      worker.onmessage = function(event) {
        document.getElementById("title").innerHTML = event.data;
        console.log(event.data);
        
        //if posted word from worker = stored input, stop the worker and reset
        if(event.data == input){
          console.log("Input found. Stopping worker.");
          worker.postMessage({cmd: "stop"});
          worker = undefined;
          useWorker = false;
          clear();
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
  
  rangeInput.oninput = function(){
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
    console.log("rangeUpdated");
    
    if(useWorker != false){
      worker.postMessage({cmd: "updateSpeed", speed: rangeInput.value});
      console.log("Slider = " + rangeInput.value);
    }
  }
  
  function clear(){
    sessionStorage.clear();
    input.value = "";
  }

  function initialize(){
    rangeInput.value = 1;
    speedDisplay.innerHTML = "<br>Speed: Fast!";
    btn.addEventListener("click", btnToggle);
    sessionStorage.clear();
    input.value = "";
  }
};
