import prayerJson from "@/data/18-kinh-can-thuoc.json";

export type Prayer = {
  id: string;
  title: string;
  text?: string;
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
