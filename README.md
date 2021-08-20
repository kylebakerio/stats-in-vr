# features
- get stats component data in VR, while you're actually using your app
- high performance, just one canvas/image draw-call texture for all stats (though each graph is its own canvas/image/draw-call, if you include those)
- uses existing stats component under the hood, so same numbers, no re-inventing the wheel
- pick which stats you want to track, reduce clutter
- throttle to as smooth or as performance sensitive as you want
- pick background color, including optional opacity
- include some, all, or no graphs
- attach to camera by default, but can attach anywhere in-scene you want
- default behavior is to display when enter-vr, and hide and show `stats` when exit-vr, but behavior can be specified with options
- set targets for maximum or minimum stats values, which will cause numbers to be red or green accordingly
- by default, shows all stats and graphs and has some opacity, and some default target values for the major stats
- if you prefer the lightest weight option instead, just set performancemode='true;'

## yet another necro component pulled into service

I've wanted this for a while, but I googled, found this, and then found what looked like a [promising pull request](https://github.com/chenzlabs/stats-in-vr/pull/1
). It hadn't been touched in 5 years, so I've spent some time updating it, improving it, making it faster, lighter, and adding features.

You can access it through jsdelivr's cdn here: https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.3.0/stats-in-vr.js

**AGAIN, Note that the build/dist files are NOT up to date with this one file listed above--they wouldn't build because of the ES6 syntax used in my bug fix, and the build tools are just that old.**

stats-in-vr component for [A-Frame](https://aframe.io).

![stats-in-vr](https://user-images.githubusercontent.com/6391152/130007970-a512c190-0a4e-4f0d-8c40-0d8e1e9e58e8.png)
![pick-graphs](https://user-images.githubusercontent.com/6391152/130017676-8de7e02b-268e-4896-89cb-3006e5a8dd58.png)


## Examples

### default behavior:
when you enter VR, full stats get attached to your face, about half a meter down and forward from you. When you are not in VR, you see the normal 2d stats.
```html
<a-scene stats-in-vr></a-scene>
```

### just want fps and triangles and raf, and graphs for all but triangles
```html
<a-scene stats-in-vr="showlabels:fps,raf,triangles; showgraphs:fps,raf"></a-scene>
```

### no graphs, just numbers please
```html
<a-scene stats-in-vr="showgraphs:null;"></a-scene>
```

### high performance mode defaults?
```html
<a-scene stats-in-vr="performancemode:true;"></a-scene>
```

### no targets
```html
<a-scene stats-in-vr="targetMax:{};targetMin:{}"></a-scene>
```

### custom targets
```html
<a-scene stats-in-vr='targetMin:{"fps":59};targetMax:{"raf":30}'></a-scene>
```

### only fps graph, but all numbers
```html
<a-scene stats-in-vr="showgraphs:fps;"></a-scene>
```

### attach translucent stats to your left hand when you enter vr:
```html
    <script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.1/dist/aframe-extras.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.2.2/stats-in-vr.js"></script>

    <a-scene stats-in-vr="anchorel:#left-hand; position:0 -.5 0; fillstyle:rgba(255, 255, 255, 0.5);">
      <a-entity id="rig" movement-controls="fly:true;" position="0 0 0">
        <a-entity camera position="0 1.6 0" look-controls>
        </a-entity>
        <a-entity id="left-hand" hand-controls="hand: left"></a-entity>
        <a-entity hand-controls="hand: right"></a-entity>
      </a-entity>
    </a-scene>
```

### make it a permanent fixture in your scene, vr or not:
stick a VR panel somewhere you want in the scene, and make it stay there, whether you're in VR or not.
```html
<a-scene stats-in-vr="anchorel:#the-box;position:0 .4 0;showallgraphs:true; alwaysshow3dstats:true; show2dstats:false;" >
     <a-circle id="floor" rotation="-90 0 0" radius="400" color="#7BC8A4"></a-circle>
     <a-box id="the-box" position="-1 0.5 -6" rotation="0 45 0" color="red"></a-box>
</a-scene>
```

## Glitch
https://glitch.com/edit/#!/stats-in-vr?path=index.html%3A17%3A30

## params
```js

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
    
    showlabels: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load']}, // please give all inputs in lowercase
    showgraphs: {type: 'array', default:['raf','fps','geometries','programs','textures','calls','triangles','points','entities','load']}, // this will be auto-filtered down to match above, but you can filter down further if you want, say, 4 values in text, but only 1 in graph form. you can also select `null` or `false` or `[]` to turn off all graphs.
    
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
```

### Installation

#### Browser

Install and use by directly including the [browser file](https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.3.0/stats-in-vr.js):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.3.0/stats-in-vr.js"></script>
</head>

<body>
  <a-scene stats-in-vr></a-scene>
</body>
```

