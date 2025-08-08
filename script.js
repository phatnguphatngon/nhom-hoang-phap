// Hàm này sẽ chạy khi toàn bộ nội dung trang đã được tải
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem chúng ta đang ở trang nào bằng URL path
    const path = window.location.pathname;

    // LOGIC CHO TRANG ĐĂNG NHẬP (index.html)
    if (path === '/' || path.endsWith('index.html')) {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');

        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Ngăn form gửi đi theo cách truyền thống

                const email = loginForm.email.value;
                const password = loginForm.password.value;
                errorMessage.textContent = ''; // Xóa thông báo lỗi cũ

                try {
                    // Gửi yêu cầu POST đến máy chủ với thông tin đăng nhập
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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
                    console.error('Lỗi đăng nhập:', error);
                    errorMessage.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
                }
            });
        }
    }
    // LOGIC CHO TRANG CHỦ (home.html - Giao diện Dashboard)
    else if (path.endsWith('home.html')) {
        // 1. Kiểm tra trạng thái đăng nhập
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (isLoggedIn !== 'true') {
            window.location.href = '/index.html'; // Chuyển về trang đăng nhập nếu chưa login
            return; // Dừng thực thi script
        }

        // 2. Lấy các phần tử DOM cần thiết
        const logoutButton = document.getElementById('logoutButton');
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        const contentFrame = document.getElementById('contentFrame');
        const pageTitle = document.getElementById('pageTitle');

        // 3. Xử lý sự kiện đăng xuất
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                sessionStorage.removeItem('isLoggedIn');
                window.location.href = '/index.html';
            });
        }

        // 4. Xử lý sự kiện click cho các link trong sidebar
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Ngăn trình duyệt chuyển trang

                const pageUrl = link.getAttribute('href');
                const title = link.querySelector('span').textContent;

                // Cập nhật iframe và tiêu đề trang
                if (contentFrame) {
                    contentFrame.src = pageUrl;
                }
                if (pageTitle) {
                    pageTitle.textContent = title;
                }

                // Cập nhật trạng thái 'active' để làm nổi bật mục đang chọn
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // 5. Tự động click vào mục đầu tiên khi tải trang để hiển thị nội dung mặc định
        if (sidebarLinks.length > 0) {
            sidebarLinks[0].click();
        }
    }
});
