'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.initMap = initMap;
exports.checkMap = checkMap;
exports.getId = getId;
exports.removeIdInKey = removeIdInKey;
exports.saveToMap = saveToMap;
exports.lookupGlobalItem = lookupGlobalItem;
exports.loadGlobalItem = loadGlobalItem;
exports.noItemFound = noItemFound;
exports.loadMapItem = loadMapItem;
exports.lookUpInMap = lookUpInMap;

var _error = require('../helpers/error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initMap() {
  return {
    innerVersion: this.innerVersion,
    index: 0,
    __keys__: {}
  };
}

// Modules
function checkMap(map) {
  return map && map.innerVersion && map.innerVersion === this.innerVersion ? map : this.initMap();
}

function getId(key, id) {
  return key + '_' + id;
}

function removeIdInKey(key, id) {
  var indexTobeRemoved = (this.core.__keys__[key] || []).indexOf(id);
  if (indexTobeRemoved !== -1) {
    this.core.__keys__[key].splice(indexTobeRemoved, 1);
  }
}

// TODO: fix this with the appropiate use of return.
/* eslint-disable */
function saveToMap(params) {
  var key = params.key,
      id = params.id,
      data = params.data;

  var newId = this.getId(key, id);
  var core = this.core;
  var currentIndex = core.index;

  // Update existed data
  if (core[newId] !== undefined) {
    if (this.enableCache) this.cache[newId] = JSON.parse(data);
    return this.setItem('map_' + core[newId], data);
  }

  // Loop over, delete old data
  if (core[core.index] !== undefined) {
    var oldId = core[core.index];
    var splitOldId = oldId.split('_');
    delete core[oldId];
    this.removeIdInKey(splitOldId[0], splitOldId[1]);
    if (this.enableCache) {
      delete this.cache[oldId];
    }
  }

  core[newId] = core.index;
  core[core.index] = newId;

  core.__keys__[key] = core.__keys__[key] || [];
  core.__keys__[key].push(id);

  if (this.enableCache) {
    var cacheData = JSON.parse(data);
    this.cache[newId] = cacheData;
  }

  if (++core.index === this.size) {
    core.index = 0;
  }

  this.setItem('map_' + currentIndex, data);
  this.setItem('map', (0, _stringify2.default)(core));
}
/* eslint-enable */

function lookupGlobalItem(params) {
  var _this = this;

  var key = params.key;

  var globalItem = this.enableCache && this.cache[key] !== undefined ? this.loadGlobalItem((0, _extends3.default)({ ret: this.cache[key] }, params)) : this.getItem(key).then(function (ret) {
    return _this.loadGlobalItem((0, _extends3.default)({ ret: ret }, params));
  });
  return globalItem;
}

function loadGlobalItem(params) {
  var _this2 = this;

  var key = params.key,
      ret = params.ret,
      autoSync = params.autoSync,
      syncInBackground = params.syncInBackground,
      syncParams = params.syncParams;

  var now = new Date().getTime();
  var writebleRet = ret;

  if (writebleRet === null || writebleRet === undefined) {
    if (autoSync && this.sync[key]) {
      return new _promise2.default(function (resolve, reject) {
        return _this2.sync[key]({ resolve: resolve, reject: reject, syncParams: syncParams });
      });
    }
    return _promise2.default.reject(new _error.NotFoundError((0, _stringify2.default)(params)));
  }

  if (typeof writebleRet === 'string') {
    writebleRet = JSON.parse(writebleRet);
    if (this.enableCache) {
      this.cache[key] = writebleRet;
    }
  }

  if (writebleRet.expires < now) {
    if (autoSync && this.sync[key]) {
      if (syncInBackground) {
        this.sync[key]({ syncParams: syncParams });
        return _promise2.default.resolve(writebleRet.data);
      }
      return new _promise2.default(function (resolve, reject) {
        return _this2.sync[key]({ resolve: resolve, reject: reject, syncParams: syncParams });
      });
    }
    return _promise2.default.reject(new _error.ExpiredError((0, _stringify2.default)(params)));
  }
  return _promise2.default.resolve(writebleRet.data);
}

function noItemFound(params) {
  var _this3 = this;

  var key = params.key,
      id = params.id,
      autoSync = params.autoSync,
      syncParams = params.syncParams;

  if (this.sync[key]) {
    if (autoSync) {
      return new _promise2.default(function (resolve, reject) {
        return _this3.sync[key]({ id: id, syncParams: syncParams, resolve: resolve, reject: reject });
      });
    }
    return _promise2.default.resolve({ syncId: id });
  }
  return _promise2.default.reject(new _error.NotFoundError((0, _stringify2.default)(params)));
}

function loadMapItem(params) {
  var _this4 = this;

  var ret = params.ret,
      key = params.key,
      id = params.id,
      autoSync = params.autoSync,
      batched = params.batched,
      syncInBackground = params.syncInBackground,
      syncParams = params.syncParams;

  var now = new Date().getTime();
  if (ret === null || ret === undefined) {
    return this.noItemFound(params);
  }

  if (typeof ret === 'string') {
    var newId = this.getId(key, id);
    if (this.enableCache) {
      this.cache[newId] = JSON.parse(ret);
    }
  }

  if (ret.expires < now) {
    if (autoSync && this.sync[key]) {
      if (syncInBackground) {
        this.sync[key]({ id: id, syncParams: syncParams });
        return _promise2.default.resolve(ret.data);
      }
      return new _promise2.default(function (resolve, reject) {
        return _this4.sync[key]({ id: id, resolve: resolve, reject: reject, syncParams: syncParams });
      });
    }

    if (batched) {
      return _promise2.default.resolve({ syncId: id });
    }
    return _promise2.default.reject(new _error.ExpiredError((0, _stringify2.default)(params)));
  }
  return _promise2.default.resolve(ret.data);
}

function lookUpInMap(params) {
  var _this5 = this;

  var key = params.key,
      id = params.id;

  var core = this.core;
  var newId = this.getId(key, id);

  if (this.enableCache && this.cache[newId]) {
    return this.loadMapItem((0, _extends3.default)({ ret: this.cache[newId] }, params));
  }

  if (core[newId] !== undefined) {
    return this.getItem('map_' + core[newId]).then(function (ret) {
      return _this5.loadMapItem((0, _extends3.default)({ ret: ret }, params));
    });
  }
  return this.noItemFound((0, _extends3.default)({ ret: undefined }, params));
}