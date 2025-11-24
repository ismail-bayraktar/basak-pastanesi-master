/**
 * Fix Media Model publicId Index
 * 
 * This script removes the unique constraint on publicId field
 * which was causing issues with local storage uploads
 */

import mongoose from 'mongoose';
import connectDB from '../config/mongodb.js';

const fixPublicIdIndex = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('media');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        // Check if publicId unique index exists
        const publicIdIndex = indexes.find(idx => 
            idx.key && idx.key.publicId !== undefined && idx.unique === true
        );

        if (publicIdIndex) {
            console.log('Found publicId unique index:', publicIdIndex);
            console.log('Dropping publicId unique index...');
            
            // Drop the unique index
            await collection.dropIndex(publicIdIndex.name);
            console.log('✅ publicId unique index dropped successfully');
        } else {
            console.log('✅ No publicId unique index found - already fixed');
        }

        // List indexes after fix
        const indexesAfter = await collection.indexes();
        console.log('Indexes after fix:', indexesAfter);

        console.log('✅ Fix completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing index:', error);
        process.exit(1);
    }
};

fixPublicIdIndex();

