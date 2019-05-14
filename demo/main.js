// new Map
const map = new maptalks.Map('map', {
    center: [121.387, 31.129],
    zoom: 13,
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate:
            'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        attribution:
            '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
        maxAvailableZoom: 18,
        placeholder: true
    }),
    scaleControl: { position: 'bottom-right', metric: true, imperial: true },
    zoomControl: {
        position: { top: 80, right: 20 },
        slider: false,
        zoomLevel: true
    },
    spatialReference: {
        projection: 'EPSG:3857',
        resolutions: (function() {
            const resolutions = []
            const d = 2 * 6378137 * Math.PI
            for (let i = 0; i < 22; i++) {
                resolutions[i] = d / (256 * Math.pow(2, i))
            }
            return resolutions
        })(),
        fullExtent: {
            top: 6378137 * Math.PI,
            bottom: -6378137 * Math.PI,
            left: -6378137 * Math.PI,
            right: 6378137 * Math.PI
        }
    }
})
new maptalks.CompassControl({
    position: 'top-right'
}).addTo(map)

const layerMarkers = new maptalks.VectorLayer('markers').addTo(map)
const layerLines = new maptalks.VectorLayer('lines').addTo(map)
const layerPolygons = new maptalks.VectorLayer('polygons').addTo(map)
const gs = new maptalks.GeometrySelection({
    layers: ['markers', 'lines', 'polygons']
}).addTo(map)

// add some geos
const center = map.getCenter()
const symbol = {
    polygonFill: '#ebebeb',
    polygonOpacity: 0.15,
    lineColor: '#333'
}
new maptalks.Marker(center.add(0.01, 0.01)).addTo(layerMarkers)
new maptalks.Marker(center.add(0.01, -0.01)).addTo(layerMarkers)
new maptalks.Marker(center.add(-0.02, 0.02)).addTo(layerMarkers)
new maptalks.Marker(center.add(-0.02, -0.02)).addTo(layerMarkers)
new maptalks.LineString([
    center.add(-0.015, -0.015),
    center.add(-0.005, -0.005)
]).addTo(layerLines)
new maptalks.LineString([
    center.add(0.005, 0.005),
    center.add(0.015, 0.015)
]).addTo(layerLines)
new maptalks.Rectangle(center.add(-0.03, -0.02), 800, 1600, { symbol }).addTo(
    layerPolygons
)
new maptalks.Rectangle(center.add(0, -0.02), 800, 1600, { symbol }).addTo(
    layerPolygons
)
new maptalks.Rectangle(center.add(0.03, -0.02), 800, 1600, { symbol }).addTo(
    layerPolygons
)

// new Toolbar
const toolbar = new maptalks.control.Toolbar({
    position: 'top-left',
    items: [
        { item: 'enable', click: () => gs.enable() },
        { item: 'disable', click: () => gs.disable() },
        {
            item: 'getGeometries',
            click: () => {
                const geos = gs.getGeometries()
                const text = geos.reduce((target, geo) => {
                    target += JSON.stringify(geo.toGeoJSONGeometry())
                    return target
                }, '')
                alert(text || '[]')
            }
        }
    ]
}).addTo(map)

// new tip Panel
const textPanel = new maptalks.control.Panel({
    position: 'bottom-left',
    draggable: true,
    custom: false,
    content: `
        Click <b>enable</b> to start to choose geometry,<br />
        click it when it's color be changed.<br />
        Click <b>disable</b> to pause. And you can click<br />
        <b>enable</b> again, geometries chosen will be<br />
        retained.<br />
        Click <b>getGeometries</b> and check it.<br />
        <br />
        点击<b>enable</b>开始选择图形，被命中时图形会变色。<br />
        点击<b>disable</b>暂停选择。你可以再次点击<b>enable</b><br />
        继续选择，上一次选择的图形会被保留。<br />
        点击<b>getGeometries</b>检查是否为选择的图形。<br />
    `,
    closeButton: true
})
map.addControl(textPanel)
