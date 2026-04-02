import Database from 'better-sqlite3';

const db = new Database('dev.db');
const users = db.prepare('SELECT id, email, role, status FROM User').all();
console.log('Users in DB:', users);
db.close();
