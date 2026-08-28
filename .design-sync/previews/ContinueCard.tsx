// ContinueCard 预览 —— 首页「继续通勤」卡，零 props，状态来自 localStorage 进度。
// 首页把它放在 max-w-5xl 主栏里，预览用 720px 容器贴近真实宽度。
import { useEffect } from "react";
import { ContinueCard } from "patra-learn";

const KEY = "patra-learn.progress.v1";
const SEED = ["l1/write-code", "l1/open-pr", "l1/changed-only", "l1/parallel-exams"];

/** 零进度态（无痕浏览器默认）：已到 0 / 13 站 + 蓝色 1 号线按钮 */
export const FreshCommuter = () => (
  <div style={{ maxWidth: 720 }}>
    <ContinueCard />
  </div>
);

/** 通勤中途态：渲染期预置 1 号线全线打卡（子组件 effect 先于父 effect 读到），挂载后立即清掉，避免污染同源其他预览的零进度态 */
export const MidJourney = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(SEED));
  } catch {
    // storage 不可用时退化为零进度态，预览仍可渲染
  }
  useEffect(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // 清理失败仅影响本页会话，忽略
    }
  }, []);
  return (
    <div style={{ maxWidth: 720 }}>
      <ContinueCard />
    </div>
  );
};
