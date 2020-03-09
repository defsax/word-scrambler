window.onload = () => {
  var randChar = [
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
    //"<", //open bracket will cause html to hide the rest of the line
    ">", ".", ",", "?", "/", "|", "{", "[", "]", "}", 
    " ", "\\", "\'", "\"", "å", "ß", "Ø", "Ö", "Õ"
  ];
  
  var invalidChar = "";
  
  const buttonID = document.getElementById("btn");
  const rangeInput = document.getElementById("speedSlider");
  const speedDisplay = document.getElementById("speedDisplay");
  const inputForm = document.getElementById("inputbox");
  
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
      if(initWorker() == true){
        useWorker = true;
        document.getElementById("errorNotice").innerHTML = "";
      }
      else{
        document.getElementById("errorNotice").innerHTML = "Invalid char: " + invalidChar;
        console.log("initWorker returned false.");
      }
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
    
    //check for char legitimacy
    if(!checkInput(input)){
      console.log("checkInput returned false.");
      return false;
    }
    
    
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
      speed: rangeInput.value,
      randChars: randChar
    });
    return true;
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
  
  
  function checkInput(inputCharacters){
    let search;
    
    //check for invalid input. invalid if no index found in char array
    for(let i = 0; i < inputCharacters.length; i++){
      search = randChar.indexOf(inputCharacters[i]);
      console.log("Results: " + search);
      if(search == -1){
        console.log("Invalid char entered: " + inputCharacters[i]);
        invalidChar = inputCharacters[i];
        return false;
      }
    }
    invalidChar = "";
    return true;
  }
  
  function clear(){
    sessionStorage.clear();
    inputForm.value = "";
  }

  function initialize(){
    rangeInput.value = 1;
    speedDisplay.innerHTML = "<br>Speed: Fast!";
    btn.addEventListener("click", btnToggle);
    sessionStorage.clear();
    inputForm.value = "";
  }
};
