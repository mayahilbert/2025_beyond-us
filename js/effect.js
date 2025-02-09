window.addEventListener("load", () => {

  // set up our WebGL context and append the canvas to our wrapper
  const curtains = new Curtains({
      container: "canvas",
      antialias: false, // render targets will disable default antialiasing anyway
      pixelRatio: Math.min(1.5, window.devicePixelRatio) // limit pixel ratio for performance
  });

  curtains.onError(() => {
      // we will add a class to the document body to display original images
      document.body.classList.add("no-curtains", "planes-loaded");
  }).onContextLost(() => {
      // on context lost, try to restore the context
      curtains.restoreContext();
  });

      // track the mouse positions to send it to the shaders
      const mousePosition = new Vec2();
      // we will keep track of the last position in order to calculate the movement strength/delta
      const mouseLastPosition = new Vec2();
  
      const deltas = {
          max: 0,
          applied: 0,
      };
  
  
  // we will keep track of all our planes in an array
  const planes = [];
  let planesDeformations = 0;

  // get our planes elements
  let planeElements = document.getElementsByClassName("plane");


  const vs = `
  precision mediump float;
  // default mandatory variables
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  
  // our texture matrix uniform
  uniform mat4 simplePlaneTextureMatrix;
  // custom variables
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMousePosition;
  uniform float uMouseMoveStrength;
  void main() {
      vec3 vertexPosition = aVertexPosition;
      // get the distance between our vertex and the mouse position
      float distanceFromMouse = distance(uMousePosition, vec2(vertexPosition.x, vertexPosition.y));
      // calculate our wave effect
      float waveSinusoid = cos(5.0 * (distanceFromMouse - (uTime / 75.0)));
      // attenuate the effect based on mouse distance
      float distanceStrength = (0.4 / (distanceFromMouse + 0.4));
      // calculate our distortion effect
      float distortionEffect = distanceStrength * waveSinusoid * uMouseMoveStrength;
      // apply it to our vertex position
      vertexPosition.z +=  distortionEffect / 30.0;
      vertexPosition.x +=  (distortionEffect / 30.0 * (uResolution.x / uResolution.y) * (uMousePosition.x - vertexPosition.x));
      vertexPosition.y +=  distortionEffect / 30.0 * (uMousePosition.y - vertexPosition.y);
      gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
      // varyings
      vTextureCoord = (simplePlaneTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
      vVertexPosition = vertexPosition;
  }
  `;

  const fs = `
  precision mediump float;
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;
  uniform sampler2D simplePlaneTexture;
  void main() {
      // apply our texture
      vec4 finalColor = texture2D(simplePlaneTexture, vTextureCoord);
      // fake shadows based on vertex position along Z axis
      finalColor.rgb -= clamp(-vVertexPosition.z, 0.0, 1.0);
      // fake lights based on vertex position along Z axis
      finalColor.rgb += clamp(vVertexPosition.z, 0.0, 1.0);
      // handling premultiplied alpha (useful if we were using a png with transparency)
      finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);
      gl_FragColor = finalColor;
  }
  `;

  // all planes will have the same parameters
  const params = {
      vertexShader: vs,
      fragmentShader: fs,
      widthSegments: 20,
      heightSegments: 20,
      drawCheckMargins: {
          top: 100,
          right: 0,
          bottom: 100,
          left: 0,
      },
      uniforms: {
          planeDeformation: {
              name: "uPlaneDeformation",
              type: "1f",
              value: 0,
          },
          resolution: { // resolution of our plane
            name: "uResolution",
            type: "2f", // notice this is an length 2 array of floats
            value: [planeElements[0].clientWidth, planeElements[0].clientHeight],
        },
        time: { // time uniform that will be updated at each draw call
            name: "uTime",
            type: "1f",
            value: 0,
        },
        mousePosition: { // our mouse position
            name: "uMousePosition",
            type: "2f", // again an array of floats
            value: mousePosition,
        },
        mouseMoveStrength: { // the mouse move strength
            name: "uMouseMoveStrength",
            type: "1f",
            value: 0,
        }
      }
  };

  // add our planes and handle them
  for(let i = 0; i < planeElements.length; i++) {
      planes.push(new Plane(curtains, planeElements[i], params));

      handlePlanes(i);
  }


  // handle all the planes
  function handlePlanes(index) {
      const plane = planes[index];

      // check if our plane is defined and use it
      plane.onError(() => {
          console.log("plane error", plane);
      }).onReady(() => {
          // once everything is ready, display everything
          if(index === planes.length - 1) {
              document.body.classList.add("planes-loaded");
          }

          // set a fov of 35 to reduce perspective (we could have used the fov init parameter)
          plane.setPerspective(35);

        // apply a little effect once everything is ready
        deltas.max = 9;

        // now that our plane is ready we can listen to mouse move event
        const wrapper = document.getElementById("page-wrap");

        wrapper.addEventListener("mousemove", (e) => {
            handleMovement(e, plane);
        });

        wrapper.addEventListener("touchmove", (e) => {
            handleMovement(e, plane);
        }, {
            passive: true
        });
      }).onRender(() => {
          // update the uniform
          plane.uniforms.planeDeformation.value = planesDeformations;
          // increment our time uniform
          plane.uniforms.time.value++;

        // decrease both deltas by damping : if the user doesn't move the mouse, effect will fade away
        deltas.applied += (deltas.max - deltas.applied) * 0.02;
        deltas.max += (0 - deltas.max) * 0.01;

        // send the new mouse move strength value
        plane.uniforms.mouseMoveStrength.value = deltas.applied;

      }).onAfterResize(() => {
        const planeBoundingRect = plane.getBoundingRect();
        plane.uniforms.resolution.value = [planeBoundingRect.width, planeBoundingRect.height];
    });

      // handle the mouse move event
      function handleMovement(e, plane) {
        // update mouse last pos
        mouseLastPosition.copy(mousePosition);

        const mouse = new Vec2();

        // touch event
        if(e.targetTouches) {
            mouse.set(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        }
        // mouse event
        else {
            mouse.set(e.clientX, e.clientY);
        }

        // lerp the mouse position a bit to smoothen the overall effect
        mousePosition.set(
            curtains.lerp(mousePosition.x, mouse.x, 0.3),
            curtains.lerp(mousePosition.y, mouse.y, 0.3)
        );

        // convert our mouse/touch position to coordinates relative to the vertices of the plane and update our uniform
        plane.uniforms.mousePosition.value = plane.mouseToPlaneCoords(mousePosition);

        // calculate the mouse move strength
        if(mouseLastPosition.x && mouseLastPosition.y) {
            let delta = Math.sqrt(Math.pow(mousePosition.x - mouseLastPosition.x, 2) + Math.pow(mousePosition.y - mouseLastPosition.y, 2)) / 30;
            delta = Math.min(4, delta);
            // update max delta only if it increased
            if(delta >= deltas.max) {
                deltas.max = delta;
            }
        }
    }
  }


  });




  