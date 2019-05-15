# maptalks.geometryselection

A tool to select geometries on layers.

## Examples

### [DEMO](https://cxiaof.github.io/maptalks.geometryselection/demo/index.html)

## Install

-   Install with npm: `npm install maptalks.geometryselection`.
-   Install with yarn: `yarn add maptalks.geometryselection`.
-   Download from [dist directory](https://github.com/cXiaof/maptalks.geometryselection/tree/master/dist).
-   Use jsdelivr CDN: `https://cdn.jsdelivr.net/npm/maptalks.geometryselection/dist/maptalks.geometryselection.min.js`

## Usage

As a plugin, `maptalks.geometryselection` must be loaded after `maptalks.js` in browsers. You can also use `'import { GeometrySelection } from "maptalks.geometryselection"` when developing with webpack.

```html
<!-- ... -->
<script src="https://cdn.jsdelivr.net/npm/maptalks.geometryselection/dist/maptalks.geometryselection.min.js"></script>
<!-- ... -->
```

```javascript
const gs = new maptalks.GeometrySelection({
    layers: ['v1', 'v2', 'v3']
}).addTo(map)
```

## API Reference

```javascript
new maptalks.GeometrySelection(options, defaultChosenGeos)
```

-   options **Object**

    -   layers **Array** names array of layers which choose geometry on
    -   availTypes **Array** or **String** which types geometry can be chosen. If availTypes equal ' \* ', all types is available.
    -   colorHit **String** the color of symbol when geo hit
    -   colorChosen **String** the color of symbol when geo chosen

-   defaultChosenGeos **Array**

`addTo()` set map

`getMap()` get map

`enable()`

`disable()`

`toggleEnable()` enable <=> disable

`isEnabled()` get enable status

`getGeometries()` get all geos chosen

`forEach()`

`filter()`

`clear()`

`remove()`

## Contributing

We welcome any kind of contributions including issue reportings, pull requests, documentation corrections, feature requests and any other helps.

## Develop

The only source file is `index.js`.

It is written in ES6, transpiled by [babel](https://babeljs.io/) and tested with [mocha](https://mochajs.org) and [expect.js](https://github.com/Automattic/expect.js).

### Scripts

-   Install dependencies

```shell
$ npm install
```

-   Watch source changes and generate runnable bundle repeatedly

```shell
$ gulp watch
```

-   Package and generate minified bundles to dist directory

```shell
$ gulp minify
```

-   Lint

```shell
$ npm run lint
```

## More Things

-   [maptalks.autoadsorb](https://github.com/cXiaof/maptalks.autoadsorb/issues)
-   [maptalks.multisuite](https://github.com/cXiaof/maptalks.multisuite/issues)
-   [maptalks.geosplit](https://github.com/cXiaof/maptalks.geosplit/issues)
-   [maptalks.polygonbool](https://github.com/cXiaof/maptalks.polygonbool/issues)
-   [maptalks.geo2img](https://github.com/cXiaof/maptalks.geo2img/issues)
-   [maptalks.control.compass](https://github.com/cXiaof/maptalks.control.compass/issues)
-   [maptalks.autogradual](https://github.com/cXiaof/maptalks.autogradual/issues)
-   [maptalks.geometryselection](https://github.com/cXiaof/maptalks.geometryselection/issues)
