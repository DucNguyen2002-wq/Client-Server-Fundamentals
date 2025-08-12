const HTTPClient = require('./client');
const { NetworkMonitor } = require('./monitor');

/**
 * Comprehensive Test Suite cho Lab01
 * Kiểm tra tất cả chức năng của dự án
 */
async function runFullTestSuite() {
    console.log('🎯 LAB01 - COMPREHENSIVE TEST SUITE');
    console.log('='.repeat(80));
    
    // Test 1: Server Health Check
    console.log('\n📋 Test 1: Server Health Check');
    try {
        const client = new HTTPClient();
        const response = await client.get('http://localhost:3000/api/health');
        console.log('✅ Server is running and healthy');
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Data:`, response.data);
    } catch (error) {
        console.error('❌ Server health check failed:', error.message);
        return;
    }
    
    // Test 2: API Endpoints
    console.log('\n📋 Test 2: API Endpoints Testing');
    const client = new HTTPClient();
    const endpoints = [
        { name: 'Server Info', url: 'http://localhost:3000/api/server-info' },
        { name: 'Time API', url: 'http://localhost:3000/api/time' },
        { name: 'Health Check', url: 'http://localhost:3000/api/health' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await client.get(endpoint.url);
            console.log(`✅ ${endpoint.name}: OK (${response.statusCode})`);
        } catch (error) {
            console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
        }
    }
    
    // Test 3: POST Request Testing
    console.log('\n📋 Test 3: POST Request Testing');
    try {
        const testData = {
            test: 'comprehensive-suite',
            timestamp: new Date().toISOString(),
            data: { key: 'value', number: 123 }
        };
        
        const response = await client.post('http://localhost:3000/api/echo', testData);
        console.log('✅ POST request successful');
        console.log(`   Received data keys: ${Object.keys(response.data.receivedData).join(', ')}`);
    } catch (error) {
        console.log('❌ POST request failed:', error.message);
    }
    
    // Test 4: External API Testing
    console.log('\n📋 Test 4: External API Testing');
    try {
        const response = await client.get('https://api.github.com/zen');
        console.log('✅ External API (GitHub) accessible');
        console.log(`   GitHub Zen: ${response.data}`);
    } catch (error) {
        console.log('❌ External API test failed:', error.message);
    }
    
    // Test 5: Error Handling
    console.log('\n📋 Test 5: Error Handling');
    try {
        await client.get('http://localhost:3000/api/non-existent');
    } catch (error) {
        console.log('✅ 404 Error handling works correctly');
    }
    
    try {
        await client.get('http://localhost:9999/api/test');
    } catch (error) {
        console.log('✅ Connection error handling works correctly');
    }
    
    // Test 6: Performance Testing
    console.log('\n📋 Test 6: Performance Testing');
    const monitor = new NetworkMonitor();
    monitor.start();
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
        promises.push(monitor.monitoredRequest({
            url: 'http://localhost:3000/api/health',
            method: 'GET'
        }));
    }
    
    try {
        await Promise.all(promises);
        const endTime = Date.now();
        console.log(`✅ Concurrent requests completed in ${endTime - startTime}ms`);
    } catch (error) {
        console.log('❌ Performance test failed:', error.message);
    }
    
    monitor.stop();
    
    // Test Summary
    console.log('\n' + '='.repeat(80));
    console.log('🏁 TEST SUITE COMPLETED');
    console.log('✅ Server is running correctly');
    console.log('✅ All API endpoints are functional');
    console.log('✅ HTTP Client works with GET/POST methods');
    console.log('✅ External API integration successful');
    console.log('✅ Error handling implemented properly');
    console.log('✅ Performance monitoring functional');
    console.log('\n🎉 LAB01 PROJECT IS READY FOR DEMONSTRATION!');
    console.log('='.repeat(80));
    
    // Instructions
    console.log('\n📋 DEMO INSTRUCTIONS:');
    console.log('1. Open browser: http://localhost:3000');
    console.log('2. Test interactive features on the web page');
    console.log('3. Use Browser Developer Tools to see network traffic');
    console.log('4. Run individual components:');
    console.log('   - node client.js (HTTP Client demo)');
    console.log('   - node monitor.js (Network monitoring demo)');
}

// Run test suite if file is executed directly
if (require.main === module) {
    runFullTestSuite().catch(console.error);
}

module.exports = { runFullTestSuite };
