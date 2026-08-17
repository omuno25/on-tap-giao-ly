export enum AppRoute {
  Home = "/",
  Study = "/hoc",
  MockTest = "/thi-thu",
  Essay = "/tu-luan",
  EssayReview = "/tu-luan/xem-lai",
  MarriageCatechism = "/giao-ly-hon-nhan",
  CatechumenCatechism = "/giao-ly-du-tong",
  ImportantPrayers = "/kinh-quan-trong",
  ExamRoom = "/phong-thi",
  Statistics = "/thong-ke",
  Profile = "/ho-so",
  Settings = "/cai-dat",
  SettingsPrivacy = "/cai-dat/quyen-rieng-tu",
  SettingsRating = "/cai-dat/danh-gia",
  SettingsFeedback = "/cai-dat/phan-hoi",
  SettingsAbout = "/cai-dat/gioi-thieu",
  SettingsReleaseNotes = "/cai-dat/lich-su-phien-ban",
  FeedbackApi = "/api/feedback",
}

export const appRoute = {
  catechumenSet: (slug: string) =>
    `${AppRoute.CatechumenCatechism}/${slug}` as const,
  catechumenStudy: (slug: string) =>
    `${AppRoute.CatechumenCatechism}/${slug}/hoc` as const,
  catechumenMockTest: (slug: string) =>
    `${AppRoute.CatechumenCatechism}/${slug}/thi-thu` as const,
  experience: (slug: string) => `/trai-nghiem/${slug}` as const,
} as const;
