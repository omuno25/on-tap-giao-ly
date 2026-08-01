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

## Bài viết Góc học tập

Mỗi bài viết là một file Markdown trong `content/blog/`. Tên file trở thành đường dẫn bài viết, ví dụ `hoc-flashcard.md` sẽ có URL `/blog/hoc-flashcard`.

```md
---
title: "Tiêu đề bài viết"
category: "Mẹo học"
excerpt: "Mô tả ngắn hiển thị trên card."
readingTime: "3 phút đọc"
featured: false
order: 4
---

Nội dung **Markdown** của bài viết.
```

Đặt `featured: true` cho bài muốn hiển thị nổi bật trên trang Học tập. `order` quyết định thứ tự hiển thị.
