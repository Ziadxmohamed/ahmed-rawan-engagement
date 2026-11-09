export interface Dialogue {
  speaker: string;
  text: string;
  at: number;
  character: "ahmed" | "rawan" | "friend" | "other";
}
export interface Scene {
  title: string;
  subtitle: string;
  duration: number;
  announcement: string;
  caption: string;
  lines: Dialogue[];
}
export const scenes: Scene[] = [
  {
    title: "A little breaking news",
    subtitle: "01 / The word on the street",
    duration: 12000,
    announcement: "AHMED IS GETTING ENGAGED!",
    caption: "BREAKING NEWS",
    lines: [
      { speaker: "عمر", text: "إنت سمعت آخر خبر؟", at: 0, character: "friend" },
      {
        speaker: "يوسف",
        text: "خير؟ أحمد عمل إيه تاني؟!",
        at: 2300,
        character: "other",
      },
      {
        speaker: "عمر",
        text: "بيقولوا أحمد خلاص قرر!",
        at: 4700,
        character: "friend",
      },
      {
        speaker: "يوسف",
        text: "قرر إيه؟ ينام بدري؟!",
        at: 7100,
        character: "other",
      },
    ],
  },
  {
    title: "One very ready groom",
    subtitle: "02 / Almost on time",
    duration: 12000,
    announcement: "A MESSAGE FROM RAWAN",
    caption: "متتأخرش يا أحمد 😂❤️",
    lines: [
      { speaker: "عمر", text: "جاهز يا عريس؟", at: 0, character: "friend" },
      {
        speaker: "أحمد",
        text: "جاهز طبعًا… هو في حد بيقلق من الخطوبة؟",
        at: 2700,
        character: "ahmed",
      },
      {
        speaker: "روان · رسالة",
        text: "متتأخرش يا أحمد 😂❤️",
        at: 6500,
        character: "rawan",
      },
      {
        speaker: "أحمد",
        text: "أنا لازم أتحرك حالًا!",
        at: 8900,
        character: "ahmed",
      },
    ],
  },
  {
    title: "Right where we belong",
    subtitle: "03 / A beautiful beginning",
    duration: 15000,
    announcement: "AHMED & RAWAN",
    caption: "Our Next Chapter Begins Here.",
    lines: [
      { speaker: "روان", text: "أخيرًا وصلت!", at: 0, character: "rawan" },
      {
        speaker: "أحمد",
        text: "أهو جيت… ومستعد نكمل المشوار سوا.",
        at: 3500,
        character: "ahmed",
      },
      {
        speaker: "روان",
        text: "طب يلا نبدأ أحلى فصل في حياتنا.",
        at: 7800,
        character: "rawan",
      },
    ],
  },
  {
    title: "A home full of tomorrows",
    subtitle: "04 / A little dream of the future",
    duration: 12000,
    announcement: "Two Hearts. One Journey.",
    caption: "A Lifetime of Beautiful Moments.",
    lines: [
      {
        speaker: "أحمد",
        text: "جاهزة نبدأ حكايتنا؟",
        at: 0,
        character: "ahmed",
      },
      {
        speaker: "روان",
        text: "جاهزة… بس اختيار ألوان البيت بتاعي، صح؟",
        at: 2400,
        character: "rawan",
      },
      {
        speaker: "أحمد",
        text: "طب وأنا أختار إيه؟",
        at: 5600,
        character: "ahmed",
      },
      {
        speaker: "روان",
        text: "أنت اختار تحبني كل يوم!",
        at: 8000,
        character: "rawan",
      },
    ],
  },
  {
    title: "One last little question",
    subtitle: "05 / You’re part of the story",
    duration: 7000,
    announcement: "Of Course You’re Invited!",
    caption: "The best moments are the ones we share.",
    lines: [
      {
        speaker: "عمر",
        text: "طب يا جماعة… إحنا معزومين ولا إيه؟!",
        at: 0,
        character: "friend",
      },
    ],
  },
];
