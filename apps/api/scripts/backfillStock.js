import "dotenv/config";
import connectDB from "../config/mongodb.js";
import productModel from "../models/ProductModel.js";

const DEFAULT_STOCK = Number(process.argv[2] ?? 0);

const addStockField = async () => {
    try {
        await connectDB();
        const result = await productModel.updateMany(
            { stock: { $exists: false } },
            { $set: { stock: DEFAULT_STOCK } }
        );
        console.log(`Matched ${result.matchedCount}, updated ${result.modifiedCount} products with stock=${DEFAULT_STOCK}.`);
        process.exit(0);
    } catch (error) {
        console.error("Failed to backfill stock field:", error);
        process.exit(1);
    }
};

addStockField();
