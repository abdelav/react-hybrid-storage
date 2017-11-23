// Module
import Storage from '../src';

const size = 10;
const defaultExpires = 1000 * 3600;
const localStorage = new Storage({
  size,
  defaultExpires,
  storageBackend : window.localStorage,
});
const asyncStorage = new Storage({
  size,
  defaultExpires,
  storageBackend : window.asyncStorage,
});
const stores = { localStorage, asyncStorage };

describe('react-hybrid-storage: basic function', () => {
  Object.keys(stores).map(storageKey => {
    const storage = stores[storageKey];

    test(`accepts parameters in constructor (${storageKey})`, () => {
      expect(storage.size).toBe(size);
      expect(storage.defaultExpires).toBe(defaultExpires);
    });

    test(`saves and loads any type of data (${storageKey})`, async () => {
      const testCases = {
        testNumber : 11221,
        testString : 'testString',
        testObject : {
          fname : 'foo',
          lname : 'bar',
        },
        testArray     : [ 'one', 'two', 'three' ],
        testBoolean   : false,
        testNull      : null,
        complexObject : {
          complexArray : [ 1, 2, 3, 'test', { a : 'b' } ],
        },
      };
      const tasks = [];
      const returnCases = {};
      const returnCasesWithId = {};
      for (const key in testCases) {
        if (Object.prototype.hasOwnProperty.call(testCases, key)) {
          const saveObj = await storage.save({ key, data : testCases[key] });
          returnCases[key] = await storage.load({ key });
          tasks.push(saveObj);

          const saveObjWithId = await storage.save({ key, id : 1, data : testCases[key] });
          returnCasesWithId[key] = await storage.load({ key, id : 1 });
          tasks.push(saveObjWithId);
        }
      }

      return Promise.all(tasks).then(() => {
        for (const key in testCases) {
          if (Object.prototype.hasOwnProperty.call(testCases, key)) {
            expect(JSON.stringify(testCases[key])).toBe(JSON.stringify(returnCases[key]));
            expect(JSON.stringify(testCases[key])).toBe(JSON.stringify(returnCasesWithId[key]));
          }
        }
      });
    });

    test(`rejects when no data found and no sync method (${storageKey})`, () => {
      const testKey1 = `testKey${Math.random()}`;
      const testKey2 = `testKey${Math.random()}`;
      const testId2 = `testId${Math.random()}`;
      let ret1;
      let ret2;
      let error1;
      let error2;

      const tasks = [
        storage.load({
          key : testKey1,
        }).then(ret => {
          ret1 = ret;
        }).catch(e => {
          error1 = e;
        }),
        storage.load({
          key : testKey2,
          id  : testId2,
        }).then(ret => {
          ret2 = ret;
        }).catch(e => {
          error2 = e;
        }),
      ];

      return Promise.all(tasks).then(() => {
        expect(ret1).toBeUndefined();
        expect(ret2).toBeUndefined();
        expect(error1.name).toBe('NotFoundError');
        expect(error2.name).toBe('NotFoundError');
      });
    });

    /* test(`rejects when data expired and no sync method (${storageKey})`, () => {
      const originGetTime = Date.prototype.getTime;
      const testKey1 = `testKey${Math.random()}`;
      const testKey2 = `testKey${Math.random()}`;
      const testId2 = `testId${Math.random()}`;
      const testData1 = `testData1${Math.random()}`;
      const testData2 = `testData2${Math.random()}`;
      let starttime = 0;
      let ret1;
      let ret2;
      let error1;
      let error2;

      Date.prototype.getTime = jest.fn(() => {  // eslint-disable-line
        const newTime = starttime += 100;
        return newTime;
      });

      const tasks = [
        storage.save({
          key     : testKey1,
          data    : testData1,
          expires : 1,
        }).then(() =>
          storage.load({ key : testKey1 })
        ).then((ret) => {
          ret1 = ret;
        }).catch((e) => {
          error1 = e;
        }),
        storage.save({
          key     : testKey2,
          id      : testId2,
          data    : testData2,
          expires : 1,
        }).then(() =>
          storage.load({ key : testKey2, id : testId2 })
        ).then((ret) => {
          ret2 = ret;
        }).catch((e) => {
          error2 = e;
        }),
      ];
      return Promise.all(tasks).then(() => {
        expect(ret1).toBeUndefined();
        expect(ret2).toBeUndefined();
        expect(error1.name).toBe('ExpiredError');
        expect(error2.name).toBe('ExpiredError');
        Date.prototype.getTime = originGetTime;  // eslint-disable-line
      });
    }); */

    test(`removes data correctly (${storageKey})`, () => {
      const testKey1 = `testKey1${Math.random()}`;
      const testKey2 = `testKey2'${Math.random()}`;
      const testId2 = `testId2${Math.random()}`;
      const testData1 = `testData1${Math.random()}`;
      const testData2 = `{testData2${Math.random()}`;
      const ret1 = [undefined, undefined];
      const ret2 = [undefined, undefined];

      function task (key, id, data, retArray) {
        return storage.save({ key, id, data }).then(() => {
          return storage.load({ key, id });
        }).then((ret) => {
          retArray[0] = ret;
          return storage.remove({ key, id });
        }).then(() => {
          return storage.load({ key, id });
        }).then(ret => {
          retArray[1] = ret;
        }).catch(() => {
          retArray[1] = 'catched';
        });
      }

      return Promise.all([
        task(testKey1, undefined, testData1, ret1),
        task(testKey2, testId2, testData2, ret2),
      ]).then(() => {
        expect(ret1[0]).toBe(testData1);
        expect(ret1[1]).toBe('catched');
        expect(ret2[0]).toBe(testData2);
        expect(ret2[1]).toBe('catched');
      });
    });

    test(`gets all data for key correctly (${storageKey})`, () => {
      const key = `testKey${Math.random()}`;
      const testIds = [Math.random(), Math.random(), Math.random()];
      const testDatas = [Math.random(), Math.random(), Math.random()];
      return Promise.all(testIds.map((id, i) => {
        return storage.save({ key, id, data : testDatas[i] });
      })).then(() => {
        return storage.getAllDataForKey(key);
      }).then(realRet => {
        expect(realRet).toEqual(testDatas);
      });
    });

    test(`removes all data for key correctly (${storageKey})`, () => {
      const key = `testKey${Math.random()}`;
      const testIds = [Math.random(), Math.random(), Math.random()];
      const testDatas = [Math.random(), Math.random(), Math.random()];
      let ret;
      return Promise.all(
        testIds.map((id, i) => storage.save({ key, id, data : testDatas[i] }))
      ).then(() => {
        return storage.clearMapForKey(key);
      }).then(() => {
        return storage.getAllDataForKey(key);
      }).then((realRet) => {
        ret = realRet;
      }).catch(() => {
        ret = undefined;
      }).then(() => {
        expect(Array.isArray(ret)).toBe(true);
        expect(ret.length).toBe(0);
      });
    });

    test(`loads ids by key correctly' (${storageKey})`, () => {
      const key = `testKey${Math.random()}`;
      const testIds = [Math.random(), Math.random(), Math.random()];
      const data = `testData${Math.random()}`;
      const tasks = testIds.map((id) => storage.save({ key, id, data }));
      return Promise.all(tasks).then(() => {
        storage.getIdsForKey(key).then((rets) => {
          expect(rets).toEqual(testIds);
        });
      });
    });
  });
});
