/// 详情页 / 状态屏共用的暖纸按钮 class 串（复刻 hi-fi .btn-primary=clay / .btn-sec）。
const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3.5 py-2 font-sans text-base font-semibold no-underline transition-colors outline-none focus-visible:shadow-[var(--ring-focus)] disabled:cursor-not-allowed";

export const btnPrimary = `${BTN_BASE} border-clay-700 bg-clay-600 text-[var(--fg-on-clay)] hover:bg-clay-700 active:bg-clay-800`;
export const btnSecondary = `${BTN_BASE} border-[var(--border-default)] bg-paper-50 text-[var(--fg-1)] hover:bg-paper-200`;
export const btnBlock = "w-full px-3.5 py-2.5";
