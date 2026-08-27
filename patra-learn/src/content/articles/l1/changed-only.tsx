// patra-learn/src/content/articles/l1/changed-only.tsx —— 1 号线第 3 站：只考改过的
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { Term } from "@/components/term";

export default function ChangedOnlyArticle() {
  return (
    <>
      <ArticleSection title="为什么不全员重考">
        <p>
          最笨的 CI 是每次 PR
          把所有服务全部编译、全部测一遍——正确，但一轮几十分钟，改一行文档也要等。这条线聪明在开考前多了一步：
          <strong className="text-ink">先算这次到底改了什么，只考改过的科目</strong>。改 catalog
          只考 catalog，改地基级的公共库全员重考，改文档全员免考。普通 PR 因此几分钟出成绩。
        </p>
        <p>
          干这件事的裁判是一个 shell 脚本：
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">
            patra-infra/cd/detect-changes.sh
          </code>
          。它是 CI <Term>workflow</Term> 开考后的第一个 job，也是整条流水线的"判卷范围 SSOT"——CI（1
          号线）和 CD（2 号线）用的是<strong className="text-ink">同一份脚本</strong>
          ，"只考改过的"和"只发改过的"因此永远口径一致。它自己还有一套单元测试保护，判卷逻辑改错了会先被测试抓住。
        </p>
      </ArticleSection>

      <ArticleSection title="三种开考方式，三种判法">
        <p>裁判根据"考试是怎么触发的"选不同的判卷模式：</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>
            <strong className="text-ink">pr 模式</strong>——你开了 PR。用 git 算出你的分支相对 main
            分叉点改了哪些文件（merge-base 到分支头的 diff），逐个分类。
          </li>
          <li>
            <strong className="text-ink">push 模式</strong>——代码合并进了 main。对比这次 push
            前后两个提交之间的差异，判法同上。
          </li>
          <li>
            <strong className="text-ink">schedule 模式</strong>——每晚定时的全量兜底考，不看
            diff，直接全员出考卷（下一站细讲它存在的意义）。
          </li>
        </ul>
        <p>
          另外还有一个 dispatch 模式留给 <Term>workflow_dispatch</Term>{" "}
          手动触发：填一个服务名就只处理那一个，2
          号线的手动回滚走的就是它。想在本地模拟判卷也可以——classify
          模式从标准输入读一份文件清单直接给结果：
        </p>
        <CodeBlock command="git diff --name-only main | bash patra-infra/cd/detect-changes.sh classify" />
      </ArticleSection>

      <ArticleSection title="分类器：一份文件清单进，一张考卷出">
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 372"
              role="img"
              aria-label="变更文件清单经分类器规则，输出 backend_units、portal_changed、docs_only 三类结果的漏斗图"
              className="min-w-[640px]"
            >
              <title>变更文件 → 分类器 → 考卷输出的漏斗</title>
              {/* 输入 */}
              <rect
                x="210"
                y="16"
                width="300"
                height="46"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="360"
                y="45"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                git diff 变更文件清单
              </text>
              <line x1="360" y1="62" x2="360" y2="90" stroke="#2e66c9" strokeWidth="2" />
              <polygon points="355,90 360,99 365,90" fill="#2e66c9" />
              {/* 分类器 */}
              <rect
                x="90"
                y="102"
                width="540"
                height="132"
                rx="14"
                fill="#f1f2ee"
                stroke="#2e66c9"
                strokeWidth="1.8"
              />
              <text
                x="360"
                y="128"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#2e66c9"
              >
                detect-changes.sh 分类器（逐个文件过规则）
              </text>
              <text x="112" y="153" fontSize="11.5" fill="#565d66">
                .github/workflows/* → 全员重考，portal 也考（管线自己变了，全验一遍）
              </text>
              <text x="112" y="174" fontSize="11.5" fill="#565d66">
                构建地基 / Dockerfile / cd 脚本 → 全员重考（动地基不能只考一间房）
              </text>
              <text x="112" y="195" fontSize="11.5" fill="#565d66">
                patra-portal/* → 前端考　｜　*.md、docs/* 等纯文档 → 免考
              </text>
              <text x="112" y="216" fontSize="11.5" fill="#565d66">
                其余文件按 module-graph.json 找所属模块 → 记下它影响的单元
              </text>
              {/* 三路输出箭头 */}
              <line x1="200" y1="234" x2="152" y2="282" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="149,278 146,289 156,285" fill="#8b929b" />
              <line x1="360" y1="234" x2="360" y2="282" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="355,282 360,291 365,282" fill="#8b929b" />
              <line x1="520" y1="234" x2="568" y2="282" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="564,285 574,289 571,278" fill="#8b929b" />
              {/* 输出三箱 */}
              <rect
                x="30"
                y="290"
                width="230"
                height="66"
                rx="12"
                fill="#ffffff"
                stroke="#2e66c9"
                strokeWidth="1.8"
              />
              <text
                x="145"
                y="315"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#2e66c9"
              >
                backend_units
              </text>
              <text x="145" y="337" textAnchor="middle" fontSize="11.5" fill="#565d66">
                受影响的后端单元清单
              </text>
              <rect
                x="290"
                y="290"
                width="180"
                height="66"
                rx="12"
                fill="#ffffff"
                stroke="#2e66c9"
                strokeWidth="1.8"
              />
              <text
                x="380"
                y="315"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#2e66c9"
              >
                portal_changed
              </text>
              <text x="380" y="337" textAnchor="middle" fontSize="11.5" fill="#565d66">
                前端要不要考
              </text>
              <rect
                x="500"
                y="290"
                width="190"
                height="66"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="595"
                y="315"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                docs_only
              </text>
              <text x="595" y="337" textAnchor="middle" fontSize="11.5" fill="#565d66">
                全员免考，直接放行
              </text>
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            漏斗全景：文件清单进，考卷范围出。规则从上到下越来越"细"，最先命中的粗规则（如 workflow
            自身变更）会直接把考卷放大到全量。
          </figcaption>
        </figure>
        <p>几条规则值得单独说透：</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>
            <strong className="text-ink">改公共库，按模块图算波及面。</strong>
            commons、starters 这些公共模块并不是一律全量：像 commons-core
            这样人人依赖的地基，模块图会算出它波及全部单元、全员重考；而 starter-batch
            这类只有两个单元用到的，就只考那两科。真正写死"必全量"的是 Gradle 构建脚本、共享的
            Dockerfile 和 <Term>docker compose</Term>{" "}
            编排文件——它们决定每个服务怎么编译、怎么打包、怎么落座，模块图管不到。
          </li>
          <li>
            <strong className="text-ink">workflow 自身变更 = 全量 + 前端也考。</strong>
            改考试规则的 PR，必须把整场考试完整跑一遍来验证新规则——裁判不能自己改了规则不试就上岗。
          </li>
          <li>
            <strong className="text-ink">认不出的文件，按全量处理。</strong>
            模块图里查无此人？宁可多考，不可漏考——错误只会往"更严格"的方向发生。
          </li>
          <li>
            <strong className="text-ink">模块归属靠 module-graph.json。</strong>这份 JSON 是从
            Gradle
            依赖图导出的地图：每个文件按最长路径前缀匹配到模块，再查这个模块会波及哪些单元（比如改
            patra-registry-api 会同时波及依赖它的其他服务）。
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection title="docs-only：免考，但灯照样是绿的">
        <p>
          这里有个精巧的细节。前面说过<Term>分支保护</Term>只认 required-check
          这盏总闸灯——那问题来了：改一篇文档，后端和前端考试全都没跑（GitHub 里显示为
          skipped），总闸灯凭什么亮？
        </p>
        <p>
          答案在总闸灯的配置里：它把 backend、portal、coverage 三科列进了{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">allowed-skips</code>
          ——<strong className="text-ink">这几科"没考"视为通过，"考挂了"才算失败</strong>。于是
          docs-only 的 PR
          几十秒就能绿灯合并，而任何真实的考试失败依然会把灯打红。免考和不及格，制度上是两回事。
        </p>
        <p>至于这份考卷发下去之后各科目怎么同时开考、成绩怎么汇总成一盏灯——下一站，并行考试。</p>
      </ArticleSection>
    </>
  );
}
