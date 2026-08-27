// patra-learn/src/content/articles/l3/four-checks.tsx —— 3 号线第 3 站：四项体检
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function FourChecksArticle() {
  return (
    <>
      <ArticleSection title="金丝雀：在岗不等于能干活">
        <p>
          查岗通过只证明了一件事：mini 的 <Term>runner</Term> 还连着
          GitHub。但"人在工位"和"能干活"之间还差着一段——docker
          引擎可能停了、磁盘可能快满了、哪个容器可能已经病恹恹的。这些毛病不发作时一切照旧，发作时正好赶上你合并代码，2
          号线当场趴窝。
        </p>
        <p>
          所以 watchdog 的第二个 job 叫 <InlineCode>canary</InlineCode>
          ——金丝雀，矿工带下井探毒气的那种鸟。它跑在 <InlineCode>[self-hosted, macmini]</InlineCode>{" "}
          上，也就是说<strong className="text-ink">它本身就是一次真实的任务派发</strong>
          ：金丝雀能开始跑，已经顺带证明了"runner
          领活—执行"这条链是通的；接下来它在机器上做四项体检，把"能干活"逐项摸一遍。
        </p>
      </ArticleSection>

      <ArticleSection title="四连检：每一项都对着一种死法">
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 320"
              role="img"
              aria-label="canary 的四项体检清单：docker 引擎可用、runner 版本未过期、磁盘余量不少于 20G、无 unhealthy 容器；任何一项不过整个巡检亮红灯"
              className="min-w-[640px]"
            >
              <title>金丝雀体检单</title>
              {/* 清单卡片 */}
              <rect
                x="40"
                y="20"
                width="480"
                height="284"
                rx="16"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <rect x="40" y="20" width="480" height="52" rx="16" fill="#7a5fb8" />
              <rect x="40" y="56" width="480" height="16" fill="#7a5fb8" />
              <text
                x="280"
                y="52"
                textAnchor="middle"
                fontSize="13.5"
                fontWeight="700"
                fill="#ffffff"
              >
                🐕 canary 体检单 · 每天 07:00
              </text>
              {/* 项 1 */}
              <rect
                x="64"
                y="88"
                width="20"
                height="20"
                rx="5"
                fill="#f1f2ee"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="74"
                y="103"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#7a5fb8"
              >
                ✓
              </text>
              <text x="100" y="103" fontSize="12.5" fontWeight="700" fill="#22262c">
                🐳 Docker 引擎还活着
              </text>
              <text x="100" y="122" fontSize="11" fill="#8b929b">
                docker info 报得出版本、数得出容器
              </text>
              {/* 项 2 */}
              <rect
                x="64"
                y="142"
                width="20"
                height="20"
                rx="5"
                fill="#f1f2ee"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="74"
                y="157"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#7a5fb8"
              >
                ✓
              </text>
              <text x="100" y="157" fontSize="12.5" fontWeight="700" fill="#22262c">
                🧾 runner 版本没有落后最新版
              </text>
              <text x="100" y="176" fontSize="11" fill="#8b929b">
                关了自更新，30 天不升 GitHub 就停止派活
              </text>
              {/* 项 3 */}
              <rect
                x="64"
                y="196"
                width="20"
                height="20"
                rx="5"
                fill="#f1f2ee"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="74"
                y="211"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#7a5fb8"
              >
                ✓
              </text>
              <text x="100" y="211" fontSize="12.5" fontWeight="700" fill="#22262c">
                💾 磁盘余量 ≥ 20G
              </text>
              <text x="100" y="230" fontSize="11" fill="#8b929b">
                构建和镜像都吃磁盘，满盘一切免谈
              </text>
              {/* 项 4 */}
              <rect
                x="64"
                y="250"
                width="20"
                height="20"
                rx="5"
                fill="#f1f2ee"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="74"
                y="265"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#7a5fb8"
              >
                ✓
              </text>
              <text x="100" y="265" fontSize="12.5" fontWeight="700" fill="#22262c">
                🩺 没有 unhealthy 的容器
              </text>
              <text x="100" y="284" fontSize="11" fill="#8b929b">
                24 个容器谁病了，点名到容器名
              </text>
              {/* 结果框 */}
              <rect
                x="556"
                y="88"
                width="144"
                height="88"
                rx="12"
                fill="#f1f2ee"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="628"
                y="118"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                全过 🤫
              </text>
              <text x="628" y="140" textAnchor="middle" fontSize="11" fill="#565d66">
                保持安静
              </text>
              <text x="628" y="160" textAnchor="middle" fontSize="11" fill="#565d66">
                无声即安好
              </text>
              <rect
                x="556"
                y="196"
                width="144"
                height="88"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="628"
                y="226"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                任一项挂 🔴
              </text>
              <text x="628" y="248" textAnchor="middle" fontSize="11" fill="#565d66">
                当场 exit 1
              </text>
              <text x="628" y="268" textAnchor="middle" fontSize="11" fill="#565d66">
                通知推到你手机
              </text>
              <line x1="520" y1="132" x2="548" y2="132" stroke="#7a5fb8" strokeWidth="2" />
              <polygon points="547,127 556,132 547,137" fill="#7a5fb8" />
              <line
                x1="520"
                y1="240"
                x2="548"
                y2="240"
                stroke="#8b929b"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />
              <polygon points="547,235 556,240 547,245" fill="#8b929b" />
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            四项体检按剧本里的实际顺序：docker → runner 版本 → 磁盘 →
            容器健康。每一项的报错文案都写清了"该干什么"，告警即行动指南。
          </figcaption>
        </figure>
        <p>
          <strong className="text-ink">第一项：docker 还活着。</strong>用{" "}
          <InlineCode>docker info</InlineCode>{" "}
          要一个服务端版本号、再数一遍在跑的容器——引擎停了这两条都答不上来。整台 mini 的价值都建立在{" "}
          <Term>docker compose</Term> 编排的那 24 个容器上，docker 引擎就是它的心跳。
        </p>
        <p>
          <strong className="text-ink">第二项：runner 版本没过期。</strong>2 号线讲过，runner
          注册时带了 <InlineCode>--disableupdate</InlineCode> 关掉自更新（launchd
          环境下自更新走不了代理曾卡死），升级改为人工控制。但 GitHub 有对应的规矩：禁用自更新的
          runner，新版发布 <strong className="text-ink">30 天内</strong>
          不升级就停止给它派活。所以这一项拿本机 <InlineCode>Runner.Listener --version</InlineCode>{" "}
          对比 GitHub API 上的最新版号，用的是严格不等比较——新版一出即告警，不等 30
          天倒计时走完。告警不是事故，是行动信号：找个空闲时段重跑一遍安装脚本即完成升级。这一项还立过功：守夜线上岗第一天，抓到的第一个问题就是
          runner 版本过期。
        </p>
        <p>
          <strong className="text-ink">第三项：磁盘余量 ≥ 20G。</strong>构建缓存、
          <Term>Docker 镜像</Term>
          、日志都在无声地吃磁盘，满盘时构建和部署都会以各种奇怪的姿势失败。用{" "}
          <InlineCode>df -g /</InlineCode> 读可用 G 数，低于 20
          就红灯，文案直接提示：清理镜像和日志。
        </p>
        <p>
          <strong className="text-ink">第四项：没有 unhealthy 容器。</strong>2
          号线健康检查站讲过每个容器的内部体检表，这里是它的日常巡查版：
        </p>
        <CodeBlock command="docker ps --filter health=unhealthy --format '{{.Names}}'" />
        <p>
          输出应当为空；不为空就红灯，并把病号名单原样打进报错——你在手机上看到的告警直接写着是哪个容器病了。
        </p>
      </ArticleSection>

      <ArticleSection title="档案 #5：全角逗号刺客">
        <p>
          2 号线健康检查站埋过一个伏笔：宿主机脚本跑在 macOS 自带的 bash 3.2
          上，变量一律要写大括号。伏笔在这一站兑现——因为这次翻车，两处里有一处就踩在体检脚本这类中文告警文案上。
        </p>
        <p>
          事情是这样的：macOS 出于许可证原因，自带的 bash 停在 2006 年的 3.2
          版，对多字节字符的边界处理很糙。当告警文案里 <InlineCode>$VAR</InlineCode>{" "}
          后面紧跟一个全角标点（中文逗号、括号这类），bash 3.2
          会把标点的字节并进变量名——去找一个名叫"VAR，"的变量，找不到，在{" "}
          <InlineCode>set -u</InlineCode> 之下当场报 unbound variable
          炸掉。写英文脚本一辈子遇不到这个坑，一写中文文案就撞上，而且报错信息完全不指向真正的病因。
        </p>
        <p>
          最气人的是它会重犯：<strong className="text-ink">在两个不同文件里，前后各踩了一次</strong>
          。第二次踩的时候才确认这不是手滑，是环境级的规律。从此立了一条铁律：凡是带中文文案的脚本，变量一律写{" "}
          <InlineCode>{`$\{VAR}`}</InlineCode>，大括号把边界钉死，bash 想歪都歪不了。现在打开
          watchdog
          剧本，版本检查那步的告警行上方还留着一句注释，专门解释为什么这里必须写大括号——规则和它的案发现场钉在同一个文件里。
        </p>
        <p>
          四项全过，金丝雀活着回来，今天的巡检无事。那要是有事呢——告警发到哪、凭什么是手机？这条线还剩最后一站：通知哲学。
        </p>
      </ArticleSection>
    </>
  );
}
