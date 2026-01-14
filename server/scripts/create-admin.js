const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`User ${email} already exists with role: ${existingUser.role}`);

      // If not an admin, update their role
      if (!['ADMIN', 'SUPER_ADMIN'].includes(existingUser.role)) {
        const updated = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
        console.log(`Updated ${email} to ADMIN role`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email, role: existingUser.role },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '7d' }
      );

      console.log('\nLogin token (copy this):');
      console.log(token);
      console.log('\nUse this token in your browser console:');
      console.log(`localStorage.setItem('auth', JSON.stringify({ tokens: { accessToken: '${token}' }, user: { id: '${existingUser.id}', email: '${existingUser.email}', role: '${existingUser.role}' } }));`);

      await prisma.$disconnect();
      await pool.end();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true
      }
    });

    console.log(`Created admin user: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    console.log('\nLogin token (copy this):');
    console.log(token);
    console.log('\nUse this token in your browser console:');
    console.log(`localStorage.setItem('auth', JSON.stringify({ tokens: { accessToken: '${token}' }, user: { id: '${admin.id}', email: '${admin.email}', role: '${admin.role}' } }));`);

    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
