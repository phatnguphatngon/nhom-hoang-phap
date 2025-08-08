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
    // LOGIC CHO TRANG CHỦ (home.html - Giao diện Hybrid)
    else if (path.endsWith('home.html')) {
        // 1. Kiểm tra đăng nhập
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = '/index.html';
            return;
        }

        // 2. Lấy các phần tử DOM
        const gridMenuView = document.getElementById('grid-menu-view');
        const appView = document.getElementById('app-view');
        const contentFrame = document.getElementById('contentFrame');
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const gridLinks = gridMenuView.querySelectorAll('.menu-card');
        const dropdownLinks = dropdownMenu.querySelectorAll('.dropdown-link');
        const backToGridBtn = document.getElementById('back-to-grid-btn');
        const logoutButton = document.getElementById('logoutButton');

        // 3. Hàm chuyển đổi giao diện
        function showAppView(url) {
            contentFrame.src = url;
            gridMenuView.classList.add('hidden');
            appView.classList.remove('hidden');
        }

        function showGridView() {
            contentFrame.src = 'about:blank'; // Dừng tải iframe để tiết kiệm tài nguyên
            appView.classList.add('hidden');
            gridMenuView.classList.remove('hidden');
            dropdownMenu.classList.add('hidden'); // Đảm bảo menu ẩn khi quay về
        }

        // 4. Gán sự kiện cho các thẻ trong Grid Menu
        gridLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('href');
                showAppView(url);
            });
        });

        // 5. Gán sự kiện cho nút Menu ẩn
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
            dropdownMenu.classList.toggle('hidden');
        });

        // 6. Gán sự kiện cho các link trong Dropdown
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('href');
                contentFrame.src = url;
                dropdownMenu.classList.add('hidden'); // Ẩn menu sau khi chọn
            });
        });

        // 7. Gán sự kiện cho nút "Bảng điều khiển" (quay về Grid)
        backToGridBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGridView();
        });

        // 8. Gán sự kiện cho nút Đăng xuất
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/index.html';
        });
        
        // 9. Đóng dropdown khi click ra ngoài
        document.addEventListener('click', () => {
            if (!dropdownMenu.classList.contains('hidden')) {
                dropdownMenu.classList.add('hidden');
            }
        });
    }
});
