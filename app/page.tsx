import Dashboard from '@/features/dashboard/components/Dashboard';
import { getBlogPosts } from '@/lib/blog';

export default function Home() {
  return <Dashboard blogPosts={getBlogPosts()} />;
}
