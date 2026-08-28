import { InlineCode } from "patra-learn";

export const CommandInSentence = () => (
  <p style={{ maxWidth: 520, fontSize: 14, lineHeight: 1.8 }}>
    健康检查连续探测 <InlineCode>/actuator/health</InlineCode>，直到返回{" "}
    <InlineCode>{'"status":"UP"'}</InlineCode>，最多 30 轮、每轮 5 秒。
  </p>
);

export const PathsAndFlags = () => (
  <p style={{ maxWidth: 560, fontSize: 14, lineHeight: 1.8 }}>
    回滚时旧版本号从 main 提交历史里抄，传给 <InlineCode>cd.yml</InlineCode> 的{" "}
    <InlineCode>-f image_tag=&lt;旧sha&gt;</InlineCode> 参数；runner 重装脚本在{" "}
    <InlineCode>patra-infra/scripts/install-github-runner.sh</InlineCode>。
  </p>
);
