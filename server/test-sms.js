const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSMS() {
    try {
        console.log('🧪 Testing SMS Backend Server...\n');

        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);

        // Test 2: Send test SMS
        console.log('\n2. Testing SMS send...');
        const smsResponse = await axios.post(`${BASE_URL}/api/sms/send`, {
            phone: '+1234567890', // Test number
            message: 'Test message from backend server'
        });
        console.log('✅ SMS send result:', smsResponse.data);

        // Test 3: Test appointment confirmation
        console.log('\n3. Testing appointment confirmation...');
        const appointmentResponse = await axios.post(`${BASE_URL}/api/sms/appointment-confirmation`, {
            name: 'Test User',
            phone: '+1234567890',
            cut: 'Volume 1 Cut',
            day: 'Monday',
            time: '4:00PM',
            location: 'At Location'
        });
        console.log('✅ Appointment confirmation result:', appointmentResponse.data);

        // Test 4: Test business notification
        console.log('\n4. Testing business notification...');
        const businessResponse = await axios.post(`${BASE_URL}/api/sms/business-notification`, {
            name: 'Test User',
            phone: '+1234567890',
            cut: 'Volume 1 Cut',
            day: 'Monday',
            time: '4:00PM',
            location: 'At Location'
        });
        console.log('✅ Business notification result:', businessResponse.data);

        // Test 5: Check quota
        console.log('\n5. Testing quota check...');
        const quotaResponse = await axios.get(`${BASE_URL}/api/sms/quota`);
        console.log('✅ Quota check result:', quotaResponse.data);

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testSMS();
