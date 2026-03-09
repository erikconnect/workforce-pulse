/**
 * Standalone seeding script
 * Run with: node backend/src/utils/seed-standalone.js
 * 
 * This script connects to MongoDB and runs the seeder to populate
 * missions, playbooks, sectors, and skills if collections are empty.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from './seeder.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce-pulse';

async function runSeeder() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🌱 Starting database seeding...\n');
    await seedDatabase();

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
