import MockTest from "@/features/quiz/components/MockTest";
import { AppRoute } from "@/lib/routes";

export default function TestPage() {
  return <MockTest exitHref={AppRoute.MarriageCatechism} />;
}
