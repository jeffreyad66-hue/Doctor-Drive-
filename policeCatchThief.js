/* ===============================
   POLICE CATCH THIEF MODE
================================ */

const policeCanvas = document.getElementById("policeCanvas");
const pcCtx = policeCanvas.getContext("2d");

//images
const policeImg = new Image();
policeImg.src = "assets/police car.png";

const thiefImg = new Image();
thiefImg.src = "assets/thief.png";

const policeRoadImg = new Image();
policeRoadImg.src = "assets/road.png";

const roadblockImg = new Image();
roadblockImg.src = "assets/roadblock.png";

let policeActive = false;
let policePaused = false;
let policeEnded = false;
let policeSpeed = 0;
let policeRoadY = 0;
let roadblocks = [];
let roadblockTimer = 0;
let roadblockDelay = 120;
let policeMaxSpeed = 10;
let thiefSpeed = 6;
let thiefBoostTimer = 0;
let policeCrashed = false;
let crashTimer = 0;
let thiefDistance = 100;
let maxEscapeDistance = 3000;
let policeLightTimer = 0;


const PC_LANES = [70,170,270];

const policeCar = {
    x:170,
    y:320,
    width:60,
    height:100,
    lane:1,
    speed:5
};

const thiefCar = {
    x:170,
    y:120,
    width:60,
    height:100,
    lane:1,
    speed:4,
    laneTimer:0
};

const pcKeys = {
    left: false,
    right: false,
    up: false,
    down: false,
};

const policeSiren = new Audio("assets/police_siren.mp3");
policeSiren.loop = true;
policeSiren.volume = 0.5;

function spawnRoadblock(){

let lane = Math.floor(Math.random()*3);

roadblocks.push({

lane:lane,
x:PC_LANES[lane],
y:-80,
width:60,
height:60,
speed:6

});

}


function updateRoadblocks(){

roadblockTimer++;

if(roadblockTimer > roadblockDelay){

spawnRoadblock();
roadblockTimer = 0;

}

roadblocks.forEach((rb,i)=>{

rb.y += policeSpeed;

if(rb.y > 650){

roadblocks.splice(i,1);

}

});

}


function drawRoadblocks(){

roadblocks.forEach(rb=>{

pcCtx.drawImage(
roadblockImg,
rb.x,
rb.y,
rb.width,
rb.height
);

});

}

function checkRoadblockCollision(){

roadblocks.forEach(rb=>{

if (isColliding(policeCar,rb) && ! policeCrashed) {
    playSound(sounds.effects.crash); // ✅ ADD THIS
    policeCrashed = true;
    crashTimer = 60;
    policeSpeed = 0;
}

});

}

function drawPoliceRoad() {
    pcCtx.drawImage(policeRoadImg,0,policeRoadY,400,600);
    pcCtx.drawImage(policeRoadImg,0,policeRoadY-600,400,600);
}

function togglePolicePause(){

    policePaused = !policePaused;

    const pauseMenu = document.getElementById("policePauseMenu");

    if(policePaused){

    pauseMenu.classList.remove("hidden");

    policeSiren.pause();

    }else{

    pauseMenu.classList.add("hidden");

    policeSiren.play().catch(()=>{});

    }

}

function resumePoliceGame(){

    policePaused = false;

    document.getElementById("policePauseMenu").classList.add("hidden");

    policeSiren.play().catch(()=>{});

}



function startPoliceCatchThief(){
    stopAllMusic();

    sounds.music.police.loop = true;
    sounds.music.police.volume = 0.8;
    sounds.music.police.play().catch(()=>{});

    document.getElementById("policeResult").classList.add("hidden");
   
    document.getElementById("policePauseMenu").classList.add("hidden");


policeActive = false;
policeEnded = false;
policePaused = false;
thiefDistance = 120;
policeSpeed = 0;
policeRoadY = 0;
policeCrashed = false;
crashTimer = 0;
roadblocks = [];
roadblockTimer = 0;
thiefDistance = 120;
thiefBoostTimer = 0;

policeCar.lane = 1;
policeCar.x = PC_LANES[1];
policeCar.y = 320;

thiefCar.lane = 1;
thiefCar.x = PC_LANES[1];
thiefCar.y = 120;

 currentMode = "police";

document.getElementById("policeScreen").classList.remove("hidden");
menuScreen.classList.add("hidden");



startPoliceCountdown();

}



function startPoliceCountdown(){

    playCountdownBeep();
const cd = document.getElementById("policeCountdown");

let count = 3;

cd.textContent = count;
cd.classList.remove("hidden");

const timer = setInterval(()=>{

count--;

if(count > 0){

cd.textContent = count;

}else{

cd.textContent = "GO!";

clearInterval(timer);

setTimeout(()=>{

cd.classList.add("hidden");

startPoliceGame();

},700);

}

},1000);

}



function startPoliceGame(){

policeActive = true;

// reset siren
policeSiren.pause();
policeSiren.currentTime = 0;

policeSiren.play().catch(()=>{});

document.getElementById("policeControls").classList.remove("hidden");

requestAnimationFrame(policeLoop);
}


function updateThief(){

thiefCar.laneTimer++;
thiefCar.y -= (thiefSpeed - policeSpeed) * 0.4;

if(thiefCar.laneTimer > 100){

thiefCar.laneTimer = 0;

let newLane = Math.floor(Math.random()*3);

thiefCar.lane = newLane;

}

thiefBoostTimer++;

if(thiefBoostTimer > 200){

thiefSpeed = 23; // boost

}

if(thiefBoostTimer > 260){

thiefSpeed = 6; // normal speed
thiefBoostTimer = 0;

}

let targetX = PC_LANES[thiefCar.lane];

thiefCar.x += (targetX - thiefCar.x) * 0.08;

}


function thiefAvoidRoadblocks(){

roadblocks.forEach(rb=>{

let sameLane = Math.abs(rb.x - thiefCar.x) < 40;
let close = rb.y > thiefCar.y - 120 && rb.y < thiefCar.y + 60;

if(sameLane && close){

let newLane = Math.floor(Math.random()*3);

thiefCar.lane = newLane;

}

});

}

function checkCatch(){

if (thiefDistance < 30 && isColliding(policeCar, thiefCar)) {
    endPoliceGame("win")
}
}


function restartPoliceCatchThief(){
    
document.getElementById("policeResult").classList.add("hidden");

startPoliceCatchThief();
}


function resetGameState() {

    // Stop game loops
    
    policeActive = false;
    policeEnded = false;

    // Reset pause states
    policePaused = false;
    trPaused = false;

    // Clear arrays
    roadblocks = [];

    // Reset speed & movement
    speed = 0;

    // Stop ALL sounds
    stopAllMusic();
    stopEngine();

    // Hide all overlays/screens
    document.getElementById("policePauseMenu").classList.add("hidden");
    document.getElementById("policeResult").classList.add("hidden");

    // Hide gameplay screens
    document.getElementById("policeScreen").classList.add("hidden");

    // Hide controls
    document.getElementById("policeControls").classList.add("hidden");
}


function endPoliceGame(type){

if(policeEnded) return;

policeEnded = true;
policeActive = false;

policeSiren.pause();

const result = document.getElementById("policeResult");
const resultText = document.getElementById("policeResultText");
const rewardText = document.getElementById("policeRewardText");

if(type === "win"){

resultText.textContent = "THIEF CAUGHT!";
rewardText.textContent = "Reward: 200 Coins";

coins += 200;

}else{

resultText.textContent = "THIEF ESCAPED!";
rewardText.textContent = "";

}

result.classList.remove("hidden");

}


function policeLoop(){

    policeLightTimer++;

if(!policeActive) return;

if(!policePaused){

pcCtx.clearRect(0,0,400,600);

drawPoliceRoad();

// acceleration
if(pcKeys.up){
policeSpeed = Math.min(policeSpeed + 0.2, policeMaxSpeed);
}

if(pcKeys.down){
policeSpeed = Math.max(policeSpeed - 0.3, 0);
}

//move road
policeRoadY += policeSpeed;

if (policeRoadY >= 600){
    policeRoadY = 0;
}

if (policeCar.x < 60) {
    policeCar.x = 60;
}

if (policeCar.x + policeCar.width > 340) {
    policeCar.x = 340 - policeCar.width;
}

if (pcKeys.left) {
    policeCar.x -= policeCar.speed;
}

if (pcKeys.right) {
    policeCar.x += policeCar.speed;
}

if (thiefDistance >= maxEscapeDistance) {
    endPoliceGame("lose");
}

updateThief();

thiefAvoidRoadblocks();

updateRoadblocks();

checkRoadblockCollision();

checkCatch();

drawRoadblocks();

// if (!policePaused) {
//     updateThief();
//     // updateRoadblocks();
//     checkRoadblockCollision();
//     checkCatch();
// }

thiefDistance += (thiefSpeed - policeSpeed) * 0.5;

thiefDistance = Math.max(0, thiefDistance);


if(policeCrashed){

crashTimer--;

let shakeX = Math.random()*10-5;
let shakeY = Math.random()*10-5;

pcCtx.save();
pcCtx.translate(shakeX,shakeY);

if(crashTimer <= 0){

policeCrashed = false;

}

}

pcCtx.fillStyle = "white";
pcCtx.font = "18px Arial";
pcCtx.fillText ("Distance: " + Math.floor (thiefDistance) + "m", 10, 30);


pcCtx.drawImage(policeImg,
policeCar.x,
policeCar.y,
policeCar.width,
policeCar.height);


// flashing police lights
let lightY = policeCar.y + 20;

if(policeLightTimer % 20 < 10){

// red glow
pcCtx.beginPath();
pcCtx.arc(policeCar.x + 15, lightY, 10, 0, Math.PI*2);
pcCtx.fillStyle = "rgba(255,0,0,0.5)";
pcCtx.fill();

// red core
pcCtx.fillStyle = "red";
pcCtx.fillRect(policeCar.x + 10, lightY-3, 10, 6);


// blue glow
pcCtx.beginPath();
pcCtx.arc(policeCar.x + 45, lightY, 10, 0, Math.PI*2);
pcCtx.fillStyle = "rgba(0,100,255,0.5)";
pcCtx.fill();

// blue core
pcCtx.fillStyle = "blue";
pcCtx.fillRect(policeCar.x + 40, lightY-3, 10, 6);

}else{

// blue glow
pcCtx.beginPath();
pcCtx.arc(policeCar.x + 15, lightY, 10, 0, Math.PI*2);
pcCtx.fillStyle = "rgba(0,100,255,0.5)";
pcCtx.fill();

// blue core
pcCtx.fillStyle = "blue";
pcCtx.fillRect(policeCar.x + 10, lightY-3, 10, 6);


// red glow
pcCtx.beginPath();
pcCtx.arc(policeCar.x + 45, lightY, 10, 0, Math.PI*2);
pcCtx.fillStyle = "rgba(255,0,0,0.5)";
pcCtx.fill();

// red core
pcCtx.fillStyle = "red";
pcCtx.fillRect(policeCar.x + 40, lightY-3, 10, 6);

}

pcCtx.drawImage(thiefImg,
thiefCar.x,
thiefCar.y,
thiefCar.width,
thiefCar.height);


if (policeCrashed) {
    pcCtx.restore();
}
}

requestAnimationFrame(policeLoop);

}


document.addEventListener("keydown", e => {

if(currentMode !== "police") return;

if(e.key === "ArrowLeft") pcKeys.left = true;
if(e.key === "ArrowRight") pcKeys.right = true;
if(e.key === "ArrowUp") pcKeys.up = true;
if(e.key === "ArrowDown") pcKeys.down = true;

});

document.addEventListener("keyup", e => {

if(e.key === "ArrowLeft") pcKeys.left = false;
if(e.key === "ArrowRight") pcKeys.right = false;
if(e.key === "ArrowUp") pcKeys.up = false;
if(e.key === "ArrowDown") pcKeys.down = false;

});


function bindPoliceControl(btn,key){

btn.addEventListener("touchstart",()=>pcKeys[key]=true);
btn.addEventListener("touchend",()=>pcKeys[key]=false);

}

bindPoliceControl(document.getElementById("pcLeft"),"left");
bindPoliceControl(document.getElementById("pcRight"),"right");
bindPoliceControl(document.getElementById("pcUp"),"up");
bindPoliceControl(document.getElementById("pcDown"),"down");




