class People {
  constructor() {
    this.people = this.initializePeople();
  }

  checkCollision(x, y) {
    for (let i = this.people.length - 1; i >= 0; i--) {
      let currentPerson = this.people[i];
      if (
        dist(
          x,
          y,
          currentPerson.x + currentPerson.size,
          currentPerson.y + currentPerson.size
        ) < currentPerson.size
      ) {
        currentPerson.lives--;
        if (currentPerson.lives <= 0) {
          this.people.splice(i, 1);
        }

        if (shoutSound && this.lives > 0) {
          shoutSound.play();
        }

        return true;
      }
    }
    return false;
  }

  addPerson(startX, startY, speed, img) {
    this.people.push(new Person(startX, startY, speed, img));
  }
  initializePeople() {
    let people = [];
    lastSpawnTime = millis(); // Reset spawn timer

    let spawnCount = 4;
    for (let i = 0; i < spawnCount; i++) {
      let startX = Math.random() * 40 - 90; // Random value between -90 and -50
      let startY = Math.random() * (height * 0.5) + height * 0.5; // Random value between height * 0.5 and height - 10
      let speed = Math.random() + 1; // Random value between 1 and 2
      let img = personImgs[Math.floor(Math.random() * personImgs.length)];
      people.push(new Person(startX, startY, speed, img));
    }
    return people;
  }

  checkLength() {
    return this.people.length;
  }
  draw() {
    // Update and display each person
    for (let person of this.people) {
      person.move();
      person.draw();
    }
  }
}
