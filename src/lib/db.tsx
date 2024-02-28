import Dexie, { Table } from 'dexie'

export interface TProject {
   id?: number
   path: string
}

export class MyXplodeDB extends Dexie {
   project!: Table<TProject>

   constructor() {
      super('xplode')
      this.version(1).stores({
         project: '++id, path',
      })
   }
}

export const db = new MyXplodeDB()
