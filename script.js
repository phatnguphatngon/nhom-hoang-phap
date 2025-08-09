// Hàm này sẽ chạy khi toàn bộ nội dung trang đã được tải
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem chúng ta đang ở trang nào
    const path = window.location.pathname;

    if (path === '/' || path.endsWith('index.html')) {
        // --- Logic cho trang Đăng Nhập ---
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn form gửi đi theo cách truyền thống

            const email = loginForm.email.value;
            const password = loginForm.password.value;
            errorMessage.textContent = ''; // Xóa thông báo lỗi cũ

            try {
                // Gửi yêu cầu POST đến máy chủ với thông tin đăng nhập
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    // Nếu đăng nhập thành công, lưu trạng thái và chuyển hướng
                    sessionStorage.setItem('isLoggedIn', 'true');
                    window.location.href = '/home.html';
                } else {
                    // Nếu thất bại, hiển thị thông báo lỗi từ máy chủ
                    errorMessage.textContent = result.message;
                }
            } catch (error) {
                // Xử lý lỗi mạng hoặc lỗi máy chủ
                console.error('Lỗi đăng nhập:', error);
                errorMessage.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            }
        });

    } else if (path.endsWith('home.html')) {
        // --- Logic cho trang Chủ ---
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');

        // Nếu người dùng chưa đăng nhập, chuyển hướng họ về trang đăng nhập
        if (isLoggedIn !== 'true') {
            window.location.href = '/index.html';
            return; // Dừng thực thi script
        }

        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', () => {
            // Xóa trạng thái đăng nhập và chuyển hướng về trang đăng nhập
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/index.html';
        });
    }
});
