p5.disableFriendlyErrors = true; // disables FES
let birdImg, bgImg, soundEffect, shoutSound;
let mc, player;
let gameStartTime;
let people;
let personImgs = [], mcImgs = [], availableMCImages = [];

const spawnInterval = 3000;
let lastSpawnTime;

// faceApi vars
let faceapi;
let video;
let detections = null;
let face = new Face();
let faceVertOff = 0;
const detection_options = {
  withLandmarks: true,
  withDescriptors: false,
};

// Visual effects
let isShooting, isGameOver, isTitleTime;
let titleTimer;
const titleTimerDec = 100;
let mouthText = "";

// Level tracking variables
let level, levelTimer, levelDuration;

function preload() {
  birdImg = loadGif("RVEN.gif");
  bgImg = loadImage("background.png");
  personImgs.push(loadImage("person2.png"));
  personImgs.push(loadImage("person3.png"));
  personImgs.push(loadImage("person5.png"));
  personImgs.push(loadImage("person6.png"));

  mcImgs = [
    loadImage("person2.png"),
    loadImage("person1.png"),
    loadImage("person7.png"),
    loadImage("person3.png"),
  ];

  soundEffect = loadSound("background.mp3");
  shoutSound = loadSound("Shout.m4a");
}

function resetGame() {
  // reset values
  lastSpawnTime = 0;
  isShooting = false;
  isGameOver = false;
  isTitleTime = true;
  titleTimer = 1500;
  mouthText = "";

  // Level tracking variables
  level = 1;
  levelTimer = 50000; // Start with 30 seconds for level 1
  levelDuration = 50000; // Duration of the current level
  people = new People();
  player = new Player();
  availableMCImages = [...mcImgs]; // Copy the list
  shuffle(availableMCImages, true);

  mc = new MC(
    Math.random() * 150 - 200, // Random value between -200 and -50
    Math.random() * (height * 0.5) + height * 0.5, // Random value between height * 0.5 and height - 10
    Math.random() + 1, // Random value between 1 and 2
    getUniqueMCImage() // Ensure unique image for MC
  );
  gameStartTime = Date.now();

  resetLevel();
  textAlign(CENTER);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(5);

  // load up your video
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video element, and just show the canvas
  faceapi = ml5.faceApi(video, detection_options, modelReady);
  resetGame();
  noLoop();
}

function draw() {
  if (isTitleTime) {
    showTitle();
    handleTitleScreen();
    return;
  }

  if (!detections || detections.length === 0 || isGameOver) return;

  background(bgImg);
  handleSoundEffect();
  updateGameState();
  drawGameElements();
  handleLevelProgression();
  spawnPeople();
}

function handleTitleScreen() {
  if (detections && detections.length > 0) {
    fill(255);
    noStroke();
    textSize(14);
    text("OPEN YOUR MOUTH TO START", width / 2, height / 2 - 100);
    if (face.isMouthOpen(detections[0].parts.mouth)) {
      titleTimer -= titleTimerDec;
      if (titleTimer < 0) {
        text("STARTING!", width / 2, height / 2 - 130);
        isTitleTime = false;
        gameStartTime = Date.now();
      }
    }
  }
}

function handleSoundEffect() {
  if (!soundEffect.isPlaying()) {
    soundEffect.loop();
  }
}

function updateGameState() {
  if (face.isMouthOpen(detections[0].parts.mouth)) {
    mouthText = "poo";
    isShooting = true;
  } else {
    mouthText = "";
  }

  faceVertOff = face.calcFaceOffset();
  player.setPos(
    face.getPosX() - player.getCenterOffX(),
    face.getPosY() + faceVertOff
  );

  if (isShooting) {
    player.shoot();
    isShooting = false;
  }
}

function drawGameElements() {
  push();
  translate(0, faceVertOff);
  face.drawMask(detections[0].parts.jawOutline);
  face.drawCamFeed(video);
  face.drawMouthText(detections[0].parts.mouth, mouthText);
  pop();

  people.draw();
  if (level <= 3) {
    mc.move();
    mc.display();
  }
  player.update();
  player.draw();

  showTimer();
}

function handleLevelProgression() {
  if (Date.now() - gameStartTime >= levelDuration) {
    if (level < 3) {
      level++;
      gameStartTime = Date.now();
      levelDuration = 50000;
      resetLevel();
    } else {
      isGameOver = true;
      showGameOver();
    }
  }
}

function spawnPeople() {
  if (Date.now() - lastSpawnTime > spawnInterval && people.checkLength() < 4) {
    let person = createPerson();
    people.addPerson(person.x, person.y, person.speed, person.img);
    lastSpawnTime = Date.now();
  }
}

function createPerson() {
  return {
    x: Math.random() * 110 - 200,
    y: Math.random() * (height * 0.5) + height * 0.5,
    speed: Math.random() + 1,
    img: personImgs[Math.floor(Math.random() * personImgs.length)]
  };
}


function showTimer() {
  let timeLeft = max(0, levelDuration - (Date.now() - gameStartTime));
  let secondsLeft = ceil(timeLeft / 1000);

  if (secondsLeft <= 0) {
    secondsLeft = 0; // Ensure it doesn’t go negative
  }

  fill(255);
  textSize(20);
  textAlign(RIGHT);
  text("TIME: " + secondsLeft, width - 10, 30);
  text("LEVEL: " + level, width / 2, 30); // Display level number
}

function resetLevel() {
  people.initializePeople();

  mc = new MC(
    Math.random() * 150 - 200, // Random value between -200 and -50
    Math.random() * (height * 0.5) + height * 0.5, // Random value between height * 0.5 and height - 10
    Math.random() + 1, // Random value between 1 and 2
    getUniqueMCImage() // Ensure unique MC image
  );

  if (level > 1) {
    mc.speed *= 1.2;
  }
}

function showGameOver() {
  noLoop(); // Stop the game loop

  fill(0, 0, 0, 150); // Semi-transparent background
  rectMode(CENTER);
  rect(width / 2, height / 2, width, height); // Draw a full-screen overlay

  fill(255);
  textSize(50);
  textAlign(CENTER, CENTER); // Ensure the text is centered
  text("GAME OVER", width / 2, height / 2 - 20);

  soundEffect.stop(); // Stop the sound when the game is over
  setTimeout(resetGame, 10000);
}

function getUniqueMCImage() {
  if (availableMCImages.length === 0) {
    availableMCImages = [...personImgs]; // Refill if empty
    shuffle(availableMCImages, true); // Shuffle again
  }
  return availableMCImages.pop(); // Remove and return an image
}

function showTitle() {
  background(bgImg, 0, 0, windowWidth, windowHeight);

  fill(255);
  stroke(0);
  rectMode(CENTER);

  textSize(50);
  text("RVEN NIGHT", width / 2, height / 2 - 15);
  noStroke();
  textSize(20);
  text("STAND HERE TO PLAY", width / 2, height / 2 - 70);
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }

  detections = result;
  faceapi.detect(gotResults);

  redraw();
}

function modelReady() {
  faceapi.detect(gotResults);
}
