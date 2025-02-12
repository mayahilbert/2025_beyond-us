let stream;
let buffer = [];
let maxBufferSize = 20;
let ghosts = [];

function preload() {
  stream = createCapture(VIDEO);
}

function setup() {
  createCanvas(windowWidth * 2 / 3, windowHeight);

  stream.size(width, height);
  stream.hide();
}

function draw() {
  background(0);

  let frame = stream.get();
  frame.filter(GRAY);
  buffer.push(frame);

  // Maintain buffer size for "memory decay"
  if (buffer.length > maxBufferSize) {
    buffer.shift();
  }

  // Overlay fading past frames
  for (let i = 0; i < buffer.length; i++) {
    let alpha = map(i, 0, buffer.length, 100, 100);
    tint(255, alpha);
    image(buffer[i], 0, 0, stream.width, height);
  }



  // Apply gradual decay to the oldest frame
  if (buffer.length > 0) {
    let oldestFrame = buffer[0];
    oldestFrame.loadPixels();
    for (let i = 0; i < oldestFrame.pixels.length; i += 4) {
      if (random(1) < 0.01) {
        oldestFrame.pixels[i] = 0;
        oldestFrame.pixels[i + 1] = 0;
        oldestFrame.pixels[i + 2] = 0;
        oldestFrame.pixels[i + 3] = 0;
      }
    }
    oldestFrame.updatePixels();
  }

  // Apply glitch effect periodically
  if (frameCount % 30 === 0 && buffer.length > 0) {
    let glitchX = random(width / 4, (3 * width) / 4);
    let glitchY = random(height / 4, (3 * height) / 4);
    let glitchW = random(50, 150);
    let glitchH = random(50, 150);

    copy(
      buffer[buffer.length - 1],
      glitchX, glitchY, glitchW, glitchH,
      glitchX + random(-20, 20), glitchY + random(-20, 20), glitchW, glitchH
    );
  }


  // Overlay faint live video feed
  tint(100, 50);
  image(stream, 0, 0, stream.width, height);
}
