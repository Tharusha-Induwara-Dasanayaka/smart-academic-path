require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Module = require('./models/Module');
const ClassGroup = require('./models/ClassGroup');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set. Create a .env file from .env.example');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Module.deleteMany({}),
      ClassGroup.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── USERS ──────────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 12);

    const [student1, student2, student3, advisor, admin] = await User.insertMany([
      {
        studentId: 'IT23583764',
        name: 'Nethmi Perera',
        email: 'IT23583764@my.sliit.lk',
        password: hashedPassword,
        phone: '+94 71 234 5678',
        programme: 'BSc (HONS) IT',
        year: 3,
        semester: 2,
        role: 'student',
      },
      {
        studentId: 'IT23000001',
        name: 'Kavindu R.',
        email: 'IT23000001@my.sliit.lk',
        password: hashedPassword,
        phone: '+94 77 123 4567',
        programme: 'BSc (HONS) IT',
        year: 3,
        semester: 2,
        role: 'student',
      },
      {
        studentId: 'IT23000002',
        name: 'Dinuka S.',
        email: 'IT23000002@my.sliit.lk',
        password: hashedPassword,
        phone: '+94 76 987 6543',
        programme: 'BSc (HONS) IT',
        year: 3,
        semester: 2,
        role: 'student',
      },
      {
        studentId: 'ADV001',
        name: 'Kasun Silva',
        email: 'kasun.silva@sliit.lk',
        password: hashedPassword,
        phone: '+94 11 234 5678',
        programme: 'Faculty Staff',
        year: 0,
        semester: 0,
        role: 'advisor',
      },
      {
        studentId: 'ADMIN001',
        name: 'System Admin',
        email: 'admin@sliit.lk',
        password: hashedPassword,
        phone: '+94 11 111 1111',
        programme: 'IT Department',
        year: 0,
        semester: 0,
        role: 'admin',
      },
    ]);
    console.log('👤 Created users');

    // ── MODULES ────────────────────────────────────────────────────────────
    const [it3060, it3070, it3080] = await Module.insertMany([
      {
        code: 'IT3060',
        name: 'Human Computer Interaction',
        credits: 3,
        semester: 2,
        year: 3,
        description: 'Study of user interface design and human-computer interaction principles.',
      },
      {
        code: 'IT3070',
        name: 'Software Engineering',
        credits: 3,
        semester: 2,
        year: 3,
        description: 'Software development methodologies, SDLC, and project management.',
      },
      {
        code: 'IT3080',
        name: 'Database Management Systems',
        credits: 3,
        semester: 2,
        year: 3,
        description: 'Advanced database design, SQL, NoSQL, and data modelling.',
      },
    ]);
    console.log('📚 Created modules');

    // ── CLASS GROUPS ────────────────────────────────────────────────────────
    // IT3060 Groups
    const [
      it3060g1, it3060g2, it3060g3,
      it3070g2, it3070g4, it3070g6,
      it3080g1, it3080g2, it3080g3,
    ] = await ClassGroup.insertMany([
      // IT3060 - Human Computer Interaction
      {
        module: it3060._id,
        moduleCode: 'IT3060',
        groupName: 'Group 1',
        dayOfWeek: 'Monday',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'LH1',
        totalSeats: 30,
        enrolledCount: 16,
      },
      {
        module: it3060._id,
        moduleCode: 'IT3060',
        groupName: 'Group 2',
        dayOfWeek: 'Wednesday',
        startTime: '14:00',
        endTime: '16:00',
        venue: 'LH3',
        totalSeats: 30,
        enrolledCount: 28,
      },
      {
        module: it3060._id,
        moduleCode: 'IT3060',
        groupName: 'Group 3',
        dayOfWeek: 'Friday',
        startTime: '09:00',
        endTime: '11:00',
        venue: 'LH2',
        totalSeats: 30,
        enrolledCount: 22,
      },

      // IT3070 - Software Engineering
      {
        module: it3070._id,
        moduleCode: 'IT3070',
        groupName: 'Group 2',
        dayOfWeek: 'Monday',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'LH4',
        totalSeats: 25,
        enrolledCount: 22, // only 3 seats left — matches design
      },
      {
        module: it3070._id,
        moduleCode: 'IT3070',
        groupName: 'Group 4',
        dayOfWeek: 'Tuesday',
        startTime: '14:00',
        endTime: '16:00',
        venue: 'LH2',
        totalSeats: 25,
        enrolledCount: 13, // 12 seats — best match
      },
      {
        module: it3070._id,
        moduleCode: 'IT3070',
        groupName: 'Group 6',
        dayOfWeek: 'Wednesday',
        startTime: '09:00',
        endTime: '11:00',
        venue: 'LH5',
        totalSeats: 25,
        enrolledCount: 13, // 12 seats
      },

      // IT3080 - Database Management Systems
      {
        module: it3080._id,
        moduleCode: 'IT3080',
        groupName: 'Group 1',
        dayOfWeek: 'Thursday',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'LH2',
        totalSeats: 30,
        enrolledCount: 15,
      },
      {
        module: it3080._id,
        moduleCode: 'IT3080',
        groupName: 'Group 2',
        dayOfWeek: 'Tuesday',
        startTime: '09:00',
        endTime: '11:00',
        venue: 'LH1',
        totalSeats: 30,
        enrolledCount: 25,
      },
      {
        module: it3080._id,
        moduleCode: 'IT3080',
        groupName: 'Group 3',
        dayOfWeek: 'Friday',
        startTime: '14:00',
        endTime: '16:00',
        venue: 'LH3',
        totalSeats: 30,
        enrolledCount: 10,
      },
    ]);
    console.log('📅 Created class groups');

    // ── NOTIFICATIONS ────────────────────────────────────────────────────────
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    await Notification.insertMany([
      {
        recipient: student1._id,
        title: 'Registration closes in 2 days',
        message: 'Semester 2 registration closes on ' + twoDaysFromNow.toLocaleDateString() + ' at 11:59pm. Complete your registration now.',
        type: 'deadline',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        recipient: student1._id,
        title: 'IT3080 room changed to LH2',
        message: 'IT3080 Group 1 has been moved from LH1 to LH2. Please note the new venue.',
        type: 'room_change',
        relatedModule: 'IT3080',
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      },
      {
        recipient: student1._id,
        title: 'IT3070 - Group 4 confirmed',
        message: 'Your registration for IT3070 Group 4 (Tue 2:00-4:00pm) has been confirmed.',
        type: 'confirmation',
        relatedModule: 'IT3070',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        recipient: student2._id,
        title: 'Registration closes in 2 days',
        message: 'Complete your Semester 2 registration before the deadline.',
        type: 'deadline',
        isRead: false,
      },
      {
        recipient: student3._id,
        title: 'Registration closes in 2 days',
        message: 'Complete your Semester 2 registration before the deadline.',
        type: 'deadline',
        isRead: true,
      },
    ]);
    console.log('🔔 Created notifications');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Student:  IT23583764 / password123');
    console.log('  Student2: IT23000001 / password123');
    console.log('  Advisor:  ADV001     / password123');
    console.log('  Admin:    ADMIN001   / password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
