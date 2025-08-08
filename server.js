// Import các thư viện cần thiết
const express = require('express');
const path = require('path');

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware để xử lý JSON và phục vụ các tệp tĩnh (HTML, CSS, JS)
app.use(express.json()); // Cho phép máy chủ đọc dữ liệu JSON từ request
app.use(express.static(__dirname)); // Phục vụ các tệp trong cùng thư mục

// Lấy thông tin đăng nhập từ biến môi trường (Environment Variables)
// Trên Render, bạn sẽ thiết lập các biến này trong dashboard.
const VALID_EMAIL = process.env.LOGIN_EMAIL;
const VALID_PASSWORD = process.env.LOGIN_PASSWORD;

// --- Định nghĩa các Route (Đường dẫn) ---

// Route chính, phục vụ trang index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route cho việc đăng nhập (chấp nhận yêu cầu POST)
app.post('/login', (req, res) => {
    // Lấy email và password từ body của request
    const { email, password } = req.body;

    // Kiểm tra xem biến môi trường đã được thiết lập chưa
    if (!VALID_EMAIL || !VALID_PASSWORD) {
        console.error('Lỗi: Biến môi trường LOGIN_EMAIL hoặc LOGIN_PASSWORD chưa được thiết lập.');
        return res.status(500).json({ message: 'Lỗi cấu hình máy chủ.' });
    }

    // So sánh thông tin người dùng nhập với thông tin từ biến môi trường
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        // Nếu đúng, trả về thông báo thành công
        res.status(200).json({ message: 'Đăng nhập thành công!' });
    } else {
        // Nếu sai, trả về lỗi 401 (Unauthorized)
        res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }
});

// Lấy cổng từ biến môi trường của Render hoặc dùng cổng 3000 mặc định
const PORT = process.env.PORT || 3000;

// Khởi động máy chủ
app.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại cổng ${PORT}`);
    // Log cảnh báo nếu không tìm thấy biến môi trường khi chạy local
    if (!VALID_EMAIL || !VALID_PASSWORD) {
        console.warn('CẢNH BÁO: Không tìm thấy biến môi trường cho email/mật khẩu.');
        console.warn('Để kiểm tra local, bạn có thể chạy: LOGIN_EMAIL=abc@gmail.com LOGIN_PASSWORD=123456 node server.js');
    }
});
