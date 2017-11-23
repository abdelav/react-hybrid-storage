// Module
import Storage from '../src';

const localStorage = new Storage({ storageBackend : window.localStorage });
const asyncStorage = new Storage({ storageBackend : window.asyncStorage });
const stores = { localStorage, asyncStorage };

describe('react-native-storage: batch and sync test', () => {
  Object.keys(stores).map(storageKey => {
    const storage = stores[storageKey];
    test(`triggers sync when no data found (${storageKey})`, () => {
      const testKey1 = `testKey1${Math.random()}`;
      const testKey2 = `testKey2${Math.random()}`;
      const testId = `testId${Math.random()}`;
      const syncData = 'syncData';

      const sync1 = jest.fn((params) => {
        const { resolve } = params;
        resolve && resolve(syncData);
      });

      const sync2 = jest.fn((params) => {
        const { id, resolve } = params;
        resolve && resolve(syncData + id);
      });

      storage.sync[testKey1] = sync1;
      storage.sync[testKey2] = sync2;

      return Promise.all([
        storage.load({ key : testKey1 }), // Key not found
        storage.load({ key : testKey2, id : testId }), // Key and id not found
      ]).then(([ret1, ret2]) => {
        expect(ret1).toBe(syncData);
        expect(sync1.mock.calls.length).toBe(1);
        expect(sync2.mock.calls.length).toBe(1);
        expect(ret2).toBe(syncData + testId);
      });
    });

    /* test(`does not trigger sync when data found and do not expire (${storageKey})`, () => {
      const testKey1 = `testKey1${Math.random()}`;
      const testKey2 = `testKey2${Math.random()}`;
      const testId = `testId${Math.random()}`;
      const testData1 = 'testData1';
      const testData2 = 'testData2';
      const syncData = 'syncData';

      const sync1 = jest.fn((params) => {
        const { resolve } = params;
        resolve && resolve(syncData);
      });

      const sync2 = jest.fn(params => {
        const { id, resolve } = params;
        resolve && resolve(syncData + id);
      });

      storage.sync[testKey1] = sync1;
      storage.sync[testKey2] = sync2;

      // Save data, expires in long time
      storage.save({ key : testKey1, data : testData1, expires : 10000 });
      storage.save({ key : testKey2, id : testId, data : testData2, expires : 10000 });

      // Instantly load
      return Promise.all([
        storage.load({ key : testKey1 }),
        storage.load({ key : testKey2, id : testId }),
      ]).then(([ret1, ret2]) => {
        expect(ret1).toBe(testData1);
        expect(sync1.mock.calls.length).toBe(0);
        expect(sync2.mock.calls.length).toBe(0);
        expect(ret2).toBe(testData2);
      });
    }); */

    test(`triggers sync when data expires but still returns outdated data(syncInBackground: true) (${storageKey})`, () => {
      const testKey1 = `testKey1${Math.random()}`;
      const testKey2 = `testKey2${Math.random()}`;
      const testId = `testId${Math.random()}`;
      const testData1 = 'testData1';
      const testData2 = 'testData2';
      const syncData = 'syncData';

      const sync1 = jest.fn(params => {
        const { resolve } = params;
        resolve && resolve(syncData);
      });

      const sync2 = jest.fn(params => {
        const { id, resolve } = params;
        resolve && resolve(syncData + id);
      });

      storage.sync[testKey1] = sync1;
      storage.sync[testKey2] = sync2;

      // Save data, expires in no time
      storage.save({ key : testKey1, data : testData1, expires : -1 });
      storage.save({ key : testKey2, id : testId, data : testData2, expires : -1 });

      // Instantly load
      return Promise.all([
        storage.load({ key : testKey1 }),
        storage.load({ key : testKey2, id : testId }),
      ]).then(([ret1, ret2]) => {
        expect(ret1).toBe(testData1);
        expect(sync1.mock.calls.length).toBe(1);
        expect(ret2).toBe(testData2);
        expect(sync2.mock.calls.length).toBe(1);
      });
    });

    test(`triggers sync when data expires and returns latest data(syncInBackground: false) (${storageKey})`, () => {
      const testKey1 = `testKey1${Math.random()}`;
      const testKey2 = `testKey2${Math.random()}`;
      const testId = `testId${Math.random()}`;
      const testData1 = 'testData1';
      const testData2 = 'testData2';
      const syncData = 'syncData';

      const sync1 = jest.fn(params => {
        const { resolve } = params;
        resolve && resolve(syncData);
      });

      const sync2 = jest.fn(params => {
        const { id, resolve } = params;
        resolve && resolve(syncData + id);
      });

      storage.sync[testKey1] = sync1;
      storage.sync[testKey2] = sync2;

      // Save data, expires in no time
      storage.save({ key : testKey1, data : testData1, expires : -1 });
      storage.save({ key : testKey2, id : testId, data : testData2, expires : -1 });

      // Instantly load
      return Promise.all([
        storage.load({ key : testKey1, syncInBackground : false }),
        storage.load({ key : testKey2, id : testId, syncInBackground : false }),
      ]).then(([ret1, ret2]) => {
        expect(ret1).toBe(syncData);
        expect(sync1.mock.calls.length).toBe(1);
        expect(ret2).toBe(syncData + testId);
        expect(sync2.mock.calls.length).toBe(1);
      });
    });

    test(`returns batch data with batch keys (${storageKey})`, () => {
      const testKey1 = `testKey1${Math.random()}`;
      const testKey2 = `testKey2${Math.random()}`;
      const testKey3 = `testKey3${Math.random()}`;
      const testData1 = 'testData1';
      const testData2 = 'testData2';
      const testData3 = 'testData3';

      const sync3 = jest.fn((params) => {
        const { resolve } = params;
        resolve && resolve(testData3);
      });

      storage.sync[testKey3] = sync3;

      // Save key1 and key2
      storage.save({ key : testKey1, data : testData1 });
      storage.save({ key : testKey2, data : testData2 });

      // Instantly load
      return storage.getBatchData([
        { key : testKey1 },
        { key : testKey2 },
        { key : testKey3 },
      ]).then((ret) => {
        expect(ret[0]).toBe(testData1);
        expect(ret[1]).toBe(testData2);
        expect(ret[2]).toBe(testData3);
        expect(sync3.mock.calls.length).toBe(1);
      });
    });

    test(`returns batch data with batch ids (${storageKey})`, () => {
      const testKey = `testKey${Math.random()}`;
      const testId1 = `testId1${Math.random()}`;
      const testId2 = `testId2${Math.random()}`;
      const testId3 = `testId3${Math.random()}`;
      const testData1 = 'testData1';
      const testData2 = 'testData2';
      const testData3 = 'testData3';

      const sync = jest.fn(params => {
        const { resolve } = params;
        resolve && resolve([testData3]); // when id is an array, the return value should be an ordered array too
      });

      storage.sync[testKey] = sync;

      // Save id1 and id2
      storage.save({ key : testKey, id : testId1, data : testData1 });
      storage.save({ key : testKey, id : testId2, data : testData2 });

      // Instantly load
      return storage.getBatchDataWithIds({
        key : testKey,
        ids : [testId1, testId2, testId3],
      }).then(ret => {
        expect(ret[0]).toBe(testData1);
        expect(ret[1]).toBe(testData2);
        expect(ret[2]).toBe(testData3);
        expect(JSON.stringify(sync.mock.calls[0][0].id)).toBe(JSON.stringify([testId3]));
      });
    });
  });
});
