// patra-learn/src/content/articles/l1/write-code.tsx —— 1 号线第 1 站：写代码
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { Term } from "@/components/term";

export default function WriteCodeArticle() {
  return (
    <>
      <ArticleSection title="main 是不能直接改的">
        <p>
          在这个仓库里，你永远碰不到"直接把代码写进 main"这个选项——不是自觉，是物理上做不到。 main
          分支装了<Term>分支保护</Term>
          ：想让代码进去，必须走 PR、必须指定的检查全绿、review
          对话必须全部处理完，否则合并按钮就是灰的。直接 push？会被闸机原地弹回来。
        </p>
        <p>
          为什么这么狠？因为 main 不是草稿本，它是"随时可以上线的版本"。合并进 main 的那一刻，2
          号线（自动上线）就发车了——所以坏代码必须在进 main 之前被拦住，而不是上线之后再救火。
        </p>
      </ArticleSection>

      <ArticleSection title="开一条自己的作业分支">
        <p>
          既然 main 碰不得，写代码的第一步永远是：从 main 切一条自己的分支。分支名带上类型前缀（
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">feat/</code>、
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">fix/</code>
          之类），一眼能看出这条分支在干什么：
        </p>
        <CodeBlock command="git switch -c feat/journal-search" />
        <p>
          在自己的分支上你想怎么折腾都行——commit
          十次、推倒重来、改到面目全非都没关系。这些草稿最后会被装订成一条干净提交（下一站细讲），所以过程乱一点完全不亏。
        </p>
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 230"
              role="img"
              aria-label="本地到远端的三步流程：开分支、提交（钩子先审）、推送"
              className="min-w-[640px]"
            >
              <title>本地到远端三步：开分支 → commit（钩子先审）→ push</title>
              {/* 本地 / 远端分界 */}
              <line
                x1="485"
                y1="22"
                x2="485"
                y2="212"
                stroke="#e3e5df"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <text x="240" y="34" textAnchor="middle" fontSize="12" fill="#8b929b">
                本地 · 你的电脑
              </text>
              <text x="605" y="34" textAnchor="middle" fontSize="12" fill="#8b929b">
                远端 · GitHub
              </text>
              {/* ① 开分支 */}
              <rect
                x="20"
                y="55"
                width="180"
                height="64"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="110"
                y="82"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ① 开分支
              </text>
              <text x="110" y="102" textAnchor="middle" fontSize="11.5" fill="#565d66">
                从 main 切 feat/xxx
              </text>
              {/* ② commit */}
              <rect
                x="255"
                y="55"
                width="180"
                height="64"
                rx="12"
                fill="#ffffff"
                stroke="#2e66c9"
                strokeWidth="1.8"
              />
              <text
                x="345"
                y="82"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ② commit
              </text>
              <text x="345" y="102" textAnchor="middle" fontSize="11.5" fill="#565d66">
                钩子先审一遍再放行
              </text>
              {/* ③ push */}
              <rect
                x="515"
                y="55"
                width="180"
                height="64"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="605"
                y="82"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ③ push
              </text>
              <text x="605" y="102" textAnchor="middle" fontSize="11.5" fill="#565d66">
                分支上传，等着开 PR
              </text>
              {/* 箭头 */}
              <line x1="200" y1="87" x2="243" y2="87" stroke="#2e66c9" strokeWidth="2" />
              <polygon points="243,82 252,87 243,92" fill="#2e66c9" />
              <line x1="435" y1="87" x2="503" y2="87" stroke="#2e66c9" strokeWidth="2" />
              <polygon points="503,82 512,87 503,92" fill="#2e66c9" />
              {/* 钩子考场 */}
              <line
                x1="345"
                y1="119"
                x2="345"
                y2="148"
                stroke="#8b929b"
                strokeWidth="1.5"
                strokeDasharray="3 4"
              />
              <rect
                x="225"
                y="150"
                width="240"
                height="58"
                rx="10"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="345"
                y="172"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#2e66c9"
              >
                pre-commit 钩子 · 第一道考场
              </text>
              <text x="345" y="192" textAnchor="middle" fontSize="11.5" fill="#565d66">
                格式 / 密钥 / 大文件 / 提交信息
              </text>
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            写代码的最小闭环：分支 → 提交 → 推送。注意考试在第 ② 步就开始了——commit
            这个动作本身要先过本地钩子这一关。
          </figcaption>
        </figure>
      </ArticleSection>

      <ArticleSection title="commit：本地钩子是第一道考场">
        <p>
          你以为考试从开 PR 才开始？其实每次{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">git commit</code>
          ，本地的 pre-commit 钩子就已经开考了（配置在仓库根的{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">
            .pre-commit-config.yaml
          </code>
          ）。它拦四类东西：
        </p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>
            <strong className="text-ink">格式问题</strong>——Java 代码自动跑 spotless
            格式化，行尾空格、换行符这类小毛病直接修掉，不劳你手动。
          </li>
          <li>
            <strong className="text-ink">密钥泄漏</strong>——gitleaks 扫描你要提交的内容，API
            key、私钥这类东西一旦被认出来，提交直接失败。这个仓库是公开的，密钥进了历史就等于全网可见，所以这道闸必须设在本地。
          </li>
          <li>
            <strong className="text-ink">大文件</strong>——超过 2MB
            的文件拒收，防止手滑把构建产物、数据文件塞进仓库。
          </li>
          <li>
            <strong className="text-ink">提交信息格式</strong>——commitlint 盯着 commit
            message：类型必须是{" "}
            <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">feat</code> /{" "}
            <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">fix</code> /{" "}
            <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">docs</code>{" "}
            等白名单里的小写词，标题不超过 100 个字符。标题用中文是这个仓库的约定：
          </li>
        </ul>
        <CodeBlock command='git commit -m "feat(catalog): 新增期刊检索接口"' />
        <p>
          这套钩子的意义是<strong className="text-ink">快</strong>
          ：云端考试一轮要几分钟，本地钩子几秒钟就把最低级的错误拦下了。越早发现的问题，修起来越便宜。
        </p>
      </ArticleSection>

      <ArticleSection title="push：把卷子交上去，但还没开考">
        <p>
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">git push</code>{" "}
          把你的分支传到 GitHub。有个容易误会的点：
          <strong className="text-ink">推一条 feature 分支本身并不会触发任何考试</strong>——
          <Term>GitHub Actions</Term> 的 CI <Term>workflow</Term>（
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">ci.yml</code>
          ）对你手上这条改动而言只在两个时刻开工：你开了指向 main 的 PR，或者代码合并进了
          main（此外它还有每晚的定时全量考和手动触发按钮，到「并行考试」站细讲）。
        </p>
        <p>所以此刻你的代码状态是"已报到、未报名"。下一站就去报名——开 PR，正式进考场。</p>
      </ArticleSection>
    </>
  );
}
