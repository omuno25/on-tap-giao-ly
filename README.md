# Ôn tập Giáo lý

Ứng dụng web hỗ trợ ôn tập giáo lý Công giáo bằng flashcard, câu hỏi trắc nghiệm, bài tự luận ngắn và audio đọc kinh. Tiến độ học được lưu cục bộ trên trình duyệt; ứng dụng hiện không yêu cầu tài khoản và không gửi dữ liệu học tập lên máy chủ.

Sử dụng trực tuyến tại [ontapgiaoly.site](https://ontapgiaoly.site/).

> **Phạm vi sử dụng:** mã nguồn được phát hành theo MIT License. Nội dung giáo lý, dữ liệu, bài viết và audio được chia sẻ nhằm phục vụ học tập, nghiên cứu và sinh hoạt tôn giáo phi thương mại; không được sử dụng các tài nguyên này cho mục đích thương mại nếu chưa có sự cho phép riêng bằng văn bản.

## Tính năng

- Ôn Giáo lý Hôn nhân và Giáo lý Dự tòng theo từng bộ câu hỏi.
- Học bằng flashcard và làm bài kiểm tra có lưu kết quả cục bộ.
- Tạo phòng thi P2P, mời bạn bè bằng mã phòng và làm cùng một bộ đề.
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

Ứng dụng không cần máy chủ dữ liệu riêng để chạy. Tính năng phòng thi có thể hoạt động chỉ với STUN mặc định của Trystero, nhưng nên cấu hình Metered TURN để các thiết bị sau NAT hoặc firewall hạn chế vẫn kết nối được như mô tả bên dưới.

## Phòng thi P2P

Phòng thi nhóm sử dụng [Trystero](https://github.com/dmotz/trystero) để thiết lập kết nối WebRTC trực tiếp giữa các trình duyệt. Dự án không có máy chủ ứng dụng trung gian để lưu phòng, người tham gia hoặc kết quả thi.

Trystero vẫn cần một kênh signaling phi tập trung để các trình duyệt tìm thấy nhau và trao đổi thông tin thiết lập WebRTC. Sau khi kết nối, dữ liệu phòng thi được gửi trực tiếp, mã hóa đầu cuối giữa các peer và không đi qua Next.js API của dự án.

### Dịch vụ bên thứ ba

Phòng thi dùng Trystero và các Nostr relay để signaling. Dự án tích hợp Metered TURN làm đường relay dự phòng khi hai peer không thể kết nối trực tiếp; xem [hướng dẫn cấu hình Metered TURN](docs/integrations/metered-turn.md) để thiết lập local, Vercel và xử lý sự cố.

### Luồng hoạt động

1. Chủ phòng tạo mã gồm 6 ký tự và giữ trạng thái chính của phòng trên trình duyệt của mình.
2. Người tham gia nhập mã hoặc mở link mời để kết nối với chủ phòng.
3. Chủ phòng bắt đầu thi và gửi hash bộ đề cùng thời điểm kết thúc cho mọi người.
4. Mỗi trình duyệt tự tạo cùng một bộ câu hỏi từ hash, tự lưu tiến độ và tự chấm bài.
5. Khi nộp bài, người tham gia chỉ gửi số câu đúng cần thiết để đồng bộ kết quả.
6. Khi phiên đã hoàn thành, lịch sử và kết quả được lưu riêng trên thiết bị của từng người; trang kết quả không cần duy trì kết nối P2P.

Trạng thái phòng đi theo thứ tự `lobby` → `started` → `completed`. Trong lúc phòng còn hoạt động, chủ phòng là nguồn dữ liệu chính cho trạng thái phòng và thời gian thi.

### Dữ liệu được trao đổi

Hook [`useExamRoomConnection`](features/group-exam/useExamRoomConnection.ts) tạo các action Trystero sau:

| Action | Mục đích |
| --- | --- |
| `identity` | Nhận diện chủ phòng hoặc người tham gia. |
| `exam-start` | Đồng bộ hash bộ đề và thời gian bắt đầu/kết thúc. |
| `room-state` | Đồng bộ trạng thái hiện tại của phòng. |
| `exam-result` | Gửi số câu đúng về chủ phòng. |
| `leaderboard` | Đồng bộ bảng xếp hạng khi kết nối còn hoạt động. |
| `room-kick` | Thông báo một người tham gia bị đưa ra khỏi phòng. |
| `room-closed` | Thông báo phiên phòng không còn khả dụng. |

`action.send()` không truyền `target` sẽ gửi cho tất cả peer; khi có `target`, thông điệp chỉ được gửi tới peer tương ứng. `onPeerJoin` và `onPeerLeave` cập nhật danh sách người đang kết nối.

### Lưu trữ và khôi phục phiên

- Hồ sơ, `userId`, phiên cá nhân, phiên nhóm, phòng đang tạo/tham gia và lịch sử thi được lưu trong `localStorage`.
- Phiên cá nhân và phiên nhóm dùng khóa riêng, vì vậy chúng không ghi đè lẫn nhau.
- Người thi có thể rời trang rồi tiếp tục bài đang làm trên cùng trình duyệt.
- Khi bấm tiếp tục một phòng chưa hoàn thành, ứng dụng kết nối lại với chủ phòng để kiểm tra trạng thái trước khi điều hướng.
- Phòng đã hoàn thành được đọc từ lịch sử cục bộ và không mở lại kết nối P2P.

Các khóa lưu trữ được quản lý tập trung trong [`lib/app-storage.ts`](lib/app-storage.ts); adapter và migration nằm trong [`lib/learning-storage.ts`](lib/learning-storage.ts).

### Giới hạn cần biết

- Chủ phòng phải giữ ứng dụng hoạt động trong lúc phiên thi đang diễn ra. Nếu tab hoặc thiết bị của chủ phòng mất kết nối, peer khác không thể lấy trạng thái mới cho đến khi chủ phòng kết nối lại.
- Vì không có cơ sở dữ liệu trung tâm, một peer không thể xác nhận tức thời và tuyệt đối rằng mã phòng không tồn tại; giao diện cần cho phép thử kết nối lại khi mạng chậm.
- Dữ liệu chỉ có trên từng trình duyệt. Xóa dữ liệu trang web hoặc đổi thiết bị sẽ làm mất phiên và lịch sử cục bộ của thiết bị đó.
- Mã phòng dùng để tìm đúng room, không phải mật khẩu. Không gửi dữ liệu nhạy cảm qua phòng thi.
- Một số mạng hạn chế WebRTC có thể khiến hai thiết bị không kết nối được trực tiếp.

### Chạy thử hai peer

```bash
bun run dev --hostname 0.0.0.0
```

1. Mở ứng dụng bằng hai trình duyệt, hai profile trình duyệt hoặc hai thiết bị khác nhau.
2. Đặt tên người dùng riêng trên mỗi thiết bị.
3. Tạo phòng ở thiết bị thứ nhất rồi dùng mã hoặc link mời trên thiết bị thứ hai.
4. Kiểm tra lần lượt các luồng tham gia, rời phòng, kết nối lại, bắt đầu thi, nộp bài và xem lịch sử.

Khi phát triển, thông báo `User-Initiated Abort, reason=Close called` có thể xuất hiện lúc Trystero chủ động đóng kết nối trong quá trình điều hướng hoặc cleanup. Đây không phải lỗi nghiệp vụ nếu kết nối được đóng có chủ đích; hook hiện chỉ lọc đúng trường hợp đóng chủ động và vẫn giữ lại các lỗi P2P khác.

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
