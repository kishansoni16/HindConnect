require('dotenv').config();
const { connectDB, User } = require('./db');

async function check() {
  await connectDB();
  const users = await User.find({});
  console.log('--- ALL USERS IN DB ---');
  users.forEach(u => {
    console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Department: ${u.department}, Approved: ${u.isApproved}`);
  });
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
