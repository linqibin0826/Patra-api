// patra-learn/src/content/articles/l2/runner-picks-up.tsx —— 2 号线第 1 站：mini 领任务
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function RunnerPicksUpArticle() {
  return (
    <>
      <ArticleSection title="换乘之后，活儿派给了谁">
        <p>
          你在换乘站点下 Merge，2 号线发车——剧本换成了 <InlineCode>cd.yml</InlineCode>
          （portal 另有一份同款 <InlineCode>portal-cd.yml</InlineCode>）。但这条线的{" "}
          <Term>runner</Term> 和 1 号线不一样：1 号线的考场全是 GitHub 免费租的云机器（
          <InlineCode>ubuntu-latest</InlineCode>
          ，一次性、用完销毁），它们在地球另一端，摸不到你家里那 24 个容器。要"把新版本换上去"，
          活儿必须落在容器所在的那台机器上——家里那台 Mac mini。
        </p>
        <p>
          于是 mini 上装了一个常驻程序，注册进 <Term>GitHub Actions</Term> 当编外演员——这就是
          self-hosted runner。云机器是临时工，考完即走；它是常驻演员， 由 macOS 的 launchd
          托管在后台，一直守着"有没有我的活"。
        </p>
      </ArticleSection>

      <ArticleSection title="领活方式：不是 GitHub 找上门，是 mini 主动去问">
        <p>
          很多人第一反应是"GitHub 怎么连进你家网络？"——答案是
          <strong className="text-ink">不连</strong>
          。方向反过来：mini 上的 runner 主动向 GitHub 发起出站长轮询，"有活吗？"
          有活，任务就沿着这条 mini 自己拨出去的连接递回来。
        </p>
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 260"
              role="img"
              aria-label="Mac mini 上的 runner 主动向 GitHub 出站长轮询领任务，任务沿同一条连接递回；家里防火墙不开任何入站端口"
              className="min-w-[640px]"
            >
              <title>长轮询领任务：只出不进</title>
              {/* GitHub 侧 */}
              <rect
                x="20"
                y="60"
                width="210"
                height="110"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="125"
                y="92"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                GitHub · 任务台
              </text>
              <text x="125" y="114" textAnchor="middle" fontSize="11.5" fill="#565d66">
                cd.yml 的 build-deploy
              </text>
              <text x="125" y="134" textAnchor="middle" fontSize="11.5" fill="#565d66">
                排队等人认领
              </text>
              {/* 防火墙 */}
              <rect x="330" y="42" width="14" height="176" rx="4" fill="#e3e5df" />
              <text
                x="337"
                y="34"
                textAnchor="middle"
                fontSize="11.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                家里防火墙
              </text>
              {/* 家侧 */}
              <rect
                x="440"
                y="42"
                width="260"
                height="176"
                rx="14"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="570"
                y="70"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                🏠 Mac mini
              </text>
              <rect
                x="466"
                y="86"
                width="208"
                height="82"
                rx="10"
                fill="#ffffff"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="570"
                y="114"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                🤖 runner（常驻演员）
              </text>
              <text x="570" y="136" textAnchor="middle" fontSize="11.5" fill="#565d66">
                launchd 托管，后台待命
              </text>
              <text x="570" y="156" textAnchor="middle" fontSize="11.5" fill="#565d66">
                旁边就是 24 个容器
              </text>
              <text x="570" y="200" textAnchor="middle" fontSize="11.5" fill="#8b929b">
                入站端口：一个都没开
              </text>
              {/* 出站长轮询箭头 */}
              <line x1="466" y1="112" x2="242" y2="98" stroke="#d95b32" strokeWidth="2" />
              <polygon points="243,93 233,98 243,104" fill="#d95b32" />
              <text
                x="352"
                y="86"
                textAnchor="middle"
                fontSize="11.5"
                fill="#d95b32"
                fontWeight="700"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                ① 有活吗？（主动出站）
              </text>
              {/* 任务返回箭头 */}
              <line
                x1="230"
                y1="152"
                x2="454"
                y2="166"
                stroke="#8b929b"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              <polygon points="452,160 463,167 451,171" fill="#8b929b" />
              <text
                x="352"
                y="186"
                textAnchor="middle"
                fontSize="11.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                ② 有——沿原路把任务递回去
              </text>
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            连接永远由 mini 主动拨出。不需要公网 IP、不需要端口转发，防火墙上不用为它打任何洞——
            "领任务"这件事对家里的网络是零暴露的。
          </figcaption>
        </figure>
        <p>
          任务怎么精确落到这台机器？靠标签路由。注册时 runner 挂了两枚标签：内置的{" "}
          <InlineCode>self-hosted</InlineCode> 和自定义的 <InlineCode>macmini</InlineCode>；
          <InlineCode>cd.yml</InlineCode> 的 build-deploy job 写着{" "}
          <InlineCode>runs-on: [self-hosted, macmini]</InlineCode>
          ——两枚标签都对得上，这份活才归它。1 号线那些 <InlineCode>ubuntu-latest</InlineCode>{" "}
          考卷则永远轮不到它头上。
        </p>
      </ArticleSection>

      <ArticleSection title="安全边界：陌生代码上不了这台机器">
        <p>
          这里有个必须掰扯清楚的问题：仓库是<strong className="text-ink">公开的</strong>
          ，任何人都能 fork 一份、提一个 PR。要是 PR 里的代码能在 mini
          上跑，那等于任何陌生人都能在你家机器上执行脚本——绝对不行。
        </p>
        <p>
          所以规矩定死在触发器上：<InlineCode>cd.yml</InlineCode> 和{" "}
          <InlineCode>portal-cd.yml</InlineCode> 只监听两种事件——
          <InlineCode>push</InlineCode> 到 main，和手动按钮 <Term>workflow_dispatch</Term>；
          <strong className="text-ink">不监听 pull_request</strong>。也就是说 mini 只执行
          两种代码：已经过你审查、被 1 号线全绿放行、合并进 main 的；或你亲手点按钮指定的。fork PR
          里的代码想上这台机器，唯一的路是先过 1 号线考试和你的 review——而考它的是云端一次性机器，
          考完连机器都销毁了。
        </p>
        <p>
          再叠加上一节的"零入站"：陌生代码进不来，陌生连接也进不来。这台家用机器敢当生产服务器，
          靠的就是这两道墙。
        </p>
      </ArticleSection>

      <ArticleSection title="常驻演员的生存环境：.env、.path 与禁自更新">
        <p>
          runner 是 launchd 后台服务，这带来一个隐蔽的差异：
          <strong className="text-ink">它不继承你终端里的任何环境变量</strong>
          。你在 shell 里配好的代理、JAVA_HOME，对它统统不存在。所以安装脚本把生存必需品直接固化进
          runner 目录的 <InlineCode>.env</InlineCode> 文件：出网代理（mini 出网必须经本机 Clash 的
          7897 端口，不写它连 GitHub 都摸不到）和 <InlineCode>JAVA_HOME</InlineCode>
          （指向 mise 管理的 Zulu JDK 25，下一站打包要用）。还有一份 <InlineCode>.path</InlineCode>
          ，补上 OrbStack docker 所在的 <InlineCode>/usr/local/bin</InlineCode> 等路径——否则它连
          docker 命令都找不到。
        </p>
        <p>
          另一个刻意的选择是注册时带 <InlineCode>--disableupdate</InlineCode>
          ，关掉 runner 的自动更新——launchd 环境里自更新的下载曾经走不了代理直接卡死。
          代价是升级得人工来：闲时重跑安装脚本即可（它会比对版本、只更新二进制）。 什么时候必须升，3
          号线守夜站会专门盯着。唯一的红线：
          <strong className="text-ink">派发任务期间严禁重启 runner</strong>
          ——会当场杀死正在执行的 Worker，任务显示成莫名其妙的 cancelled。
        </p>
        <CodeBlock command="bash patra-infra/scripts/install-github-runner.sh <REGISTRATION_TOKEN>" />
        <p>
          这条命令就是 runner 的全部运维：安装、升级、离线后重新注册，都是它。脚本头部的注释块
          即运维手册，翻车经验全沉淀在里面。
        </p>
        <p>
          好，演员领到活了。任务清单上写着：把改过的服务打成新镜像。下一站看它怎么打——
          以及为什么"在哪台机器上打"曾经酿成一场持续三个月的事故。
        </p>
      </ArticleSection>
    </>
  );
}
