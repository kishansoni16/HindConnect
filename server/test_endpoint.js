require('dotenv').config();
const { connectDB, User } = require('./db');

async function run() {
  await connectDB();
  const users = await User.find({});
  console.log('Total users found in DB:', users.length);
  
  // Simulate getRecipients controller logic
  const formatted = users.map(u => ({
    id: u.id || u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department
  }));

  console.log('--- RECIPIENT ENDPOINT MOCK RESPONSE ---');
  console.log(JSON.stringify(formatted, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
