import { ArticleSection, InlineCode, Term } from "patra-learn";

export const InSentence = () => (
  <p style={{ maxWidth: 520, fontSize: 14, lineHeight: 1.8 }}>
    部署剧本真正跑在你家常驻的 <Term>runner</Term> 上，而不是 GitHub 租的一次性云机器。
  </p>
);

export const InProse = () => (
  <div style={{ maxWidth: 640 }}>
    <ArticleSection title="查岗钥匙放在哪">
      <p>
        机器远在天边，凭什么知道你家 mini 上的 <Term>runner</Term> 死活？答案是{" "}
        <Term>GitHub Actions</Term> 根本不去碰它——守夜线的查岗钥匙放在{" "}
        <Term>secrets</Term> 保险柜里，名字叫 <InlineCode>RUNNER_ADMIN_TOKEN</InlineCode>。
      </p>
      <p>
        回滚也不用登录机器：<Term>workflow_dispatch</Term> 是剧本上留的手动按钮，
        填服务名和旧版本号即可；旧版本镜像本机没有时才去 <Term>GHCR</Term> 拉。
      </p>
    </ArticleSection>
  </div>
);

export const DenseTerms = () => (
  <p style={{ maxWidth: 560, fontSize: 14, lineHeight: 1.8 }}>
    <Term>分支保护</Term> 要求必须走 PR、检查全绿才能合并，合并方式固定为{" "}
    <Term>squash merge</Term>——零碎提交压成 main 上干净的一条，之后由{" "}
    <Term>docker compose</Term> 一条 up 拉起整套服务。
  </p>
);
