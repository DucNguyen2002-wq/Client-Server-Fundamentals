# Demo Script - Lab01 Client-Server Fundamentals

## Chuẩn bị trước Demo (5 phút trước)

### Checklist:
- [ ] Server đang chạy: `node server.js`
- [ ] Browser mở sẵn tab: http://localhost:3000
- [ ] Terminal 1: Ready for client demo
- [ ] Terminal 2: Ready for monitor demo
- [ ] Browser DevTools mở sẵn Network tab
- [ ] Backup slides sẵn sàng

### Commands chuẩn bị:
```bash
# Terminal 1
cd d:\VS2022\Project\UDWNC\BTN1
node server.js

# Terminal 2 (backup)
cd d:\VS2022\Project\UDWNC\BTN1
# Ready for: node client.js

# Terminal 3 (backup)
cd d:\VS2022\Project\UDWNC\BTN1
# Ready for: node monitor.js
```

## Phần 1: Giới thiệu và Kiến trúc (3 phút)

### Script:
"Chào thầy và các bạn. Hôm nay nhóm chúng em sẽ trình bày về Lab01 - Client-Server Fundamentals.

**[Slide 1]** Nhóm chúng em gồm 3 thành viên với phân chia công việc rõ ràng: [đọc tên và nhiệm vụ]

**[Slide 2]** Dự án của chúng em triển khai kiến trúc Client-Server hoàn chỉnh với 4 thành phần chính:
- Web Browser client với static files
- Express.js server với RESTful APIs  
- Custom HTTP client built from scratch
- External API integration

Technology stack chúng em sử dụng: Node.js, Express.js, và pure JavaScript."

## Phần 2: Technical Implementation (5 phút)

### Script:
"**[Slide 3]** Về HTTP Server implementation, chúng em đã xây dựng:

```javascript
// Highlight key code
const app = express();
app.use(express.static('public'));

// Custom middleware for headers
app.use((req, res, next) => {
    res.header('X-Powered-By', 'Lab01-Server');
    res.header('X-Server-Time', new Date().toISOString());
    next();
});
```

Server hỗ trợ static file serving, multiple API endpoints, custom headers, và comprehensive error handling.

**[Slide 4]** HTTP Client được implement hoàn toàn từ built-in Node.js modules:

```javascript
class HTTPClient {
    async request(options) {
        return new Promise((resolve, reject) => {
            const client = options.url.startsWith('https:') ? https : http;
            // ... implementation
        });
    }
}
```

Client hỗ trợ cả HTTP và HTTPS, multiple methods, và robust error handling.

**[Slide 5]** Network Monitoring system cung cấp real-time tracking và performance analytics."

## Phần 3: Live Demo (7 phút)

### Demo Sequence:

#### 3.1 Server Demo (2 phút)
**Script:** "Bây giờ chúng em sẽ demo trực tiếp. Server đang chạy trên port 3000..."

**Actions:**
1. **Show terminal output:**
   ```
   📡 Server running on: http://localhost:3000
   📅 Started at: [timestamp]
   🖥️  Platform: win32 x64
   ```

2. **Switch to browser:**
   - Navigate to http://localhost:3000
   - **Point out:** "Đây là web interface với responsive design"
   - **Click:** "Refresh Server Info" button
   - **Explain:** "Đây là AJAX call tới API endpoint"

3. **Show real-time updates:**
   - Point to current time updating
   - Show server uptime counter

#### 3.2 API Testing Demo (2 phút)
**Script:** "Tiếp theo, chúng em sẽ demo API testing functionality..."

**Actions:**
1. **API Dropdown testing:**
   - Select "GET /api/server-info"
   - Click "Test API"
   - **Explain response:** "JSON response với server information"
   
2. **POST request testing:**
   - Select "POST /api/echo"
   - Show JSON input field appears
   - Enter test data: `{"message": "Demo test", "timestamp": "now"}`
   - Click "Test API"
   - **Highlight:** "Echo response showing received data"

3. **Error handling demo:**
   - Manually change URL to non-existent endpoint
   - Show 404 error handling

#### 3.3 HTTP Client Demo (2 phút)
**Script:** "Bây giờ demo HTTP Client tự xây dựng..."

**Actions:**
1. **Switch to Terminal 2:**
   ```bash
   node client.js
   ```

2. **Narrate output:**
   - "Test 1: GET request tới server cục bộ - ✅ Success"
   - "Test 2: External API (GitHub) - ✅ Success" 
   - "Test 3: POST request tới JSONPlaceholder - ✅ Success"
   - "Test 4: Local server POST - ✅ Success"
   - "Test 5-6: Error handling - ✅ Success"

3. **Highlight key points:**
   - Pure Node.js implementation
   - No external HTTP libraries
   - Comprehensive error handling

#### 3.4 Network Analysis Demo (1 phút)
**Script:** "Cuối cùng, demo network monitoring..."

**Actions:**
1. **Browser DevTools:**
   - Open F12 → Network tab
   - Refresh page to show network traffic
   - **Point out:** Request details, timing, headers

2. **Quick monitor demo:**
   ```bash
   node monitor.js
   ```
   - Show real-time monitoring output
   - **Highlight:** Performance metrics, concurrent testing

## Phần 4: Challenges và Learning (2 phút)

### Script:
"**[Slide 7]** Trong quá trình thực hiện, nhóm gặp phải 3 challenges chính:

1. **HTTP Client Implementation:** Xây dựng client không dùng thư viện bên ngoài. Chúng em giải quyết bằng cách sử dụng built-in modules và Promise wrapper.

2. **Network Monitoring:** Track và analyze HTTP traffic. Solution là request interceptors với performance measurement.

3. **Error Handling:** Handle đa dạng error types. Chúng em implement categorized error handling.

**[Slide 8]** Qua dự án này, nhóm đã nắm vững:
- HTTP Protocol understanding sâu sắc
- Client-Server architecture
- Asynchronous programming patterns
- Network performance analysis
- RESTful API design principles"

## Phần 5: Kết luận (1 phút)

### Script:
"**[Slide 9]** Về future enhancements, chúng em có kế hoạch implement HTTPS, WebSocket, authentication system.

**[Slide 10]** Tóm lại, dự án đã hoàn thành tất cả requirements:
- ✅ Complete Client-Server implementation
- ✅ Custom HTTP client và server
- ✅ Network monitoring tools
- ✅ Comprehensive documentation

Dự án giúp nhóm hiểu sâu về web fundamentals và chuẩn bị tốt cho các projects phức tạp hơn.

Cảm ơn thầy và các bạn đã lắng nghe. Nhóm sẵn sàng trả lời câu hỏi!"

## Q&A Preparation (10 phút)

### Câu hỏi thường gặp và cách trả lời:

#### Q1: "Tại sao không dùng axios cho HTTP client?"
**A:** "Yêu cầu bài lab là build from scratch để hiểu HTTP protocol ở low-level. Built-in modules giúp nắm vững request/response cycle và network programming fundamentals."

#### Q2: "Server handle concurrent requests như thế nào?"
**A:** "Node.js sử dụng event loop, non-blocking I/O. Đã test với 10 concurrent requests, average response time 3ms. Event-driven architecture cho phép handle thousands of connections simultaneously."

#### Q3: "Security considerations nào đã implement?"
**A:** "Custom headers, input validation, error handling without exposing internals. Future plans: HTTPS, JWT authentication, rate limiting, CORS configuration."

#### Q4: "Performance optimization strategies?"
**A:** "Monitoring response times, static file caching, connection keep-alive. Network monitor tool giúp identify bottlenecks. Có thể thêm compression, CDN integration."

#### Q5: "So sánh Express.js vs pure Node.js?"
**A:** "Express.js: routing, middleware, static serving built-in. Pure Node.js: manual implementation, verbose nhưng full control. Express giúp productivity cao hơn cho web development."

## Backup Plans

### Nếu Demo fails:
1. **Server không start:** Show prepared screenshots
2. **Network issues:** Use localhost alternatives  
3. **Browser crashes:** Have backup browser ready
4. **Code errors:** Explain logic từ slides

### Emergency Commands:
```bash
# Kill processes on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Restart server
node server.js

# Quick health check
curl http://localhost:3000/api/health
```

### Presentation Tips:
- Speak clearly and confidently
- Make eye contact with audience
- Explain technical concepts simply
- Be ready to go deeper if asked
- Have enthusiasm for the technology
- Practice transitions between slides
- Keep demos short and focused
