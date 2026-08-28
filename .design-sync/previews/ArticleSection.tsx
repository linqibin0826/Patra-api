import { ArticleSection, InlineCode } from "patra-learn";

export const ProseSection = () => (
  <div style={{ maxWidth: 640 }}>
    <ArticleSection title="镜像就位：本地优先，退避拉取">
      <p>
        部署脚本先看本机有没有这个版本的镜像——刚构建完的场景直接命中，零下载。
        只有回滚到旧版本时才需要去 <InlineCode>GHCR</InlineCode> 拉，
        拉不动就按 30 / 60 / 120 秒退避重试三轮。
      </p>
      <p>
        这套顺序是「芯片格式事故」之后定下的：构建和部署在同一台机器上，
        镜像天然就位，<InlineCode>docker pull</InlineCode> 从关键路径上消失了。
      </p>
    </ArticleSection>
  </div>
);

export const StackedSections = () => (
  <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 32 }}>
    <ArticleSection title="这一站讲什么">
      <p>上线不算完，得验货：健康检查与 127.0.0.1 的讲究。</p>
    </ArticleSection>
    <ArticleSection title="验货标准">
      <p>
        连续探测 <InlineCode>/actuator/health</InlineCode> 直到返回{" "}
        <InlineCode>{'"status":"UP"'}</InlineCode>，最多 30 轮、每轮 5 秒。
      </p>
    </ArticleSection>
  </div>
);
