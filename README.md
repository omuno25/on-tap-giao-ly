# Ôn tập Giáo lý

Ứng dụng web hỗ trợ ôn tập giáo lý Công giáo bằng flashcard, câu hỏi trắc nghiệm, bài tự luận ngắn và audio đọc kinh. Tiến độ học được lưu cục bộ trên trình duyệt; ứng dụng hiện không yêu cầu tài khoản và không gửi dữ liệu học tập lên máy chủ.

Sử dụng trực tuyến tại [ontapgiaoly.site](https://ontapgiaoly.site/).

> **Phạm vi sử dụng:** mã nguồn được phát hành theo MIT License. Nội dung giáo lý, dữ liệu, bài viết và audio được chia sẻ nhằm phục vụ học tập, nghiên cứu và sinh hoạt tôn giáo phi thương mại; không được sử dụng các tài nguyên này cho mục đích thương mại nếu chưa có sự cho phép riêng bằng văn bản.

## Tính năng

- Ôn Giáo lý Hôn nhân và Giáo lý Dự tòng theo từng bộ câu hỏi.
- Học bằng flashcard và làm bài kiểm tra có lưu kết quả cục bộ.
- Học các kinh quan trọng với bản đọc audio.
- Theo dõi tiến độ và thống kê ngay trên thiết bị.
- Đọc các bài viết hướng dẫn học tập.

## Yêu cầu

- Node.js `>=20.9.0`
- Bun `1.3.13`

## Chạy ở máy cá nhân

```bash
bun ci
bun run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Ứng dụng hiện không cần API key hoặc dịch vụ bên ngoài để chạy.

## Kiểm tra trước khi đóng góp

```bash
bun run check
bun audit
```

`bun run check` chạy ESLint, kiểm tra TypeScript và production build.

## Lưu ý về nội dung

Ứng dụng là tài liệu hỗ trợ ôn tập do cộng đồng duy trì, không phải ấn bản giáo lý chính thức và không thay thế hướng dẫn của giáo phận, giáo xứ hoặc người phụ trách đào tạo. Nội dung liên quan đến sức khỏe, hôn nhân hoặc pháp luật chỉ có mục đích học tập; hãy tham khảo người có chuyên môn trước khi đưa ra quyết định thực tế.

Nguồn gốc và trạng thái quyền của các bộ dữ liệu, bài viết và audio được ghi tại [CONTENT_PROVENANCE.md](CONTENT_PROVENANCE.md).

## Deploy lên Vercel

Import repository vào Vercel và giữ Framework Preset là **Next.js**. Vercel nhận diện `bun.lock` cùng trường `packageManager` và dùng cấu hình Bun trong `vercel.json`; không cần đặt riêng Install Command, Build Command hoặc Output Directory.

Nếu không muốn chạy Next.js bằng Bun runtime trên Vercel, có thể xóa `vercel.json`; Bun vẫn được dùng làm package manager nhờ `bun.lock`.

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

- Mã nguồn: [MIT License](LICENSE), bao gồm quyền sử dụng thương mại theo các điều kiện của MIT.
- Nội dung gốc, dữ liệu và audio do dự án tạo: [CC BY-NC 4.0](CONTENT_LICENSE.md).
- Tài liệu hoặc nội dung từ bên thứ ba, nếu có, vẫn tuân theo quyền và điều khoản của chủ sở hữu tương ứng.

Đây là repository đa license: phần mã nguồn là open source theo MIT; các tài nguyên trong `content/`, `data/` và `public/audio/` không thuộc MIT và bị giới hạn ở mục đích phi thương mại theo CC BY-NC 4.0.

Xem thêm [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [CONTRIBUTING.md](CONTRIBUTING.md) và [SECURITY.md](SECURITY.md).
