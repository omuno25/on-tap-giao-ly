# Third-party notices

Dự án sử dụng các package npm được khai báo trong `package.json` và khóa phiên bản bằng `bun.lock`. Các dependency trực tiếp sử dụng license permissive như MIT, Apache-2.0 và ISC.

Toàn bộ thông báo bản quyền và nội dung license của dependency được giữ trong từng package khi cài bằng Bun. `bun.lock` là nguồn xác định chính xác package và phiên bản được cài.

Các dependency gián tiếp có điều kiện cần lưu ý gồm:

- `@img/sharp-libvips-*`: LGPL-3.0-or-later.
- `lightningcss` và `axe-core`: MPL-2.0.
- `caniuse-lite`: CC BY 4.0.
- `argparse`: Python-2.0.

Các package này không được commit trực tiếp vào repository. Lockfile chỉ ghi phiên bản và checksum để Bun tải chúng từ registry.

Khi phân phối container, executable hoặc bản đóng gói có chứa dependency, bên phát hành có trách nhiệm kèm theo các thông báo và license tương ứng. Tài liệu này không thay thế license gốc của từng package.
