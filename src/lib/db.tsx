import Dexie, { Table } from 'dexie'

import { TProject } from '../types'

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
