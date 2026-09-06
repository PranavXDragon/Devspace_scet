-- Supabase Schema Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins Table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "mobileNumber" VARCHAR(20),
    "profilePhoto" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Registrations Table
CREATE TABLE student_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    "fatherName" VARCHAR(255) NOT NULL,
    course VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    section VARCHAR(50) NOT NULL,
    "set" VARCHAR(50) NOT NULL,
    "studentId" VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    "transactionId" VARCHAR(255) NOT NULL UNIQUE,
    "paymentMode" VARCHAR(50) DEFAULT 'ONLINE',
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventName" VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "registrationLink" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Boarding Passes Table
CREATE TABLE boarding_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentName" VARCHAR(255) NOT NULL,
    "studentEmail" VARCHAR(255) NOT NULL,
    "eventName" VARCHAR(255) NOT NULL,
    "eventDescription" TEXT NOT NULL,
    qid VARCHAR(100) NOT NULL,
    "wifiUser" VARCHAR(100),
    "wifiPass" VARCHAR(100),
    "loginUser" VARCHAR(100),
    "loginPass" VARCHAR(100),
    "citeNumber" VARCHAR(100),
    "boardingPassId" VARCHAR(255) NOT NULL UNIQUE,
    "qrCodeImage" TEXT,
    "issuedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Certificates Table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentName" VARCHAR(255) NOT NULL,
    "studentEmail" VARCHAR(255) NOT NULL,
    "eventName" VARCHAR(255) NOT NULL,
    "eventDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "coordinatorName" VARCHAR(255) NOT NULL,
    "signatureImage" TEXT NOT NULL,
    "certificateId" VARCHAR(255) NOT NULL UNIQUE,
    position VARCHAR(50) DEFAULT 'Participant',
    "qrCodeImage" TEXT,
    "issuedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "adminId" UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    os VARCHAR(100) NOT NULL,
    browser VARCHAR(100) NOT NULL,
    device VARCHAR(100) NOT NULL,
    "ipAddress" VARCHAR(100) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "academicYear" VARCHAR(20) NOT NULL,
    "subTeam" VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    post VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    "sequenceNumber" INTEGER DEFAULT 0 NOT NULL,
    photo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "isReplied" BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tokens Table
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "userType" VARCHAR(50) NOT NULL,
    token TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom QRs Table
CREATE TABLE custom_qrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link TEXT NOT NULL,
    "qrUrl" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
