import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('dev.db');
const user = db.prepare('SELECT passwordHash FROM User WHERE email = ?').get('admin@example.com') as any;

if (user) {
  const isMatch = bcrypt.compareSync('adminpassword', user.passwordHash);
  console.log('Password "adminpassword" matches hash in DB:', isMatch);
} else {
  console.log('User not found');
}
db.close();
