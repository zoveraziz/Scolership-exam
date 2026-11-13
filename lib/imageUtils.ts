/**
 * গুগল ড্রাইভ বা সাধারণ ছবির লিংক ব্রাউজারে প্রদর্শনের উপযোগী ফরম্যাটে রূপান্তর করে
 */
export function formatImageUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Base64 ছবি হলে সরাসরি রিটার্ন
  if (trimmed.startsWith("data:image")) return trimmed;

  // Google Drive URL হ্যান্ডলিং - লোকাল প্রক্সি এপিআই দিয়ে শতভাগ সফল লোড নিশ্চিত করা
  if (trimmed.includes("drive.google.com") || trimmed.includes("drive.usercontent.google.com")) {
    const fileIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `/api/image-proxy?id=${fileId}`;
    }
  }

  return trimmed;
}
