// Global variables
let networkMonitor = {
    isRunning: false,
    requests: [],
    stats: {
        total: 0,
        successful: 0,
        failed: 0,
        totalResponseTime: 0
    }
};

// Utility functions
function formatTime(date) {
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// AJAX Helper function
function makeAjaxRequest(url, options = {}) {
    const startTime = performance.now();
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const method = options.method || 'GET';
        
        xhr.open(method, url, true);
        
        // Set headers
        if (options.headers) {
            Object.keys(options.headers).forEach(key => {
                xhr.setRequestHeader(key, options.headers[key]);
            });
        }
        
        // Set default content-type for POST requests
        if (method === 'POST' && !options.headers?.['Content-Type']) {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
                
                const response = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseTime: responseTime,
                    data: null,
                    headers: {}
                };
                
                // Parse response
                try {
                    response.data = JSON.parse(xhr.responseText);
                } catch (e) {
                    response.data = xhr.responseText;
                }
                
                // Parse headers
                const headerString = xhr.getAllResponseHeaders();
                headerString.split('\n').forEach(line => {
                    const parts = line.split(': ');
                    if (parts.length === 2) {
                        response.headers[parts[0]] = parts[1];
                    }
                });
                
                // Log network activity
                logNetworkActivity(method, url, xhr.status, responseTime);
                
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(response);
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            }
        };
        
        xhr.onerror = function() {
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            logNetworkActivity(method, url, 0, responseTime, 'Network Error');
            reject(new Error('Network Error'));
        };
        
        xhr.ontimeout = function() {
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            logNetworkActivity(method, url, 0, responseTime, 'Timeout');
            reject(new Error('Request Timeout'));
        };
        
        // Set timeout
        xhr.timeout = options.timeout || 10000;
        
        // Send request
        if (options.data) {
            xhr.send(typeof options.data === 'string' ? options.data : JSON.stringify(options.data));
        } else {
            xhr.send();
        }
    });
}

// Network monitoring functions
function logNetworkActivity(method, url, status, responseTime, error = null) {
    if (!networkMonitor.isRunning) return;
    
    const timestamp = new Date();
    const logEntry = {
        timestamp,
        method,
        url,
        status,
        responseTime,
        error
    };
    
    networkMonitor.requests.push(logEntry);
    updateNetworkStats(status, responseTime);
    updateNetworkLog(logEntry);
}

function updateNetworkStats(status, responseTime) {
    networkMonitor.stats.total++;
    networkMonitor.stats.totalResponseTime += responseTime;
    
    if (status >= 200 && status < 300) {
        networkMonitor.stats.successful++;
    } else {
        networkMonitor.stats.failed++;
    }
    
    // Update UI
    document.getElementById('total-requests').textContent = networkMonitor.stats.total;
    document.getElementById('successful-requests').textContent = networkMonitor.stats.successful;
    document.getElementById('failed-requests').textContent = networkMonitor.stats.failed;
    
    const avgResponseTime = networkMonitor.stats.total > 0 
        ? Math.round(networkMonitor.stats.totalResponseTime / networkMonitor.stats.total)
        : 0;
    document.getElementById('avg-response-time').textContent = `${avgResponseTime}ms`;
}

function updateNetworkLog(logEntry) {
    const logContent = document.getElementById('network-log-content');
    const statusIcon = logEntry.status >= 200 && logEntry.status < 300 ? '✅' : '❌';
    const errorText = logEntry.error ? ` (${logEntry.error})` : '';
    
    const logLine = `[${formatTime(logEntry.timestamp)}] ${statusIcon} ${logEntry.method} ${logEntry.url} - ${logEntry.status} (${logEntry.responseTime}ms)${errorText}\n`;
    
    logContent.textContent += logLine;
    logContent.scrollTop = logContent.scrollHeight;
}

// Main functions
async function refreshServerInfo() {
    try {
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        const response = await makeAjaxRequest('/api/server-info');
        const data = response.data;
        
        // Update current time
        document.getElementById('current-time').textContent = formatTime(new Date(data.timestamp));
        
        // Update uptime
        document.getElementById('server-uptime').textContent = formatUptime(data.uptime);
        
        // Update platform
        document.getElementById('server-platform').textContent = `${data.platform} ${data.architecture}`;
        
        button.innerHTML = originalText;
        button.disabled = false;
        
        showMessage('Server information refreshed successfully!', 'success');
    } catch (error) {
        console.error('Error refreshing server info:', error);
        showMessage(`Error refreshing server info: ${error.message}`, 'error');
        
        const button = event.target;
        button.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Server Info';
        button.disabled = false;
    }
}

async function getServerInfo() {
    try {
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        const response = await makeAjaxRequest('/api/server-info');
        const data = response.data;
        
        // Format server info
        const serverInfoText = `📊 Server Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 Timestamp: ${data.timestamp}
🖥️  Server: ${data.server} v${data.version}
⏱️  Uptime: ${formatUptime(data.uptime)}
💻 Platform: ${data.platform} ${data.architecture}
🚀 Node.js: ${data.nodeVersion}
💾 Total Memory: ${Math.round(data.totalMemory / 1024 / 1024)} MB
💾 Free Memory: ${Math.round(data.freeMemory / 1024 / 1024)} MB
🔧 CPU Cores: ${data.cpus}
🌐 Hostname: ${data.hostname}
📡 Network Interfaces: ${data.networkInterfaces.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        document.getElementById('server-info').textContent = serverInfoText;
        
        button.innerHTML = originalText;
        button.disabled = false;
        
        showMessage('Server information loaded successfully!', 'success');
    } catch (error) {
        console.error('Error getting server info:', error);
        document.getElementById('server-info').textContent = `❌ Error loading server info: ${error.message}`;
        showMessage(`Error getting server info: ${error.message}`, 'error');
        
        const button = event.target;
        button.innerHTML = '<i class="fas fa-download"></i> Get Server Info';
        button.disabled = false;
    }
}

async function testAPI() {
    try {
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        button.disabled = true;
        
        const endpoint = document.getElementById('api-endpoint').value;
        const isPost = endpoint === '/api/echo';
        
        let response;
        if (isPost) {
            const postDataText = document.getElementById('post-data').value || '{"message": "Hello Server", "timestamp": "' + new Date().toISOString() + '"}';
            let postData;
            
            try {
                postData = JSON.parse(postDataText);
            } catch (e) {
                throw new Error('Invalid JSON in POST data');
            }
            
            response = await makeAjaxRequest(endpoint, {
                method: 'POST',
                data: postData
            });
        } else {
            response = await makeAjaxRequest(endpoint);
        }
        
        // Format response
        const responseText = `Status: ${response.status} ${response.statusText || 'OK'}
Response Time: ${response.responseTime}ms
Content-Type: ${response.headers['content-type'] || 'Unknown'}

Headers:
${Object.keys(response.headers).map(key => `${key}: ${response.headers[key]}`).join('\n')}

Response Data:
${JSON.stringify(response.data, null, 2)}`;
        
        document.getElementById('api-response').textContent = responseText;
        
        button.innerHTML = originalText;
        button.disabled = false;
        
        showMessage(`API test completed successfully! (${response.responseTime}ms)`, 'success');
    } catch (error) {
        console.error('Error testing API:', error);
        document.getElementById('api-response').textContent = `❌ Error: ${error.message}`;
        showMessage(`API test failed: ${error.message}`, 'error');
        
        const button = event.target;
        button.innerHTML = '<i class="fas fa-play"></i> Test API';
        button.disabled = false;
    }
}

function startNetworkMonitor() {
    networkMonitor.isRunning = true;
    networkMonitor.requests = [];
    networkMonitor.stats = {
        total: 0,
        successful: 0,
        failed: 0,
        totalResponseTime: 0
    };
    
    // Reset UI
    document.getElementById('total-requests').textContent = '0';
    document.getElementById('successful-requests').textContent = '0';
    document.getElementById('failed-requests').textContent = '0';
    document.getElementById('avg-response-time').textContent = '0ms';
    document.getElementById('network-log-content').textContent = `🟢 Network monitoring started at ${formatTime(new Date())}\n`;
    
    showMessage('Network monitoring started', 'success');
}

function stopNetworkMonitor() {
    networkMonitor.isRunning = false;
    const logContent = document.getElementById('network-log-content');
    logContent.textContent += `🔴 Network monitoring stopped at ${formatTime(new Date())}\n`;
    
    showMessage('Network monitoring stopped', 'info');
}

function clearNetworkLog() {
    document.getElementById('network-log-content').textContent = 'Network monitoring log cleared...\n';
    networkMonitor.requests = [];
    showMessage('Network log cleared', 'info');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Show/hide POST data field based on endpoint selection
    const endpointSelect = document.getElementById('api-endpoint');
    const postDataGroup = document.getElementById('post-data-group');
    
    endpointSelect.addEventListener('change', function() {
        if (this.value === '/api/echo') {
            postDataGroup.style.display = 'block';
        } else {
            postDataGroup.style.display = 'none';
        }
    });
    
    // Initialize current time
    setInterval(() => {
        if (!networkMonitor.isRunning) {
            document.getElementById('current-time').textContent = formatTime(new Date());
        }
    }, 1000);
    
    // Load initial server info
    refreshServerInfo();
    
    console.log('🚀 Lab01 Client-Side JavaScript Loaded');
    console.log('📊 Network monitoring available');
    console.log('🔧 API testing tools ready');
});
