// Script to migrate database.json local fallback data to Supabase
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const { 
  connectDB, 
  User, 
  Ticket, 
  Comment, 
  KnowledgeBase, 
  Notification, 
  ActivityLog 
} = require('./db');

const JSON_DB_PATH = path.join(__dirname, 'database.json');

const importData = async () => {
  try {
    // 1. Connect to DB (will connect to Supabase if env vars are set)
    await connectDB();

    if (!User.isSupabase()) {
      console.error('Error: Supabase is not active. Please check your server/.env configuration.');
      process.exit(1);
    }

    console.log('Successfully connected to Supabase for data migration.');

    // 2. Read database.json
    if (!fs.existsSync(JSON_DB_PATH)) {
      console.error(`Error: File not found at ${JSON_DB_PATH}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(JSON_DB_PATH, 'utf8');
    const dbData = JSON.parse(rawData);

    // 3. Clear existing data in Supabase tables
    console.log('Clearing existing data in Supabase...');
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Comment.deleteMany({});
    await KnowledgeBase.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Supabase tables cleared.');

    // 4. Seed Users
    if (dbData.users && dbData.users.length > 0) {
      console.log(`Seeding ${dbData.users.length} users...`);
      for (const u of dbData.users) {
        // Clean mongo/json schema specifics if any
        const cleanUser = { ...u };
        await User.create(cleanUser);
      }
    }

    // 5. Seed Tickets
    if (dbData.tickets && dbData.tickets.length > 0) {
      console.log(`Seeding ${dbData.tickets.length} tickets...`);
      for (const t of dbData.tickets) {
        const cleanTicket = { ...t };
        // Ensure attachments is passed as json
        if (cleanTicket.attachments && typeof cleanTicket.attachments === 'string') {
          try {
            cleanTicket.attachments = JSON.parse(cleanTicket.attachments);
          } catch (e) {}
        }
        await Ticket.create(cleanTicket);
      }
    }

    // 6. Seed Comments
    if (dbData.comments && dbData.comments.length > 0) {
      console.log(`Seeding ${dbData.comments.length} comments...`);
      for (const c of dbData.comments) {
        await Comment.create({ ...c });
      }
    }

    // 7. Seed Knowledge Base Articles
    if (dbData.knowledge_base && dbData.knowledge_base.length > 0) {
      console.log(`Seeding ${dbData.knowledge_base.length} knowledge base articles...`);
      for (const kb of dbData.knowledge_base) {
        await KnowledgeBase.create({ ...kb });
      }
    }

    // 8. Seed Notifications
    if (dbData.notifications && dbData.notifications.length > 0) {
      console.log(`Seeding ${dbData.notifications.length} notifications...`);
      for (const n of dbData.notifications) {
        await Notification.create({ ...n });
      }
    }

    // 9. Seed Activity Logs
    if (dbData.activity_logs && dbData.activity_logs.length > 0) {
      console.log(`Seeding ${dbData.activity_logs.length} activity logs...`);
      for (const log of dbData.activity_logs) {
        await ActivityLog.create({ ...log });
      }
    }

    console.log('🎉 Data migration from database.json to Supabase completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

importData();
