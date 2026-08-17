import { redirect } from "next/navigation";
import { AppRoute } from "@/lib/routes";

export default function LegacyProfilePage() {
  redirect(AppRoute.Settings);
}
