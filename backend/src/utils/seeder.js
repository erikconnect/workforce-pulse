/**
 * Database seeding utility
 * Initializes MongoDB with seed data on first startup if collections are empty
 */

import Sector from '../models/Sector.js';
import Skill from '../models/Skill.js';
import Mission from '../models/Mission.js';
import Playbook from '../models/Playbook.js';
import { sectorsSeed } from '../seeds/sectors.seed.js';
import { skillsSeed } from '../seeds/skills.seed.js';
import { missionsSeed } from '../seeds/missions.seed.js';
import { playbooksSeed } from '../seeds/playbooks.seed.js';

export async function seedDatabase() {
  try {
    console.log('[Seeder] Checking database initialization...');

    // Check if sectors collection is empty
    const sectorCount = await Sector.countDocuments();
    if (sectorCount === 0) {
      console.log('[Seeder] 🌱 Seeding sectors...');
      await Sector.insertMany(sectorsSeed);
      console.log(`[Seeder] ✅ Inserted ${sectorsSeed.length} sectors`);
    } else {
      console.log(`[Seeder] ℹ️  Sectors already exist (${sectorCount} documents)`);
    }

    // Check if skills collection is empty
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      console.log('[Seeder] 🌱 Seeding skills...');
      await Skill.insertMany(skillsSeed);
      console.log(`[Seeder] ✅ Inserted ${skillsSeed.length} skills`);
    } else {
      console.log(`[Seeder] ℹ️  Skills already exist (${skillCount} documents)`);
    }

    // Check if missions collection is empty
    const missionCount = await Mission.countDocuments();
    if (missionCount === 0) {
      console.log('[Seeder] 🌱 Seeding missions...');
      await Mission.insertMany(missionsSeed);
      console.log(`[Seeder] ✅ Inserted ${missionsSeed.length} missions`);
    } else {
      console.log(`[Seeder] ℹ️  Missions already exist (${missionCount} documents)`);
    }

    // Check if playbooks collection is empty
    const playbookCount = await Playbook.countDocuments();
    if (playbookCount === 0) {
      console.log('[Seeder] 🌱 Seeding playbooks...');
      await Playbook.insertMany(playbooksSeed);
      console.log(`[Seeder] ✅ Inserted ${playbooksSeed.length} playbooks`);
    } else {
      console.log(`[Seeder] ℹ️  Playbooks already exist (${playbookCount} documents)`);
    }

    console.log('[Seeder] 🎉 Database initialization complete');
  } catch (error) {
    console.error('[Seeder] ❌ Error during seeding:', error.message);
    throw error;
  }
}
