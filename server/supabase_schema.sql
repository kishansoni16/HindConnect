-- SQL Schema migration for HindConnect to run in Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    _id TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Employee',
    department TEXT NOT NULL,
    "isApproved" BOOLEAN DEFAULT FALSE,
    mobile TEXT,
    "bloodGroup" TEXT,
    doj TEXT,
    "empCode" TEXT,
    designation TEXT,
    "emergencyContact" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) if desired, or leave open for simple client operations.
-- For simplicity of a direct migrate, we keep table permissions open or simple.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    _id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Open',
    department TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "slaDeadline" TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    _id TEXT,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    message TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 4. Knowledge Base Table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id TEXT PRIMARY KEY,
    _id TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    "helpfulVotes" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE knowledge_base DISABLE ROW LEVEL SECURITY;

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    _id TEXT,
    "userId" TEXT NOT NULL,
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    _id TEXT,
    "ticketId" TEXT,
    action TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    details TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
