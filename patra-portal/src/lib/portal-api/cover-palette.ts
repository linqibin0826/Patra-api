/** 深色学术调色板（延续原 mock 视觉质感）：bg 深底 + ink 浅字。期刊封面占位用。 */
export const COVER_PALETTE = [
  { bg: "#3C1611", ink: "#F6E8DA" },
  { bg: "#1F2E45", ink: "#E9EEF4" },
  { bg: "#0E574F", ink: "#ECF5F3" },
  { bg: "#1C1917", ink: "#F4D9B8" },
  { bg: "#5A1A14", ink: "#F6E8DA" },
  { bg: "#6E3216", ink: "#FBF1E8" },
] as const;

/** 按期刊 id 稳定 hash 选取调色板（同一期刊每次同色，SSR/CSR 一致）。 */
export function pickCover(id: string): { bg: string; ink: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  // 取模保证索引落在 [0, length) 内；?? 兜底首元素让 TS 在 noUncheckedIndexedAccess 下推断为非空
  return COVER_PALETTE[Math.abs(hash) % COVER_PALETTE.length] ?? COVER_PALETTE[0];
}
