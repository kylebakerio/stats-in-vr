<!-- github -->
![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hm/kylebakerio/vr-super-stats)
<!-- npm -->
<!-- [![](https://data.jsdelivr.com/v1/package/npm/vr-super-stats/badge)](https://www.jsdelivr.com/package/npm/vr-super-stats) -->
_note: if you're seeing this on npm, it is recommended that you go see github for latest release. npm release may be rarely updated in comparison to github release._

# vr-super-stats
**One-line drop in for default functionality.** Huge amount of customizability.

See fps, raf, triangles, draw cals, points, etc. counts live while in VR. Also measure averages and generate reports programatically.

<img src="https://user-images.githubusercontent.com/6391152/130669882-2c535623-1fdd-4464-8b75-3feb97cc01b9.png" width="500"><img src="https://user-images.githubusercontent.com/6391152/130512748-a3dcea0c-38ff-4744-bf9a-54c23f3d85e5.png" width="400">

<a href='https://ko-fi.com/kylev' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' /><a/>
  
_Also check out [a-console](https://github.com/kylebakerio/a-console) to see logs while in-vr!_

# features
- **now featuring [extra-stats](https://github.com/mrxz/fern-aframe-components/tree/main/extra-stats), which corrects the graphs for webxr, and provides more available info!**
- get stats component data in VR, while you're actually using your app, showing you what is really impacting the numbers and by how much
- high performance, just one canvas/image draw-call texture for all stats (though each graph is its own canvas/image/draw-call, if you include those)
- uses existing stats component under the hood, so same numbers, no re-inventing the wheel
- pick which stats you want to track, reduce clutter
- throttle to as smooth or as performance sensitive as you want
- pick background color, including optional opacity
- include some, all, or no graphs
- attaches to camera by default, but can attach anywhere in-scene you want
- default behavior is to display when enter-vr, and hide and show `stats` when exit-vr, but behavior can be specified with options
- set targets for maximum or minimum stats values, which will cause numbers to be red or green accordingly
- by default, shows all stats and graphs, and some default target values for the major stats
- if you prefer the lightest weight option instead, just set `performancemode='true;'` and `showlabels:fps,raf;` (or exactly whatever stats you want to track).
- **track live performance and view in-VR reports on average/high/low within sample period at a sample rate you determine**
- helper components for activating on events (e.g. `buttondown` event from `tracked-controller`, to active on any button press)

## yet another necro component pulled into service

I've wanted this for a while, but I googled, found this, and then found a library that used to do what I wanted 5 years ago (and hadn't been touched since) in an older version of A-Frame. I've spent some time--arguably too much time--almost completely rewriting it, improving it, making it faster, lighter, and adding features.

<img src="https://user-images.githubusercontent.com/6391152/130007970-a512c190-0a4e-4f0d-8c40-0d8e1e9e58e8.png" width="256"><img src="https://user-images.githubusercontent.com/6391152/130179324-d68f276d-1ccf-4f7c-90fc-1a872bb4fe61.png" width="256">
<img src="https://user-images.githubusercontent.com/6391152/130179339-85f94d50-414a-43ae-b9c7-53304a245921.png" width="256">
<img src="https://user-images.githubusercontent.com/6391152/130179350-8eac1d93-beda-4175-aa1b-7d6ecb829e61.png" width="256">
<img src="https://user-images.githubusercontent.com/6391152/130513640-53b73d1c-ff60-40fb-94c4-0a5d014c9d46.png" width="256">

## Installation

#### Browser

Install and use by directly including the browser file via jsdelivr's cdn:

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
  <script src="https://unpkg.com/@fern-solutions/aframe-extra-stats/dist/extra-stats.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/kylebakerio/vr-super-stats@2.0.1/vr-super-stats.js"></script>
</head>

<body>
  <a-scene extra-stats vr-super-stats></a-scene>
</body>
```


## Usage Examples

### default behavior:
when you enter VR, full stats get attached to your face, about half a meter down and forward from you. When you are not in VR, you see the normal 2d stats.
```html
<a-scene extra-stats vr-super-stats></a-scene>
```

### just want fps and triangles and raf, and graphs for only the first two
```html
<a-scene extra-stats vr-super-stats="showlabels:fps,raf,triangles; showgraphs:fps,raf"></a-scene>
```

### no graphs, just numbers please
takes up less space and reduces overhead
```html
<a-scene extra-stats vr-super-stats="showgraphs:null;"></a-scene>
```

### high performance mode defaults?
bare minimum makes for the lighest tick, producing the purest readings possible. with the new update, you can also add any other settings, and you'll just override the performance defaults selected while still getting the remaining features culled for your benefit.
```html
<a-scene extra-stats vr-super-stats="performancemode:true;"></a-scene>
```

### no targets
No red/green numbers when above/below min/max threshholds. In some cases may significantly improve performance, because no string -> number coercion needed every tick if you don't need to do an equation on it.
```html
<a-scene extra-stats vr-super-stats="notargets:true;"></a-scene>
```

### custom targets
shoot high, or shoot low, based on your platform and app.
```html
<a-scene extra-stats vr-super-stats='targetgreaterthan:{"fps":59};targetlessthan:{"raf":30}'></a-scene>
```

### only fps graph, but all numbers
since all labels and graphs are enabled by default, this overrides this existing graph list
```html
<a-scene extra-stats vr-super-stats="showgraphs:fps;"></a-scene>
```

## advanced examples

### enable default auto-report (600 ticks after enter-vr, display for 30 seconds before disappearing)
runs and displays a report on stats collected from 600 ticks
```html
<a-scene extra-stats vr-super-stats='samplereport:{"autostart":true};'></a-scene>
```

### start sampling manually
```html
<a-scene extra-stats vr-super-stats></a-scene>
<script>
         // ... at the appropriate moment... 
         const samplesToTake = 200
         const timeToShowResults = 10000
         document.querySelector('[vr-super-stats]').components['vr-super-stats'].sample(samplesToTake).then(() => {
            document.querySelector('[vr-super-stats]').components['vr-super-stats'].showSampleCanvas(timeToShowResults)
         })
</script>
```

### attach translucent stats to your left hand when you enter vr:
```html
    <a-scene extra-stats vr-super-stats="anchorel:#left-hand; position:0 -.5 0; backgroundcolor:rgba(255, 255, 255, 0.8);">
      <a-entity id="rig" position="0 0 0">
        <a-camera camera position="0 1.6 0" look-controls></a-camera>
        <a-entity hand-controls="hand: left" id="left-hand"></a-entity>
        <a-entity hand-controls="hand: right">              </a-entity>
      </a-entity>
    </a-scene>
```

### make stats appear on your right controller when you press button on your right controller, run sampling when you press button on left controller
notice the use of the two supplementary micro-components, `stats-on-event` and `sample-on-event`.
```html
<a-scene extra-stats vr-super-stats="anchorel:#right-hand; position:0 -.5 0;" >
      <a-entity id="rig" position="0 0 0">
        <a-entity camera id="the-cam" position="0 1.6 0"></a-entity>
        <a-entity sample-on-event id="left-hand" hand-controls="hand: left"></a-entity>
        <a-entity stats-on-event id="right-hand" hand-controls="hand: right"></a-entity>
      </a-entity>
```

### make the stats panel a fixed item in your scene's space, remaining there whether in vr or not
stick a VR panel somewhere you want in the scene, and make it stay there, whether you're in VR or not.
```html
<a-scene extra-stats vr-super-stats="anchorel:#the-box;position:0 .4 0; alwaysshow3dstats:true; show2dstats:false;" >
     <a-circle id="floor" rotation="-90 0 0" radius="400" color="#7BC8A4"></a-circle>
     <a-box id="the-box" position="-1 0.5 -6" rotation="0 45 0" color="red"></a-box>
</a-scene>
```

## Demo
[Glitch workspace](https://glitch.com/edit/#!/vr-super-stats)

## params
```js

  dependencies: ["extra-stats"],

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

    extraStatsGroups: { type:"string", default: "three: true; aframe: true; three-alloc: true"}, // see: https://github.com/mrxz/fern-aframe-components/tree/main/extra-stats
    
    showlabels: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load','color','matrix4','matrix3','quaternion','vector4','vector3','vector2']}, // please give all inputs in lowercase
    showgraphs: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','color','matrix4','matrix3','quaternion','vector4','vector3','vector2']}, // this will be auto-filtered down to match above, but you can filter down further if you want, say, 4 values in text, but only 1 in graph form. you can also select `null` or `false` or `[]` to turn off all graphs.

    //
    // advanced options:
    // 

    // targetlessthan
    // targetgreaterthan
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
        displayDuration: 30000, // how long to leave report up in VR before auto-closing; this is 30 seconds, to read the report and process it before it self-dismisses
      }),
      parse(jsonOrObj) {
        let output = typeof jsonOrObj === "string" ? JSON.parse(jsonOrObj) : jsonOrObj; 
        output = {...JSON.parse(this.default), ...output};
        return output;
      },
      stringify: JSON.stringify
    },
    

    notargets: { type: "boolean", default: false },
    // thrown in are some sane defaults. This library is written/expects all stats to be given in lowercase everywhere, they will be uppercased as needed.
    // note that you can only have one or the other defined for a given property; for performance, only one will be checked per property. to maximize performance, set no targets.
    targetlessthan: {
      default: {
        raf: 30, // needed to keep responsiveness around 60fps
        calls: 200, // too many draw calls kills responsiveness
        triangles: 100000, // rough limit for mobile experiences to be smooth
        "load time": 4000, // this is the minimum requirement to be featured on the oculus quest homepage
        points: 15000, // unsure, I've heard 20k is a drag, it's likely lower than that
        entities: 200, // unsure, I'm more familiar with draw calls, suggested improved number here welcome
        // you can specify your own targets for any stats props, and they'll turn green when are below target
        // this does come with a small performance penalty
      },
      capLabels: ['geometries','programs','textures','calls','triangles','points','entities','load','color','matrix4','matrix3','quaternion','vector4','vector3','vector2'], // these props are auto-uppercased once for faster processing in tick handler
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
    targetgreaterthan: {// inverse of targetlessthan, for values where lower is better
      default: {
        fps: 58, // phones cap at 60, quest 1 aimed for 75 under ideal conditions. quest2 can do 90+ even in A-Frame if you set <a-scene renderer="highRefreshRate:true;">. 60 is minimum to be featured on oculus, 72+ is recommended.
        // you can specify targets for any stats props, and they'll turn red when they fall below target
        // this does come with a small performance penalty
      },
      capLabels: ['geometries','programs','textures','calls','triangles','points','entities','load','color','matrix4','matrix3','quaternion','vector4','vector3','vector2'], // these props are auto-uppercased once for faster processing in tick handler
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
  }
```

# performance impact?
I haven't tried to measure the impact not having it at all makes, but here's an example of measuring the impact of all features enabled and default throttle=50, vs just setting 'high performance mode', in the default demo scene, with default sample of 200 ticks:

![max](https://user-images.githubusercontent.com/6391152/132111876-a25eb56a-1c1a-4efd-9684-4a052fa9286c.png)
![min](https://user-images.githubusercontent.com/6391152/132111877-2c5a86ed-a78d-4481-b465-c187d95d4c62.png)

in other words, about 20fps in this scene! I've done prelim testing and been a bit surprised by what factors had the biggest impact on this number, but need to sit down and record them more thoroughly at some point here. In the meantime, feel free to run your own tests by remixing the demo and playing with the features there.

Keep in mind that your fps and raf numbers will be better when not measuring; the point of this isn't getting precise numbers for those, but measuring impact, though with `performancemode:true;` and/or doing reports, the aim is to get as close as we can with that. With future updates we should get even better at this.

# what's next?
The biggest improvement would come, I think, from importing the rstats code itself, and skipping its render to html step, which would enable us to skip our pulling from html step, and get raw numbers. If anyone wants to pull request this, happy to receive it. Doing this would likely completely remove the loss from parse those numbers from text into Number values to measure targets, and would also enable far more performant (and useful--the default graphs are not very applicable to VR and not customizable) graph options. It could also mean removing calculations that aren't needed at a deeper level, further improving optimization.
