class Player {
  constructor(shooterImage) {
    this.image = shooterImage;
    this.x = 30; // width / 2
    this.y = 30;

    this.bullets = [];

    // spacing
    this.marginSide = 25;
    this.marginTop = 25;
    this.marginLives = 225;
    this.marginScore = 50;
    this.marginText = 30;
    this.imgSzY = 8;
    this.imgSzX = 11.5;
    this.collisionSz = 20;

    // timing
    this.timeSinceLastBullet = 0;
    this.bulletDelay = 15;

    // ouch
    this.isOuchTime = false;
    this.ouchTimerMax = 2000;
    this.ouchTimer = this.ouchTimerMax;
    this.ouchTimerDec = 100;
  }

  getScore() {
  }

  getCenterOffX() {
    return this.imgSzX;
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    this.constrain();
    this.updateBullets();
    this.updateOuchTimer();
  }

  updateOuchTimer() {
    if (this.isOuchTime) {
      this.ouchTimer -= this.ouchTimerDec;
      if (this.ouchTimer < 0) {
        this.ouchTimer = this.ouchTimerMax;
        this.isOuchTime = false;
      }
    }
  }
  
  setOuchStatus(status) {
    this.isOuchTime = status;
  }
  
  getOuchStatus() {
    return this.isOuchTime;
  }
  
  updateBullets() {
  for (let i = this.bullets.length - 1; i >= 0; i--) {
    this.bullets[i].update();
    
    // Ensure there's a valid condition to remove bullets
    if (this.hasHitShooter(this.bullets[i]) || this.hasHitMC(this.bullets[i])) {
      this.bullets.splice(i, 1);
      break;
    } else if (this.bullets[i].isOffScreen()) {
      this.bullets.splice(i, 1)
      break;
    }
  }
} // <- Closing brace added here
  
   hasHitShooter(bullet) {
    return people.checkCollision(bullet.x, bullet.y);
  }
  
  hasHitMC(bullet) {
    return mc.checkCollision(bullet.x, bullet.y);
  }

  checkCollision(x, y) {
    if (dist(x, y, player.x + this.imgSzX, player.y + this.imgSzY) < this.collisionSz) {
      return true;
    } else {
      return false;
    }
  }

  constrain() {
    if (this.x <= 0) {
      this.x = 0;
    } else if (this.x > width - this.marginSide) {
      this.x = width - this.marginSide;
    }
  }

  draw() {
    //image(this.image, this.x, this.y, this.image.width / 20, this.image.height / 20);

    this.drawBullets();
  }

  drawBullets() {
    for (let bullet of this.bullets) {
      bullet.draw();
    }
  }

  shoot() {
    if (this.timeSinceLastBullet >= this.bulletDelay) {
      this.bullets.push(new PlayerBullet(this.x + 12, this.y));
      this.timeSinceLastBullet = 0;
    }
    this.timeSinceLastBullet++;
  }

}