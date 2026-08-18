# Cấu hình Metered TURN

Dự án sử dụng [Metered TURN Dashboard](https://dashboard.metered.ca/turnserver/app/6a84756c3bd7b1ca54627e3b) để cấp ICE server cho các kết nối không thể đi trực tiếp. TURN là đường dự phòng: Trystero vẫn giữ các STUN mặc định và WebRTC ưu tiên candidate kết nối trực tiếp; dữ liệu chỉ được relay qua TURN khi NAT hoặc firewall khiến kết nối P2P thất bại.

## Thiết lập Metered

1. Với tài khoản free, giữ **Default/Standard region** để API trả endpoint `standard.relay.metered.ca`. Không chọn **Singapore Only**: các endpoint theo region chỉ dành cho gói trả phí. Nếu đã nâng cấp gói, có thể chọn Singapore để giảm độ trễ cho người dùng ở Việt Nam.
2. Tạo hoặc regenerate API key trong phần TURN Credentials.
3. Không commit API key, username hoặc password vào repository.

## Chạy local

Sao chép `.env.example` thành `.env.local` và đặt các biến server-side:

```dotenv
METERED_TURN_ENDPOINT=https://ontapgiaoly.metered.live/api/v1/turn/credentials
METERED_TURN_API_KEY=replace_with_your_metered_api_key
```

Khởi động lại development server sau khi thay đổi biến môi trường:

```bash
bun run dev
```

Không đặt tiền tố `NEXT_PUBLIC_` cho hai biến trên.

## Luồng tích hợp

Route [`/api/turn-credentials`](../../app/api/turn-credentials/route.ts) giữ API key ở phía server, gọi Metered với `cache: no-store`, kiểm tra phản hồi rồi chỉ trả các ICE server có URL `turn:` hoặc `turns:` cho trình duyệt.

Hook [`useExamRoomConnection`](../../features/group-exam/useExamRoomConnection.ts) lấy credential trước khi gọi `joinRoom()` và truyền chúng qua `turnConfig`. Nếu endpoint TURN tạm thời không khả dụng, hook ghi cảnh báo và tiếp tục dùng STUN mặc định.

Cấu hình không sử dụng `iceTransportPolicy: "relay"`. WebRTC có thể thu thập candidate STUN và TURN đồng thời để giảm thời gian kết nối, nhưng ưu tiên đường trực tiếp; TURN chỉ truyền dữ liệu khi ICE chọn relay candidate.

## Deploy lên Vercel

1. Mở **Project → Settings → Environment Variables**.
2. Thêm `METERED_TURN_ENDPOINT` và `METERED_TURN_API_KEY`.
3. Áp dụng ít nhất cho Production và Preview.
4. Redeploy ứng dụng để deployment mới nhận biến môi trường.

## Kiểm tra cấu hình

Gọi `/api/turn-credentials` trên deployment:

- HTTP `200` và JSON có `turnConfig`: credential hoạt động.
- HTTP `503`: deployment chưa nhận đủ biến môi trường.
- HTTP `502`: Metered từ chối request, trả dữ liệu sai định dạng hoặc không trả TURN server.

Để kiểm tra fallback thực tế, tạo phòng trên một thiết bị dùng Wi-Fi và tham gia bằng thiết bị khác dùng 4G/5G. Kiểm tra console nếu phòng vẫn không kết nối được.

## Bảo mật và xử lý sự cố

- Không đăng ảnh hoặc log chứa API key, username hay credential.
- Nếu secret xuất hiện trong issue, chat, commit hoặc ảnh chụp màn hình, regenerate ngay trong Metered Dashboard rồi cập nhật Vercel.
- Lỗi WebSocket tới Nostr relay là lỗi signaling riêng. TURN hỗ trợ NAT traversal nhưng không thay thế signaling.
- Khi `/api/turn-credentials` trả `503`, kiểm tra chính xác tên biến `METERED_TURN_ENDPOINT` và `METERED_TURN_API_KEY`, sau đó redeploy.
- Khi Metered tạm thời không khả dụng, ứng dụng vẫn thử kết nối trực tiếp bằng STUN mặc định.
