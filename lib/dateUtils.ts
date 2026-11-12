// Bengali numerals translation
const banglaDigits: { [key: string]: string } = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

const bengaliToEnglishDigits: { [key: string]: string } = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export function toBanglaNumber(num: number | string): string {
  return String(num).replace(/[0-9]/g, (w) => banglaDigits[w] || w);
}

export const banglaMonthMap: Record<string, number> = {
  "জানুয়ারি": 0,
  "জানুয়ারি": 0,
  "january": 0,
  "jan": 0,
  "ফেব্রুয়ারি": 1,
  "ফেব্রুয়ারি": 1,
  "february": 1,
  "feb": 1,
  "মার্চ": 2,
  "march": 2,
  "mar": 2,
  "এপ্রিল": 3,
  "april": 3,
  "apr": 3,
  "মে": 4,
  "may": 4,
  "জুন": 5,
  "june": 5,
  "jun": 5,
  "জুলাই": 6,
  "july": 6,
  "jul": 6,
  "আগস্ট": 7,
  "august": 7,
  "aug": 7,
  "সেপ্টেম্বর": 8,
  "september": 8,
  "sep": 8,
  "অক্টোবর": 9,
  "october": 9,
  "oct": 9,
  "নভেম্বর": 10,
  "november": 10,
  "nov": 10,
  "ডিসেম্বর": 11,
  "december": 11,
  "dec": 11,
};

/**
 * বাংলা বা ইংরেজি তারিখ থেকে JavaScript Date অবজেক্ট তৈরি
 * যেমন: "৩১ আগস্ট ২০২৬" -> 2026-08-31 23:59:59
 */
export function parseDeadlineDate(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  const normalized = dateStr
    .trim()
    .replace(/[০-৯]/g, (d) => bengaliToEnglishDigits[d] || d);

  // মাস মিলিয়ে দেখা
  for (const [monthKey, monthIndex] of Object.entries(banglaMonthMap)) {
    if (normalized.toLowerCase().includes(monthKey)) {
      const numbers = normalized.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        let day = parseInt(numbers[0], 10);
        let year = parseInt(numbers[1], 10);
        if (day > 1000) {
          const temp = day;
          day = year;
          year = temp;
        }
        return new Date(year, monthIndex, day, 23, 59, 59, 999);
      }
    }
  }

  // YYYY-MM-DD বা DD-MM-YYYY
  if (normalized.includes("-")) {
    const parts = normalized.split("-").map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
      } else {
        return new Date(parts[2], parts[1] - 1, parts[0], 23, 59, 59, 999);
      }
    }
  }

  // DD/MM/YYYY বা YYYY/MM/DD
  if (normalized.includes("/")) {
    const parts = normalized.split("/").map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
      } else {
        return new Date(parts[2], parts[1] - 1, parts[0], 23, 59, 59, 999);
      }
    }
  }

  const nativeParsed = new Date(normalized);
  if (!isNaN(nativeParsed.getTime())) {
    nativeParsed.setHours(23, 59, 59, 999);
    return nativeParsed;
  }

  return null;
}

/**
 * আবেদনের শেষ সময় পার হয়েছে কিনা তা যাচাই
 */
export function isApplicationDeadlinePassed(deadlineStr?: string): boolean {
  if (!deadlineStr) return false;
  const deadlineDate = parseDeadlineDate(deadlineStr);
  if (!deadlineDate) return false;
  return new Date().getTime() > deadlineDate.getTime();
}
