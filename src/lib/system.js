// @flow

export function getItem (key : string) : Promise<any> {
  const method = this.isPromise
    ? this.storage.getItem(key)
    : Promise.resolve(this.storage.getItem(key));
  return this.storage ? method : Promise.resolve();
}

export function setItem (key : string, value : Object) : Promise<any> {
  const method = this.isPromise
    ? this.storage.setItem(key, value)
    : Promise.resolve(this.storage.setItem(key, value));
  return this.storage ? method : Promise.resolve();
}

export function removeItem (key : string) : Promise<any> {
  const method = this.isPromise
    ? this.storage.removeItem(key)
    : Promise.resolve(this.storage.removeItem(key));
  return this.storage ? method : Promise.resolve();
}

export function save (params : Object) : Promise<any> {
  const { key, id, data } = params;
  let dataToSave = { data };
  let infoToReturn;

  if (key.toString().indexOf('_') !== -1) {
    console.error('Please do not use "_" in key!');
  }

  if (data === undefined) {
    console.error('"data" is required in save()!');
  }

  dataToSave = JSON.stringify(dataToSave);
  if (id === undefined) {
    if (this.enableCache) {
      const cacheData = JSON.parse(dataToSave);
      this.cache[key] = cacheData;
    }
    infoToReturn = this.setItem(key, dataToSave);
  } else {
    if (id.toString().indexOf('_') !== -1) {
      console.error('Please do not use "_" in id!');
    }
    infoToReturn = this.mapPromise.then(() => this.saveToMap({ key, id, data : dataToSave }));
  }

  return infoToReturn;
}

export function getBatchData (querys : Array<Object>) : Promise<any> {
  const tasks = querys.map((query) => this.load(query));
  return Promise.all(tasks);
}

export function getBatchDataWithIds (params : Object) : Promise<any> {
  const { key, ids, syncInBackground } = params;
  return Promise.all(
    ids.map((id) => this.load({ key, id, syncInBackground, autoSync : false, batched : true }))
  ).then((results) => {
    return new Promise((resolve, reject) => {
      const filteredIds = results.filter((value) => value.syncId !== undefined);
      if (!ids.length) {
        return resolve();
      }
      return this.sync[key]({
        id : filteredIds.map((value) => value.syncId),
        resolve,
        reject,
      });
    }).then((data = []) => {
      return results.map((value) => value.syncId ? data.shift() : value);
    });
  });
}

// TODO: fix this with the appropiate use of return.
/* eslint-disable */
export function remove (params : Object) : Promise<any> {
  return this.mapPromise.then(() => {
    const { key, id } = params;
    const core = this.core;
    const newId = this.getId(key, id);

    if (id === undefined) {
      if (this.enableCache && this.cache[key]) {
        delete this.cache[key];
      }
      return this.removeItem(key);
    }

    // Remove existed data
    if (core[newId] !== undefined) {
      const idTobeDeleted = core[newId];
      if (this.enableCache && this.cache[newId]) {
        delete this.cache[newId];
      }

      this.removeIdInKey(key, id);
      delete core[newId];
      this.setItem('map', JSON.stringify(core));
      return this.removeItem(`map_${idTobeDeleted}`);
    }
  });
}
/* eslint-enable */

export function load (params : Object) : Promise<any> {
  const { key, id, autoSync = true, syncInBackground = true, syncParams } = params;
  return this.mapPromise.then(() => new Promise((resolve, reject) => {
    if (id === undefined) {
      return resolve(this.lookupGlobalItem({ key, resolve, reject, autoSync, syncInBackground, syncParams }));
    }

    return resolve(this.lookUpInMap({ key, id, resolve, reject, autoSync, syncInBackground, syncParams }));
  }));
}

export function clearMap () : void {
  this.removeItem('map').then(() => {
    this.core = this.initMap();
  });
}

export function clearMapForKey (key : string) : Promise<any> {
  return this.mapPromise.then(() => {
    const tasks = (this.core.__keys__[key] || []).map(id => this.remove({ key, id }));
    return Promise.all(tasks);
  });
}

export function getIdsForKey (key : string) : Promise<any> {
  return this.mapPromise.then(() => {
    return this.core.__keys__[key] || [];
  });
}

export function getAllDataForKey (key : string, options : Object) : Promise<any> {
  const syncOptions = Object.assign({ syncInBackground : true }, options);
  return this.getIdsForKey(key).then(ids => {
    const querys = ids.map(id => ({ key, id, syncInBackground : syncOptions.syncInBackground }));
    return this.getBatchData(querys);
  });
}
