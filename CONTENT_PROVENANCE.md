# Nguồn gốc nội dung và tài nguyên

Tài liệu này ghi nhận nguồn gốc và trạng thái quyền của những tài nguyên không phải mã nguồn. Nó không thay thế `CONTENT_LICENSE.md`.

## Bộ dữ liệu giáo lý

| Phạm vi                              | Người duy trì      | Nguồn                                                     | Trạng thái                                                                               |
| ------------------------------------ | ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data/giao-ly-hon-nhan-dataset.json` | Omuno contributors | Bộ câu hỏi do người duy trì nhập và biên tập cho ứng dụng | Cần tiếp tục đối chiếu với tài liệu giáo lý chính thức trước mỗi lần phát hành           |
| `data/giao-ly-du-tong-29-40.json`    | Omuno contributors | Bộ câu hỏi do người duy trì nhập và biên tập cho ứng dụng | Cần tiếp tục đối chiếu với tài liệu giáo lý chính thức trước mỗi lần phát hành           |
| `data/giao-ly-du-tong-15-28.json`    | Omuno contributors | Bộ câu hỏi do người duy trì nhập và biên tập cho ứng dụng | Cần tiếp tục đối chiếu với tài liệu giáo lý chính thức trước mỗi lần phát hành           |
| `data/18-kinh-can-thuoc.json`        | Omuno contributors | Nội dung kinh được chuẩn hóa cho ứng dụng                 | Chỉ cấp phép phần biên soạn mà dự án có quyền; văn bản bên thứ ba giữ quyền riêng nếu có |
| `data/leaderboard.json`              | Omuno contributors | Dữ liệu minh họa, không phải dữ liệu người dùng thật      | CC BY-NC 4.0                                                                             |

## Bài viết

Các tệp trong `content/blog/`, `content/privacy-policy.md` và `content/release-notes.md` do Omuno contributors biên soạn cho dự án và được cấp phép theo CC BY-NC 4.0, trừ khi tệp ghi chú khác.

## Audio tổng hợp bằng AI

Các tệp trong `public/audio/` được người duy trì tạo bằng công nghệ tổng hợp giọng nói AI và thêm vào repository trong các ngày 2026-08-01–02. Metadata hiện có chỉ ghi encoder `Lavf60.16.101`; tên dịch vụ/model tạo giọng không được lưu trong file gốc.

- Người tạo và cung cấp: Omuno contributors.
- Giọng đọc: không nhằm mô phỏng hoặc đại diện cho cá nhân cụ thể.
- Phạm vi cấp phép của dự án: CC BY-NC 4.0.
- Điều kiện: chỉ phân phối khi điều khoản của dịch vụ tạo audio cho phép phân phối đầu ra.
- Việc cần lưu cho lần tạo tiếp theo: tên dịch vụ, model/voice, ngày tạo, phiên bản điều khoản và bằng chứng quyền sử dụng.

Không được đổi audio sang license thương mại nếu chưa xác minh lại điều khoản của dịch vụ/model đã dùng.

## Quy trình cập nhật

Mọi pull request thêm nội dung phải ghi nguồn, tác giả/người tạo, ngày lấy hoặc ngày tạo, license gốc và các thay đổi đã thực hiện. Tài nguyên không rõ quyền sử dụng phải bị loại khỏi bản phát hành công khai.
