# react-hybrid-storage [![Build Status](https://travis-ci.org/dnamic/react-hybrid-storage.svg?branch=master)](https://travis-ci.org/dnamic/react-hybrid-storage)

A local storage wrapper for both react-native([AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html)) and browser([localStorage](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)).
## Features

- Promise based for async load.
- Size controlling.
- Auto expiring.
- Remote data auto syncing.
- Get a batch data in one query.

## Install

in react-native environment require react-native version >= 0.13

	npm install react-hybrid-storage --save OR yarn add react-hybrid-storage
  
## Usage

#### Import

```js
import Storage from 'react-hybrid-storage';
```  

Do not use `require('react-hybrid-storage')`, which would cause error in react-native version >= 0.16.

#### Init

```js
import Storage from 'react-hybrid-storage';
import { AsyncStorage } from 'react-native'; // Don't import if the target is web

const storage = new Storage({
  size           : 1000, // maximum capacity, default 1000 
  storageBackend : AsyncStorage, // Use AsyncStorage for RN, or window.localStorage for web.
  defaultExpires : 1000 * 3600 * 24, // expire time, default 1 day(1000 * 3600 * 24 milliseconds).
  enableCache    : true, // cache data in the memory. default is true.
  sync           : {}, 
})	

// I suggest you have one(and only one) storage instance in global scope.

// for web
window.storage = storage;

// for react-native
global.storage = storage;
```

#### Save

- key : should be an unique string value and are permanently stored unless you remove, do not use underscore("_") in key!
- data : any valid JSON object to save.
- expires : expire time in milliseconds, if set to null, then it will never expire.

```js
storage.save({
  key  : 'auth',
  data : {
    token   : 'some access token',
    refresh : 'some refresh token',
  },
  expires : 1000 * 3600,
});
```

#### Load

- key : a string value (key) that we want to load.
- autoSync : if data not found or expired, then invoke the corresponding sync method.
- syncInBackground : if data expired, return the outdated data first while invoke the sync method.
- syncParams : you can pass extra params to sync method.

```js
try {
  const { token, refresh } = await storage.load({
    key              : 'auth',
    autoSync         : true,
    syncInBackground : true,
    syncParams       : {},
  });

  console.log(token);
} catch (error) {
  // Do something
} 

```

## Credits

This library is a rewrite of [react-native-storage](https://github.com/sunnylqm/react-native-storage) originally created by sunnylqm. We really appreciate the effort he did solving the issue we face using localstorage and async storage in multiplatform enviorments.

## License

MIT
