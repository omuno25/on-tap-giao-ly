# Ôn tập Giáo lý

Ứng dụng web hỗ trợ ôn tập giáo lý Công giáo bằng flashcard, câu hỏi trắc nghiệm, bài tự luận ngắn và audio đọc kinh. Tiến độ học được lưu cục bộ trên trình duyệt; ứng dụng hiện không yêu cầu tài khoản và không gửi dữ liệu học tập lên máy chủ.

## Tính năng

- Ôn Giáo lý Hôn nhân và Giáo lý Dự tòng theo từng bộ câu hỏi.
- Học bằng flashcard và làm bài kiểm tra có lưu kết quả cục bộ.
- Học các kinh quan trọng với bản đọc audio.
- Theo dõi tiến độ và thống kê ngay trên thiết bị.
- Đọc các bài viết hướng dẫn học tập.

## Yêu cầu

- Node.js `>=20.9.0`
- pnpm `10.11.0`

## Chạy ở máy cá nhân

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

Ứng dụng hiện không cần API key hoặc dịch vụ bên ngoài để chạy.

## Kiểm tra trước khi đóng góp

```bash
pnpm check
pnpm audit
```

`pnpm check` chạy ESLint, kiểm tra TypeScript và production build.

## Cấu trúc chính

- `app/`: route và layout của Next.js App Router.
- `features/`: giao diện theo từng tính năng.
- `components/`: component dùng chung.
- `lib/`: adapter dữ liệu và logic lưu trữ cục bộ.
- `data/`: bộ câu hỏi và metadata bài học.
- `content/`: bài viết, chính sách riêng tư và release notes.
- `public/audio/`: audio được ứng dụng phục vụ trực tiếp.

Xem [data/README.md](data/README.md) để biết cấu trúc dữ liệu.

## Quyền riêng tư

Dữ liệu về tên hiển thị, tiến độ và kết quả học được lưu trong bộ nhớ cục bộ của trình duyệt. Xem [chính sách quyền riêng tư](content/privacy-policy.md).

## Audio tạo bằng AI

Các tệp MP3 trong `public/audio/` được người duy trì dự án tạo bằng công nghệ tổng hợp giọng nói AI. Chúng không nhằm mô phỏng, đại diện hoặc khiến người nghe hiểu nhầm là giọng của một cá nhân cụ thể. Người đóng góp audio phải bảo đảm công cụ họ sử dụng cho phép phân phối lại đầu ra.

## License

- Mã nguồn: [MIT License](LICENSE).
- Nội dung gốc, dữ liệu và audio do dự án tạo: [CC BY 4.0](CONTENT_LICENSE.md).
- Tài liệu hoặc nội dung từ bên thứ ba, nếu có, vẫn tuân theo quyền và điều khoản của chủ sở hữu tương ứng.

Xem thêm [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [CONTRIBUTING.md](CONTRIBUTING.md) và [SECURITY.md](SECURITY.md).
