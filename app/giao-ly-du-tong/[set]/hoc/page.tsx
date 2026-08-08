import { notFound } from "next/navigation";
import CatechumenStudy from "@/features/study/components/CatechumenStudy";
import { CATECHUMEN_SETS, getCatechumenSet } from "@/lib/catechumen";

export function generateStaticParams() {
  return CATECHUMEN_SETS.map((set) => ({ set: set.slug }));
}

export default async function CatechumenStudyPage({
  params,
}: {
  params: Promise<{ set: string }>;
}) {
  const { set: slug } = await params;
  const catechumenSet = getCatechumenSet(slug);
  if (!catechumenSet) notFound();
  return <CatechumenStudy set={catechumenSet} />;
}
