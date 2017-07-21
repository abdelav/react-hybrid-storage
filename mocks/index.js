const localStorageMock = (() => {
  const localStorage = {};
  Object.defineProperty(localStorage, 'getItem', {
    value        : (key) => (localStorage[key] === undefined) ? null : localStorage[key],
    writable     : false,
    configurable : false,
    enumerable   : false,
  });

  Object.defineProperty(localStorage, 'setItem', {
    value : (sKey, sValue) => {
      if (typeof sValue !== 'object') {
        localStorage[sKey] = sValue + '';
      } else {
        localStorage[sKey] = sValue;
      }
    },
    writable     : false,
    configurable : false,
    enumerable   : false,
  });

  Object.defineProperty(localStorage, 'removeItem', {
    value : (sKey) => {
      if (!sKey) return;
      delete localStorage[sKey];
    },
    writable     : false,
    configurable : false,
    enumerable   : false,
  });

  Object.defineProperty(localStorage, 'length', {
    get          : () => Object.keys(localStorage).length,
    configurable : false,
    enumerable   : false,
  });

  Object.defineProperty(localStorage, 'clear', {
    value : () => {
      Object.keys(localStorage).forEach((key) => {
        delete localStorage[key];
      });
    },
    writable     : false,
    configurable : false,
    enumerable   : false,
  });

  return localStorage;
})();

const asyncStorageMock = (() => {
  const data = {};
  const asyncStorage = {
    getItem : (key) => {
      return new Promise((resolve) => {
        resolve(data[key]);
      });
    },
    setItem : (key, value) => {
      return new Promise((resolve) => {
        data[key] = value;
        resolve();
      });
    },
    removeItem : (key) => {
      return new Promise((resolve) => {
        if (data[key]) {
          delete data[key];
        }
        resolve();
      });
    },
  };

  return asyncStorage;
})();

Object.defineProperty(window, 'localStorage', { value : localStorageMock });
Object.defineProperty(window, 'asyncStorage', { value : asyncStorageMock });
