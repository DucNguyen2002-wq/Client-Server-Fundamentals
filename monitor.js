const http = require('http');
const https = require('https');
const url = require('url');

/**
 * Network Monitor - Công cụ giám sát hiệu suất mạng
 * Theo dõi và phân tích các request HTTP/HTTPS
 */
class NetworkMonitor {
    constructor() {
        this.requests = [];
        this.isMonitoring = false;
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalResponseTime: 0,
            averageResponseTime: 0
        };
    }

    /**
     * Bắt đầu giám sát
     */
    start() {
        this.isMonitoring = true;
        this.requests = [];
        this.resetStats();
        console.log('🟢 Network monitoring started at', new Date().toISOString());
    }

    /**
     * Dừng giám sát
     */
    stop() {
        this.isMonitoring = false;
        console.log('🔴 Network monitoring stopped at', new Date().toISOString());
        this.generateReport();
    }

    /**
     * Reset thống kê
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalResponseTime: 0,
            averageResponseTime: 0
        };
    }

    /**
     * Ghi lại một request
     */
    logRequest(requestData) {
        if (!this.isMonitoring) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            method: requestData.method || 'GET',
            url: requestData.url,
            statusCode: requestData.statusCode,
            responseTime: requestData.responseTime,
            error: requestData.error || null,
            size: requestData.size || 0
        };

        this.requests.push(logEntry);
        this.updateStats(logEntry);
        this.displayLog(logEntry);
    }

    /**
     * Cập nhật thống kê
     */
    updateStats(logEntry) {
        this.stats.totalRequests++;
        this.stats.totalResponseTime += logEntry.responseTime;
        this.stats.averageResponseTime = Math.round(this.stats.totalResponseTime / this.stats.totalRequests);

        if (logEntry.statusCode >= 200 && logEntry.statusCode < 300) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }
    }

    /**
     * Hiển thị log entry
     */
    displayLog(logEntry) {
        const statusIcon = logEntry.statusCode >= 200 && logEntry.statusCode < 300 ? '✅' : '❌';
        const errorText = logEntry.error ? ` (${logEntry.error})` : '';
        
        console.log(`[${logEntry.timestamp}] ${statusIcon} ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} (${logEntry.responseTime}ms)${errorText}`);
    }

    /**
     * Tạo báo cáo tổng hợp
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 NETWORK MONITORING REPORT');
        console.log('='.repeat(80));
        console.log(`📈 Total Requests: ${this.stats.totalRequests}`);
        console.log(`✅ Successful: ${this.stats.successfulRequests} (${Math.round(this.stats.successfulRequests / this.stats.totalRequests * 100)}%)`);
        console.log(`❌ Failed: ${this.stats.failedRequests} (${Math.round(this.stats.failedRequests / this.stats.totalRequests * 100)}%)`);
        console.log(`⏱️  Average Response Time: ${this.stats.averageResponseTime}ms`);
        console.log(`🏁 Monitoring Duration: ${this.getMonitoringDuration()}`);
        
        // Phân tích chi tiết
        this.analyzePatterns();
        console.log('='.repeat(80));
    }

    /**
     * Phân tích patterns của requests
     */
    analyzePatterns() {
        console.log('\n📋 DETAILED ANALYSIS:');
        
        // Phân tích theo method
        const methodStats = {};
        this.requests.forEach(req => {
            if (!methodStats[req.method]) {
                methodStats[req.method] = { count: 0, totalTime: 0 };
            }
            methodStats[req.method].count++;
            methodStats[req.method].totalTime += req.responseTime;
        });

        console.log('\n🔧 By HTTP Method:');
        Object.keys(methodStats).forEach(method => {
            const stats = methodStats[method];
            const avgTime = Math.round(stats.totalTime / stats.count);
            console.log(`   ${method}: ${stats.count} requests, avg ${avgTime}ms`);
        });

        // Phân tích theo status code
        const statusStats = {};
        this.requests.forEach(req => {
            const statusRange = Math.floor(req.statusCode / 100) * 100;
            if (!statusStats[statusRange]) {
                statusStats[statusRange] = 0;
            }
            statusStats[statusRange]++;
        });

        console.log('\n📊 By Status Code:');
        Object.keys(statusStats).forEach(status => {
            console.log(`   ${status}xx: ${statusStats[status]} requests`);
        });

        // Top 5 slowest requests
        const slowestRequests = [...this.requests]
            .sort((a, b) => b.responseTime - a.responseTime)
            .slice(0, 5);

        console.log('\n🐌 Top 5 Slowest Requests:');
        slowestRequests.forEach((req, index) => {
            console.log(`   ${index + 1}. ${req.method} ${req.url} - ${req.responseTime}ms`);
        });
    }

    /**
     * Tính thời gian monitoring
     */
    getMonitoringDuration() {
        if (this.requests.length === 0) return '0ms';
        
        const first = new Date(this.requests[0].timestamp);
        const last = new Date(this.requests[this.requests.length - 1].timestamp);
        const duration = last - first;
        
        return `${duration}ms`;
    }

    /**
     * Thực hiện request và theo dõi
     */
    async monitoredRequest(options) {
        const startTime = Date.now();
        
        try {
            const response = await this.makeRequest(options);
            const responseTime = Date.now() - startTime;
            
            this.logRequest({
                method: options.method || 'GET',
                url: options.url,
                statusCode: response.statusCode,
                responseTime: responseTime,
                size: response.data ? response.data.length : 0
            });
            
            return response;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            this.logRequest({
                method: options.method || 'GET',
                url: options.url,
                statusCode: 0,
                responseTime: responseTime,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Thực hiện HTTP request
     */
    makeRequest(options) {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(options.url);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;

            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.path,
                method: options.method || 'GET',
                headers: options.headers || {}
            };

            const req = client.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        headers: res.headers,
                        data: data
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (options.data) {
                req.write(options.data);
            }

            req.end();
        });
    }
}

/**
 * Performance Benchmarking
 */
class PerformanceBenchmark {
    constructor(monitor) {
        this.monitor = monitor;
    }

    /**
     * Benchmark với different file sizes
     */
    async benchmarkFileSizes() {
        console.log('\n🏁 PERFORMANCE BENCHMARK - FILE SIZES');
        console.log('='.repeat(60));

        const testFiles = [
            { name: 'Small File', url: 'http://localhost:3000/', expectedSize: 'small' },
            { name: 'Medium File', url: 'http://localhost:3000/style.css', expectedSize: 'medium' },
            { name: 'Large File', url: 'http://localhost:3000/script.js', expectedSize: 'large' }
        ];

        for (const testFile of testFiles) {
            try {
                console.log(`\n📁 Testing ${testFile.name}...`);
                const startTime = Date.now();
                
                const response = await this.monitor.monitoredRequest({
                    url: testFile.url,
                    method: 'GET'
                });
                
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                const fileSize = response.data ? response.data.length : 0;
                
                console.log(`   ✅ ${testFile.name}: ${fileSize} bytes, ${responseTime}ms`);
                console.log(`   📊 Transfer rate: ${Math.round(fileSize / responseTime * 1000)} bytes/sec`);
                
                // Tạm dừng giữa các tests
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.log(`   ❌ ${testFile.name}: Error - ${error.message}`);
            }
        }
    }

    /**
     * Benchmark concurrent requests
     */
    async benchmarkConcurrentRequests() {
        console.log('\n🚀 CONCURRENT REQUESTS BENCHMARK');
        console.log('='.repeat(60));

        const concurrencyLevels = [1, 5, 10];
        
        for (const concurrency of concurrencyLevels) {
            console.log(`\n📊 Testing ${concurrency} concurrent requests...`);
            
            const promises = [];
            const startTime = Date.now();
            
            for (let i = 0; i < concurrency; i++) {
                promises.push(this.monitor.monitoredRequest({
                    url: 'http://localhost:3000/api/health',
                    method: 'GET'
                }));
            }
            
            try {
                await Promise.all(promises);
                const endTime = Date.now();
                const totalTime = endTime - startTime;
                
                console.log(`   ✅ Completed ${concurrency} requests in ${totalTime}ms`);
                console.log(`   📈 Average per request: ${Math.round(totalTime / concurrency)}ms`);
                console.log(`   🔥 Requests per second: ${Math.round(concurrency / totalTime * 1000)}`);
                
            } catch (error) {
                console.log(`   ❌ Error in concurrent test: ${error.message}`);
            }
            
            // Tạm dừng giữa các tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

/**
 * Demo function
 */
async function runMonitoringDemo() {
    const monitor = new NetworkMonitor();
    const benchmark = new PerformanceBenchmark(monitor);
    
    console.log('🎯 STARTING NETWORK MONITORING DEMO');
    console.log('='.repeat(80));
    
    // Bắt đầu monitoring
    monitor.start();
    
    try {
        // Test các endpoint cơ bản
        console.log('\n📋 Testing basic endpoints...');
        await monitor.monitoredRequest({ url: 'http://localhost:3000/api/health' });
        await monitor.monitoredRequest({ url: 'http://localhost:3000/api/server-info' });
        await monitor.monitoredRequest({ url: 'http://localhost:3000/api/time' });
        
        // Test POST request
        console.log('\n📋 Testing POST request...');
        await monitor.monitoredRequest({
            url: 'http://localhost:3000/api/echo',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ test: 'monitoring', timestamp: new Date().toISOString() })
        });
        
        // Test error handling
        console.log('\n📋 Testing error handling...');
        try {
            await monitor.monitoredRequest({ url: 'http://localhost:3000/api/not-found' });
        } catch (error) {
            // Expected error
        }
        
        // Performance benchmarks
        await benchmark.benchmarkFileSizes();
        await benchmark.benchmarkConcurrentRequests();
        
    } catch (error) {
        console.error('❌ Demo error:', error.message);
    } finally {
        // Dừng monitoring và tạo báo cáo
        monitor.stop();
    }
}

// Export classes
module.exports = {
    NetworkMonitor,
    PerformanceBenchmark
};

// Chạy demo nếu file được execute trực tiếp
if (require.main === module) {
    // Kiểm tra xem server có đang chạy không
    const http = require('http');
    
    const healthCheck = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/health',
        method: 'GET',
        timeout: 1000
    }, (res) => {
        console.log('✅ Server is running, starting monitoring demo...\n');
        runMonitoringDemo().catch(console.error);
    });
    
    healthCheck.on('error', (error) => {
        console.log('❌ Server is not running on localhost:3000');
        console.log('💡 Please start the server first with: npm start');
        process.exit(1);
    });
    
    healthCheck.end();
}
