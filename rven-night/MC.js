class MC {
  constructor(x, y, speed, img) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = random(30, 50);
    this.image = img;
    this.direction = 1;
    this.lives = 3;
    this.text = "Arg!"; // Initial text
    this.textTimer = millis(); // Timer for changing text
    this.isAlive = true;
  }

  checkCollision(x, y) {
    if (dist(x, y, this.x + this.size, this.y + this.size) < this.size) {
      this.lives--;

      if (shoutSound && this.lives > 0) {
        shoutSound.play();
      }

      if (this.lives <= 0) {
        this.isAlive = false;
      }
      return true;
    }
    return false;
  }

  move() {
    this.x += this.speed * this.direction * 2;

    // Reverse direction when hitting screen edges
    if (this.x > width - this.size) {
      this.direction *= -1;
    } else if (this.x < 0) {
      this.direction = 1;
    }

    // Change text every 2 seconds
    if (millis() - this.textTimer > 5000) {
      this.changeText();
      this.textTimer = millis();
    }
  }

  changeText() {
    // Define different text for each level
    let levelTexts = {
      1: [
        "How could this happen to me!?",
        "I should’ve known better…",
        "I can’t believe they cheated!",
        "My life was riding on this...",
        "At family game night no less!",
        "I’m going to teach them a lesson.",
      ],

      2: [
        "...should I really go through with this?",
        "I know I said I’d go but this is getting out of hand.",
        "My fault!? It’s your fault!",
        "You are the one who planned everything.",
        "I don’t know if I can go through with this…it isn’t a prank anymore.",
        "What do I do…",
      ],

      3: [
        "AHH!",
        "Where did my 50 bucks go!",
        "It was just in my pocket a second ago!",
        "Oh goodness… my sister is going to kill me…",
        "Maybe I can pickpocket someone...",
        "NO! no…I shouldn’t.",
        "Maybe...",
      ],
    };
    if (levelTexts[level]) {
      this.text = random(levelTexts[level]); // Pick random text from current level
    }
  }

  display() {
    if (this.isAlive) {
      image(this.image, this.x, this.y, this.size, this.size * 1.5);
      fill(255, 75, 51);
      textSize(20);
      textAlign(CENTER);
      text(this.text, this.x, this.y - 20); // Example text
    }
  }
}
