// GlossaryWall 预览 —— 图鉴卡片墙，零 props：搜索框 + 全部词条卡。
// 列数由视口断点决定（sm:2 / lg:5），config overrides 的 1280x800 捕获视口下呈 5 列。
import { GlossaryWall } from "patra-learn";

/** 卡片墙全量态（1280 视口 = lg 断点 5 列） */
export const FullWall = () => <GlossaryWall />;
