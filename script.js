document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // LOGIC CHO TRANG ĐĂNG NHẬP (index.html)
    if (path === '/' || path.endsWith('index.html')) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = loginForm.email.value;
                const password = loginForm.password.value;
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = '';

                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const result = await response.json();
                    if (response.ok) {
                        sessionStorage.setItem('isLoggedIn', 'true');
                        window.location.href = '/home.html';
                    } else {
                        errorMessage.textContent = result.message;
                    }
                } catch (error) {
                    errorMessage.textContent = 'Đã có lỗi xảy ra.';
                }
            });
        }
    }
    // LOGIC CHO TRANG CHỦ (home.html)
    else if (path.endsWith('home.html')) {
        // 1. Kiểm tra đăng nhập
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = '/index.html';
            return;
        }

        // 2. Gán sự kiện cho nút Đăng xuất
        const logoutButton = document.getElementById('logoutButton');
        if(logoutButton) {
            logoutButton.addEventListener('click', () => {
                sessionStorage.removeItem('isLoggedIn');
                window.location.href = '/index.html';
            });
        }
    }
});
