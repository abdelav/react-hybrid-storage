// @flow

// Modules
import { NotFoundError } from '../helpers/error';

export function initMap () : Object {
  return {
    innerVersion : this.innerVersion,
    index        : 0,
    __keys__     : {},
  };
}

export function checkMap (map : Object) : Object {
  return (map && map.innerVersion && map.innerVersion === this.innerVersion) ? map : this.initMap();
}

export function getId (key : string, id : string) : string {
  return `${key}_${id}`;
}

export function removeIdInKey (key : string, id : string) : void {
  const indexTobeRemoved = (this.core.__keys__[key] || []).indexOf(id);
  if (indexTobeRemoved !== -1) {
    this.core.__keys__[key].splice(indexTobeRemoved, 1);
  }
}

// TODO: fix this with the appropiate use of return.
/* eslint-disable */
export function saveToMap (params : Object) {
  const { key, id, data } = params;
  const newId = this.getId(key, id);
  const core = this.core;
  const currentIndex = core.index;

  // Update existed data
  if (core[newId] !== undefined) {
    if (this.enableCache) this.cache[newId] = JSON.parse(data);
    return this.setItem('map_' + core[newId], data);
  }

  // Loop over, delete old data
  if (core[core.index] !== undefined) {
    const oldId = core[core.index];
    const splitOldId = oldId.split('_');
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
    const cacheData = JSON.parse(data);
    this.cache[newId] = cacheData;
  }

  if (++core.index === this.size) {
    core.index = 0;
  }

  this.setItem(`map_${currentIndex}`, data);
  this.setItem('map', JSON.stringify(core));
}
/* eslint-enable */

export function lookupGlobalItem (params : Object) {
  const { key } = params;
  const globalItem = this.enableCache && this.cache[key] !== undefined
    ? this.loadGlobalItem({ ret : this.cache[key], ...params })
    : this.getItem(key).then((ret) => this.loadGlobalItem({ ret, ...params }));
  return globalItem;
}

export function loadGlobalItem (params : Object) {
  const { key, ret, autoSync, syncInBackground, syncParams } = params;
  let writebleRet = ret;

  if (writebleRet === null || writebleRet === undefined) {
    if (autoSync && this.sync[key]) {
      return new Promise((resolve, reject) => this.sync[key]({ resolve, reject, syncParams }));
    }
    return Promise.reject(new NotFoundError(JSON.stringify(params)));
  }

  if (typeof writebleRet === 'string') {
    writebleRet = JSON.parse(writebleRet);
    if (this.enableCache) {
      this.cache[key] = writebleRet;
    }
  }

  if (autoSync && this.sync[key]) {
    if (syncInBackground) {
      this.sync[key]({ syncParams });
      return Promise.resolve(writebleRet.data);
    }
    return new Promise((resolve, reject) => this.sync[key]({ resolve, reject, syncParams }));
  }
  return Promise.resolve(writebleRet.data);
}

export function noItemFound (params : Object) {
  const { key, id, autoSync, syncParams } = params;
  if (this.sync[key]) {
    if (autoSync) {
      return new Promise((resolve, reject) => this.sync[key]({ id, syncParams, resolve, reject }));
    }
    return Promise.resolve({ syncId : id });
  }
  return Promise.reject(new NotFoundError(JSON.stringify(params)));
}

export function loadMapItem (params : Object) {
  const { ret, key, id, autoSync, batched, syncInBackground, syncParams } = params;
  if (ret === null || ret === undefined) {
    return this.noItemFound(params);
  }

  if (typeof ret === 'string') {
    const newId = this.getId(key, id);
    if (this.enableCache) {
      this.cache[newId] = JSON.parse(ret);
    }
  }

  if (autoSync && this.sync[key]) {
    if (syncInBackground) {
      this.sync[key]({ id, syncParams });
      return Promise.resolve(ret.data);
    }
    return new Promise((resolve, reject) => this.sync[key]({ id, resolve, reject, syncParams }));
  }

  if (batched) {
    return Promise.resolve({ syncId : id });
  }

  return Promise.resolve(ret.data);
}

export function lookUpInMap (params : Object) {
  const { key, id } = params;
  const core = this.core;
  const newId = this.getId(key, id);

  if (this.enableCache && this.cache[newId]) {
    return this.loadMapItem({ ret : this.cache[newId], ...params });
  }

  if (core[newId] !== undefined) {
    return this.getItem(`map_${core[newId]}`).then((ret) => this.loadMapItem({ret, ...params }));
  }
  return this.noItemFound({ ret : undefined, ...params });
}

