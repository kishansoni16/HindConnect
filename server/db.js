const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
const BUNDLED_DB_PATH = path.join(__dirname, 'database.json');
const JSON_DB_PATH = isServerless ? '/tmp/database.json' : BUNDLED_DB_PATH;
let bundledSeedData = { users: [], tickets: [], comments: [], knowledge_base: [], notifications: [], activity_logs: [] };
try { bundledSeedData = require('./database.json'); } catch (e) { /* ignore */ }
let useMongo = false;
let useSupabase = false;
let supabase = null;

// Simple Mongoose schema definitions
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Employee', 'IT Staff', 'Admin'], default: 'Employee' },
  department: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  mobile: { type: String },
  bloodGroup: { type: String },
  doj: { type: String },
  empCode: { type: String },
  designation: { type: String },
  emergencyContact: { type: String }
});

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'Pending', 'Resolved', 'Closed'], default: 'Open' },
  department: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, default: null },
  recipientId: { type: String, default: null },
  recipientName: { type: String, default: null },
  assignedTo: { type: String, default: null },
  slaDeadline: { type: Date },
  attachments: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  message: { type: String, required: true },
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const kbSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: Number, default: 0 },
  helpfulVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const activityLogSchema = new mongoose.Schema({
  ticketId: { type: String },
  action: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

let MongoUser, MongoTicket, MongoComment, MongoKb, MongoNotification, MongoActivityLog;

// Initialize JSON database if needed
const initJsonDb = () => {
  if (!fs.existsSync(JSON_DB_PATH)) {
    try {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(bundledSeedData, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing initial JSON DB:', err);
    }
  }
};

const readJsonDb = () => {
  try {
    initJsonDb();
    if (fs.existsSync(JSON_DB_PATH)) {
      const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading JSON DB:', error);
  }
  return bundledSeedData;
};

const writeJsonDb = (data) => {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON DB:', err);
  }
};

// JSON database collection wrapper to mimic Mongoose
class JsonModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async find(query = {}) {
    const db = readJsonDb();
    const items = db[this.collectionName] || [];
    return items.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }).map(item => ({ ...item }));
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  async findById(id) {
    return this.findOne({ id });
  }

  async create(data) {
    const db = readJsonDb();
    if (!db[this.collectionName]) db[this.collectionName] = [];
    const newItem = {
      id: uuidv4(),
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    db[this.collectionName].push(newItem);
    writeJsonDb(db);
    return { ...newItem };
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const db = readJsonDb();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    
    const current = items[index];
    let updated = { ...current, ...updateData, updatedAt: new Date().toISOString() };
    
    items[index] = updated;
    writeJsonDb(db);
    return { ...updated };
  }

  async updateOne(query, updateData) {
    const db = readJsonDb();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return { nModified: 0 };
    items[index] = { ...items[index], ...updateData, updatedAt: new Date().toISOString() };
    writeJsonDb(db);
    return { nModified: 1 };
  }

  async deleteMany(query = {}) {
    const db = readJsonDb();
    const items = db[this.collectionName] || [];
    const beforeCount = items.length;
    const remaining = items.filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    db[this.collectionName] = remaining;
    writeJsonDb(db);
    return { deletedCount: beforeCount - remaining.length };
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

const TABLE_COLUMNS = {
  users: [
    'id', '_id', 'name', 'email', 'password', 'role', 'department', 
    'isApproved', 'mobile', 'bloodGroup', 'doj', 'empCode', 
    'designation', 'emergencyContact', 'createdAt'
  ],
  tickets: [
    'id', '_id', 'title', 'description', 'category', 'priority', 
    'status', 'department', 'employeeId', 'employeeName', 'recipientId', 
    'recipientName', 'assignedTo', 'slaDeadline', 'attachments', 
    'createdAt', 'updatedAt'
  ],
  comments: [
    'id', '_id', 'ticketId', 'userId', 'userName', 'userRole', 
    'message', 'isInternal', 'createdAt'
  ],
  knowledge_base: [
    'id', '_id', 'title', 'category', 'content', 'views', 
    'helpfulVotes', 'createdAt'
  ],
  notifications: [
    'id', '_id', 'userId', 'message', 'isRead', 'createdAt'
  ],
  activity_logs: [
    'id', '_id', 'ticketId', 'action', 'userId', 'userName', 
    'details', 'createdAt'
  ]
};

// Supabase database collection wrapper to mimic Mongoose
class SupabaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async find(query = {}) {
    try {
      let q = supabase.from(this.tableName).select('*');
      for (let key in query) {
        if (key === '_id' || key === 'id') {
          q = q.or(`id.eq.${query[key]},_id.eq.${query[key]}`);
        } else if (query[key] !== undefined && query[key] !== null) {
          q = q.eq(key, query[key]);
        }
      }
      const { data, error } = await q;
      if (error) {
        if (error.code === '42703' || (error.message && error.message.includes('column'))) {
          console.warn(`Supabase find column missing fallback on ${this.tableName}:`, error.message);
          return [];
        }
        console.error(`Supabase find error on ${this.tableName}:`, error);
        throw error;
      }
      return (data || []).map(item => ({ ...item, _id: item.id || item._id, id: item.id || item._id }));
    } catch (err) {
      if (err.code === '42703' || (err.message && err.message.includes('column'))) {
        return [];
      }
      throw err;
    }
  }

  async findOne(query = {}) {
    try {
      let q = supabase.from(this.tableName).select('*');
      for (let key in query) {
        if (key === '_id' || key === 'id') {
          q = q.or(`id.eq.${query[key]},_id.eq.${query[key]}`);
        } else if (query[key] !== undefined && query[key] !== null) {
          q = q.eq(key, query[key]);
        }
      }
      const { data, error } = await q.limit(1);
      if (error) {
        if (error.code === '42703' || (error.message && error.message.includes('column'))) {
          return null;
        }
        console.error(`Supabase findOne error on ${this.tableName}:`, error);
        throw error;
      }
      if (!data || data.length === 0) return null;
      return { ...data[0], _id: data[0].id, id: data[0].id };
    } catch (err) {
      if (err.code === '42703' || (err.message && err.message.includes('column'))) {
        return null;
      }
      throw err;
    }
  }

  async findById(id) {
    return this.findOne({ id });
  }

  async create(data) {
    const columns = TABLE_COLUMNS[this.tableName] || [];
    const insertData = {};
    for (let key of columns) {
      if (data[key] !== undefined) {
        insertData[key] = data[key];
      }
    }
    if (!insertData.id) {
      const id = data.id || data._id || uuidv4();
      insertData.id = id;
      insertData._id = id;
    }
    if (columns.includes('createdAt') && !insertData.createdAt) {
      insertData.createdAt = new Date().toISOString();
    }
    if (columns.includes('updatedAt') && !insertData.updatedAt) {
      insertData.updatedAt = new Date().toISOString();
    }

    const { data: inserted, error } = await supabase
      .from(this.tableName)
      .insert(insertData)
      .select();

    if (error) {
      console.error(`Supabase create error on ${this.tableName}:`, error);
      throw error;
    }
    return { ...inserted[0], _id: inserted[0].id, id: inserted[0].id };
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const columns = TABLE_COLUMNS[this.tableName] || [];
    const cleanUpdate = {};
    for (let key of columns) {
      if (updateData[key] !== undefined && key !== 'id' && key !== '_id') {
        cleanUpdate[key] = updateData[key];
      }
    }
    if (columns.includes('updatedAt') && !cleanUpdate.updatedAt) {
      cleanUpdate.updatedAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update(cleanUpdate)
      .or(`id.eq.${id},_id.eq.${id}`)
      .select();

    if (error) {
      console.error(`Supabase findByIdAndUpdate error on ${this.tableName}:`, error);
      throw error;
    }
    if (!data || data.length === 0) return null;
    return { ...data[0], _id: data[0].id, id: data[0].id };
  }

  async updateOne(query, updateData) {
    const columns = TABLE_COLUMNS[this.tableName] || [];
    const cleanUpdate = {};
    for (let key of columns) {
      if (updateData[key] !== undefined && key !== 'id' && key !== '_id') {
        cleanUpdate[key] = updateData[key];
      }
    }
    if (columns.includes('updatedAt') && !cleanUpdate.updatedAt) {
      cleanUpdate.updatedAt = new Date().toISOString();
    }

    let q = supabase.from(this.tableName).update(cleanUpdate);
    for (let key in query) {
      if (key === '_id' || key === 'id') {
        q = q.or(`id.eq.${query[key]},_id.eq.${query[key]}`);
      } else if (query[key] !== undefined && query[key] !== null) {
        q = q.eq(key, query[key]);
      }
    }
    const { data, error } = await q.select();
    if (error) {
      console.error(`Supabase updateOne error on ${this.tableName}:`, error);
      throw error;
    }
    return { nModified: data ? data.length : 0 };
  }

  async deleteMany(query = {}) {
    let q = supabase.from(this.tableName).delete();
    let hasFilter = false;
    for (let key in query) {
      if (key === '_id' || key === 'id') {
        q = q.or(`id.eq.${query[key]},_id.eq.${query[key]}`);
        hasFilter = true;
      } else if (query[key] !== undefined && query[key] !== null) {
        q = q.eq(key, query[key]);
        hasFilter = true;
      }
    }
    if (!hasFilter) {
      q = q.neq('id', 'all');
    }
    const { data, error } = await q.select();
    if (error) {
      console.error(`Supabase deleteMany error on ${this.tableName}:`, error);
      throw error;
    }
    return { deletedCount: data ? data.length : 0 };
  }

  async countDocuments(query = {}) {
    let q = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    for (let key in query) {
      if (key === '_id' || key === 'id') {
        q = q.or(`id.eq.${query[key]},_id.eq.${query[key]}`);
      } else if (query[key] !== undefined && query[key] !== null) {
        q = q.eq(key, query[key]);
      }
    }
    const { count, error } = await q;
    if (error) {
      console.error(`Supabase countDocuments error on ${this.tableName}:`, error);
      throw error;
    }
    return count || 0;
  }
}

// Connect Function
let dbConnectPromise = null;

const connectDB = async () => {
  if (dbConnectPromise) return dbConnectPromise;

  dbConnectPromise = (async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        console.log('Initializing Supabase client...');
        supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test the connection by doing a simple select on users
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) {
          throw error;
        }
        console.log('Supabase connected successfully');
        useSupabase = true;
        useMongo = false;
        return;
      } catch (error) {
        console.warn('Supabase connection failed. Falling back to local JSON database.', error.message);
      }
    }

    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');
        useMongo = true;
        useSupabase = false;

        MongoUser = mongoose.model('User', userSchema);
        MongoTicket = mongoose.model('Ticket', ticketSchema);
        MongoComment = mongoose.model('Comment', commentSchema);
        MongoKb = mongoose.model('KnowledgeBase', kbSchema);
        MongoNotification = mongoose.model('Notification', notificationSchema);
        MongoActivityLog = mongoose.model('ActivityLog', activityLogSchema);
        return;
      } catch (error) {
        console.warn('MongoDB connection failed. Falling back to local JSON database.', error.message);
      }
    } else {
      console.log('No database credentials (Supabase/Mongo) specified. Using local JSON database fallback.');
    }
    
    useMongo = false;
    useSupabase = false;
    initJsonDb();
  })();

  return dbConnectPromise;
};

// Expose unified models
const getModel = (name, mongoModelFactory, jsonCollectionName, supabaseTableName) => {
  return {
    find: (query) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).find(query);
      if (useMongo) return mongoModelFactory().find(query).lean();
      return new JsonModel(jsonCollectionName).find(query);
    },
    findOne: (query) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).findOne(query);
      if (useMongo) return mongoModelFactory().findOne(query).lean();
      return new JsonModel(jsonCollectionName).findOne(query);
    },
    findById: (id) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).findById(id);
      if (useMongo) return mongoModelFactory().findById(id).lean();
      return new JsonModel(jsonCollectionName).findById(id);
    },
    create: (data) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).create(data);
      if (useMongo) return mongoModelFactory().create(data);
      return new JsonModel(jsonCollectionName).create(data);
    },
    findByIdAndUpdate: (id, update, options) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).findByIdAndUpdate(id, update, options);
      if (useMongo) return mongoModelFactory().findByIdAndUpdate(id, update, { new: true, ...options }).lean();
      return new JsonModel(jsonCollectionName).findByIdAndUpdate(id, update, options);
    },
    updateOne: (query, update) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).updateOne(query, update);
      if (useMongo) return mongoModelFactory().updateOne(query, update);
      return new JsonModel(jsonCollectionName).updateOne(query, update);
    },
    deleteMany: (query) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).deleteMany(query);
      if (useMongo) return mongoModelFactory().deleteMany(query);
      return new JsonModel(jsonCollectionName).deleteMany(query);
    },
    countDocuments: (query) => {
      if (useSupabase) return new SupabaseModel(supabaseTableName).countDocuments(query);
      if (useMongo) return mongoModelFactory().countDocuments(query);
      return new JsonModel(jsonCollectionName).countDocuments(query);
    },
    isMongo: () => useMongo,
    isSupabase: () => useSupabase
  };
};

module.exports = {
  connectDB,
  User: getModel('User', () => MongoUser, 'users', 'users'),
  Ticket: getModel('Ticket', () => MongoTicket, 'tickets', 'tickets'),
  Comment: getModel('Comment', () => MongoComment, 'comments', 'comments'),
  KnowledgeBase: getModel('KnowledgeBase', () => MongoKb, 'knowledge_base', 'knowledge_base'),
  Notification: getModel('Notification', () => MongoNotification, 'notifications', 'notifications'),
  ActivityLog: getModel('ActivityLog', () => MongoActivityLog, 'activity_logs', 'activity_logs')
};
