import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export class TodoDB extends Dexie {
  todos!: Table<Todo>;

  constructor() {
    super('todoDB');
    this.version(1).stores({
      todos: 'id, completed',
    });
  }
}

export const db = new TodoDB();
