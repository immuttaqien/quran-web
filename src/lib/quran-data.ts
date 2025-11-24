export interface QuranWord {
  arabic: string
  root: string
  translation: string
}

export interface QuranPage {
  surah: string
  words: QuranWord[]
}

export const quranData: QuranPage[] = [
  {
    surah: "Surah Al-Fatihah (1)",
    words: [
      {
        arabic: "بِسْمِ",
        root: "root: ism",
        translation: "Dengan nama",
      },
      {
        arabic: "اللَّهِ",
        root: "root: allah",
        translation: "Allah",
      },
      {
        arabic: "الرَّحْمَٰنِ",
        root: "root: rahman",
        translation: "Yang Maha Pengasih",
      },
      {
        arabic: "الرَّحِيمِ",
        root: "root: rahim",
        translation: "Yang Maha Penyayang",
      },
    ],
  },
  {
    surah: "Surah Al-Fatihah (2)",
    words: [
      {
        arabic: "الْحَمْدُ",
        root: "root: hamd",
        translation: "Segala puji",
      },
      {
        arabic: "لِلَّهِ",
        root: "root: li-llah",
        translation: "bagi Allah",
      },
      {
        arabic: "رَبِّ",
        root: "root: rabb",
        translation: "Tuhan",
      },
      {
        arabic: "الْعَالَمِينَ",
        root: "root: alamin",
        translation: "sekalian alam",
      },
    ],
  },
  {
    surah: "Surah Al-Fatihah (3)",
    words: [
      {
        arabic: "الرَّحْمَٰنِ",
        root: "root: rahman",
        translation: "Yang Maha Pengasih",
      },
      {
        arabic: "الرَّحِيمِ",
        root: "root: rahim",
        translation: "Yang Maha Penyayang",
      },
    ],
  },
  {
    surah: "Surah Al-Fatihah (4)",
    words: [
      {
        arabic: "مَالِكِ",
        root: "root: malik",
        translation: "Pemilik",
      },
      {
        arabic: "يَوْمِ",
        root: "root: yawm",
        translation: "hari",
      },
      {
        arabic: "الدِّينِ",
        root: "root: din",
        translation: "Agama",
      },
    ],
  },
  {
    surah: "Surah Al-Fatihah (5)",
    words: [
      {
        arabic: "إِيَّاكَ نَعْبُدُ",
        root: "root: ibadah",
        translation: "Hanya kepada-Mu kami menyembah",
      },
      {
        arabic: "وَإِيَّاكَ",
        root: "root: iyaaka",
        translation: "dan hanya kepada-Mu",
      },
      {
        arabic: "نَسْتَعِينُ",
        root: "root: isti'anah",
        translation: "kami mohon pertolongan",
      },
    ],
  },
  {
    surah: "Surah Al-Fatihah (6)",
    words: [
      {
        arabic: "اهْدِنَا",
        root: "root: huda",
        translation: "Tunjukilah kami",
      },
      {
        arabic: "الصِّرَاطَ",
        root: "root: sirath",
        translation: "jalan",
      },
      {
        arabic: "الْمُسْتَقِيمَ",
        root: "root: istiqamah",
        translation: "yang lurus",
      },
    ],
  },
  {
    surah: "Surah Al-Fatihah (7)",
    words: [
      {
        arabic: "صِرَاطَ الَّذِينَ",
        root: "root: sirath",
        translation: "Jalan orang-orang",
      },
      {
        arabic: "أَنْعَمْتَ عَلَيْهِمْ",
        root: "root: ni'mah",
        translation: "yang Engkau beri nikmat",
      },
      {
        arabic: "غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ",
        root: "root: ghadab",
        translation: "bukan yang dimurkai",
      },
      {
        arabic: "وَلَا الضَّالِّينَ",
        root: "root: dalalah",
        translation: "dan bukan yang sesat",
      },
    ],
  },
]
