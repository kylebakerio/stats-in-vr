/* globals AFRAME */

/**
 * Show scene stats in VR.
 */
 
AFRAME.registerComponent('sample-on-event',{
  schema: {
    event: { type: 'string', default: 'buttondown' },
  },
  init() {
    this.el.addEventListener(this.data.event, function (evt) { 
       document.querySelector('[vr-super-stats]').components['vr-super-stats'].sample().then(() => {
          document.querySelector('[vr-super-stats]').components['vr-super-stats'].showSampleCanvas()
       })
    });
  }
});

AFRAME.registerComponent('stats-on-event',{
  schema: {
    event: { type: 'string', default: 'buttondown' },
  },
  init() {
    this.el.addEventListener(this.data.event, function (evt) { 
       document.querySelector('[vr-super-stats]').components['vr-super-stats'].toggle()
    });
  }
});

AFRAME.registerComponent("vr-super-stats", {
  dependencies: ["stats"],

  schema: {
    enabled: { type: "boolean", default: true },
    debug: { type: "boolean", default: false },

    position: { type: "string", default: "0 -1.1 -.5" },
    rotation: { type: "string", default: "-20 0 0" },
    scale: { type: "string", default: "1 .8 1" },

    performancemode: { type: "boolean", default: false }, // set of defaults to focus on making it as light of impact as possible
    throttle: { type: "number", default: 50 }, // how many ms between recalc, has biggest effect on performance (which, here, you can easily see for yourself! hah.)

    backgroundcolor: { type:"color", default: "orange"}, // you can specify semi-transparent colors using css style rgba(r,g,b,a) color declarations as well.

    show2dstats: { type: "boolean", default: true },  // show the built-in 'stats' component when not in VR
    alwaysshow3dstats: { type: "boolean", default: false },  // show this component even when not in VR
    anchorel: { type: "selector", default: "[camera]" }, // anchor in-vr stats to something other than the camera

    showlabels: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load time']}, // please give all inputs in lowercase
    showgraphs: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load time']}, // this will be auto-filtered down to match above, but you can filter down further if you want, say, 4 values in text, but only 1 in graph form. you can also select `null` or `false` or `[]` to turn off all graphs.

    //
    // advanced options:
    // 
    
    // targetmax
    // targetmin
    // samplereport
    // ^ these three are defined below as custom schema options--basically, they take in JSON (if serializing or if defining in HTML, see examples) or straight up JS objects (if adding to scene programatically)    
    
    samplereport: {
      // all numbers in ms
      default: JSON.stringify({
        autostart: false, // if false, can be programtically started by e.g. a button press by calling 
                          // if true, will fire every time `enter-vr` event is triggered
        /*
          const ticksToSample = 600;
          const durationToShowVRSampleReport = 20000 // 20 seconds
          document.querySelector('[vr-super-stats]').components['vr-super-stats'].sample(ticksToSample).then(() => {
              document.querySelector('[vr-super-stats]').components['vr-super-stats'].showSampleCanvas(durationToShowVRSampleReport)
          })
        */
        delay: 0, // if autostart true, how long after app launch to auto-start sampling
        samples: 200, // if autostart true, how many samples to take
        displayDuration: 30000, // how long to leave report up in VR before auto-closing
      }),
      parse(json) {
        let output = typeof json === "string" ? JSON.parse(json) : json; 
        output = {...JSON.parse(this.default), ...output}
        return output
      },
      stringify: JSON.stringify
    },
    

    notargets: { type: "boolean", default: false },
    // thrown in are some sane defaults. This library is written/expects all stats to be given in lowercase everywhere, they will be uppercased as needed.
    // note that you can only have one or the other defined for a given property; for performance, only one will be checked per property. to maximize performance, set no targets.
    targetmax: {
      default: {
        calls: 200, // too many draw calls kills responsiveness
        raf: 15, // needed to keep responsiveness around 60fps
        triangles: 100000, // rough limit for mobile experiences to be smooth
        "load time": 4000, // this is the minimum requirement to be featured on the oculus quest homepage
        points: 15000, // unsure, I've heard 20000 is a drag, but likely lower than that
        entities: 200, // unsure, I'm more familiar with draw calls, suggested improved number here welcome
        // you can specify your own targets for any stats props, and they'll turn red when they rise above target
        // this does come with a small performance penalty
      },
      capLabels: ['geometries','programs','textures','calls','triangles','points','entities','load'], // these props are auto-uppercased once for faster processing in tick handler
      parse: json => {
        const output = typeof json === "string" ? JSON.parse(json) : json; 
        
        const capitalizeWord = function(word) {
          return word[0].toUpperCase() + word.slice(1,word.length)
        }
        Object.keys(output).forEach(label => {
          output[capitalizeWord(label)] = output[label]
        })
        output['Load Time'] = output['Load Time'] || output['load time'] || output['load']; // || output['loadtime'] || output['load_time'] || output['Load'] || output['Load time'] || output['load-time'] ||
        return output;
      },
      stringify: JSON.stringify
    },
    targetmin: {// inverse of targetmax, for values where lower is better
      default: {
        fps: 60, // phones cap at 60, quest 1 aimed for 75 under ideal conditions. quest2 can do 90+ even in A-Frame if you set <a-scene renderer="highRefreshRate:true;">. 60 is minimum to be featured on oculus, 72+ is recommended.
        // you can specify targets for any stats props, and they'll turn red when they fall below target
        // this does come with a small performance penalty
      },
      capLabels: ['geometries','programs','textures','calls','triangles','points','entities','load'], // these props are auto-uppercased once for faster processing in tick handler
      parse: json => {
        const output = typeof json === "string" ? JSON.parse(json) : json; 
        
        const capitalizeWord = function(word) {
          return word[0].toUpperCase() + word.slice(1,word.length)
        }
        Object.keys(output).forEach(label => {
          output[capitalizeWord(label)] = output[label]
        })
        output['Load Time'] = output['Load Time'] || output['load time'] || output['load']; // || output['loadtime'] || output['load_time'] || output['Load'] || output['Load time'] || output['load-time'] ||
        return output;
      },
      stringify: JSON.stringify
    }
  },

  toggle() {
    if (this.data.debug) console.log("toggle enabled to", !this.data.enabled)
    this.data.enabled = !this.data.enabled;
    this.update()
  },
  inVR: false,
  isDefault(prop){
    let result = this.schema[prop].default === this.data[prop];
    if (Array.isArray(this.schema[prop].default) && Array.isArray(this.data[prop])) {
      result = !this.schema[prop].default.some((el,i) => {
        return this.data[prop][i] !== el
      })
    }
    else if (typeof this.schema[prop].default === 'object' && this.schema[prop].default !== null) {
      result = !Object.keys(this.schema[prop].default).some((key) => {
        console.log('compare', this.data[prop][key],this.schema[prop].default[key])
        return this.data[prop][key] !== this.schema[prop].default[key]
      })
    }
    if (!this.data.debug) {
      // don't log
    } else if (!result) {
      console.log("non-default val for",prop, this.schema[prop].default,'is default, vs actual',this.data[prop])
    } else {
      console.log('default for',prop)
    }
    return result
  },
  init: function() {
    if (this.data.debug) {
      console.warn("init vr-super-stats")
    }
    
    this.canvasParent = document.createElement('div');
    this.canvasParent.setAttribute('id','vr-super-stats-canvas-parent')
    this.sceneEl = AFRAME.scenes[0]
    
    if (this.data.performancemode) {
      if (this.data.debug) console.warn("performance mode enabled, setting throttle, hiding graphs and 2d stats, setting solid gray background, setting no targets; debug is on, it is recommended that you turn it off, as logs have a performance cost")
      this.data.throttle = this.isDefault('throttle') ? 250 : this.data.throttle
      this.data.showgraphs = this.isDefault('showgraphs') ? [] : this.data.showgraphs
      this.data.show2dstats = this.isDefault('show2dstats') ? false : this.data.show2dstats
      this.data.backgroundcolor = this.isDefault('backgroundcolor') ? "white" : this.data.backgroundcolor
      this.data.targetmax = this.isDefault('targetmax') ? {} : this.data.targetmax
      this.data.targetmin = this.isDefault('targetmin') ? {} : this.data.targetmin
    }
    
    this.haveTargets = !this.data.notargets && !!(Object.keys(this.data.targetmax).length + Object.keys(this.data.targetmin).length)

    AFRAME.scenes[0].addEventListener('enter-vr', async () => {
      this.inVR = true;
      if (this.data.enabled) {
        if (this.data.debug) console.log("entered VR, showing stats")
        this.show()
        if (this.data.samplereport.autostart) {
          if (this.data.debug) console.log("will autostart sampleReport")
          
          setTimeout(() => {
            document.querySelector('[vr-super-stats]').components['vr-super-stats'].sample(this.data.samplereport.samples).then(() => {
                document.querySelector('[vr-super-stats]').components['vr-super-stats'].showSampleCanvas(this.data.samplereport.displayDuration)
            })
          },this.data.samplereport.delay)
        }
      } else if (this.data.debug) {
        console.warn("vr-super-stats is not enabled")
        this.hide()
      }
    })
    AFRAME.scenes[0].addEventListener('exit-vr', async () => {
      this.inVR = false;
      if (!this.data.alwaysshow3dstats) {
        if (this.data.debug) console.log("hiding VR stats")
        this.hide();
      } else {
        if (this.data.debug) console.log("persistent 3d stats enabled, won't hide")
        this.show()
      }
    })
    
    if (!this.data.show2dstats) {
      if (this.data.debug) console.log("hiding 2d stats panel")
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
      
      const checkIfTrackedLabel = this.rsid.toLowerCase()//.split(" ")[0]
      
      console.log(this.rsid.toLowerCase(), this.idsuffix, checkIfTrackedLabel, this.data.showlabels.includes(checkIfTrackedLabel))
      if (this.data.showlabels.includes(checkIfTrackedLabel)) {
        if (this.data.debug) console.log("include label", i, this.rsid)
        this.labelOrder = this.data.showlabels.findIndex(label => this.rsid.toLowerCase().includes(label));
        this.trackedvalues[this.labelOrder] = i;
      } else if (this.data.debug) {
        console.log("will not show", this.rsid)
      }

      if (this.data.showgraphs.includes(this.rsid.toLowerCase())) {
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
    this.monoImage.setAttribute("id", "aframe-rstats-text");
    this.monoImage.setAttribute("position", {x:0.17, y:1.25, z:0});
    this.monoImage.setAttribute("width", .16);
    this.monoImage.setAttribute("height", .025 * this.trackedvalues.length);
    this.monoImage.setAttribute("src", "#" + this.monoCanvas.id);
    this.statspanel.appendChild(this.monoImage);
    
    this.tickctx = this.monoCanvas.getContext("2d");
  },

  update: function(olddata) {
    if (!this.statspanel || !this.trackedvalues) {
      console.warn("skip initial update",olddata,this.data)
      return;
    } else {
      console.warn("non-skipped update",olddata,this.data)
    }
    this.haveTargets = (this.data.targetmax || this.data.targetmin) && !!Object.keys(this.data.targetmax).length || !!Object.keys(this.data.targetmin).length;
    this.statspanel.setAttribute("position", this.data.position);
    this.statspanel.setAttribute("scale", this.data.scale);
    if (this.tick) this.tick = AFRAME.utils.throttleTick(this.willtick, this.data.throttle, this);
    this.data.enabled ? this.show() : this.hide();
  },

  remove: function() {
    const statsEl = this.sceneEl.components.stats.statsEl;
    statsEl.parentNode.removeChild(statsEl); // interesting...?
  },
  
  tv: {
    node: null,
    tickI: 0,
    tickctx: null,
    label: null,
    value: null,
  },
  tick(){},
  willtick: function() {
    if ((!this.inVR && !this.data.alwaysshow3dstats) || !this.data.enabled) {
      return;
    }
    if (this.trackedvalues.length) {
      this.tickctx.clearRect(0, 0, 192, 16 * this.trackedvalues.length);
      this.tickctx.fillStyle = this.data.backgroundcolor;
      this.tickctx.fillRect(0, 0, 192, 16 * this.trackedvalues.length);
      this.tickctx.font = "12px monospace";
      
      for (this.tv.tickI = 0; this.tv.tickI < this.trackedvalues.length; this.tv.tickI++) {
        this.tv.label = this.rsids[this.trackedvalues[this.tv.tickI]];
        this.tv.value = parseInt(this.rsvalues[this.trackedvalues[this.tv.tickI]].innerText);
        // parseInt is the most performant way to do this, but it would be even better if we could somehow access the raw numbers before they go to HTML. parseInt is about a 60% slowdwon compared to using raw numbers.
        
        this.tickctx.fillStyle = 
          !this.haveTargets || (!this.data.targetmax[this.tv.label] && !this.data.targetmin[this.tv.label]) ? 
            "black" :  
          this.data.targetmax[this.tv.label] ?
            (this.tv.value < this.data.targetmax[this.tv.label] ? "green" : "red") :
            (this.tv.value > this.data.targetmin[this.tv.label] ? "green" : "red") ;
        
        this.tickctx.fillText(
          `${this.tv.label} ${this.tv.value}`, 
          2, 15.5 + (15.5*this.tv.tickI)
        );
        
        this.runSample() // no-op unless sample is active
      }

      for (this.tv.tickI = 0; this.tv.tickI < this.trackedvalues.length*2; this.tv.tickI++) {
        if (this.statspanel.childNodes.item(this.tv.tickI)?.components?.material?.shader){
          this.tv.node = this.statspanel.childNodes.item(this.tv.tickI);
          if (this.tv.node) {
            this.tv.node.components.material.material.map.needsUpdate = true;
          }
        } 
      }
    }
  },
  
  sampleTrack: {
    // set dynamically by runSample()
  },
  stopSample: false,
  sample(sampleCount=this.data.samplereport.samples) {
    return new Promise((resolve, reject) => {
      this.samplesRun = 0;
      this.sampleStart = Date.now()
      const predictedTime = this.data.throttle*sampleCount/1000;
      console.log('Running Sample...')
      console.log('Should theoretically take:',Math.round(predictedTime),'~seconds, at',Math.round(1000/this.data.throttle),'~samples per second')
      console.log('you can check progress while waiting:',`document.querySelector('[vr-super-stats]').components['vr-super-stats'].samplesRun`)
      console.log('you can end sampling at any time:',`document.querySelector('[vr-super-stats]').components['vr-super-stats'].stopSample = true`)

      this.stopSample = true; // kill any currently running sample process
      this.showSampleCanvas(null, !!"load message", sampleCount) // null: ignored when second var is true
      this.runSample = () => {
        if (this.tv.tickI === 0) this.samplesRun++

        if (this.samplesRun === 1) {
          this.stopSample = false;
          this.sampleTrack[this.tv.label] = {
            total: 0,
            high: 0,
            low: Infinity,
          }
        }

        if (this.samplesRun < sampleCount && !this.stopSample) {
          this.sampleTrack[this.tv.label].total += this.tv.value
          this.sampleTrack[this.tv.label].high = this.sampleTrack[this.tv.label].high > this.tv.value ? this.sampleTrack[this.tv.label].high : this.tv.value
          this.sampleTrack[this.tv.label].low = this.sampleTrack[this.tv.label].low < this.tv.value ? this.sampleTrack[this.tv.label].low : this.tv.value
          
          this.showSampleCanvas(null, !!"loading message", sampleCount)
        } else {
          const duration = (Date.now() - this.sampleStart)/1000;
          const expectedTime = this.data.throttle*this.samplesRun/1000 // different than predictedTime, because could be stopped earlyer with this.stopSample

          this.sampleReport  = `Sample Report:\n`;
          this.sampleReport += `samples: ${this.samplesRun} ticks @ ${this.data.throttle}ms throttle\n`
          this.sampleReport += `duration: ${duration} sec (vs. ${expectedTime} sec expected)\n`
          this.sampleReport += `throttle lag: ${Math.round( ((duration-expectedTime) / expectedTime) * 10000)/100}%\n`
          this.sampleReport += `\nstat     | average  | high    | low`
          this.sampleReport += `\n-------------------------------------`

          Object.keys(this.sampleTrack).forEach(label => {
            this.sampleReport += `\n${label}|${Math.round((this.sampleTrack[label].total/this.samplesRun)*100)/100}|${this.sampleTrack[label].high}|${this.sampleTrack[label].low}`; // line format is critical for canvas function
            delete this.sampleTrack[label];
          });

          console.log(this.sampleReport);

          this.runSample = () => {};
          this.stopSample = false;
          resolve();
        }
      };
    })
  },
  runSample() {}, // dynamically set by calling sample()
  showSampleCanvas(displayDuration=this.data.samplereport.displayDuration,waiting=false,samplesToRun=null) { // second two options used only for waiting screen
    clearInterval(this.sampleCanvasHideTimeout); // if there's already a canvas showing (we started and finished recording while prior result were already displaying), we need to cancel the 'hide' timeout from that one and restart it now.
    
    const sampleLines = this.sampleReport?.split("\n");

    if (!this.sampleCanvas) {
      this.sampleCanvas = document.createElement('canvas');
      this.sampleCanvas.setAttribute("id", "sample-canvas");
      this.sampleCanvas.setAttribute("width", 315);
      this.sampleCanvas.setAttribute("height", 16* (sampleLines?.length || 1));
      this.sampleCanvas.setAttribute("crossorigin", "anonymous");
      this.samplectx = this.sampleCanvas.getContext("2d");
      this.canvasParent.appendChild(this.sampleCanvas)
      
      this.sampleImage = document.createElement("a-image");
      this.sampleImage.setAttribute("id", "aframe-sample-text");
      this.sampleImage.setAttribute("position", {x:0, y:1.6, z:0});
      this.sampleImage.setAttribute("width", .396);
      this.sampleImage.setAttribute("height", .025 * (sampleLines?.length || 1));
      this.sampleImage.setAttribute("src", "#" + this.sampleCanvas.id);
      this.statspanel.appendChild(this.sampleImage);
    }
    
    if (waiting) {
      if (!this.sampleImage.getAttribute('material')?.visible) {
        if (this.data.debug) console.log("will show waiting message while sampling",displayDuration)
        this.sampleCanvas.setAttribute("height", 16);
        this.sampleImage.setAttribute("height", .025);
        
        // this.sampleCanvas.setAttribute("height", 16* (this.trackedvalues.length));
        // this.sampleImage.setAttribute("height", .025 * (this.trackedvalues.length));
      } else {
        // console.log("won't set height")
      }

      this.samplectx.clearRect(0, 0, 315, 16);
      this.samplectx.fillStyle = this.data.backgroundcolor;
      this.samplectx.fillRect(0, 0, 315 * (this.samplesRun/samplesToRun), 16);

      this.samplectx.font = "12px monospace";      
      this.samplectx.fillStyle = "black"
      this.samplectx.fillText(
        `sampling... ${this.samplesRun}/${samplesToRun}`,
        2, 15
      );
    } else {
      if (this.data.debug) console.log("will show report")
      this.sampleCanvas.setAttribute("height", 16* (sampleLines.length));
      this.sampleImage.setAttribute("height", .025 * (sampleLines.length));
      
      this.samplectx.clearRect(0, 0, 315, 16 * (sampleLines.length));
      this.samplectx.fillStyle = this.data.backgroundcolor;
      this.samplectx.fillRect(0, 0, 315, 16 * (sampleLines.length));
      this.samplectx.font = "12px monospace";

      for (let i = 0; i < sampleLines.length; i++) {
        const potentialLabel = sampleLines[i].trim().split('|')[0];
        // let labelIndex = null;
        if (this.rsids.includes(potentialLabel)) {
          // console.log("found label", potentialLabel)
          // labelIndex = this.rsids.indexOf(potentialLabel);

          this.samplectx.fillStyle = "black"
          this.samplectx.fillText(
            potentialLabel,
            2, 15.5 + (15.5*i)
          );

          sampleLines[i].split("|").forEach((chunk,x) => {
            if (x !== 0) {
              const value = chunk;

              this.samplectx.fillStyle = 
                !this.haveTargets || (!this.data.targetmax[potentialLabel] && !this.data.targetmin[potentialLabel]) ? 
                  "black" :  
                this.data.targetmax[potentialLabel] ?
                  (value < this.data.targetmax[potentialLabel] ? "green" : "red") :
                  (value > this.data.targetmin[potentialLabel] ? "green" : "red") ;

              // console.log(chunk,this.samplectx.fillStyle)
              this.samplectx.fillText(chunk, x*(315/4) || 2, 15.5 + (15.5*i))
            }

          })
        } else {
          // console.log("not label", potentialLabel)
          this.samplectx.fillStyle = "black"

          this.samplectx.fillText(
            sampleLines[i], 
            2, 15.5 + (15.5*i)
          );
        }
      }
      this.sampleCanvasHideTimeout = setTimeout(this.hideSampleCanvas.bind(this), displayDuration);
    }
    this.sampleImage.setAttribute('material','visible','true');
    
  },
  hideSampleCanvas() {
    if (this.data.debug) console.warn("will hide sample report canvas")
    this.sampleImage.setAttribute('material','visible','false')
  },
  

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
