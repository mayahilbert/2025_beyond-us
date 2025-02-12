class Face {
  constructor() {
    // face api indices
    this.IDX_MOUTH_TOP = 3;
    this.IDX_MOUTH_BOT = 9;
    this.IDX_JAW_BOT = 7;

    // user-set constants
    this.foreheadSz = 20;
    this.maskMargins = 10;
    
    // face vertical offset
    this.headTop = 0;
    this.floatingSpd = 1;
    this.faceVertOff = 0;
    
    // mouth threshold resize
    this.openThresh = 50;
    
    // mouth pos
    this.midPtX = 0;
    this.midPtY = 0;
  }

  getPosX() {
    return this.midPtX;
  }
  
  getPosY() {
    return this.midPtY;
  }
  
  calcFaceOffset() {    
    return -this.headTop;
  }
  drawCamFeed(video) {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  // image(video, 0, 0, video.width, video.height);
  pop();
}
  drawMask(jawPos) {      

    // num points
    const numPoints = jawPos.length;
    
    // update head top pos
    this.headTop = max(jawPos[numPoints-1]._y, jawPos[0]._y) - this.foreheadSz;
    
    // update face size
    const faceBotPos = jawPos[this.IDX_JAW_BOT]._y;
    const faceTopPos = jawPos[0]._y - this.foreheadSz;
    this.openThresh = (faceBotPos - faceTopPos) * 7;
      }
  
  drawMouthText(mouthPos, mouthText) {
     const scaleX = width / video.width;
  const scaleY = height / video.height;
  const topPt = mouthPos[this.IDX_MOUTH_TOP];
  const botPt = mouthPos[this.IDX_MOUTH_BOT];
  const midPtX = width - (topPt._x * scaleX);
  const midPtY = ((botPt._y + topPt._y) * 0.5) * scaleY;
    stroke(255);
    strokeWeight(2);
    textSize(15);
    text(mouthText, midPtX, midPtY);
    image(birdImg, midPtX, midPtY-10, 50, 50);
  }

  isMouthOpen(mouthPos) {
    // retrieve data
    const topPt = mouthPos[this.IDX_MOUTH_TOP];
    const botPt = mouthPos[this.IDX_MOUTH_BOT];

    // solve for center
    this.midPtX = width - topPt._x;
    this.midPtY = (botPt._y + topPt._y) * 0.5;
    return this.calcMouthDist(topPt, botPt) > this.openThresh;
  }
  
  calcMouthDist(pos_top, pos_bot) {
    return (pos_top._x - pos_bot._x) * (pos_top._x - pos_bot._x) + (pos_top._y - pos_bot._y) * (pos_top._y - pos_bot._y);
  }
}