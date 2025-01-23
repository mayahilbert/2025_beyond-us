class WEBGL {
    constructor(set) {
      this.curtains = new Curtains({ container: "canvas" });
      this.planeElement = set.planeElement;
      this.mouse = {
        x: 0,
        y: 0
      };
      this.font = 'a'
      this.params = {
        vertexShader: document.getElementById("vs").textContent, // our vertex shader ID
        fragmentShader: document.getElementById("fs").textContent, // our framgent shader ID
        uniforms: {
          time: {
            name: "uTime", // uniform name that will be passed to our shaders
            type: "1f", // this means our uniform is a float
            value: 0
          },
          mousepos: {
            name: "uMouse",
            type: "2f",
            value: [0, 0]
          },
          resolution: {
            name: "uReso",
            type: "2f",
            value: [0, 0]
          },
          progress: {
            name: "uProgress",
            type: "1f",
            value: 0
          }
        }
      };
    }
  

  
    async createCanvas(plane, canvas) {
      
      const boundingPlane = plane.getBoundingRect();
  
      const planeElement = plane.htmlElement;
      // get styles of the h1 title
      const textStyles = window.getComputedStyle(planeElement.children[0]);
  
      const relWidth = boundingPlane.width / this.curtains.pixelRatio;
      const relHeight = boundingPlane.height / this.curtains.pixelRatio;
  
      const ctx2d = canvas.getContext("2d");
  
      canvas.width = ctx2d.width = relWidth;
      canvas.height = ctx2d.height = relHeight;
  
      // set styles at text
      ctx2d.fillStyle = textStyles.color;
      ctx2d.font = `${textStyles.fontWeight} ${textStyles.fontSize} ${
        this.font.family
      }`;
  
      // text baseline and text align
      ctx2d.textBaseline = "middle";
      ctx2d.textAlign = "center";
  
      // draw the text in the midlle or our plane
      ctx2d.fillText(planeElement.textContent, relWidth / 2, relHeight / 2);
  
      // update our canvas texture once on next draw call
      if (plane.textures.length > 0) {
        plane.textures[0].needUpdate();
      }
    }
  
    initPlane() {
      // create our plane mesh
      this.plane = this.curtains.addPlane(this.planeElement, this.params);
  
      // use the onRender method of our plane fired at each requestAnimationFrame call
  
      if (this.plane) {
        const text = this.plane.htmlElement.textContent;
  
        const canvas = document.createElement("canvas");
        this.createCanvas(this.plane, canvas);
        canvas.setAttribute("data-sampler", "planeTexture");
        this.plane.loadCanvas(canvas);
  
        this.plane.setScale(1, 1);
  
        this.plane.onReady(() => {
          this.plane.uniforms.resolution.value = [
            this.plane.getBoundingRect().width,
            this.plane.getBoundingRect().height
          ];
  
          this.plane.textures[0].shouldUpdate = false;
  
          this.update();
          this.initEvents(canvas);
        });
      }
    }
  
    update() {
      this.plane.onRender(() => {
        this.plane.updatePosition();
  
        this.plane.uniforms.time.value += 0.01; // update our time uniform value
      });
    }
  
    initEvents(canvas) {
      window.addEventListener("mousemove", e => {
        const x = e.clientX;
        const y = innerHeight - e.clientY;
  
        TweenMax.to(this.plane.uniforms.mousepos.value, 0.7, {
          0: x,
          1: y
        });
      });
  
      window.addEventListener("resize", () => {
        this.plane.uniforms.resolution.value = [
          this.plane.getBoundingRect().width,
          this.plane.getBoundingRect().height
        ];
  
        this.createCanvas(this.plane, this.plane.textures[0].source);
      });
    }
  }
  
  const webgl = new WEBGL({
    planeElement: document.querySelector(".title-hero")
  });
  
  webgl.initPlane();
  