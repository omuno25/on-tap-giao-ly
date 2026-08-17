import { redirect } from "next/navigation";
import { AppRoute } from "@/lib/routes";

export default function AboutPage() {
  redirect(AppRoute.SettingsReleaseNotes);
}
