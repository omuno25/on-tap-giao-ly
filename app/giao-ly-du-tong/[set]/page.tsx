import { notFound } from "next/navigation";
import CatechumenSetDetail from "@/features/study/components/CatechumenSetDetail";
import { CATECHUMEN_SETS, getCatechumenSet } from "@/lib/catechumen";

export function generateStaticParams() {
  return CATECHUMEN_SETS.map((set) => ({ set: set.slug }));
}

export default async function CatechumenSetPage({
  params,
}: {
  params: Promise<{ set: string }>;
}) {
  const { set: slug } = await params;
  const catechumenSet = getCatechumenSet(slug);
  if (!catechumenSet) notFound();
  return <CatechumenSetDetail set={catechumenSet} />;
}
