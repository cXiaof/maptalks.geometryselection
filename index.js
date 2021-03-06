import isEqual from 'lodash.isequal'
import { createFilter, getFilterFeature } from '@maptalks/feature-filter'

const uid = 'geometryselection@cXiaof'
const options = {
    layers: [],
    availTypes: '*',
    colorHit: '#ffa400',
    colorChosen: '#00bcd4'
}

const markerStyleDefault = {
    markerType: 'path',
    markerPath: [
        {
            path:
                'M8 23l0 0 0 0 0 0 0 0 0 0c-4,-5 -8,-10 -8,-14 0,-5 4,-9 8,-9l0 0 0 0c4,0 8,4 8,9 0,4 -4,9 -8,14z M3,9 a5,5 0,1,0,0,-0.9Z',
            fill: '#DE3333'
        }
    ],
    markerPathWidth: 16,
    markerPathHeight: 23,
    markerWidth: 24,
    markerHeight: 34
}

export class GeometrySelection extends maptalks.Eventable(maptalks.Class) {
    constructor(options, defaultChosenGeos) {
        super(options)
        this._layerId = `${maptalks.INTERNAL_LAYER_PREFIX}${uid}`
        this._enabled = false
        this._setDefaultChosenGeos(defaultChosenGeos)
    }

    addTo(map) {
        if (!map) return this
        if (map._map_tool) map._map_tool.disable()
        this._map = map
        this._newDedicatedLayer()
        return this
    }

    getMap() {
        return this._map
    }

    enable() {
        this._enabled = true
        this._registerEvents()
        if (this._layer) this._layer.show()
        this.fire('enable')
        return this
    }

    disable() {
        if (!this._enabled) return this
        this._enabled = false
        this._offMapEvents()
        if (this._layer) this._layer.hide()
        this.fire('disable')
        return this
    }

    toggleEnable() {
        return this._enabled ? this.disable() : this.enable()
    }

    isEnabled() {
        return !!this._enabled
    }

    getGeometries() {
        return this._geometries || []
    }

    forEach(fn = () => false, context) {
        if (!this._isFn(fn)) return this
        this._geometries.forEach((geo, i, arr) => {
            if (context) fn.call(context, geo, i, arr)
            else fn(geo, i, arr)
        })
        return this
    }

    filter(fn = () => false, context) {
        const isFn = this._isFn(fn)
        const filter = isFn ? fn : createFilter(fn)
        return this._geometries.filter((geo, i, arr) => {
            geo = isFn ? geo : getFilterFeature(geo)
            return context
                ? filter.call(context, geo, i, arr)
                : filter(geo, i, arr)
        })
    }

    clear() {
        if (this._layer) this._layer.clear()
        this._geometries = []
    }

    remove() {
        this.disable()
        if (this._layer) this._layer.remove()
        delete this.hitGeo
        delete this._layer
        delete this._layerId
        delete this._enabled
        delete this._map
        delete this._geometries
        return this
    }

    _isArrayHasData(attr) {
        return maptalks.Util.isArrayHasData(attr)
    }

    _isFn(fn) {
        return maptalks.Util.isFunction(fn)
    }

    _setDefaultChosenGeos(geos) {
        this._geometries = this._isArrayHasData(geos) ? geos : []
    }

    _newDedicatedLayer() {
        this._layer = new maptalks.VectorLayer(this._layerId)
        this._layer.addTo(this._map).bringToFront()
    }

    _registerEvents() {
        const layers = this.options['layers']
        if (this._isArrayHasData(layers)) {
            this._map.on('mousemove', this._mousemoveEvents, this)
            this._map.on('click', this._clickEvents, this)
        }
    }

    _offMapEvents() {
        this._map.off('mousemove', this._mousemoveEvents, this)
        this._map.off('click', this._clickEvents, this)
    }

    _mousemoveEvents(e) {
        const { target, coordinate } = e
        const layers = this.options['layers']
        const tolerance = 0.0001
        target.identify({ coordinate, tolerance, layers }, (geos) => {
            const hit = geos.reduce((target, geo) => {
                if (target) return target
                if (this._isAvailTypes(geo)) return geo
                return target
            }, null)
            this.hitGeo = hit
            this._showCopyHitGeo()
        })
    }

    _isAvailTypes(geo) {
        const availTypes = this.options['availTypes']
        if (availTypes === '*') return true
        if (!this._isArrayHasData(availTypes)) return false
        const type = geo.getType()
        return availTypes.some(
            (avail, availType) => avail || type.endsWith(availType)
        )
    }

    _showCopyHitGeo() {
        if (!this._layer) this._newDedicatedLayer()
        const id = `__hit__${uid}`
        const lastHitGeo = this._layer.getGeometryById(id)
        if (lastHitGeo) lastHitGeo.remove()
        if (this.hitGeo) {
            this.fire('hit', this.hitGeo)
            const hitSymbol = this._getSymbolOrDefault('Hit', this.hitGeo)
            const hitCopy = this._copyGeoUpdateSymbol(hitSymbol, this.hitGeo)
            hitCopy.setId(id)
        }
    }

    _getSymbolOrDefault(colorType, geo) {
        let symbol = geo.getSymbol()
        const type = geo.getType()
        const color = this.options[`color${colorType}`]
        const lineWidth = 4
        if (symbol) {
            for (let key in symbol) {
                if (key.endsWith('Fill') || key.endsWith('Color'))
                    symbol[key] = color
            }
            symbol.lineWidth = lineWidth
        } else {
            if (type.endsWith('Point'))
                symbol = Object.assign(markerStyleDefault, {
                    markerFill: color
                })
            else symbol = { lineColor: color, lineWidth }
        }
        return symbol
    }

    _copyGeoUpdateSymbol(symbol, geo) {
        return geo.copy().updateSymbol(symbol).addTo(this._layer)
    }

    _clickEvents() {
        if (this.hitGeo) {
            const coordHit = this._getSafeCoords(this.hitGeo)
            const chooseNext = this._geometries.reduce((chooses, geo) => {
                const coord = this._getSafeCoords(geo)
                if (isEqual(coordHit, coord)) return chooses
                return [...chooses, geo]
            }, [])
            if (chooseNext.length === this._geometries.length) {
                this.fire('choose', this.hitGeo)
                const newGeo = this.hitGeo.copy()
                this._geometries.push(this.hitGeo)
            } else this._geometries = chooseNext
            this._renderChosenGeos()
        }
    }

    _getSafeCoords(geo) {
        const { options } = geo
        geo = geo.copy()
        let coords = geo.getCoordinates()
        if (options.numberOfShellPoints) {
            options.numberOfShellPoints *= 4
            geo.setOptions(options)
            coords = [geo.getShell()]
        }
        return coords
    }

    _renderChosenGeos() {
        if (this._layer) this._layer.clear()
        else this._newDedicatedLayer()
        this._geometries.forEach((geo) => {
            const chooseSymbol = this._getSymbolOrDefault('Chosen', geo)
            this._copyGeoUpdateSymbol(chooseSymbol, geo)
        })
    }
}

GeometrySelection.mergeOptions(options)
