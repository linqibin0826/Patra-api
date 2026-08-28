// GlossaryWall 预览 —— 图鉴卡片墙，零 props：搜索框 + 全部词条卡。
// 列数由视口断点决定（sm:2 / lg:5），900px 捕获视口下呈 2 列。
import { GlossaryWall } from "patra-learn";

/** 卡片墙全量态（900 视口 = sm 断点 2 列） */
export const FullWall = () => <GlossaryWall />;
