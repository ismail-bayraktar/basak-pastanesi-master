import mongoose from 'mongoose';
import branchModel from '../models/BranchModel.js';
import orderModel from '../models/OrderModel.js';

/**
 * Setup Default Branch for MuditaKurye Integration
 * Creates a default branch and assigns it to all existing orders
 */

const DEFAULT_BRANCH = {
  name: 'Tulumbak Ana Şube',
  code: 'TULUMBAK_MAIN',
  address: {
    street: 'Ana Şube Adresi',
    district: 'Merkez',
    city: 'İzmir',
    zipCode: '35000',
    coordinates: {
      latitude: null,
      longitude: null
    }
  },
  contact: {
    phone: '+90 555 000 0000',
    email: 'info@tulumbak.com',
    whatsapp: '+90 555 000 0000'
  },
  workingHours: {
    weekdays: {
      start: '09:00',
      end: '22:00'
    },
    weekend: {
      start: '10:00',
      end: '23:00'
    },
    timezone: 'Europe/Istanbul'
  },
  assignedZones: [],
  capacity: {
    dailyOrders: 200,
    activeCouriers: 10
  },
  settings: {
    autoAssignment: true,
    hybridMode: false,
    googleMapsEnabled: false
  },
  managerId: null,
  status: 'active',
  notes: 'Default branch created for MuditaKurye courier integration'
};

async function setupDefaultBranch() {
  try {
    console.log('\n🏗️  Default Branch Setup Starting...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB\n');

    // Check if default branch already exists
    console.log('🔍 Checking for existing default branch...');
    let defaultBranch = await branchModel.findOne({ code: 'TULUMBAK_MAIN' });

    if (defaultBranch) {
      console.log('✅ Default branch already exists:');
      console.log('   Name:', defaultBranch.name);
      console.log('   Code:', defaultBranch.code);
      console.log('   ID:', defaultBranch._id);
    } else {
      // Create default branch
      console.log('📝 Creating default branch...');
      defaultBranch = new branchModel(DEFAULT_BRANCH);
      await defaultBranch.save();
      console.log('✅ Default branch created successfully');
      console.log('   Name:', defaultBranch.name);
      console.log('   Code:', defaultBranch.code);
      console.log('   ID:', defaultBranch._id);
    }

    console.log('\n');

    // Update all orders without branchId
    console.log('🔍 Finding orders without branch assignment...');
    const ordersWithoutBranch = await orderModel.find({
      $or: [
        { branchId: { $exists: false } },
        { branchId: null },
        { branchId: '' }
      ]
    });

    console.log(`📋 Found ${ordersWithoutBranch.length} orders without branch\n`);

    if (ordersWithoutBranch.length > 0) {
      console.log('📌 Assigning default branch to orders...');

      const updateResult = await orderModel.updateMany(
        {
          $or: [
            { branchId: { $exists: false } },
            { branchId: null },
            { branchId: '' }
          ]
        },
        {
          $set: {
            branchId: defaultBranch._id.toString(),
            branchCode: defaultBranch.code,
            'assignment.mode': 'auto',
            'assignment.status': 'assigned',
            'assignment.decidedBy': 'system',
            'assignment.decidedAt': Date.now()
          }
        }
      );

      console.log('✅ Branch assignment completed');
      console.log('   Orders updated:', updateResult.modifiedCount);
    } else {
      console.log('ℹ️  All orders already have branch assignments');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Setup completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Summary:');
    console.log('   Branch ID:', defaultBranch._id);
    console.log('   Branch Code:', defaultBranch.code);
    console.log('   Branch Name:', defaultBranch.name);
    console.log('   Orders Updated:', ordersWithoutBranch.length);
    console.log('\n🚀 MuditaKurye courier integration is now ready!');
    console.log('   You can now use "Kuryeye Ata" button to send orders.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run setup
setupDefaultBranch();
