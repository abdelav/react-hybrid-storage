// @flow

// Modules
import {
  getItem,
  setItem,
  removeItem,
  save,
  getBatchData,
  getBatchDataWithIds,
  remove,
  load,
  getIdsForKey,
  getAllDataForKey,
  clearMapForKey,
  clearMap,
} from './lib/system';
import {
  initMap,
  getId,
  checkMap,
  removeIdInKey,
  saveToMap,
  noItemFound,
  lookupGlobalItem,
  loadGlobalItem,
  loadMapItem,
  lookUpInMap,
} from './lib/engine';

class Storage {
  // Types
  size                : number;
  sync                : Object;
  defaultExpires      : number;
  enableCache         : boolean;
  storage             : Object;
  innerVersion        : number;
  cache               : Object;
  isPromise           : boolean;
  mapPromise          : Object;
  core                : Object;
  getItem             : (key : string) => Promise<any>;
  setItem             : (key : string, value : Object) => Promise<any>;
  removeItem          : (key : string) => Promise<any>;
  save                : (params : Object) => Promise<any>;;
  initMap             : () => Object;
  checkMap            : (map : Object) => Object;
  getId               : Object;
  removeIdInKey       : Object;
  saveToMap           : Object;
  getBatchData        : Object;
  getBatchDataWithIds : Object;
  lookupGlobalItem    : Object;
  loadGlobalItem      : Object;
  noItemFound         : Object;
  loadMapItem         : Object;
  lookUpInMap         : Object;
  remove              : Object;
  load                : Object;
  getIdsForKey        : Object;
  getAllDataForKey    : Object;
  clearMapForKey      : Object;
  clearMap            : Object;

  constructor (options : Object = {}) {
    this.size = options.size || 1000;   // maximum capacity
    this.sync = options.sync || {};     // remote sync method
    this.defaultExpires = options.defaultExpires !== undefined
      ? options.defaultExpires
      : 1000 * 3600 * 24;
    this.enableCache = options.enableCache !== false;
    this.storage = options.storageBackend || {};
    this.innerVersion = 11;
    this.cache = {};
    this.isPromise = false;
    this.core = {};

    if (this.storage && this.storage.setItem) {
      try {
        const promiseTest = this.storage.setItem('reactHybridStorage', 'test');
        this.isPromise = !!(promiseTest && promiseTest.then);
      } catch (error) {
        console.warn(error);
        delete this.storage;
        throw error;
      }
    } else {
      console.warn(`Data would be lost after reload cause there is no storageBackend specified!
      \nEither use localStorage(for web) or AsyncStorage(for React Native) as a storageBackend.`);
    }

    this.mapPromise = this.getItem('map').then((map : string) => {
      const mapObj = map && JSON.parse(map) || {};
      this.core = this.checkMap(mapObj);
    });
  }
}

Object.assign(Storage.prototype, {
  getItem,
  setItem,
  removeItem,
  save,
  initMap,
  checkMap,
  getId,
  removeIdInKey,
  saveToMap,
  getBatchData,
  getBatchDataWithIds,
  lookupGlobalItem,
  loadGlobalItem,
  noItemFound,
  loadMapItem,
  lookUpInMap,
  remove,
  load,
  getIdsForKey,
  getAllDataForKey,
  clearMapForKey,
  clearMap,
});

export default Storage;
