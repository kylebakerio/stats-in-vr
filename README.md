![sample-report-3](https://user-images.githubusercontent.com/6391152/130512748-a3dcea0c-38ff-4744-bf9a-54c23f3d85e5.png)

# features
- get stats component data in VR, while you're actually using your app
- high performance, just one canvas/image draw-call texture for all stats (though each graph is its own canvas/image/draw-call, if you include those)
- uses existing stats component under the hood, so same numbers, no re-inventing the wheel
- pick which stats you want to track, reduce clutter
- throttle to as smooth or as performance sensitive as you want
- pick background color, including optional opacity
- include some, all, or no graphs
- attaches to camera by default, but can attach anywhere in-scene you want
- default behavior is to display when enter-vr, and hide and show `stats` when exit-vr, but behavior can be specified with options
- set targets for maximum or minimum stats values, which will cause numbers to be red or green accordingly
- by default, shows all stats and graphs and has some opacity, and some default target values for the major stats
- if you prefer the lightest weight option instead, just set `performancemode='true;'` and `showlabels:fps,raf;` (or exactly whatever stats you want to track).
- **track live performance and view in-VR reports on caverage/high/low within sample period at a sample rate you determine**
- helper components for activating on events (e.g. `buttondown` event from `tracked-controller`)

## yet another necro component pulled into service

I've wanted this for a while, but I googled, found this, and then found what looked like a [promising pull request](https://github.com/chenzlabs/stats-in-vr/pull/1
). It hadn't been touched in 5 years, so I've spent some time updating it, improving it, making it faster, lighter, and adding features.

You can access it through jsdelivr's cdn here: https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.3.0/stats-in-vr.js

stats-in-vr component for [A-Frame](https://aframe.io).

![stats-in-vr](https://user-images.githubusercontent.com/6391152/130007970-a512c190-0a4e-4f0d-8c40-0d8e1e9e58e8.png)
![orange](https://user-images.githubusercontent.com/6391152/130179324-d68f276d-1ccf-4f7c-90fc-1a872bb4fe61.png)
![some-graphs-only](https://user-images.githubusercontent.com/6391152/130179339-85f94d50-414a-43ae-b9c7-53304a245921.png)
![allgraphs-opacity](https://user-images.githubusercontent.com/6391152/130179350-8eac1d93-beda-4175-aa1b-7d6ecb829e61.png)
![sample-report-2](https://user-images.githubusercontent.com/6391152/130513640-53b73d1c-ff60-40fb-94c4-0a5d014c9d46.png)


## Installation

#### Browser

Install and use by directly including the [browser file](https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.3.0/stats-in-vr.js):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.3.3/stats-in-vr.js"></script>
</head>

<body>
  <a-scene stats-in-vr></a-scene>
</body>
```


## Examples

### default behavior:
when you enter VR, full stats get attached to your face, about half a meter down and forward from you. When you are not in VR, you see the normal 2d stats.
```html
<a-scene stats-in-vr></a-scene>
```

### just want fps and triangles and raf, and graphs for only the first two
```html
<a-scene stats-in-vr="showlabels:fps,raf,triangles; showgraphs:fps,raf"></a-scene>
```

### no graphs, just numbers please
takes up less space and reduces overhead
```html
<a-scene stats-in-vr="showgraphs:null;"></a-scene>
```

### high performance mode defaults?
bare minimum makes for the lighest tick, producing the purest readings possible
```html
<a-scene stats-in-vr="performancemode:true;"></a-scene>
```

### no targets
improves performance
```html
<a-scene stats-in-vr="targetmax:{};targetmin:{}"></a-scene>
```

### custom targets
shoot high, or shoot low, based on your platform
```html
<a-scene stats-in-vr='targetmin:{"fps":59};targetmax:{"raf":30}'></a-scene>
```

### only fps graph, but all numbers
since all labels and graphs are enabled by default, this overrides this existing graph list
```html
<a-scene stats-in-vr="showgraphs:fps;"></a-scene>
```

## advanced examples

### enable default auto-report (600 ticks after enter-vr, display for 30 seconds before disappearing)
runs and displays a report on stats collected from 600 ticks
```html
<a-scene stats-in-vr='samplereport:{"autostart":true};'></a-scene>
```

### start sampling manually
```html
<a-scene stats-in-vr stats-in-vr></a-scene>
<script>
         // ... at the appropriate moment... 
         const samplesToTake = 200
         const timeToShowResults = 10000
         document.querySelector('[stats-in-vr]').components['stats-in-vr'].sample(samplesToTake).then(() => {
            document.querySelector('[stats-in-vr]').components['stats-in-vr'].showSampleCanvas(timeToShowResults)
         })
</script>
```

### attach translucent stats to your left hand when you enter vr:
```html
    <a-scene stats-in-vr="anchorel:#left-hand; position:0 -.5 0; fillstyle:rgba(255, 255, 255, 0.5);">
      <a-entity id="rig" position="0 0 0">
        <a-camera camera position="0 1.6 0" look-controls></a-camera>
        <a-entity hand-controls="hand: left" id="left-hand"></a-entity>
        <a-entity hand-controls="hand: right">              </a-entity>
      </a-entity>
    </a-scene>
```

### make stats appear on your right controller when you press button on your right controller, run sampling when you press button on left controller
```html
<a-scene stats-in-vr="anchorel:#right-hand; position:0 -.5 0; fillstyle:rgba(255, 255, 255, 0.5)" >
      <a-entity id="rig" position="0 0 0">
        <a-entity camera id="the-cam" position="0 1.6 0"></a-entity>
        <a-entity sample-on-event id="left-hand" hand-controls="hand: left"></a-entity>
        <a-entity stats-on-event id="right-hand" hand-controls="hand: right"></a-entity>
      </a-entity>
```

### make the stats panel a fixed item in your scene's space, remaining there whether in vr or not:
stick a VR panel somewhere you want in the scene, and make it stay there, whether you're in VR or not.
```html
<a-scene stats-in-vr="anchorel:#the-box;position:0 .4 0; alwaysshow3dstats:true; show2dstats:false;" >
     <a-circle id="floor" rotation="-90 0 0" radius="400" color="#7BC8A4"></a-circle>
     <a-box id="the-box" position="-1 0.5 -6" rotation="0 45 0" color="red"></a-box>
</a-scene>
```

## Glitch
https://glitch.com/edit/#!/stats-in-vr?path=index.html%3A17%3A30

## params
```js

  schema: {
    enabled: { type: "boolean", default: true },
    debug: { type: "boolean", default: false },

    position: { type: "string", default: "0 -1.1 -.5" },
    rotation: { type: "string", default: "-20 0 0" },
    scale: { type: "string", default: "1 .8 1" },

    performancemode: { type: "boolean", default: false }, // set of defaults to focus on making it as light of impact as possible
    throttle: { type: "number", default: 15 }, // how many ms between recalc, has biggest effect on performance (try it out for yourself! hah)

    backgroundcolor: { type:"color", default: "orange"}, // you can specify solid colors to be slightly more performant

    show2dstats: { type: "boolean", default: true },  // show the built-in 'stats' component when not in VR
    alwaysshow3dstats: { type: "boolean", default: false },  // show this component even when not in VR
    anchorel: { type: "selector", default: "[camera]" }, // anchor in-vr stats to something other than the camera

    showlabels: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load time']}, // please give all inputs in lowercase
    showgraphs: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load time']}, // this will be auto-filtered down to match above, but you can filter down further if you want, say, 4 values in text, but only 1 in graph form. you can also select `null` or `false` or `[]` to turn off all graphs.

    // ADVANCED:

    // targetmax
    // targetmin
    // samplereport
    // ^ these three are defined below as custom schema options--basically, they take in JSON (if serializing or if defining in HTML, see examples) or straight up JS objects (if adding to scene programatically)
    // see examples for HTML usage guidance, syntax is very delicate for this
    
    samplereport: {
      // all numbers in ms
      default: JSON.stringify({
        autostart: false, // if false, can be programtically started by e.g. a button press by calling 
                          // if true, will fire every time `enter-vr` event is triggered
        /*
          const ticksToSample = 600;
          const durationToShowVRSampleReport = 20000 // 20 seconds
          document.querySelector('[stats-in-vr]').components['stats-in-vr'].sample(ticksToSample).then(() => {
              document.querySelector('[stats-in-vr]').components['stats-in-vr'].showSampleCanvas(durationToShowVRSampleReport)
          })
        */
        delay: 0, // if autostart true, how long after app launch to auto-start sampling
        samples: 60, // if autostart true, how many samples to take
        displayDuration: 30000, // how long to leave report up in VR before auto-closing
      }),
      parse: json => {
        return typeof json === "string" ? JSON.parse(json) : json; 
      },
      stringify: JSON.stringify
    },
    
    // thrown in are some sane defaults. This library is written/expects all stats to be given in lowercase everywhere, they will be uppercased as needed.
    // note that you can only have one or the other defined for a given property; for performance, only one will be checked per property. to maximize performance, set no targets.
    targetmax: {
      default: JSON.stringify({
        calls: 200, // 
        raf: 15, // needed to keep responsiveness around 60fps
        triangles: 100000,
        "load time": 3000,
        // you can specify your own targets for any stats props, and they'll turn red when they rise above target
        // this does come with a small performance penalty
      }),
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
      default: JSON.stringify({
        fps: 75,
        // you can specify targets for any stats props, and they'll turn red when they fall below target
        // this does come with a small performance penalty
      }),
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
```



