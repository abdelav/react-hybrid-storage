'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _system = require('./lib/system');

var _engine = require('./lib/engine');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Modules
var Storage =
// Types
function Storage() {
  var _this = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  (0, _classCallCheck3.default)(this, Storage);

  this.size = options.size || 1000; // maximum capacity
  this.sync = options.sync || {}; // remote sync method
  this.defaultExpires = options.defaultExpires !== undefined ? options.defaultExpires : 1000 * 3600 * 24;
  this.enableCache = options.enableCache !== false;
  this.storage = options.storageBackend || {};
  this.innerVersion = 11;
  this.cache = {};
  this.isPromise = false;
  this.core = {};

  if (this.storage && this.storage.setItem) {
    try {
      var promiseTest = this.storage.setItem('reactHybridStorage', 'test');
      this.isPromise = !!(promiseTest && promiseTest.then);
    } catch (error) {
      console.warn(error);
      delete this.storage;
      throw error;
    }
  } else {
    console.warn('Data would be lost after reload cause there is no storageBackend specified!\n      \nEither use localStorage(for web) or AsyncStorage(for React Native) as a storageBackend.');
  }

  this.mapPromise = this.getItem('map').then(function (map) {
    var mapObj = map && JSON.parse(map) || {};
    _this.core = _this.checkMap(mapObj);
  });
};

(0, _assign2.default)(Storage.prototype, {
  getItem: _system.getItem,
  setItem: _system.setItem,
  removeItem: _system.removeItem,
  save: _system.save,
  initMap: _engine.initMap,
  checkMap: _engine.checkMap,
  getId: _engine.getId,
  removeIdInKey: _engine.removeIdInKey,
  saveToMap: _engine.saveToMap,
  getBatchData: _system.getBatchData,
  getBatchDataWithIds: _system.getBatchDataWithIds,
  lookupGlobalItem: _engine.lookupGlobalItem,
  loadGlobalItem: _engine.loadGlobalItem,
  noItemFound: _engine.noItemFound,
  loadMapItem: _engine.loadMapItem,
  lookUpInMap: _engine.lookUpInMap,
  remove: _system.remove,
  load: _system.load,
  getIdsForKey: _system.getIdsForKey,
  getAllDataForKey: _system.getAllDataForKey,
  clearMapForKey: _system.clearMapForKey,
  clearMap: _system.clearMap
});

exports.default = Storage;