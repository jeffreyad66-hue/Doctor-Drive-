// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const timeRaceCanvas = document.getElementById("timeRaceCanvas");
const timeRaceCtx = timeRaceCanvas.getContext("2d");


//hide pause button in menu
function showPauseBtn() {
  document.getElementById("pauseBtn").style.display = "block";
}

function hidePauseBtn() {
  document.getElementById("pauseBtn").style.display = "none";
}


const ROAD_LEFT = 60;
const ROAD_RIGHT = 400 - 60;
let isPaused = false;
let trPaused = false;
let maxSpeed = 10;
let gameActive = false;
let currentMode = "menu";
//"menu" | "normal" | "roadRace" | "timeRace"


const driveKeys = {
    left: false,
    right: false,
    up: false,
    down: false,
};

const driveGameKeys = {
    left: false,
    right: false,
    up: false,
    down: false,
};

let highScore = Number(localStorage.getItem("highScore")) || 0;


// ================= SOUND SYSTEM =================
let sounds = {};

document.addEventListener("DOMContentLoaded", () =>{
    sounds = {
    ui: {
        click: document.getElementById("clickSound")
    },
    engine: {
        idle: document.getElementById("engineSound")
    },
    effects: {
        crash: document.getElementById("crashSound"),
        overtake: new Audio("assets/overtake.mp3"),
        coin: new Audio("assets/coin.wav") // ✅ ADD THIS
    },
    music: {
        menu: document.getElementById("bgMenu"),
        gameplay: new Audio("assets/gameplay.mp3"),
        police: new  Audio("assets/police.mp3"),
        race: new Audio("assets/race.mp3")
        }
    };
    console.log("Sound loaded:", sounds)
})



// Play / Stop helpers
function playSound(sound) {
    if (!sound || typeof
    sound.play !== "function") {
        console.warn("Invalid sound:", sound);
        return;
    } 
    sound.currentTime = 0;
    sound.play().catch(() => {});
    

}

function stopSound(sound) {
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
}

function stopAllMusic() {
    if (!sounds.music) return;

    Object.values(sounds.music).forEach(m => {
        if (m && typeof m.pause === "function") {
            m.pause();
            m.currentTime = 0;
        }
    });
}



document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        playSound(sounds.ui.click);
    });
});

function togglePause() {

    if (currentMode === "menu") return;

    isPaused = !isPaused;

    // SHOW correct overlay
    if (currentMode === "normal") {
        document.getElementById("pauseOverlay")
            .classList.toggle("hidden", !isPaused);
    }

    if (currentMode === "timeRace") {
        document.getElementById("trPauseOverlay")
            .classList.toggle("hidden", !isPaused);
    }

    // SOUND CONTROL
    if (isPaused) {
        stopEngine();
        stopAllMusic();
    } else {
        resumeGameAudio();
    }
}


function resumeGameAudio() {

    if (currentMode === "normal") {
        sounds.music.gameplay.play().catch(()=>{});
    }

    if (currentMode === "timeRace") {
        sounds.music.race.play().catch(()=>{});
    }

    startEngine();
}


function trResumeGame() {
    isPaused = false;

    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementById("trPauseOverlay").classList.add("hidden");

    resumeGameAudio();
}

function resumeGame() {
    isPaused = false;

    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementById("trPauseOverlay").classList.add("hidden");

    resumeGameAudio();
}


//restart (auto-detect mode)
function trRestartPausedGame() {

    isPaused = false;

    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementById("trPauseOverlay").classList.add("hidden");

    if (currentMode === "normal") {
        startGame();
    }

    if (currentMode === "timeRace") {
        startTimeRace();
    }
}

//restart (auto-detect mode)
function restartPausedGame() {

    isPaused = false;

    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementById("trPauseOverlay").classList.add("hidden");

    if (currentMode === "normal") {
        startGame();
    }

    if (currentMode === "timeRace") {
        startTimeRace();
    }
}


function drawMenu() {}
function updateGame () {}
function drawGame () {}

function resetGameState() {

    // Stop game loops
    gameRunning = false;
    timeRaceActive = false;
    raceEnded = false;

    // Reset pause states
    isPaused = false;

    // Clear arrays
    traffic = [];
    coinItems = [];

    // Reset speed & movement
    speed = 0;

    // Stop ALL sounds
    stopAllMusic();
    stopEngine();

    // Hide all overlays/screens
    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementsByClassName("popup").classList.add("hidden")
    document.getElementById("trPauseOverlay").classList.add("hidden");
    document.getElementById("raceResultPopup").classList.add("hidden");

    // Hide gameplay screens
    document.querySelector(".game-container").style.display = "none";
    document.getElementById("timeRaceScreen").classList.add("hidden");

    // Hide controls
    document.getElementById("driveControls").classList.add("hidden");
}


function goToMenu() {

    // STOP EVERYTHING
    stopAllMusic();
    stopEngine();

    // RESET STATES
    gameRunning = false;
    timeRaceActive = false;
    policeActive = false;

    isPaused = false;
    policePaused = false;

    currentMode = "menu";

    // CLEAR ARRAYS
    traffic = [];
    coinItems = [];
    roadblocks = [];

    // HIDE ALL SCREENS
    document.querySelector(".game-container").style.display = "none";
    document.getElementById("timeRaceScreen").classList.add("hidden");
    document.getElementById("policeScreen").classList.add("hidden");

    // HIDE UI OVERLAYS
    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("trPauseOverlay").classList.add("hidden");
    document.getElementById("policePauseMenu").classList.add("hidden");

    document.getElementById("raceResultPopup").classList.add("hidden");
    document.getElementById("policeResult").classList.add("hidden");

    // HIDE CONTROLS
    document.getElementById("driveControls").classList.add("hidden");
    document.getElementById("policeControls").classList.add("hidden");

    // STOP POLICE SIREN
    if (typeof policeSiren !== "undefined") {
        policeSiren.pause();
        policeSiren.currentTime = 0;
    }

    // SHOW MENU
    hidePauseBtn();
    menuScreen.classList.remove("hidden");
    menuScreen.classList.remove("hidden");

    // PLAY MENU MUSIC
    if (sounds.music && sounds.music.menu) {
        sounds.music.menu.loop = true;
        sounds.music.menu.volume = 0.5;
        sounds.music.menu.play().catch(()=>{});
    }
}




// Start game from menu
function startGame() {
   
   gameOverScreen.classList.add("hidden");
    stopAllMusic();

    sounds.music.gameplay.loop = true;
    sounds.music.gameplay.volume = 0.8;
    sounds.music.gameplay.play().catch(()=>{});

    // Start engine
    sounds.engine.idle.volume = 0.6;
    sounds.engine.idle.play().catch(()=>{});

    document.getElementById("driveControls").classList.remove("hidden");

    currentMode = "normal";

    isPaused = false;
    applyCarStats();
    showPauseBtn();
    

  menuScreen.classList.add("hidden");
    document.getElementById("pauseBtn").style.display = "block";
    document.querySelector(".game-container").style.display = "block";

  gameRunning = true;
  traffic = [];
  speed = 0;
  distance = 0;
  gameLoop();
}

let load = 0;

const progress = document.getElementById("loadingProgress");
const startBtn = document.getElementById("startGameBtn");

let loadingInterval = setInterval(()=>{

load += Math.random()*10;

if(load >= 100){
    load = 100;
    clearInterval(loadingInterval);

    // show start button
    startBtn.classList.remove("hidden");
}

progress.style.width = load + "%";

}, 200);

let audioUnlocked = false;

// create a silent audio
const unlockAudio = new Audio();
unlockAudio.src = "assets/click.mp3"; // any small sound
unlockAudio.volume = 0;

function unlockGameAudio(){

if(audioUnlocked) return;

unlockAudio.play().then(()=>{
    audioUnlocked = true;
}).catch(()=>{});

}


document.getElementById("startGameBtn").addEventListener("click", ()=>{

    unlockGameAudio();

    const loadingScreen = document.getElementById("loadingScreen");

    // 🔴 STRONG HIDE (not just class)
    loadingScreen.classList.add("hidden");
    loadingScreen.style.display = "none";

    const introScreen = document.getElementById("introScreen");
    introScreen.classList.remove("hidden");

    const video = document.getElementById("introVideo");

    video.currentTime = 0;
    video.muted = false;

    setTimeout(()=>{
        video.play().catch(()=>{});
    }, 100);

});


// Show menu (after intro)
function showMenu() {
    hidePauseBtn();
    // Hide all screens
    document.querySelector(".game-container").style.display = "none";
    document.getElementById("timeRaceScreen").classList.add("hidden");
    document.getElementById("challengesScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("raceResult").classList.add("hidden");
    

    // Reset states
    
    gameRunning = false;
    timeRaceActive = false;
    isPaused = false;

    // Show menu
    
    
    menuScreen.classList.remove("hidden");
}

//challenge screen
function openChallenges() {
  document.getElementById("challengesScreen").classList.remove("hidden");
}

function closeChallenges() {
  document.getElementById("challengesScreen").classList.add("hidden");
}


// TIME RACE STATE
let finishLineWorldY = 0;
const finishLineHeight = 80;
let timeRaceActive = false;
let raceTimeLeft = 120; // seconds
let raceDistance = 0;
let finishDistance = 40000;
let raceEnded = false;

function endTimeRace(type) {
  if (raceEnded) return;
  raceEnded = true;

  timeRaceActive = false;
  isPaused = false;

  const popup = document.getElementById("raceResultPopup");
  const title = document.getElementById("raceResultTitle");
  const text = document.getElementById("raceResultText");

  if (type === "crash") {
    title.textContent = "GAME OVER";
    text.textContent = "You crashed into traffic!";
  }

  if (type === "timeup") {
    title.textContent = "TIME UP!";
    text.textContent = "You did not reach the finish line.";
  }

  if (type === "win") {
    title.textContent = "YOU WIN!";
    text.textContent = "+50 Coins Awarded 🎉";
    coins += 50;
    localStorage.setItem("coins", coins);
  }

  popup.classList.remove("hidden");


}

//restart button and menu

function restartTimeRace() {
  document.getElementById("raceResultPopup").classList.add("hidden");
  raceEnded = false;
    
  startTimeRace();
}

const finishLineImg = new Image();
finishLineImg.src = "assets/finish.png";


function startTimeRace() {
    stopAllMusic();

    sounds.music.race.loop = true;
    sounds.music.race.volume = 0.8;
    sounds.music.race.play().catch(()=>{});

    document.getElementById("driveControls").classList.remove("hidden");
    currentMode = "timeRace";

    isPaused = false;

    applyCarStats();
    startEngine();
    showPauseBtn();

    document.getElementById("timeRaceScreen").classList.remove("hidden");
    document.getElementById("pauseBtn").style.display = "block";
    menuScreen.classList.add("hidden");


    roadY = 0;
    traffic = [];
    raceEnded = false;
    raceTimeLeft = 120;
    raceDistance = 0;
    finishDistance = 40000;
    finishLineWorldY = finishDistance;
    timeRaceActive = false;

  startCountdown();


}

function startCountdown() {
    playCountdownBeep();
  const cd = document.getElementById("countdown");
  cd.classList.remove("hidden");

  let count = 3;
  cd.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      cd.textContent = count;
    } else {
      cd.textContent = "GO!";
      clearInterval(interval);

      setTimeout(() => {
        cd.textContent = "";
        cd.classList.add("hidden");
        startTimeRaceGame();
      }, 800);
    }
  }, 1000);
}


function drawRoadTimeRace() {
  timeRaceCtx.drawImage(roadImg, 0, roadY, timeRaceCanvas.width, roadHeight);
  timeRaceCtx.drawImage(
    roadImg,
    0,
    roadY - roadHeight,
    timeRaceCanvas.width,
    roadHeight
  );
}

function startTimeRaceGame() {
  timeRaceActive = true;

document.getElementById("driveControls").classList.remove("hidden");
    traffic = [];
    speed = 0;
    roadY = 0;
    raceDistance = 0;
  startRaceTimer();
  requestAnimationFrame(timeRaceLoop);
}


function startRaceTimer() {
  const timerEl = document.getElementById("raceTime");

  const timer = setInterval(() => {
    if (!timeRaceActive) {
      clearInterval(timer);
      return;
    }

    raceTimeLeft--;
    timerEl.textContent = raceTimeLeft;

    if (raceTimeLeft <= 0) {
    endTimeRace("timeup");
      clearInterval(timer);
    }
  }, 1000);
}


function winTimeRace() {
  timeRaceActive = false;
  showRaceResult("YOU WIN!");
}

function loseTimeRace() {
  timeRaceActive = false;
  showRaceResult("TIME UP!");
}

function showRaceResult(text) {
    const result = document.getElementById("raceResult");
    result.textContent = text;
    result.classList.remove("hidden");
}

function updateGarageCoinDisplay() {
  const el = document.getElementById("garageCoins");
  if (el) {
    el.textContent = "Coins: " + coins;
  }
}


//car garage
const cars = [
    { id: 0, name: "Speed: 8", price: 0, img: "assets/car1.png", maxSpeed: 8, accel: 0.15 },
    { id: 1, name: "Speed: 9", price: 300, img: "assets/car2.png", maxSpeed: 9, accel: 0.16  },
    { id: 2, name: "Speed: 10", price: 500, img: "assets/car3.png", maxSpeed: 10, accel: 0.17  },
    { id: 3, name: "Speed: 11", price: 800, img: "assets/car4.png", maxSpeed: 11, accel: 0.18  },
    { id: 4, name: "Speed: 12", price: 1000, img: "assets/car5.png", maxSpeed: 12, accel: 0.19  },
    { id: 5, name: "Speed: 13", price: 1200, img: "assets/car6.png", maxSpeed: 13, accel: 0.20  },
    { id: 6, name: "Speed: 14", price: 1400, img: "assets/car7.png", maxSpeed: 14, accel: 0.21  },
    { id: 7, name: "Speed: 15", price: 1600, img: "assets/car8.png", maxSpeed: 15, accel: 0.22  },
    { id: 8, name: "Speed: 16", price: 1800, img: "assets/car9.png", maxSpeed: 16, accel: 0.23  },
    { id: 9, name: "Speed: 17", price: 2000, img: "assets/car10.png", maxSpeed: 17, accel: 0.24  },
    { id: 10, name: "Speed: 18", price: 2300, img: "assets/car11.png", maxSpeed: 18, accel: 0.25  },
    { id: 11, name: "Speed: 19", price: 2500, img: "assets/car12.png", maxSpeed: 19, accel: 0.26  },
    { id: 12, name: "Speed: 20", price: 2700, img: "assets/car13.png", maxSpeed: 20, accel: 0.27  },
    { id: 13, name: "Speed: 21", price: 3000, img: "assets/car14.png", maxSpeed: 21, accel: 0.28  },
    { id: 14, name: "Speed: 22", price: 3200, img: "assets/car15.png", maxSpeed: 22, accel: 0.29  },
    { id: 15, name: "Speed: 23", price: 3500, img: "assets/car16.png", maxSpeed: 23, accel: 0.30  },
    
];

let ownedCars = JSON.parse(localStorage.getItem("ownedCars")) || [0];
let selectedCar = Number(localStorage.getItem("selectedCar")) || 0;


// DOM elements
// const startBtn = document.getElementById("startBtn");
const speedText = document.getElementById("speed");
const scoreText = document.getElementById("score");
const lanes = [60, 170, 280];

//game over
const gameOverScreen = document.getElementById("gameOverScreen");
const finalDistance = document.getElementById("finalDistance");
const finalCoins = document.getElementById("finalCoins");
const restartBtn = document.getElementById("restartBtn");
const garageBtn = document.getElementById("garageBtn");


//car garage state
const garageScreen = document.getElementById("garageScreen");
const garageList = document.getElementById("garageList");

// menuBtn.onclick = () => {
//   gameOverScreen.classList.add("hidden");
//   showMenu();
// };

function openGarage() {
  garageScreen.classList.remove("hidden"); // ✅ SHOW GARAGE

    updateGarageCoinDisplay();
  garageList.innerHTML = "";

  cars.forEach(car => {
    const card = document.createElement("div");
    card.className = "car-card";

    const img = document.createElement("img");
    img.src = car.img;

    const name = document.createElement("div");
    name.textContent = car.name;

    const price = document.createElement("div");
    price.textContent = car.price === 0 ? "FREE" : `${car.price} Coins`;

    const btn = document.createElement("button");

    if (ownedCars.includes(car.id)) {
      btn.textContent = car.id === selectedCar ? "Selected" : "Select";
      btn.onclick = () => selectCar(car.id);
    } else {
      btn.textContent = "Buy";
      btn.onclick = () => buyCar(car.id, car.price);
    }

    card.append(img, name, price, btn);
    garageList.appendChild(card);
  });
}

function buyCar(id, price) {
  if (coins >= price) {
    coins -= price;
    ownedCars.push(id);
    localStorage.setItem("coins", coins);
    localStorage.setItem("ownedCars", JSON.stringify(ownedCars));

    updateGarageCoinDisplay();
    openGarage(); // refresh UI
  } else {
    alert("Not enough coins!");
  }
}

function selectCar(id) {
  selectedCar = id;
  localStorage.setItem("selectedCar", id);
  carImg.src = cars[id].img; // change car instantly
    applyCarStats();
    openGarage(); // refresh UI
}

let currentCarStats = cars.find(c => c.id === selectedCar) || cars[0];

function applyCarStats() {
    currentCarStats = cars.find(c => c.id === selectedCar) || cars[0];

    maxSpeed = currentCarStats.maxSpeed;
    car.speed = currentCarStats.accel;
}


function closeGarage() {
  garageScreen.classList.add("hidden");
}

//coin
const coinImg = new Image();
coinImg.src = "assets/coin.png";

let coins = Number(localStorage.getItem("coins")) || 0;
let coinItems = [];

// Game state
let gameRunning = false;
let speed = 0;
let distance = 0;


// Player car
const car = {
  x: 170,
  y: 320,
  width: 60,
  height: 100,
  speed: 5
};

// Road scroll
let roadY = 0;
const roadHeight = canvas.height;

// Images
const carImg = new Image();
carImg.src = cars[selectedCar].img;

const trafficImgs = [
  new Image(),
  new Image(),
  new Image()
];
trafficImgs[0].src = "assets/traffic1.png";
trafficImgs[1].src = "assets/traffic2.png";
trafficImgs[2].src = "assets/traffic3.png";

const roadImg = new Image();
roadImg.src = "assets/road.png";


// Traffic
let traffic = [];

function createTraffic() {
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  // Prevent cars spawning too close
  if (traffic.length > 0) {
    const lastCar = traffic[traffic.length - 1];
    if (lastCar.y > -200) return null;
  }

  return {
    x: lane,
    y: -150,
    width: 60,
    height: 100,
    speed: Math.random() * 2 + 2,
    type: Math.floor(Math.random() * 3)
  };
}

//coin function
function createCoin() {
  return {
    x: lanes[Math.floor(Math.random() * lanes.length)] + 15,
    y: -40,
    width: 30,
    height: 30
  };
}

//game over function
function gameOver() {
  gameRunning = false;

  // ✅ ONLY save score in normal mode
  if (currentMode === "normal") {
    if (distance > highScore) {
      highScore = distance;
      localStorage.setItem("highScore", highScore);
    }
  }

  gameOverScreen.classList.remove("hidden");

  finalDistance.textContent = `Distance: ${distance}`;
  finalCoins.textContent = `Coins Collected: ${coins}`;
}


function openScoreScreen() {
  menuScreen.classList.add("hidden");

  document.getElementById("scoreScreen").classList.remove("hidden");

  // update score display
  document.getElementById("highScoreText").textContent = highScore;
}

function closeScoreScreen() {
  document.getElementById("scoreScreen").classList.add("hidden");
  menuScreen.classList.remove("hidden");
}


// Collision detection
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}



// Draw road
function drawRoad() {
    ctx.drawImage(roadImg, 0, roadY, canvas.width, roadHeight);
    ctx.drawImage(roadImg, 0, roadY - roadHeight, canvas.width, roadHeight);
}

// Controls - keyboard
document.addEventListener("keydown", e => {

if(currentMode !== "timeRace") return;

if(e.key === "ArrowLeft") driveKeys.left = true;
if(e.key === "ArrowRight") driveKeys.right = true;
if(e.key === "ArrowUp") driveKeys.up = true;
if(e.key === "ArrowDown") driveKeys.down = true;

});

document.addEventListener("keyup", e => {

if(e.key === "ArrowLeft") driveKeys.left = false;
if(e.key === "ArrowRight") driveKeys.right = false;
if(e.key === "ArrowUp") driveKeys.up = false;
if(e.key === "ArrowDown") driveKeys.down = false;

});


function bindDriveControl(btn,key){

btn.addEventListener("touchstart",()=>driveKeys[key]=true);
btn.addEventListener("touchend",()=>driveKeys[key]=false);

}

bindDriveControl(document.getElementById("dcLeft"),"left");
bindDriveControl(document.getElementById("dcRight"),"right");
bindDriveControl(document.getElementById("dcUp"),"up");
bindDriveControl(document.getElementById("dcDown"),"down");


// game Controls - keyboard
document.addEventListener("keydown", e => {

if(currentMode !== "normal") return;

if(e.key === "ArrowLeft") driveGameKeys.left = true;
if(e.key === "ArrowRight") driveGameKeys.right = true;
if(e.key === "ArrowUp") driveGameKeys.up = true;
if(e.key === "ArrowDown") driveGameKeys.down = true;

});

document.addEventListener("keyup", e => {

if(e.key === "ArrowLeft") driveGameKeys.left = false;
if(e.key === "ArrowRight") driveGameKeys.right = false;
if(e.key === "ArrowUp") driveGameKeys.up = false;
if(e.key === "ArrowDown") driveGameKeys.down = false;

});


function bindDriveGameControl(btn,key){

btn.addEventListener("touchstart",()=>driveGameKeys[key]=true);
btn.addEventListener("touchend",()=>driveGameKeys[key]=false);

}

bindDriveGameControl(document.getElementById("dgLeft"),"left");
bindDriveGameControl(document.getElementById("dgRight"),"right");
bindDriveGameControl(document.getElementById("dgUp"),"up");
bindDriveGameControl(document.getElementById("dgDown"),"down");


restartBtn.onclick = () =>{
    gameOverScreen.classList.add("hidden");
    startGame();
};


//game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentMode === "menu"){
        showMenu();
    }

    if (currentMode === "normal") {
        if (!isPaused) {
            updateGame();
        }
        drawGame();
    }

  if (!gameRunning) return;

if (isPaused) {
    requestAnimationFrame(gameLoop);

    return;
}


  // Scroll road
  roadY += speed + 2;
  if (roadY >= roadHeight) 
    roadY = 0;

  drawRoad();

//movement
if (driveGameKeys.up) {
    speed = Math.min(speed + currentCarStats.accel, maxSpeed);


}

if (driveGameKeys.down) {
        speed = Math.max(speed - 0.3, 0);
}

if (driveGameKeys.left) {
    car.x -= 5;
}

if (driveGameKeys.right) {
    car.x += 5;
}

//clamp to road
if (car.x < ROAD_LEFT) {
    car.x = ROAD_LEFT;
}

if (car.x + car.width > ROAD_RIGHT) {
    car.x = ROAD_RIGHT - car.width;
}


//coin loop
// ===== COINS =====
if (Math.random() < 0.03) {
  coinItems.push(createCoin());
}

for (let i = coinItems.length - 1; i >= 0; i--) {
  const c = coinItems[i];
  c.y += speed + 2;

  ctx.drawImage(coinImg, c.x, c.y, c.width, c.height);

  // Collision with player
  if (isColliding(car, c)) {
    playSound(sounds.effects.coin); // ✅ ADD THIS
    coins++;
    localStorage.setItem("coins", coins);
    coinItems.splice(i, 1);
    continue;
  }

  // Remove off screen
  if (c.y > canvas.height) {
    coinItems.splice(i, 1);
  }
}

  // Player
  ctx.drawImage(carImg, car.x, car.y, car.width, car.height);

  // Traffic
  traffic.forEach((t, index) => {
    t.y += t.speed + speed;
    ctx.drawImage(trafficImgs[t.type], t.x, t.y, t.width, t.height);

    if (isColliding(car, t)) {
    playSound(sounds.effects.crash); // ✅ ADD THIS
    gameOver();
}

    if (t.y > canvas.height) {
      traffic.splice(index, 1);
      distance += 10;
    }
  });

  // Spawn traffic
 if (Math.random() < 0.02) {
    const newCar = createTraffic();
    if (newCar) traffic.push(newCar);
}

  // Update HUD
    speedText.textContent = `Speed: ${speed.toFixed(1)}`;
    scoreText.textContent = `Distance: ${distance}`;
    scoreText.textContent = `Distance: ${distance} | Coins: ${coins}`;
    scoreText.textContent = `Distance: ${distance} | Coins: ${coins} | Best: ${highScore}`;


  requestAnimationFrame(gameLoop);
}


//timeraceloop
function timeRaceLoop() {
  if (!timeRaceActive) return;

    if (isPaused) {
        requestAnimationFrame(timeRaceLoop);
        return;
    }

    timeRaceCtx.clearRect(0, 0, 400, 600);


//movement
if (driveKeys.up) {
    speed = Math.min(speed + 0.2, maxSpeed);
}

if (driveKeys.down) {
        speed = Math.max(speed - 0.3, 0);
}

if (driveKeys.left) {
    car.x -= 5;
}

if (driveKeys.right) {
    car.x += 5;
}

//clamp to road
if (car.x < ROAD_LEFT) {
    car.x = ROAD_LEFT;
}

if (car.x + car.width > ROAD_RIGHT) {
    car.x = ROAD_RIGHT - car.width;
}

  // Scroll road
  roadY += speed + 2;
  if (roadY >= roadHeight) roadY = 0;

    updateEngine();
    drawRoadTimeRace();

// ===== FINISH LINE =====
if (timeRaceActive) {
  const finishLineScreenY = car.y - (finishLineWorldY - raceDistance);

  if (finishLineScreenY < timeRaceCanvas.height) {
    timeRaceCtx.drawImage(
      finishLineImg,
      0,
      finishLineScreenY,
      timeRaceCanvas.width,
      finishLineHeight
    );
  }
}


  // Spawn traffic
  if (Math.random() < 0.03) {
    const t = createTraffic();
    if (t) traffic.push(t);
  }

  // Draw traffic
  traffic.forEach((t, i) => {
    t.y += t.speed + speed;
    timeRaceCtx.drawImage(
      trafficImgs[t.type],
      t.x,
      t.y,
      t.width,
      t.height
    );

    if (isColliding(car, t)) {
    playSound(sounds.effects.crash); // ✅ ADD THIS
    endTimeRace("crash");
    return;
}

    if (t.y > 600) {
      traffic.splice(i, 1);
    }
  });

  // Draw player
  timeRaceCtx.drawImage(
    carImg,
    car.x,
    car.y,
    car.width,
    car.height
  );

  // Distance logic
  raceDistance += speed;
    if (raceDistance >= finishDistance) {
        endTimeRace("win");
        return;
    }


  requestAnimationFrame(timeRaceLoop);
}


const introScreen = document.getElementById("introScreen");
const introVideo = document.getElementById("introVideo");
const menuScreen = document.getElementById("menuScreen");

// When intro video ends → show menu
introVideo.onended = () => {
    if (sounds.music && sounds.music.menu) {
    stopAllMusic();
    sounds.music.menu.volume = 0.5;
    sounds.music.menu.play().catch(()=>{});
}


    document.getElementById("introScreen").classList.add("hidden");

    // 🔴 ENSURE loading NEVER comes back
    const loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.classList.add("hidden");
    loadingScreen.style.display = "none";

    document.getElementById("menuScreen").classList.remove("hidden");

};

// Hide game at start
document.querySelector(".game-container").style.display = "none";


const howToScreen = document.getElementById("howToScreen");


// HOW TO PLAY
document.getElementById("howToBtn").onclick = () => {
  menuScreen.classList.add("hidden");
  howToScreen.classList.remove("hidden");
};

function closeHowTo() {
  howToScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
}


// Unlock audio for mobile
function unlockGameAudio() {
    Object.values(sounds).forEach(category => {

        Object.values(category).forEach(sound => {

            if (!sound || typeof sound.play !== "function") return;

            sound.muted = true;

            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.muted = false;
            }).catch(() => {});

        });

    });
}

function startEngine() {
    if (!sounds.engine.idle) return;

    sounds.engine.idle.volume = 0.9;
    sounds.engine.idle.play().catch(()=>{});
}

function stopEngine () {
    if (!sounds.engine.idle) return;

    sounds.engine.idle.pause();
    sounds.engine.idle.currentTime = 0;
}


function updateEngine(speed) {
    if (!sounds.engine.idle) return;
    if (!isFinite(speed)) return;

    speed = Math.max(0, Math.min(1, speed));
    sounds.engine.idle.playbackRate = 0.8 + speed * 0.7;
}

function playCountdownBeep() {
    const beep = new Audio("assets/countdown.mp3");
    playSound(beep);
}

self.addEventListener("install", e => {
  console.log("App installed");
});
