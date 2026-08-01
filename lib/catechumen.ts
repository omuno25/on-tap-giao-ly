import catechumenJson from "@/data/catechumen-question-set.json";

export type CatechumenCard = {
  id: string;
  lesson: number;
  question: string;
  answer: string;
};

export type CatechumenSet = {
  slug: string;
  title: string;
  description: string;
  cards: CatechumenCard[];
};

type CatechumenData = {
  meta: {
    title: string;
    note?: string;
  };
  sets: CatechumenSet[];
};

const data = catechumenJson as CatechumenData;

export const CATECHUMEN_META = data.meta;
export const CATECHUMEN_SETS = data.sets;

export function getCatechumenSet(slug: string) {
  return CATECHUMEN_SETS.find((set) => set.slug === slug);
}
