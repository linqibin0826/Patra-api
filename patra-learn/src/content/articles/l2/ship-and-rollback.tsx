// patra-learn/src/content/articles/l2/ship-and-rollback.tsx —— 2 号线第 5 站：上线与回滚
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function ShipAndRollbackArticle() {
  return (
    <>
      <ArticleSection title="回滚是常规操作，不是事故">
        <p>
          很多团队把回滚当成拉响警报的大事，这套体系的立场相反：
          <strong className="text-ink">新版本可能有问题是常态，退回去只是流程的一个分支</strong>
          。前几站铺的所有垫子——commit sha 当版本号、GHCR 留归档、每个服务一本 last-good
          账——都是为了让"退回去"便宜到不值得紧张。便宜到什么程度？自动的那种你甚至不用出手。
        </p>
      </ArticleSection>

      <ArticleSection title="验货失败：机器人自己翻小本本">
        <p>
          上一站三道验货有任何一道没过，deploy.sh 先把该服务容器最近 80
          行日志甩进流水线记录（这是你回头排查的第一现场），然后启动自动回滚：翻开{" "}
          <InlineCode>~/.patra/cd/last-good-&lt;服务名&gt;</InlineCode>
          ，读出上一个确认好用的版本号，按老流程把它换回去——镜像就位（本机没有就回源{" "}
          <Term>GHCR</Term>）、up、再走一轮健康检查。
        </p>
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 340"
              role="img"
              aria-label="验货失败后的决策树：有 last-good 记录且不等于当前 tag 时自动回滚并复检，复检健康则服务恢复但整单仍标失败；无记录或复检仍失败则需人工介入"
              className="min-w-[640px]"
            >
              <title>失败 → 自动退回 last-good 决策树</title>
              {/* 起点 */}
              <rect
                x="250"
                y="16"
                width="220"
                height="46"
                rx="12"
                fill="#ffffff"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="360"
                y="45"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ✗ 某服务验货失败
              </text>
              <line x1="360" y1="62" x2="360" y2="88" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="355,87 360,96 365,87" fill="#8b929b" />
              {/* 判断 1 */}
              <rect
                x="235"
                y="96"
                width="250"
                height="46"
                rx="23"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="360"
                y="125"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                小本本上有 last-good 吗？
              </text>
              {/* 无记录分支 */}
              <line x1="485" y1="119" x2="580" y2="119" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="579,114 588,119 579,124" fill="#8b929b" />
              <text
                x="532"
                y="108"
                textAnchor="middle"
                fontSize="11.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                没有 / 记的就是这版
              </text>
              <rect
                x="588"
                y="96"
                width="112"
                height="46"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="644"
                y="125"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#565d66"
              >
                ‼ 人工介入
              </text>
              {/* 回滚 */}
              <line x1="360" y1="142" x2="360" y2="168" stroke="#d95b32" strokeWidth="2" />
              <polygon points="355,167 360,176 365,167" fill="#d95b32" />
              <text
                x="384"
                y="160"
                textAnchor="start"
                fontSize="11.5"
                fill="#d95b32"
                fontWeight="700"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                有，且是别的版本
              </text>
              <rect
                x="235"
                y="176"
                width="250"
                height="52"
                rx="12"
                fill="#ffffff"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="360"
                y="198"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ⟲ 换回 last-good 版本
              </text>
              <text x="360" y="218" textAnchor="middle" fontSize="11.5" fill="#565d66">
                镜像就位 → up → 复检健康
              </text>
              {/* 复检结果 */}
              <line x1="300" y1="228" x2="212" y2="264" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="216,258 205,267 220,268" fill="#8b929b" />
              <line x1="420" y1="228" x2="508" y2="264" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="500,268 515,267 504,258" fill="#8b929b" />
              <text
                x="232"
                y="250"
                textAnchor="middle"
                fontSize="11.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                复检健康 ✓
              </text>
              <text
                x="490"
                y="250"
                textAnchor="middle"
                fontSize="11.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                复检仍失败 ✗
              </text>
              <rect
                x="40"
                y="268"
                width="300"
                height="56"
                rx="12"
                fill="#f1f2ee"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="190"
                y="290"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                服务照常跑（旧版）
              </text>
              <text x="190" y="310" textAnchor="middle" fontSize="11.5" fill="#565d66">
                但整单标记失败，通知照发——回滚不是成功
              </text>
              <rect
                x="420"
                y="268"
                width="220"
                height="56"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="530"
                y="290"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#565d66"
              >
                ‼ 人工介入
              </text>
              <text x="530" y="310" textAnchor="middle" fontSize="11.5" fill="#565d66">
                日志已备好在流水线记录里
              </text>
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            自动回滚的决策树。注意左下角：就算回滚成功、网站照常能访问，这一单也照样以失败收场——
            "自动兜住了"和"上线成功了"是两回事，不能混。
          </figcaption>
        </figure>
        <p>
          几个边界处理得很老实：小本本上没有记录（比如服务第一次上线就失败）、或记的恰好就是这个失败的
          tag，脚本不硬来，直接标"需人工介入"；回滚成功也只是"服务恢复"，整个 job 仍以失败退出——
          <Term>GitHub Actions</Term> 的原生通知（App 推送 + 邮件）会找上你。于是终点站的体验是：
          <strong className="text-ink">手机没响 = 上线成功；响了 = 已自动退回旧版</strong>
          ，网站照常跑，你有空再看日志。
        </p>
      </ArticleSection>

      <ArticleSection title="手动回滚：填两个空，两分钟">
        <p>
          另一种场景是自动验货抓不住的：上线一切健康，第二天你才发现新版逻辑有 bug。这时用剧本留的
          手动按钮 <Term>workflow_dispatch</Term>——去 Actions 页面（或用 gh 命令）触发
          cd.yml，填两个参数：哪个服务、回到哪个 tag：
        </p>
        <CodeBlock command="gh workflow run cd.yml -f service=catalog -f image_tag=<旧sha>" />
        <p>
          <InlineCode>image_tag</InlineCode> 一旦非空，流水线里所有构建、打镜像、归档推送的步骤
          整体跳过，直接拿这个 tag 去跑 deploy.sh——旧镜像还躺在 mini 的本机缓存里，整个过程约 2
          分钟。旧 sha 去哪找？这就是 1 号线 <Term>squash merge</Term> 埋的伏笔：main
          的历史一行一件事，每个 commit 都是一个可部署的版本号，翻 git log 按提交号精确点名即可。
          portal 同理，用 portal-cd.yml 的手动按钮、只填 image_tag（它整条剧本只管 portal
          一个服务）。
        </p>
        <p>
          这条路不是"理论上可行"——上线后专门做过回滚演练：滚回旧版、再滚回新版，双向都实际走通过。
          没演练过的回滚方案等于没有回滚方案。
        </p>
      </ArticleSection>

      <ArticleSection title="档案 #6：打错字的假成功">
        <p>
          部署闭环站说过 deploy.sh 开工前要"验票"，现在补上它的来历。早期版本里，手动回滚时如果把
          服务名打错（比如 catalog 手滑成 catalgo），脚本会把它当成"不在名单里的服务"静默跳过——
          什么都没部署，流水线却一路绿灯报成功。你以为回滚完成了，生产上跑的还是坏版本。
        </p>
        <p>
          这个坑是 AI 评审员 CodeRabbit 在 PR 评审里抓出来的。修法就是现在的入参校验：清单必须是
          非空数组、每个名字必须在 services.json 花名册里，不认识的名字直接{" "}
          <InlineCode>exit 2</InlineCode> 拒绝执行。宁可当场报错，绝不假装成功——
          <strong className="text-ink">流水线最危险的状态不是红灯，是骗人的绿灯</strong>。
        </p>
        <p>
          至此 2 号线到站：从 mini 领任务、本机打包、部署闭环、三道验货，到出事自己退回来， 你点完
          Merge 之后的一切都有人（机器人）负责。但还剩一个没人管的问题——这套设施
          <strong className="text-ink">本身</strong>坏了怎么办？runner 悄悄掉线、磁盘悄悄塞满，
          谁来发现？换乘 3 号线，守夜线开车。
        </p>
      </ArticleSection>
    </>
  );
}
