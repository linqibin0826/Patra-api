// MetroMap 预览 —— 首页 SVG 学习网络图，数据驱动自 lines.ts，零 props。
// 固定画布 950x520，只有一种渲染形态（无痕浏览器 = 零进度态，1 号线首站带当前站光环）。
import { MetroMap } from "patra-learn";

/** 全网络图：三条开通线 + 两条规划虚线 + 换乘节点 */
export const FullNetwork = () => <MetroMap />;
