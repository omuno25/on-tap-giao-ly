# Dữ liệu học tập

Chỉ chỉnh nội dung học trong thư mục này:

- `marriage-question-set.json`: câu hỏi Giáo lý Hôn nhân.
- `catechumen-question-set.json`: flashcard Giáo lý Dự tòng.
- `prayer-set.json`: 18 Kinh cần thuộc và đường dẫn audio.

## Cấu trúc một bài kinh

```json
{
  "id": "kinh-lay-cha",
  "title": "Kinh Lạy Cha",
  "text": "Nội dung bài kinh...",
  "audio": "/audio/kinh-lay-cha.mp3"
}
```

Trường `audio` có thể bỏ qua khi chưa có file đọc. File audio nội bộ nên đặt trong `public/audio/` và đường dẫn trong JSON bắt đầu bằng `/audio/`.

Không import JSON trực tiếp từ component. Các adapter trong `lib/question-bank.ts`, `lib/catechumen.ts` và `lib/prayers.ts` chịu trách nhiệm cung cấp dữ liệu có type cho UI.
