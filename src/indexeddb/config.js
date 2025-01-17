/** @type {import('react-indexed-db-hook').IndexedDBProps} */
export const DBConfig = {
  name: "BusinessDaysToGo",
  version: 1,
  objectStoresMeta: [
    {
      store: "events",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "name", keypath: "name", options: { unique: false } },
        { name: "date", keypath: "date", options: { unique: false } }
      ]
    },
    {
      store: "days",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "name", keypath: "name", options: { unique: false } },
        { name: "date", keypath: "date", options: { unique: true } }
      ]
    }
  ]
}
