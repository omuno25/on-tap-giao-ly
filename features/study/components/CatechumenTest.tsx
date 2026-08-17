import MockTest, {
  type MockTestSourceQuestion,
} from "@/features/quiz/components/MockTest";
import type { CatechumenSet } from "@/lib/catechumen";
import { appRoute } from "@/lib/routes";

export default function CatechumenTest({ set }: { set: CatechumenSet }) {
  const sourceQuestions: MockTestSourceQuestion[] = set.cards.map((card) => ({
    id: card.id,
    type: "short",
    question: card.question,
    answer: card.answer,
  }));

  return (
    <MockTest
      sourceQuestions={sourceQuestions}
      objectiveCount={13}
      essayCount={0}
      eyebrow="Giáo lý Dự tòng"
      title={`Kiểm tra ${set.title.replace("Giáo lý Dự tòng · ", "")}`}
      exitHref={appRoute.catechumenSet(set.slug)}
      saveResult={false}
    />
  );
}
