import Dashboard from "@/features/dashboard/components/Dashboard";
import { getBlogPosts } from "@/shared/server/blog";

export default function Home() {
  return <Dashboard blogPosts={getBlogPosts()} />;
}
