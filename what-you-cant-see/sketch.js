let video;
let handPose;
let hands = [];
let flashlight, roombackground;
let monster_gif1, monster_gif2;
let startTime = 0, duration = 2000;
let monsterVisible = true;
let lastSeen = 0;
let scaleX;
let scaleY;

function preload() {
  handPose = ml5.handPose({ flipped: true });
  flashlight = loadImage("flashlight.png");
  roombackground = loadImage("roombackground.png");
  monster_gif1 = loadImage("monstergif1.gif");
  monster_gif2 = loadImage("monstergif2.gif");
  myFont = loadFont("Overpass-VariableFont_wght.ttf");
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  dot = createGraphics(300, 400);
  dot.clear();

  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();
  handPose.detectStart(video, gotHands);
  scaleX = width / video.width;
  scaleY = height / video.height;

  startTime = millis();
}

function draw() {
  image(video, 0, 0);
  image(roombackground, 0, 0, windowWidth, windowHeight);

  let flashlightTouchingMonster = false;

  if (hands.length > 0) {
    hand = hands[0];

    let index = hand.index_finger_tip;
    image(flashlight, index.x * scaleX, index.y * scaleY, 150, 150);
    noStroke();
    fill(255, 255, 26, 50);

    let circleX = index.x - 60;
    let circleY = index.y + 200;
    let circleRadius = 100;

    circle(circleX, circleY, 200);

    if (monsterVisible && checkCollision(circleX, circleY, circleRadius, -80, -30, monster_gif1.width, monster_gif1.height, monster_gif2.width, monster_gif2.height)) {
      monsterVisible = false;
      lastSeenTime = millis();
      flashlightTouchingMonster = true;
    }
  }

  if (!flashlightTouchingMonster && !monsterVisible && millis() - lastSeenTime > 10000) {
    monsterVisible = true;
  }

  if (monsterVisible && monster_gif1 && monster_gif2 && millis() - startTime > duration) {
    image(monster_gif1, 0, 0, windowWidth, windowHeight);
    image(monster_gif2, 0, 0, windowWidth, windowHeight);
    push();
    textSize(20);
    displayText("Move your index finger slowly around the space to scare away the monsters.");
    pop();
  }
}

// Collision detection function
function checkCollision(cx, cy, cr, mx, my, mw, mh) {
  let closestX = constrain(cx, mx, mx + mw);
  let closestY = constrain(cy, my, my + mh);
  let distance = dist(cx, cy, closestX, closestY);
  return distance < cr;
}

function displayText(msg) {
  noStroke();
  fill(255, 210);
  push();
  stroke(10);
  rect(800, 60, 530, 90);
  pop();
  fill(0);
  textFont(myFont);
  text(msg, 820, 80, 500, 70);
}