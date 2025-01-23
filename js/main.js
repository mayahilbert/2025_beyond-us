const $bigBall = document.querySelector(".cursor__ball--big");
//const $smallBall = document.querySelector(".cursor__ball--small");
const $hoverables = document.querySelectorAll("a");

// Listeners
document.body.addEventListener("mousemove", onMouseMove);
for (let i = 0; i < $hoverables.length; i++) {
  $hoverables[i].addEventListener("mouseenter", onMouseHover);
  $hoverables[i].addEventListener("mouseleave", onMouseHoverOut);
}

// Move the cursor
function onMouseMove(e) {
  TweenMax.to($bigBall, 0.4, {
    x: e.clientX - 15,
    y: e.clientY - 15,
  });
  //TweenMax.to($smallBall, 0.1, {
  //  x: e.clientX - 5,
  //  y: e.clientY - 7,
  //});
}

// // Hover an element
function onMouseHover() {
  TweenMax.to($bigBall, 0.3, {
    scale: 1.5,
  });
  //TweenMax.to($smallBall, 0.3, {
  //  scale: 0.8,
  //});
}
function onMouseHoverOut() {
  TweenMax.to($bigBall, 0.3, {
    scale: 1,
  });
  //TweenMax.to($smallBall, 0.3, {
  //  scale: 1,
  //});
}

const vidContainers = document.querySelectorAll(".vid-container");
vidContainers.forEach((el) =>
  el.addEventListener("click", (event) => {
    playVideo(el);
  })
);

function playVideo(thisVid) {
  var thisVideo = thisVid;

  var playButton = thisVideo.querySelectorAll(".playbutton")[0];
  var player = thisVideo.querySelectorAll("iframe")[0];
  var vimeoplayer = new Vimeo.Player(player);

  $(playButton).addClass("hide");
  $(thisVideo).addClass("show");
  vimeoplayer.play();

  $($bigBall).addClass("cursor-hide");
  //$($smallBall).addClass("cursor-hide");
}

//const arrowScroll = gsap.timeline({ repeat: -1 });

//arrowScroll
//  .fromTo(
//    ".arrow--down",
//    { yPercent: 0 },
//    { yPercent: 100, ease: "none", duration: 5 },
//    0
//  )
//  .fromTo(
//    ".arrow--down-2",
//    { yPercent: -100 },
//    { yPercent: 0, ease: "none", duration: 5 },
//    0
//  );


