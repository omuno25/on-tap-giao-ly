export interface Question {
  id: string;
  type: 'essay' | 'multiple-choice' | 'flashcard';
  title: string;
  description?: string;
  category?: string;
  standardAnswer?: string;
  options?: { id: string; text: string }[];
  correctOptionId?: string;
  image?: string;
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: '12',
    type: 'essay',
    title: 'Trình bày các đặc tính của hôn nhân theo Giáo luật Điều 1056.',
    description: 'Giải thích các đặc tính thiết yếu của hôn nhân được định nghĩa trong Bộ Giáo luật và tại sao chúng được coi là không thể thiếu đối với tính thành sự của bí tích.',
    category: 'Bí tích Hôn phối',
    standardAnswer: 'Các đặc tính thiết yếu của hôn nhân là sự đơn nhất và tính bất khả phân ly; trong hôn nhân Kitô giáo, các đặc tính ấy còn có một sự bền vững đặc biệt nhờ bí tích.',
  },
  {
    id: '13',
    type: 'essay',
    title: 'Tại sao hôn nhân là một bí tích?',
    category: 'Phần 2: Suy tư Thần học',
  },
  {
    id: 'fc-1',
    type: 'flashcard',
    title: 'Mục đích của hôn nhân Công giáo là gì?',
    standardAnswer: 'Mục đích của hôn nhân Công giáo là sự thiện ích của đôi vợ chồng và việc sinh sản cũng như giáo dục con cái.',
  },
  {
    id: 'mc-12',
    type: 'multiple-choice',
    title: 'Mục đích của việc chuẩn bị kết hôn theo Giáo luật là gì?',
    image: 'https://picsum.photos/seed/marriage/800/450',
    category: 'Giáo Xứ Chánh Tòa',
    options: [
      { id: 'A', text: 'Để đôi bạn tìm hiểu kỹ về gia thế và tài sản của nhau trước khi ký giấy tờ.' },
      { id: 'B', text: 'Để đảm bảo việc kết hôn được thành sự, hợp pháp và đôi bạn ý thức được trách nhiệm.' },
      { id: 'C', text: 'Chỉ là một thủ tục hành chính bắt buộc để được làm lễ tại Nhà thờ.' },
      { id: 'D', text: 'Để Cha xứ biết mặt đôi bạn và sắp xếp ngày giờ tổ chức hôn lễ.' },
    ],
    correctOptionId: 'B',
  }
];
