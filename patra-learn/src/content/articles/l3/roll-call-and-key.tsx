// patra-learn/src/content/articles/l3/roll-call-and-key.tsx —— 3 号线第 2 站：查岗与钥匙
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function RollCallAndKeyArticle() {
  return (
    <>
      <ArticleSection title="查岗怎么查：一条 API 的事">
        <p>
          上一站说过，查岗必须在 GitHub 的云机器上做。那台 <InlineCode>ubuntu-latest</InlineCode>{" "}
          机器远在天边，凭什么知道你家 mini 上的 <Term>runner</Term> 死活？答案是它根本不去碰
          mini——它问的是 GitHub 自己。runner 与 GitHub 之间本来就保持着长轮询连接（2
          号线讲过），GitHub 那边时刻记着每台 runner 的状态；check-runner 要做的只是调一条 API
          把状态读出来：
        </p>
        <CodeBlock
          command={
            'gh api "repos/linqibin0826/patra/actions/runners" \\\n  --jq \'.runners[] | select(.name=="macmini") | .status\''
          }
        />
        <p>
          这条命令列出仓库注册过的所有 self-hosted runner，用 jq 挑出名字叫{" "}
          <InlineCode>macmini</InlineCode> 的那台，取它的 <InlineCode>status</InlineCode>{" "}
          字段。剧本里接着一行判断：状态是 <InlineCode>online</InlineCode> 就放行，否则当场{" "}
          <InlineCode>exit 1</InlineCode> 红灯。红灯时的报错文案还分了两种情况——状态是{" "}
          <InlineCode>offline</InlineCode> 说明机器掉线了；连记录都查不到（
          <InlineCode>未注册</InlineCode>），说明 registration 已经被 GitHub 移除，得重装。
        </p>
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 280"
              role="img"
              aria-label="查岗调用链：ubuntu 云机器上的 check-runner 拿 RUNNER_ADMIN_TOKEN 调 GitHub API 的 actions/runners 接口，读出 macmini runner 的状态；online 放行 canary，offline 或未注册直接红灯"
              className="min-w-[640px]"
            >
              <title>查岗调用链</title>
              {/* check-runner */}
              <rect
                x="24"
                y="80"
                width="200"
                height="96"
                rx="14"
                fill="#ffffff"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="124"
                y="110"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ☁️ check-runner
              </text>
              <text x="124" y="132" textAnchor="middle" fontSize="11.5" fill="#565d66">
                ubuntu-latest 云机器
              </text>
              <text x="124" y="152" textAnchor="middle" fontSize="11.5" fill="#565d66">
                手里攥着那把钥匙 🗝️
              </text>
              {/* 箭头到 API */}
              <line x1="224" y1="112" x2="296" y2="112" stroke="#7a5fb8" strokeWidth="2" />
              <polygon points="295,107 304,112 295,117" fill="#7a5fb8" />
              <text
                x="262"
                y="98"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
                fill="#7a5fb8"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                gh api
              </text>
              {/* GitHub API */}
              <rect
                x="304"
                y="80"
                width="200"
                height="96"
                rx="14"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="404"
                y="110"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                GitHub · 点名册
              </text>
              <text x="404" y="132" textAnchor="middle" fontSize="11" fill="#565d66">
                repos/…/actions/runners
              </text>
              <text x="404" y="152" textAnchor="middle" fontSize="11.5" fill="#565d66">
                记着每台 runner 的状态
              </text>
              {/* 状态返回 */}
              <line
                x1="504"
                y1="112"
                x2="576"
                y2="112"
                stroke="#8b929b"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              <polygon points="575,107 584,112 575,117" fill="#8b929b" />
              <text
                x="540"
                y="98"
                textAnchor="middle"
                fontSize="10.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                status
              </text>
              {/* 三种结果 */}
              <rect
                x="584"
                y="36"
                width="116"
                height="52"
                rx="10"
                fill="#ffffff"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="642"
                y="58"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#22262c"
              >
                online ✅
              </text>
              <text x="642" y="76" textAnchor="middle" fontSize="10.5" fill="#565d66">
                放行 canary
              </text>
              <rect
                x="584"
                y="104"
                width="116"
                height="52"
                rx="10"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="642"
                y="126"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#22262c"
              >
                offline 🔴
              </text>
              <text x="642" y="144" textAnchor="middle" fontSize="10.5" fill="#565d66">
                掉线了，去看 mini
              </text>
              <rect
                x="584"
                y="172"
                width="116"
                height="52"
                rx="10"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="642"
                y="194"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#22262c"
              >
                未注册 🔴
              </text>
              <text x="642" y="212" textAnchor="middle" fontSize="10.5" fill="#565d66">
                被除名，需重装
              </text>
              {/* mini 旁观 */}
              <rect
                x="304"
                y="212"
                width="200"
                height="52"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x="404"
                y="234"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#565d66"
              >
                🏠 Mac mini
              </text>
              <text x="404" y="254" textAnchor="middle" fontSize="10.5" fill="#8b929b">
                全程没被碰——问的是点名册
              </text>
              <line
                x1="404"
                y1="176"
                x2="404"
                y2="204"
                stroke="#8b929b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            查岗不接触 mini 本身：GitHub 靠长轮询早就知道每台 runner 在不在，check-runner
            只是拿钥匙翻一眼点名册。online 之外的两种结果都当场红灯。
          </figcaption>
        </figure>
      </ArticleSection>

      <ArticleSection title="那把钥匙：RUNNER_ADMIN_TOKEN">
        <p>
          翻点名册需要凭证。你可能以为 workflow 自带的 <InlineCode>GITHUB_TOKEN</InlineCode>{" "}
          就够——不行，这类接口它无权访问，列 self-hosted runner 必须用 PAT（Personal Access
          Token，个人访问令牌）。于是有了这条线的钥匙：一把 fine-grained PAT，存在 GitHub{" "}
          <Term>secrets</Term> 保险柜里，名字叫 <InlineCode>RUNNER_ADMIN_TOKEN</InlineCode>。
        </p>
        <p>
          这把钥匙的配置是最小权限原则的教科书示范：只授权给 patra 这
          <strong className="text-ink">一个仓库</strong>，权限清单上只勾了{" "}
          <InlineCode>Administration: Read-only</InlineCode>{" "}
          <strong className="text-ink">一项</strong>
          。够它翻点名册，但改不了任何东西——就算哪天泄露，拿到它的人也只能看看你的 runner
          在不在线，注销不了 runner、动不了代码、碰不了别的仓库。名字里虽有 Admin
          字样，实际是把只读钥匙。
        </p>
        <p>
          钥匙有两条运维注意。其一，fine-grained PAT 带有效期，到期后查岗会开始失败——报错文案会提示
          token 未配置或失效，处理方式就是去 GitHub 重新生成一把、更新进
          secrets。其二，也是这条线的红线：<strong className="text-ink">这个 secret 不能删</strong>
          。删了它，守夜线全线瘫痪，而且瘫痪得很安静——正是它要防的那种安静。
        </p>
      </ArticleSection>

      <ArticleSection title="档案 #2：演员失踪——为什么值得每天点名">
        <p>
          每天查一遍"在不在岗"，听起来小题大做？这站的存在本身就是一次事故的遗产。GitHub
          有条规定：self-hosted runner{" "}
          <strong className="text-ink">离线满 30 天，registration 会被自动移除</strong>
          ——编制直接注销，不是断线重连能救回来的。
        </p>
        <p>
          2026 年这套系统真发生过：项目搁置期间 mini 的 runner
          掉了线，没有任何东西负责发现它，一掉就是两个月。回来干活时才发现"演员"连编制都没了——2
          号线全线趴窝，还得重新走注册流程。这就是事故档案 #2，也是整条守夜线立项的直接原因。
        </p>
        <p>
          现在的兜底闭环是：每日查岗把"掉线"的发现窗口从两个月压到一天，远够不着 30
          天红线；真到了要重装的那步，也只是在 mini 上跑一条命令（2 号线讲过的安装脚本，重新拿一个
          registration token 即可）：
        </p>
        <CodeBlock command="bash patra-infra/scripts/install-github-runner.sh <REGISTRATION_TOKEN>" />
        <p>
          查岗通过，说明人在。但"在岗"不等于"能干活"——机器在线，docker
          可能停了、磁盘可能满了。所以查岗之后还有第二个 job，进门做四项体检。下一站，四项体检。
        </p>
      </ArticleSection>
    </>
  );
}
