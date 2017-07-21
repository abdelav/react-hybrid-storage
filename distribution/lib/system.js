'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.getItem = getItem;
exports.setItem = setItem;
exports.removeItem = removeItem;
exports.save = save;
exports.getBatchData = getBatchData;
exports.getBatchDataWithIds = getBatchDataWithIds;
exports.remove = remove;
exports.load = load;
exports.clearMap = clearMap;
exports.clearMapForKey = clearMapForKey;
exports.getIdsForKey = getIdsForKey;
exports.getAllDataForKey = getAllDataForKey;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getItem(key) {
  var method = this.isPromise ? this.storage.getItem(key) : _promise2.default.resolve(this.storage.getItem(key));
  return this.storage ? method : _promise2.default.resolve();
}

function setItem(key, value) {
  var method = this.isPromise ? this.storage.setItem(key, value) : _promise2.default.resolve(this.storage.setItem(key, value));
  return this.storage ? method : _promise2.default.resolve();
}

function removeItem(key) {
  var method = this.isPromise ? this.storage.removeItem(key) : _promise2.default.resolve(this.storage.removeItem(key));
  return this.storage ? method : _promise2.default.resolve();
}

function save(params) {
  var _this = this;

  var key = params.key,
      id = params.id,
      data = params.data,
      _params$expires = params.expires,
      expires = _params$expires === undefined ? this.defaultExpires : _params$expires;

  var now = new Date().getTime();
  var dataToSave = { data: data, expires: now + expires };
  var infoToReturn = void 0;

  if (key.toString().indexOf('_') !== -1) {
    console.error('Please do not use "_" in key!');
  }

  if (data === undefined) {
    console.error('"data" is required in save()!');
  }

  dataToSave = (0, _stringify2.default)(dataToSave);
  if (id === undefined) {
    if (this.enableCache) {
      var cacheData = JSON.parse(dataToSave);
      this.cache[key] = cacheData;
    }
    infoToReturn = this.setItem(key, dataToSave);
  } else {
    if (id.toString().indexOf('_') !== -1) {
      console.error('Please do not use "_" in id!');
    }
    infoToReturn = this.mapPromise.then(function () {
      return _this.saveToMap({ key: key, id: id, data: dataToSave });
    });
  }

  return infoToReturn;
}

function getBatchData(querys) {
  var _this2 = this;

  var tasks = querys.map(function (query) {
    return _this2.load(query);
  });
  return _promise2.default.all(tasks);
}

function getBatchDataWithIds(params) {
  var _this3 = this;

  var key = params.key,
      ids = params.ids,
      syncInBackground = params.syncInBackground;

  return _promise2.default.all(ids.map(function (id) {
    return _this3.load({ key: key, id: id, syncInBackground: syncInBackground, autoSync: false, batched: true });
  })).then(function (results) {
    return new _promise2.default(function (resolve, reject) {
      var filteredIds = results.filter(function (value) {
        return value.syncId !== undefined;
      });
      if (!ids.length) {
        return resolve();
      }
      return _this3.sync[key]({
        id: filteredIds.map(function (value) {
          return value.syncId;
        }),
        resolve: resolve,
        reject: reject
      });
    }).then(function () {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return results.map(function (value) {
        return value.syncId ? data.shift() : value;
      });
    });
  });
}

// TODO: fix this with the appropiate use of return.
/* eslint-disable */
function remove(params) {
  var _this4 = this;

  return this.mapPromise.then(function () {
    var key = params.key,
        id = params.id;

    var core = _this4.core;
    var newId = _this4.getId(key, id);

    if (id === undefined) {
      if (_this4.enableCache && _this4.cache[key]) {
        delete _this4.cache[key];
      }
      return _this4.removeItem(key);
    }

    // Remove existed data
    if (core[newId] !== undefined) {
      var idTobeDeleted = core[newId];
      if (_this4.enableCache && _this4.cache[newId]) {
        delete _this4.cache[newId];
      }

      _this4.removeIdInKey(key, id);
      delete core[newId];
      _this4.setItem('map', (0, _stringify2.default)(core));
      return _this4.removeItem('map_' + idTobeDeleted);
    }
  });
}
/* eslint-enable */

function load(params) {
  var _this5 = this;

  var key = params.key,
      id = params.id,
      _params$autoSync = params.autoSync,
      autoSync = _params$autoSync === undefined ? true : _params$autoSync,
      _params$syncInBackgro = params.syncInBackground,
      syncInBackground = _params$syncInBackgro === undefined ? true : _params$syncInBackgro,
      syncParams = params.syncParams;

  return this.mapPromise.then(function () {
    return new _promise2.default(function (resolve, reject) {
      if (id === undefined) {
        return resolve(_this5.lookupGlobalItem({ key: key, resolve: resolve, reject: reject, autoSync: autoSync, syncInBackground: syncInBackground, syncParams: syncParams }));
      }

      return resolve(_this5.lookUpInMap({ key: key, id: id, resolve: resolve, reject: reject, autoSync: autoSync, syncInBackground: syncInBackground, syncParams: syncParams }));
    });
  });
}

function clearMap() {
  var _this6 = this;

  this.removeItem('map').then(function () {
    _this6.core = _this6.initMap();
  });
}

function clearMapForKey(key) {
  var _this7 = this;

  return this.mapPromise.then(function () {
    var tasks = (_this7.core.__keys__[key] || []).map(function (id) {
      return _this7.remove({ key: key, id: id });
    });
    return _promise2.default.all(tasks);
  });
}

function getIdsForKey(key) {
  var _this8 = this;

  return this.mapPromise.then(function () {
    return _this8.core.__keys__[key] || [];
  });
}

function getAllDataForKey(key, options) {
  var _this9 = this;

  var syncOptions = (0, _assign2.default)({ syncInBackground: true }, options);
  return this.getIdsForKey(key).then(function (ids) {
    var querys = ids.map(function (id) {
      return { key: key, id: id, syncInBackground: syncOptions.syncInBackground };
    });
    return _this9.getBatchData(querys);
  });
}