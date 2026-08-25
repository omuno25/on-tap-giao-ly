# Source review checklist

Danh sách các hạng mục cần cải thiện sau khi rà soát source. Thực hiện theo thứ tự ưu tiên bên dưới.

## P1 — Nên sửa trước khi public rộng

### Chặn gian lận điểm thi nhóm

- [ ] Giới hạn `correctCount` trong khoảng từ `0` đến tổng số câu của bài thi (hiện tại là `20`).
- [ ] Chỉ chấp nhận kết quả từ peer đã đăng ký trong danh sách participant của phòng.
- [ ] Xác nhận `userId` trong kết quả khớp với participant gắn với `peerId` gửi message.
- [ ] Không cho participant ghi đè kết quả sau khi đã nộp thành công.
- [ ] Bổ sung test cho điểm âm, điểm vượt tổng số câu, peer lạ và nộp lần hai.

Files liên quan:

- `features/group-exam/useExamRoomConnection.ts`
- `app/phong-thi/thi/page.tsx`
- `lib/group-exam.ts`
- `tests/group-exam.test.ts`

Tiêu chí hoàn thành:

- Host không lưu điểm ngoài phạm vi hợp lệ.
- Một participant chỉ có một kết quả chính thức trong mỗi phiên.
- Message từ peer không thuộc phòng không làm thay đổi kết quả.

### Thêm rate limit cho API feedback

- [ ] Giới hạn số request theo IP, ví dụ `5 request/phút`.
- [ ] Trả HTTP `429` và thông báo phù hợp khi vượt giới hạn.
- [ ] Không forward request bị giới hạn tới Google Apps Script.
- [ ] Bổ sung test cho rate limit và thời gian reset quota.

File liên quan: `app/api/feedback/route.ts`.

Tiêu chí hoàn thành:

- Spam từ cùng một địa chỉ không thể tạo request upstream không giới hạn.
- Rate limit hoạt động đúng trong môi trường deploy nhiều instance hoặc serverless.

### Bảo vệ API TURN credentials

- [ ] Thêm rate limit theo IP cho `/api/turn-credentials`.
- [ ] Thêm timeout khi gọi Metered TURN API.
- [ ] Chỉ cho phép endpoint HTTPS thuộc hostname Metered đã cấu hình/chấp thuận.
- [ ] Không log API key hoặc URL có chứa API key.
- [ ] Bổ sung test cho thiếu cấu hình, timeout, rate limit và upstream lỗi.

File liên quan: `app/api/turn-credentials/route.ts`.

Tiêu chí hoàn thành:

- Endpoint không thể bị gọi tự động với tần suất không giới hạn.
- Request upstream bị hủy khi vượt timeout.
- API key không xuất hiện trong response hoặc log.

## P2 — Nên sửa sớm

### Giới hạn body feedback theo kích thước thực tế

- [ ] Chỉ nhận `Content-Type: application/json`.
- [ ] Không chỉ dựa vào header `Content-Length` do client cung cấp.
- [ ] Đọc body có giới hạn và dừng khi dữ liệu vượt `4096` byte.
- [ ] Trả HTTP `413` cho request chunked hoặc không có `Content-Length` nhưng vượt giới hạn.
- [ ] Bổ sung test cho body lớn, JSON lỗi và content type sai.

File liên quan: `app/api/feedback/route.ts`.

### Sửa cảnh báo dynamic filesystem access của Turbopack

- [ ] Bỏ hoặc thu hẹp helper `getRootPath(...paths)` quá tổng quát.
- [ ] Cố định filesystem access trong `content/blog` hoặc các thư mục nội dung cần thiết.
- [ ] Chạy production build và xác nhận không còn cảnh báo trace toàn bộ project.

Files liên quan:

- `shared/server/file-manager.ts`
- `shared/server/blog.ts`

Tiêu chí hoàn thành:

- `bun run build` không còn cảnh báo `Dynamic filesystem access causes tracing of the whole project`.
- Blog vẫn được generate đầy đủ trong production build.

### Siết validation message P2P

- [ ] Kiểm tra `roomCode` trong `GroupExamStart` trùng với phòng hiện tại.
- [ ] Kiểm tra `durationSeconds` là số hữu hạn, số nguyên và nằm trong phạm vi cho phép.
- [ ] Kiểm tra `expiresAt` lớn hơn `startedAt` và khớp với duration trong sai số cho phép.
- [ ] Giới hạn độ dài `userId`, tên người dùng và số phần tử leaderboard.
- [ ] Kiểm tra `correctCount` và `rank` là số nguyên trong phạm vi hợp lệ.
- [ ] Không nhận start, room state, leaderboard, kick hoặc close từ peer không phải host.

File liên quan: `features/group-exam/useExamRoomConnection.ts`.

## P3 — Test và hardening

### Bổ sung test API

- [ ] Test `/api/feedback`: payload hợp lệ, validation lỗi, body quá lớn, upstream lỗi, timeout và rate limit.
- [ ] Test `/api/turn-credentials`: thiếu cấu hình, payload upstream sai, lọc STUN/TURN, timeout và rate limit.

### Bổ sung test phòng thi nhóm

- [ ] Không nhận điểm lớn hơn tổng số câu.
- [ ] Không nhận kết quả từ peer lạ hoặc sai `userId`.
- [ ] Không cho participant nộp lần hai.
- [ ] Không nhận trạng thái phòng từ peer không phải host.
- [ ] Reconnect không tạo participant hoặc kết quả trùng.

### Bổ sung security headers

- [ ] Thêm `Content-Security-Policy` phù hợp với Next.js, WebRTC, Nostr relay và Metered TURN.
- [ ] Thêm `X-Content-Type-Options: nosniff`.
- [ ] Thêm `Referrer-Policy`.
- [ ] Thêm `Permissions-Policy` với phạm vi tối thiểu cần thiết.
- [ ] Kiểm tra các header trên production build/deployment.

File liên quan: `next.config.ts`.

## Baseline hiện tại

Tại thời điểm review:

- `bun run lint`: pass.
- `bun run test`: 25 test pass.
- `bun run build`: pass, còn một cảnh báo dynamic filesystem access.
- `bun audit`: không phát hiện vulnerability.
