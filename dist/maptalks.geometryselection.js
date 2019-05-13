/*!
 * maptalks.geometryselection v0.1.0-alpha.1
 * LICENSE : MIT
 * (c) 2016-2019 maptalks.org
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.maptalks = global.maptalks || {})));
}(this, (function (exports) { 'use strict';

/*!
    Feature Filter by

    (c) mapbox 2016 and maptalks 2018
    www.mapbox.com | www.maptalks.org
    License: MIT, header required.
*/
var types = ['Unknown', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];

/**
 * Given a filter expressed as nested arrays, return a new function
 * that evaluates whether a given feature (with a .properties or .tags property)
 * passes its test.
 *
 * @param {Array} filter mapbox gl filter
 * @returns {Function} filter-evaluating function
 */
function createFilter(filter) {
    return new Function('f', 'var p = (f && f.properties || {}); return ' + compile(filter));
}

function compile(filter) {
    if (!filter) return 'true';
    var op = filter[0];
    if (filter.length <= 1) return op === 'any' ? 'false' : 'true';
    var str = op === '==' ? compileComparisonOp(filter[1], filter[2], '===', false) : op === '!=' ? compileComparisonOp(filter[1], filter[2], '!==', false) : op === '<' || op === '>' || op === '<=' || op === '>=' ? compileComparisonOp(filter[1], filter[2], op, true) : op === 'any' ? compileLogicalOp(filter.slice(1), '||') : op === 'all' ? compileLogicalOp(filter.slice(1), '&&') : op === 'none' ? compileNegation(compileLogicalOp(filter.slice(1), '||')) : op === 'in' ? compileInOp(filter[1], filter.slice(2)) : op === '!in' ? compileNegation(compileInOp(filter[1], filter.slice(2))) : op === 'has' ? compileHasOp(filter[1]) : op === '!has' ? compileNegation(compileHasOp(filter[1])) : 'true';
    return '(' + str + ')';
}

function compilePropertyReference(property) {
    // const ref =
    //     property === '$type' ? 'f.type' :
    //         property === '$id' ? 'f.id' : `p[${JSON.stringify(property)}]`;
    // return ref;
    return property[0] === '$' ? 'f.' + property.substring(1) : 'p[' + JSON.stringify(property) + ']';
}

function compileComparisonOp(property, value, op, checkType) {
    var left = compilePropertyReference(property);
    var right = property === '$type' ? types.indexOf(value) : JSON.stringify(value);
    return (checkType ? 'typeof ' + left + '=== typeof ' + right + '&&' : '') + left + op + right;
}

function compileLogicalOp(expressions, op) {
    return expressions.map(compile).join(op);
}

function compileInOp(property, values) {
    if (property === '$type') values = values.map(function (value) {
        return types.indexOf(value);
    });
    var left = JSON.stringify(values.sort(compare));
    var right = compilePropertyReference(property);

    if (values.length <= 200) return left + '.indexOf(' + right + ') !== -1';

    return 'function(v, a, i, j) {\n        while (i <= j) { var m = (i + j) >> 1;\n            if (a[m] === v) return true; if (a[m] > v) j = m - 1; else i = m + 1;\n        }\n    return false; }(' + right + ', ' + left + ',0,' + (values.length - 1) + ')';
}

function compileHasOp(property) {
    return property === '$id' ? '"id" in f' : JSON.stringify(property) + ' in p';
}

function compileNegation(expression) {
    return '!(' + expression + ')';
}

// Comparison function to sort numbers and strings
function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Get feature object from a geometry for filter functions.
 * @param  {Geometry} geometry geometry
 * @return {Object}          feature for filter functions
 */
function getFilterFeature(geometry) {
    var json = geometry._toJSON(),
        g = json['feature'];
    g['type'] = types.indexOf(g['geometry']['type']);
    g['subType'] = json['subType'];
    return g;
}

/**
 * Compile layer's style, styles to symbolize layer's geometries, e.g.<br>
 * <pre>
 * [
 *   {
 *     'filter' : ['==', 'foo', 'val'],
 *     'symbol' : {'markerFile':'foo.png'}
 *   }
 * ]
 * </pre>
 * @param  {Object|Object[]} styles - style to compile
 * @return {Object[]}       compiled styles
 */

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var layerPrevent = maptalks.INTERNAL_LAYER_PREFIX;
var options = {
    layers: [],
    colorHit: '#ffa400',
    colorChoose: '#00bcd4'
};

var GeometrySelection = function (_maptalks$Class) {
    _inherits(GeometrySelection, _maptalks$Class);

    function GeometrySelection(options, defaultChosenGeos) {
        _classCallCheck(this, GeometrySelection);

        var _this = _possibleConstructorReturn(this, _maptalks$Class.call(this, options));

        _this._layer = layerPrevent + 'geometryselection@cXiaof';
        _this._enabled = false;
        _this._setDefaultChosenGeos(defaultChosenGeos);
        return _this;
    }

    GeometrySelection.prototype.enable = function enable() {
        this._enabled = true;
        return this;
    };

    GeometrySelection.prototype.disable = function disable() {
        this._enabled = false;
        return this;
    };

    GeometrySelection.prototype.toggleEnable = function toggleEnable() {
        this._enabled = !this._enabled;
        return this;
    };

    GeometrySelection.prototype.isEnabled = function isEnabled() {
        return this._enabled;
    };

    GeometrySelection.prototype.getGeometries = function getGeometries() {
        return this._geometries || [];
    };

    GeometrySelection.prototype.forEach = function forEach() {
        var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
            return false;
        };
        var context = arguments[1];

        if (typeof fn !== 'function') return this;
        var geos = this.getGeometries();
        geos.forEach(function (geo, i, arr) {
            if (context) fn.call(context, geo, i, arr);else fn(geo, i, arr);
        });
        return this;
    };

    GeometrySelection.prototype.filter = function filter(fn, context) {
        var isFn = typeof fn === 'function';
        var filter = isFn ? fn : createFilter(fn);
        var geos = this.getGeometries();
        return geos.filter(function (geo, i, arr) {
            geo = isFn ? geo : getFilterFeature(geo);
            return context ? filter.call(context, geo, i, arr) : filter(geo, i, arr);
        });
    };

    GeometrySelection.prototype.remove = function remove() {
        return this;
    };

    GeometrySelection.prototype._setDefaultChosenGeos = function _setDefaultChosenGeos(geos) {
        this._geometries = geos instanceof Array ? geos : [];
    };

    return GeometrySelection;
}(maptalks.Class);

GeometrySelection.mergeOptions(options);

exports.GeometrySelection = GeometrySelection;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.geometryselection v0.1.0-alpha.1');

})));
