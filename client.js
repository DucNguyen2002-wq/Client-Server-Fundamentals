const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

/**
 * Custom HTTP Client class - Không sử dụng axios hay fetch
 * Chỉ sử dụng built-in modules của Node.js
 */
class HTTPClient {
    constructor(options = {}) {
        this.defaultTimeout = options.timeout || 5000;
        this.defaultHeaders = options.headers || {};
    }

    /**
     * Thực hiện HTTP/HTTPS request
     */
    request(options) {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(options.url);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;

            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.path,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': 'Lab01-HTTP-Client/1.0.0',
                    ...this.defaultHeaders,
                    ...options.headers
                },
                timeout: options.timeout || this.defaultTimeout
            };

            // Thêm Content-Length cho POST requests
            if (options.data) {
                const postData = typeof options.data === 'string' 
                    ? options.data 
                    : JSON.stringify(options.data);
                
                requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
                
                if (!requestOptions.headers['Content-Type']) {
                    requestOptions.headers['Content-Type'] = 'application/json';
                }
            }

            console.log(`🌐 ${options.method || 'GET'} ${options.url}`);
            console.log(`📡 Headers:`, requestOptions.headers);

            const req = client.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = {
                            statusCode: res.statusCode,
                            statusMessage: res.statusMessage,
                            headers: res.headers,
                            data: this.parseResponseData(data, res.headers['content-type']),
                            url: options.url,
                            method: options.method || 'GET'
                        };

                        console.log(`✅ Response: ${res.statusCode} ${res.statusMessage}`);
                        
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(response);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                console.error(`❌ Request failed:`, error.message);
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Request timeout after ${requestOptions.timeout}ms`));
            });

            // Gửi data cho POST requests
            if (options.data) {
                const postData = typeof options.data === 'string' 
                    ? options.data 
                    : JSON.stringify(options.data);
                req.write(postData);
            }

            req.end();
        });
    }

    /**
     * Parse response data dựa trên content-type
     */
    parseResponseData(data, contentType) {
        if (!data) return null;

        if (contentType && contentType.includes('application/json')) {
            try {
                return JSON.parse(data);
            } catch (e) {
                return data;
            }
        }

        return data;
    }

    /**
     * GET request
     */
    get(url, options = {}) {
        return this.request({
            url,
            method: 'GET',
            ...options
        });
    }

    /**
     * POST request
     */
    post(url, data, options = {}) {
        return this.request({
            url,
            method: 'POST',
            data,
            ...options
        });
    }

    /**
     * PUT request
     */
    put(url, data, options = {}) {
        return this.request({
            url,
            method: 'PUT',
            data,
            ...options
        });
    }

    /**
     * DELETE request
     */
    delete(url, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            ...options
        });
    }
}

/**
 * Test functions
 */
async function runTests() {
    const client = new HTTPClient({
        timeout: 10000,
        headers: {
            'X-Lab-Client': 'Testing'
        }
    });

    console.log('🧪 BẮT ĐẦU KIỂM THỬ HTTP CLIENT');
    console.log('='.repeat(60));

    // Test 1: GET request tới server cục bộ
    try {
        console.log('\n📋 Test 1: GET request tới server cục bộ');
        const response1 = await client.get('http://localhost:3000/api/server-info');
        console.log('✅ Thành công:', response1.data);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }

    // Test 2: GET request tới external API (GitHub)
    try {
        console.log('\n📋 Test 2: GET request tới GitHub API');
        const response2 = await client.get('https://api.github.com/users/octocat');
        console.log('✅ Thành công:', {
            login: response2.data.login,
            name: response2.data.name,
            public_repos: response2.data.public_repos
        });
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }

    // Test 3: POST request tới JSONPlaceholder
    try {
        console.log('\n📋 Test 3: POST request tới JSONPlaceholder');
        const testData = {
            title: 'Lab01 Test Post',
            body: 'This is a test post from our HTTP client',
            userId: 1
        };
        
        const response3 = await client.post(
            'https://jsonplaceholder.typicode.com/posts',
            testData
        );
        console.log('✅ Thành công:', response3.data);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }

    // Test 4: POST request tới server cục bộ
    try {
        console.log('\n📋 Test 4: POST request tới server cục bộ');
        const echoData = {
            message: 'Hello from HTTP Client',
            timestamp: new Date().toISOString(),
            testNumber: 4
        };
        
        const response4 = await client.post('http://localhost:3000/api/echo', echoData);
        console.log('✅ Thành công:', response4.data);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }

    // Test 5: Xử lý lỗi - URL không tồn tại
    try {
        console.log('\n📋 Test 5: Xử lý lỗi - URL không tồn tại');
        await client.get('http://localhost:3000/api/not-found');
    } catch (error) {
        console.log('✅ Xử lý lỗi thành công:', error.message);
    }

    // Test 6: Xử lý lỗi - Server không khả dụng
    try {
        console.log('\n📋 Test 6: Xử lý lỗi - Server không khả dụng');
        await client.get('http://localhost:9999/api/test');
    } catch (error) {
        console.log('✅ Xử lý lỗi thành công:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 HOÀN THÀNH TẤT CẢ KIỂM THỬ');
}

// Chạy tests nếu file được execute trực tiếp
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = HTTPClient;
