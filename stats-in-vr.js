/* globals AFRAME */

/**
 * Show scene stats in VR.
 */
const capitalizeWord = function(word) {
  return word[0].toUpperCase() + word.slice(1,word.length)
}

AFRAME.registerComponent("stats-in-vr", {
  dependencies: ["stats"],

  schema: {
    enabled: { type: "boolean", default: true },
    debug: { type: "boolean", default: false },
    
    position: { type: "string", default: "0 -1.1 -1" },
    rotation: { type: "string", default: "-20 0 0" },
    scale: { type: "string", default: "1 .8 1" },
    
    performancemode: { type: "boolean", default: false }, // set of defaults to focus on making it as light of impact as possible
    throttle: { type: "number", default: 50 }, // how many ms between recalc, has biggest effect on performance (try it out for yourself! hah)
    
    backgroundcolor: { type:"color", default: "rgba(255, 255, 255, 0.5)"}, // you can specify solid colors to be slightly more performant
    
    show2dstats: { type: "boolean", default: true },  // show the built-in 'stats' component when not in VR
    alwaysshow3dstats: { type: "boolean", default: false },  // show this component even when not in VR
    anchorel: { type: "selector", default: "[camera]" }, // anchor in-vr stats to something other than the camera
    
    showlabels: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load time']}, // please give all inputs in lowercase
    showgraphs: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load time']}, // this will be auto-filtered down to match above, but you can filter down further if you want, say, 4 values in text, but only 1 in graph form. you can also select `null` or `false` or `[]` to turn off all graphs.
    
    targetMax: {
      default: JSON.stringify({
        Calls: 200, // 
        raf: 15, // needed to keep responsiveness around 60fps
        Triangles: 100000,
        // you can specify your own targets for any stats props, and they'll turn red when they rise above target
        // this does come with a small performance penalty
      }),
      capLabels: ['geometries','programs','textures','calls','triangles','points','entities','load'], // these props are auto-uppercased once for faster processing in tick handler
      parse: json => {
        const output = typeof json === "string" ? JSON.parse(json) : json; 
        Object.keys(output).forEach(label => {
          output[capitalizeWord(label)] = output[label]
        })
        return output;
      },
      stringify: JSON.stringify
    },
    targetMin: {// inverse of targetMax, for values where lower is better
      default: JSON.stringify({
        fps: 75,
        // you can specify targets for any stats props, and they'll turn red when they fall below target
        // this does come with a small performance penalty
      }),
      capLabels: ['geometries','programs','textures','calls','triangles','points','entities','load'], // these props are auto-uppercased once for faster processing in tick handler
      parse: json => {
        const output = typeof json === "string" ? JSON.parse(json) : json; 
        Object.keys(output).forEach(label => {
          output[capitalizeWord(label)] = output[label]
        })
        return output;
      },
      stringify: JSON.stringify
    }
  },
  
  inVR: false,
  init: function() {
    console.warn("init")
    this.haveTargets = !!(Object.keys(this.data.targetMax).length + Object.keys(this.data.targetMin).length)
    this.canvasParent = document.createElement('div');
    this.canvasParent.setAttribute('id','stats-in-vr-canvas-parent')
    this.sceneEl = AFRAME.scenes[0]
    
    if (this.data.performancemode) {
      if (this.data.debug) console.warn("performance mode enabled, setting throttle, hiding graphs and 2d stats, grayscale, no targets")
      this.data.throttle = 250
      this.data.showgraphs = []
      this.data.show2dstats = false
      this.data.color = "white"
      this.data.targets = {}
    }

    AFRAME.scenes[0].addEventListener('enter-vr', async () => {
      this.inVR = true;
      if (this.data.enabled) {
        console.warn("entered VR, showing stats")
        this.show()
      } else if (this.data.debug) {
        console.warn("not showing because disabled")
      }
    })
    AFRAME.scenes[0].addEventListener('exit-vr', async () => {
      this.inVR = false;
      if (!this.data.alwaysshow3dstats) {
        console.warn("hiding VR stats")
        this.hide();
      } else {
        console.warn("persistent 3d stats enabled, won't hide")
      }
    })
    
    if (!this.data.show2dstats) {
      if (this.data.debug) console.warn("hiding 2d stats panel")
      this.sceneEl.components.stats.statsEl.style = 'display: none !important;';
      this.sceneEl.components.stats.statsEl.className = 'a-hidden';
    }

    this.begin();
  },
  
  begin: async function() {
    // once we start rendering, create VR stats panel
    if (this.sceneEl.renderStarted) {
      await this.createStatsPanel();
    } else {
      this.sceneEl.addEventListener("renderstart", this.createStatsPanel.bind(this));
    }
  },

  createStatsPanel: async function() {
    // attached to scene element, so inject stats panel into camera
    this.statspanel = document.createElement("a-entity");
    this.statspanel.setAttribute("id", "statspanel");
    this.statspanel.setAttribute("position", this.data.position);
    this.statspanel.setAttribute('rotation', this.data.rotation);
    this.statspanel.setAttribute("scale", this.data.scale);
    this.statspanel.setAttribute(
      "visible",
      this.data.enabled ? "true" : "false"
    );
    this.data.anchorel.appendChild(this.statspanel);
    
    if (this.data.debug) {
      // put our canvas where it is visible to observe without being put in 3d space, instead of somewhere it can't be seen.
      this.sceneEl.components.stats.statsEl.appendChild(this.canvasParent);
    }
    else {
      document.body.appendChild(this.canvasParent);
    }
    
    await this.setupData();
    this.tick = AFRAME.utils.throttleTick(this.willtick, this.data.throttle, this);
    if (this.data.alwaysshow3dstats || this.inVR) {
      this.show();
    }
    else if (!this.inVR) {
      this.hide();
    }
  },
  
  waitForTime: async function(ms) {
    return new Promise((res,rej) => {
      setTimeout(res,ms)
    })
  },
  
  setupData: async function() {
    if (this.data.debug) console.warn("calling setupData")
    // method:
    // store stat labels
    // store stat values
    // make a canvas
    // make picture with prior canvas as source
    // attach picture to statspanel entity
    // set canvas in the canvas ctx within the tick function (weird?)
    // label the item as needing an update to rendered
    
    if (!this.statspanel) return
    
    if (!document.querySelectorAll(".rs-canvas").length) {
      if (this.data.debug) console.log("no canvases, recurse in ", 100)
      await this.waitForTime(100)
      return await this.setupData()
    }

    this.trackedvalues = [];
    this.rsids = [];
    this.rsvalues = [];
    this.stats = [];
    
    
    if (!this.rscanvases) {
      this.rscanvases = document.querySelectorAll(".rs-canvas");
    }
    
    for (let i = 0; i < this.rscanvases.length; i++) {
      this.rsparent = this.rscanvases[i].parentElement;
      this.rsid = this.rsparent.querySelector(".rs-counter-id").innerText; // label

      if (this.rsids.indexOf(this.rsid) >= 0) {
        continue;
      }

      // remember labels and value elements
      this.rsids[i] = this.rsid;
      this.rsvalues[i] = (this.rsparent.querySelector(".rs-counter-value")); // value

      // inject id values for rstats canvases
      this.idsuffix = this.rsids[i].replace(" ", "_");
      this.rscanvases[i].id = "rstats-" + this.idsuffix;
      
      if (this.data.showalllabel || this.data.showlabels.includes(this.rsid.toLowerCase())) {
        if (this.data.debug) console.log("include label", i, this.rsid)
        this.labelOrder = this.data.showlabels.findIndex(label => this.rsid.toLowerCase().includes(label));
        this.trackedvalues[this.labelOrder] = i;
      } else if (this.data.debug) {
        console.log("will not show", this.rsid)
      }

      if (this.data.showallgraphs || this.data.showgraphs.includes(this.rsid.toLowerCase())) {
        if (this.data.debug && !this.data.showlabels.includes(this.rsid.toLowerCase())) {
          console.warn("will not show graph without matching label",this.rsid)
          continue
        } // else
        this.yval = ( ( (1.25 - (.0125*(this.data.showlabels.length-1))) + ((this.data.showlabels.length-1) * .025) ) - (this.labelOrder * 0.025));
        // this.yval = ( 1.25 + (this.data.showlabels.length * .0125) )
        if (this.data.debug) console.log("include graph", i, this.trackedvalues.length, this.rsid,this.yval,this.labelOrder)        
        this.stats[i] = document.createElement('a-image'); // aframe VR image that will have the DOM's graph canvas given as texture
        this.stats[i].setAttribute('position', {x:-0.08, y:this.yval, z:0});
        this.stats[i].setAttribute('width', 0.34);
        this.stats[i].setAttribute('height', 0.025);
        this.stats[i].setAttribute('id', this.rsid + '-reflector');
        this.stats[i].setAttribute('src', '#' + this.rscanvases[i].id);
        this.statspanel.appendChild(this.stats[i]);
      }
    }
    
    this.monoCanvas = document.createElement('canvas');
    this.monoCanvas.setAttribute("id", "value-monocanvas");
    this.monoCanvas.setAttribute("width", 128);
    this.monoCanvas.setAttribute("height", 16*this.trackedvalues.length);
    this.monoCanvas.setAttribute("crossorigin", "anonymous");
    this.canvasParent.appendChild(this.monoCanvas)
    
    this.monoImage = document.createElement("a-image");
    this.monoImage.setAttribute("id", "aframe-all");
    this.monoImage.setAttribute("position", {x:0.17, y:1.25, z:0});
    this.monoImage.setAttribute("width", .16);
    this.monoImage.setAttribute("height", .025 * this.trackedvalues.length);
    this.monoImage.setAttribute("src", "#" + this.monoCanvas.id);
    this.statspanel.appendChild(this.monoImage);
  },

  update: function(olddata) {
    if (!this.statspanel) {
      console.warn("skip initial update",olddata,this.data)
      return;
    } else {
      console.warn("non-skipped update",olddata,this.data)
    }
    this.haveTargets = !!Object.keys(this.data.targets).length;
    this.statspanel.setAttribute("position", this.data.position);
    this.statspanel.setAttribute("scale", this.data.scale);
    this.tick = AFRAME.utils.throttleTick(this.willtick, this.data.throttle, this);
    return this.data.enabled ? this.show() : this.hide();
  },

  remove: function() {
    const statsEl = this.sceneEl.components.stats.statsEl;
    statsEl.parentNode.removeChild(statsEl); // interesting...?
  },
  
  newText: "",
  node: null,
  tick(){},
  willtick: function() {
    if (!this.inVR && !this.data.alwaysshow3dstats) {
      return;
    }
    if (this.trackedvalues.length) {
      // this.newText = "";
      this.tickctx = this.monoCanvas.getContext("2d"); // remove this line from tick function
      this.tickctx.clearRect(0, 0, 192, 16 * this.trackedvalues.length);
      this.tickctx.fillStyle = this.data.backgroundcolor;
      this.tickctx.fillRect(0, 0, 192, 16 * this.trackedvalues.length);
      this.tickctx.font = "12px monospace";
      
      for (this.tickI = 0; this.tickI < this.trackedvalues.length; this.tickI++) {
        this.tickctx.fillStyle = 
          !this.haveTargets || (!this.data.targetMax[this.rsids[this.trackedvalues[this.tickI]]] && !this.data.targetMin[this.rsids[this.trackedvalues[this.tickI]]]) ? 
            "black" :  
          this.data.targetMax[this.rsids[this.trackedvalues[this.tickI]]] ?
            (parseInt(this.rsvalues[this.trackedvalues[this.tickI]].innerText) < this.data.targetMax[this.rsids[this.trackedvalues[this.tickI]]] ? "green" : "red") :
            (parseInt(this.rsvalues[this.trackedvalues[this.tickI]].innerText) > this.data.targetMin[this.rsids[this.trackedvalues[this.tickI]]] ? "green" : "red") ;
            // parseInt is the most performant way to do this, but it would be even better if we could somehow access the raw numbers before they go to HTML. parseInt is about a 60% slowdwon compared to using raw numbers.
        
        this.tickctx.fillText(
          `${this.rsids[this.trackedvalues[this.tickI]]} ${this.rsvalues[this.trackedvalues[this.tickI]].innerText}`, 
          2, 15.5 + (15.5*this.tickI)
        );
      }

      for (this.tickI = 0; this.tickI < this.trackedvalues.length*2; this.tickI++) {
        if (this.statspanel.childNodes.item(this.tickI)?.components?.material?.shader){
          this.node = this.statspanel.childNodes.item(this.tickI);
          if (this.node) {
            this.node.components.material.material.map.needsUpdate = true;
          }
        } 
      }
    }
  },
  tickI: 0,
  tickctx: null,

  hide: function() {
    if (this.data.debug) {
      console.warn("will hide")
    }
    if (this.statspanel) {
      this.statspanel.object3D.visible = false;
    }
    if (!this.data.show2dstats) {
      this.sceneEl.components.stats.statsEl.style = 'display: none !important;';
      this.sceneEl.components.stats.statsEl.className = 'a-hidden';
    } else {
      this.sceneEl.components.stats.statsEl.classList.remove("a-hidden");
      this.sceneEl.components.stats.statsEl.style = "";
    }
  },

  show: function() {
    if (this.statspanel) {
      this.statspanel.object3D.visible = true;
    }
  }
});
