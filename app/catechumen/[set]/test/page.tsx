import { notFound } from "next/navigation";
import CatechumenTest from "@/features/study/components/CatechumenTest";
import { CATECHUMEN_SETS, getCatechumenSet } from "@/lib/catechumen";

export function generateStaticParams() {
  return CATECHUMEN_SETS.map((set) => ({ set: set.slug }));
}

export default async function CatechumenTestPage({
  params,
}: {
  params: Promise<{ set: string }>;
}) {
  const { set: slug } = await params;
  const catechumenSet = getCatechumenSet(slug);
  if (!catechumenSet) notFound();
  return <CatechumenTest set={catechumenSet} />;
}
