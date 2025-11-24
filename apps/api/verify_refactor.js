// Mock environment variables
process.env.WEBHOOK_ENCRYPTION_KEY = 'mock-key-for-testing-purposes-only-32-chars';
process.env.JWT_SECRET = 'mock-jwt-secret';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'password';

console.log('Environment variables mocked');

const runVerification = async () => {
    try {
        const ProductService = (await import('./services/ProductService.js')).default;
        const ProductController = await import('./controllers/ProductController.js');
        const CartController = await import('./controllers/CartController.js');
        const OrderController = await import('./controllers/OrderController.js');
        const UserController = await import('./controllers/UserController.js');
        const AdminController = await import('./controllers/AdminController.js');
        const PayTrController = await import('./controllers/PayTrController.js');
        const { successResponse, errorResponse } = await import('./utils/response.js');

        console.log('ProductService imported successfully');
        console.log('ProductController imported successfully');
        console.log('CartController imported successfully');
        console.log('OrderController imported successfully');
        console.log('UserController imported successfully');
        console.log('AdminController imported successfully');
        console.log('PayTrController imported successfully');
        console.log('Response utilities imported successfully');

        if (typeof ProductService.addProduct !== 'function') throw new Error('ProductService.addProduct is not a function');
        if (typeof ProductController.addProduct !== 'function') throw new Error('ProductController.addProduct is not a function');

        if (typeof CartController.addToCart !== 'function') throw new Error('CartController.addToCart is not a function');
        if (typeof OrderController.placeOrder !== 'function') throw new Error('OrderController.placeOrder is not a function');
        if (typeof UserController.loginUser !== 'function') throw new Error('UserController.loginUser is not a function');
        if (typeof AdminController.adminLogin !== 'function') throw new Error('AdminController.adminLogin is not a function');
        if (typeof PayTrController.requestPaytrToken !== 'function') throw new Error('PayTrController.requestPaytrToken is not a function');

        console.log('Verification successful');
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

runVerification();
