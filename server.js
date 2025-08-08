// Sử dụng các thư viện cần thiết
const express = require('express');
const path = require('path');

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware để xử lý JSON và phục vụ các tệp tĩnh
app.use(express.json());
app.use(express.static(__dirname));

// Lấy danh sách tài khoản từ biến môi trường của Render
// Biến này sẽ chứa một chuỗi JSON, ví dụ: '[{"email":"a@a.com","password":"1"},{"email":"b@b.com","password":"2"}]'
const userAccountsJson = process.env.USER_ACCOUNTS;
let validUsers = []; // Mảng để chứa các tài khoản hợp lệ

// Phân tích chuỗi JSON thành một mảng các đối tượng user
try {
    if (userAccountsJson) {
        validUsers = JSON.parse(userAccountsJson);
    }
} catch (error) {
    console.error('Lỗi phân tích JSON từ biến môi trường USER_ACCOUNTS:', error);
}


// --- Định nghĩa các Route (Đường dẫn) ---

// Route chính, phục vụ trang index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route cho việc đăng nhập (chấp nhận yêu cầu POST)
app.post('/login', (req, res) => {
    // Lấy email và password từ body của request
    const { email, password } = req.body;

    // Kiểm tra xem biến môi trường đã được thiết lập và có chứa tài khoản nào không
    if (validUsers.length === 0) {
        console.error('Lỗi: Không có tài khoản nào được cấu hình trong biến môi trường USER_ACCOUNTS.');
        return res.status(500).json({ message: 'Lỗi cấu hình máy chủ.' });
    }

    // Tìm kiếm trong mảng tài khoản xem có tài khoản nào khớp không
    const foundUser = validUsers.find(user => user.email === email && user.password === password);

    if (foundUser) {
        // Nếu tìm thấy, trả về thông báo thành công
        res.status(200).json({ message: 'Đăng nhập thành công!' });
    } else {
        // Nếu không tìm thấy, trả về lỗi 401 (Unauthorized)
        res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }
});

// Lấy cổng từ biến môi trường của Render hoặc dùng cổng 3000 mặc định
const PORT = process.env.PORT || 3000;

// Khởi động máy chủ
app.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại cổng ${PORT}`);
    if (validUsers.length === 0) {
        console.warn('CẢNH BÁO: Không tìm thấy tài khoản nào trong biến môi trường USER_ACCOUNTS.');
    } else {
        console.log(`Đã tải thành công ${validUsers.length} tài khoản.`);
    }
});
