# features
- get stats component data in VR, while you're actually using your app
- high performance, just one canvas/image draw-call texture for all stats (though each graph is its own canvas/image/draw-call, if you include those)
- uses existing stats component under the hood, so same numbers, no re-inventing the wheel
- pick which stats you want to track, reduce clutter
- throttle to as smooth or as performance sensitive as you want
- pick background color, opacity
- include some, all, or no graphs
- attach to camera by default, but can attach anywhere in-scene you want
- default behavior is to display when enter-vr, and hide and show `stats` when exit-vr, but behavior can be specified with options
- easy-peasy

## yet another necro component pulled into service

This one is revived from back in the olden days! A-Frame 0.4.0 is close to as old as I've seen (pretty sure I have pulled a library somewhere that had a demo on 0.3.0?). Very cool that this 5 year old code can still be called into service.

I've wanted this for a while, but I googled, found this, and then found what looked like a [promising pull request](https://github.com/chenzlabs/stats-in-vr/pull/1
).

Which, with just one tiny bug fix, was found to work even on A-Frame 1.2.0!

~~though it seems the bars may not be working properly and that they perhaps used to. perhaps some more tinkering is in order?~~ Got the bars working again. :D Also spent a few hours going over it, refactoring stuff in the process. ~~I now realize it adds about 40-50 draw calls or so, because it works by adding a ton of images with canvas with text as textures for every value.~~ NM, fixed that too. Now all text stats are rendered as one buttery smooth image with canvas texture.

I spent time working on the code, but not yet the repo. It's got all the usual boilerplate, now fallen way out of date. I just use the 'stats-in-vr.js' file and ignore the rest for now, may clean up rest of repo later. 

You can access it through jsdelivr's cdn here: https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.1.0/stats-in-vr.js

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

### just want fps and tirangles, including their graphs
```html
<a-scene stats-in-vr="showlabels:fps,triangles; showgraphs:fps,triangles"></a-scene>
```

### no graphs, just numbers please
```html
<a-scene stats-in-vr="showallgraphs:false"></a-scene>
```

### only fps graph, but all numbers
```html
<a-scene stats-in-vr="showgraphs:fps;showalllabels:true"></a-scene>
```

### attach translucent stats to your left hand when you enter vr:
```html
    <script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.1/dist/aframe-extras.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.2.2/stats-in-vr.js"></script>

    <a-scene stats-in-vr="anchorel:#left-hand; position:0 -.5 0;showallgraphs:true;fillstyle:rgba(255, 255, 255, 0.5);">
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

  schema: {
    enabled: { type: "boolean", default: true },
    debug: { type: "boolean", default: false },
    position: { type: "string", default: "0 -1.1 -1" },
    rotation: { type: "string", default: "-20 0 0" },
    scale: { type: "string", default: "1 .8 1" },
    throttle: { type: "number", default: 20 },
    fillstyle: { type:"color", default: "white"}, // for opacity, you can try "rgba(255, 255, 255, 0.5)"
    show2dstats: { type: "boolean", default: true },  // show the built-in 'stats' component
    alwaysshow3dstats: { type: "boolean", default: false },  // show the built-in 'stats' component
    anchorel: { type: "selector", default: "[camera]" }, // anchor in-vr stats to something other than the camera
    showalllabels: { type: "boolean", default: true }, 
    showlabels: {type: 'array', default:[]}, // e.g., ['raf','fps','calls','entities']
    showallgraphs: { type: "boolean", default: true },
    showgraphs: {type: 'array', default:[]}, // e.g., ['raf','fps','calls','entities']
  },
```

### Installation

#### Browser

Install and use by directly including the [browser file](https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.2.2/stats-in-vr.js):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/kylebakerio/stats-in-vr@1.2.2/stats-in-vr.js"></script>
</head>

<body>
  <a-scene stats-in-vr></a-scene>
</body>
```

