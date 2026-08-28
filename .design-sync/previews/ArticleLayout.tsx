// ArticleLayout 预览 —— 课程页骨架：站条 + 正文 + 打卡按钮 + 上下站导航。
// 用真实线路数据（LINES），children 保持紧凑以适配 900x700 捕获视口。
import { ArticleLayout, ArticleSection, InlineCode } from "patra-learn";
import { LINES } from "patra-learn/src/content/lines";

const l1 = LINES[0]!;
const l2 = LINES[1]!;

/** 线中站：l2/native-build，上一站/下一站都存在 */
export const MidLineStation = () => (
  <ArticleLayout line={l2} station={l2.stations[1]!} stationRef="l2/native-build">
    <ArticleSection title="一场跑了三个月的芯片格式事故">
      <p>
        旧架构里打包在云端 ubuntu 机器上做：portal 构建产物是 amd64，推上去、拉回来、在 mini 上靠 Rosetta 转译层默默跑了三个月，没有任何报错。根治靠的不是「下次小心」，而是把出错的那个环节从结构上删掉——打包的机器就是上线的机器。
      </p>
    </ArticleSection>
  </ArticleLayout>
);

/** 线首站：l1/write-code，只有「下一站」导航 */
export const LineStartStation = () => (
  <ArticleLayout line={l1} station={l1.stations[0]!} stationRef="l1/write-code">
    <ArticleSection title="一切从分支开始">
      <p>
        本地开发、提交规范与推送的最小闭环：<InlineCode>git switch -c feat/xxx</InlineCode> 开分支，commit message 过 commitlint，推上去才有资格报名考试。
      </p>
    </ArticleSection>
  </ArticleLayout>
);
