import prayerJson from "@/data/prayer-set.json";

export type Prayer = {
  id: string;
  title: string;
  text: string;
  audio?: string;
};

type PrayerData = {
  meta: {
    title: string;
    note?: string;
  };
  prayers: Prayer[];
};

const data = prayerJson as PrayerData;

export const PRAYER_META = data.meta;
export const PRAYERS = data.prayers;
