import crypto from 'crypto';
import fetch from 'node-fetch';

// Configuration
const WEBHOOK_URL = 'http://localhost:4002/api/webhook/muditakurye';
const WEBHOOK_SECRET = 'wh_0rC-rimL096iJALsxXui67-n0LrKWVNlpHknLHn12g4';

// Test payload
const payload = {
    muditaOrderId: 'TEST_MK_001',
    orderId: 'TEST_LOCAL_001',
    status: 'DELIVERED',
    timestamp: Date.now(),
    courier: {
        id: 'COURIER_001',
        name: 'Test Kurye',
        phone: '+905551234567'
    },
    deliveryTime: new Date().toISOString(),
    location: {
        latitude: 41.0082,
        longitude: 28.9784
    },
    notes: 'Test delivery webhook'
};

// Generate HMAC signature
const generateSignature = (payload, secret, timestamp) => {
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
};

// Send test webhook
const sendTestWebhook = async () => {
    try {
        const timestamp = Date.now();
        const signature = generateSignature(payload, WEBHOOK_SECRET, timestamp);

        console.log('🚀 Sending test webhook to:', WEBHOOK_URL);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));
        console.log('🔐 Signature:', signature);
        console.log('⏰ Timestamp:', timestamp);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MuditaKurye-Signature': signature,
                'X-Mudita-Timestamp': timestamp.toString()
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.text();

        console.log('\n📨 Response Status:', response.status);
        console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
        console.log('📄 Response Body:', responseData);

        if (response.ok) {
            console.log('✅ Webhook test successful!');
        } else {
            console.log('❌ Webhook test failed with status:', response.status);
        }

    } catch (error) {
        console.error('❌ Error sending webhook:', error);
    }
};

// Run the test
console.log('='.repeat(60));
console.log('🧪 MuditaKurye Webhook Test');
console.log('='.repeat(60));
sendTestWebhook();