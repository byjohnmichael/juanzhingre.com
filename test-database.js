const axios = require('axios');

// Test against local development server first, then production
const BASE_URL = process.env.TEST_URL || 'http://localhost:2509';
const PRODUCTION_URL = 'https://www.juanzhingre.com';

console.log(`🧪 Testing against: ${BASE_URL}`);

async function testDatabaseEndpoints() {
    console.log('🧪 Testing Database Endpoints...\n');

    try {
        // Test 1: Store confirmation data
        console.log('1. Testing store confirmation...');
        const confirmationData = {
            confirmationCode: 'TEST1234',
            appointmentDetails: {
                name: 'Test User',
                phone: '+1234567890',
                cut: 'Volume 1 Cut',
                day: 'Monday',
                date: '2024-09-23',
                time: '4:00PM',
                location: 'At Location'
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };

        const testUrl = process.env.TEST_URL || BASE_URL;
        const storeResponse = await axios.post(`${testUrl}/api/edge-config/store`, confirmationData);
        console.log('✅ Store confirmation result:', storeResponse.data);

        // Test 2: Verify confirmation code
        console.log('\n2. Testing verify confirmation...');
        const verifyResponse = await axios.get(`${testUrl}/api/edge-config/verify/TEST1234`);
        console.log('✅ Verify confirmation result:', verifyResponse.data);

        // Test 3: Confirm appointment
        console.log('\n3. Testing confirm appointment...');
        const confirmResponse = await axios.post(`${testUrl}/api/edge-config/confirm/TEST1234`);
        console.log('✅ Confirm appointment result:', confirmResponse.data);

        // Test 4: Check availability
        console.log('\n4. Testing appointment availability...');
        const availabilityResponse = await axios.get(`${testUrl}/api/edge-config/availability?start=2024-09-23&end=2024-09-29`);
        console.log('✅ Availability result:', availabilityResponse.data);

        // Test 5: Verify again (should show confirmed status)
        console.log('\n5. Testing verify after confirmation...');
        const verifyAgainResponse = await axios.get(`${testUrl}/api/edge-config/verify/TEST1234`);
        console.log('✅ Verify after confirmation result:', verifyAgainResponse.data);

        console.log('\n🎉 All database tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status:', error.response.status);
        }
    }
}

// Test with different confirmation codes
async function testMultipleAppointments() {
    console.log('\n🔄 Testing Multiple Appointments...\n');

    const appointments = [
        {
            code: 'APPT1',
            day: 'Tuesday',
            date: '2024-09-24',
            time: '4:00PM'
        },
        {
            code: 'APPT2',
            day: 'Wednesday',
            date: '2024-09-25',
            time: '6:00PM'
        },
        {
            code: 'APPT3',
            day: 'Saturday',
            date: '2024-09-28',
            time: '2:00PM'
        }
    ];

    try {
        const testUrl = process.env.TEST_URL || BASE_URL;
        
        // Store multiple appointments
        for (const appointment of appointments) {
            const confirmationData = {
                confirmationCode: appointment.code,
                appointmentDetails: {
                    name: `Test User ${appointment.code}`,
                    phone: '+1234567890',
                    cut: 'Volume 1 Cut',
                    day: appointment.day,
                    date: appointment.date,
                    time: appointment.time,
                    location: 'At Location'
                },
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            };

            await axios.post(`${testUrl}/api/edge-config/store`, confirmationData);
            console.log(`✅ Stored appointment ${appointment.code}`);
        }

        // Check availability for the week
        console.log('\n📅 Checking availability for the week...');
        const availabilityResponse = await axios.get(`${testUrl}/api/edge-config/availability?start=2024-09-23&end=2024-09-29`);
        console.log('✅ Weekly availability:', availabilityResponse.data);

        // Confirm one appointment
        console.log('\n✅ Confirming APPT1...');
        await axios.post(`${testUrl}/api/edge-config/confirm/APPT1`);
        console.log('✅ APPT1 confirmed');

        // Check availability again
        console.log('\n📅 Checking availability after confirmation...');
        const availabilityAfterResponse = await axios.get(`${testUrl}/api/edge-config/availability?start=2024-09-23&end=2024-09-29`);
        console.log('✅ Availability after confirmation:', availabilityAfterResponse.data);

        console.log('\n🎉 Multiple appointments test completed!');

    } catch (error) {
        console.error('❌ Multiple appointments test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Test both local and production
async function testBothEnvironments() {
    console.log('🏠 Testing Local Development Server...\n');
    const originalTestUrl = process.env.TEST_URL;
    process.env.TEST_URL = 'http://localhost:2509';
    await testDatabaseEndpoints();
    await testMultipleAppointments();
    
    console.log('\n\n🌐 Testing Production Server...\n');
    process.env.TEST_URL = 'https://www.juanzhingre.com';
    await testDatabaseEndpoints();
    await testMultipleAppointments();
    
    // Restore original test URL
    if (originalTestUrl) {
        process.env.TEST_URL = originalTestUrl;
    } else {
        delete process.env.TEST_URL;
    }
}

// Run tests
async function runAllTests() {
    const testEnv = process.env.TEST_ENV || 'both';
    
    if (testEnv === 'local') {
        const originalTestUrl = process.env.TEST_URL;
        process.env.TEST_URL = 'http://localhost:2509';
        await testDatabaseEndpoints();
        await testMultipleAppointments();
        if (originalTestUrl) {
            process.env.TEST_URL = originalTestUrl;
        } else {
            delete process.env.TEST_URL;
        }
    } else if (testEnv === 'production') {
        const originalTestUrl = process.env.TEST_URL;
        process.env.TEST_URL = 'https://www.juanzhingre.com';
        await testDatabaseEndpoints();
        await testMultipleAppointments();
        if (originalTestUrl) {
            process.env.TEST_URL = originalTestUrl;
        } else {
            delete process.env.TEST_URL;
        }
    } else {
        await testBothEnvironments();
    }
}

runAllTests();
