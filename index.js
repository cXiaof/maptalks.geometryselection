import { createFilter, getFilterFeature } from '@maptalks/feature-filter'

const layerPrevent = maptalks.INTERNAL_LAYER_PREFIX
const options = {
    layers: [],
    colorHit: '#ffa400',
    colorChoose: '#00bcd4'
}

export class GeometrySelection extends maptalks.Class {
    constructor(options, defaultChosenGeos) {
        super(options)
        this._layer = `${layerPrevent}geometryselection@cXiaof`
        this._enabled = false
        this._setDefaultChosenGeos(defaultChosenGeos)
    }

    enable() {
        this._enabled = true
        return this
    }

    disable() {
        this._enabled = false
        return this
    }

    toggleEnable() {
        this._enabled = !this._enabled
        return this
    }

    isEnabled() {
        return this._enabled
    }

    getGeometries() {
        return this._geometries || []
    }

    forEach(fn = () => false, context) {
        if (typeof fn !== 'function') return this
        const geos = this.getGeometries()
        geos.forEach((geo, i, arr) => {
            if (context) fn.call(context, geo, i, arr)
            else fn(geo, i, arr)
        })
        return this
    }

    filter(fn, context) {
        const isFn = typeof fn === 'function'
        const filter = isFn ? fn : createFilter(fn)
        const geos = this.getGeometries()
        return geos.filter((geo, i, arr) => {
            geo = isFn ? geo : getFilterFeature(geo)
            return context
                ? filter.call(context, geo, i, arr)
                : filter(geo, i, arr)
        })
    }

    remove() {
        return this
    }

    _setDefaultChosenGeos(geos) {
        this._geometries = geos instanceof Array ? geos : []
    }
}

GeometrySelection.mergeOptions(options)
