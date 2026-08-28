// patra-learn/src/content/articles/l3/daily-0700.tsx —— 3 号线第 1 站：每天 07:00
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function Daily0700Article() {
  return (
    <>
      <ArticleSection title="换乘 3 号线：这条线防的不是代码坏">
        <p>
          2 号线终点站留了一个问题：流水线能发现"代码坏了"，但设施
          <strong className="text-ink">本身</strong>坏了呢？<Term>runner</Term>{" "}
          悄悄掉线、磁盘悄悄塞满、某个容器悄悄病了——这些事没有任何一次 push
          会触发检查，它们只会安静地烂下去。这套系统真吃过这个亏：runner
          曾经离线整整两个月都没人发现，直到被 GitHub 除名（事故档案 #2，下一站细讲）。
        </p>
        <p>
          3 号线的答案朴素到近乎笨：<strong className="text-ink">每天定点巡一圈</strong>。剧本是{" "}
          <InlineCode>runner-watchdog.yml</InlineCode>——一份不部署任何东西、只负责"看一眼"的{" "}
          <Term>workflow</Term>
          。全线一共三站的活儿都在这一份文件里：今天先看它怎么定闹钟、怎么分工。
        </p>
      </ArticleSection>

      <ArticleSection title="闹钟怎么定：cron、UTC 与北京时间">
        <p>
          <Term>GitHub Actions</Term> 的定时触发器叫 <InlineCode>schedule</InlineCode>，时间用 cron
          表达式描述。watchdog 里写的是：
        </p>
        <CodeBlock
          command={
            "on:\n  schedule:\n    - cron: '0 23 * * *'   # 每日 UTC 23:00（北京 07:00）\n  workflow_dispatch:"
          }
        />
        <p>
          cron 的五个位置从左到右是"分 时 日 月 星期"，<InlineCode>0 23 * * *</InlineCode> 就是"每天
          23 点 0 分"。但这里有个所有人都会踩一次的坑：我们的 workflow 没配 timezone 字段，
          <strong className="text-ink">GitHub 就按默认的 UTC 来解释这行 cron</strong>
          。北京时间是 UTC+8，所以要在北京早上 7 点巡检，闹钟得定在 UTC 前一天的 23:00——23 + 8 =
          31，减 24 就是次日
          07:00。剧本里那行注释把换算结果直接写死在旁边，防的就是半年后自己回来看不懂。
        </p>
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 300"
              role="img"
              aria-label="cron 0 23 * * * 按 UTC 解释为 23:00，加 8 小时换算成北京时间次日 07:00；触发后先在 GitHub 云机器上跑 check-runner 查岗，通过后才在 Mac mini 上跑 canary 体检"
              className="min-w-[640px]"
            >
              <title>UTC 换算与两个 job 的分工</title>
              {/* UTC 时钟 */}
              <rect
                x="24"
                y="30"
                width="200"
                height="72"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="124"
                y="58"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                cron &apos;0 23 * * *&apos;
              </text>
              <text x="124" y="82" textAnchor="middle" fontSize="11.5" fill="#565d66">
                UTC 23:00（未配 timezone 时的默认）
              </text>
              {/* +8h 箭头 */}
              <line x1="224" y1="66" x2="300" y2="66" stroke="#7a5fb8" strokeWidth="2" />
              <polygon points="299,61 308,66 299,71" fill="#7a5fb8" />
              <text
                x="264"
                y="52"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#7a5fb8"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                +8h
              </text>
              {/* 北京时钟 */}
              <rect
                x="308"
                y="30"
                width="200"
                height="72"
                rx="12"
                fill="#f1f2ee"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="408"
                y="58"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ⏰ 北京 次日 07:00
              </text>
              <text x="408" y="82" textAnchor="middle" fontSize="11.5" fill="#565d66">
                你还没起床，巡检已发车
              </text>
              {/* 手动按钮 */}
              <rect
                x="540"
                y="30"
                width="160"
                height="72"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x="620"
                y="58"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#565d66"
              >
                workflow_dispatch
              </text>
              <text x="620" y="82" textAnchor="middle" fontSize="11.5" fill="#8b929b">
                不想等明早：手动触发
              </text>
              {/* 向下箭头 */}
              <line x1="408" y1="102" x2="408" y2="136" stroke="#7a5fb8" strokeWidth="2" />
              <polygon points="403,135 408,144 413,135" fill="#7a5fb8" />
              <line
                x1="620"
                y1="102"
                x2="620"
                y2="120"
                stroke="#8b929b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <line
                x1="620"
                y1="120"
                x2="440"
                y2="140"
                stroke="#8b929b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* job 1 */}
              <rect
                x="60"
                y="148"
                width="290"
                height="104"
                rx="14"
                fill="#ffffff"
                stroke="#7a5fb8"
                strokeWidth="1.8"
              />
              <text
                x="205"
                y="176"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ☁️ check-runner · 云端查岗
              </text>
              <text x="205" y="200" textAnchor="middle" fontSize="11.5" fill="#565d66">
                runs-on: ubuntu-latest
              </text>
              <text x="205" y="222" textAnchor="middle" fontSize="11.5" fill="#565d66">
                问 GitHub：mini 的 runner 在线吗？
              </text>
              <text x="205" y="242" textAnchor="middle" fontSize="11" fill="#8b929b">
                mini 挂了它也照样能跑
              </text>
              {/* needs 箭头 */}
              <line x1="350" y1="200" x2="404" y2="200" stroke="#7a5fb8" strokeWidth="2" />
              <polygon points="403,195 412,200 403,205" fill="#7a5fb8" />
              <text
                x="378"
                y="188"
                textAnchor="middle"
                fontSize="10.5"
                fill="#7a5fb8"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                needs
              </text>
              {/* job 2 */}
              <rect
                x="412"
                y="148"
                width="290"
                height="104"
                rx="14"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="557"
                y="176"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                🐕 canary · 本机体检
              </text>
              <text x="557" y="200" textAnchor="middle" fontSize="11.5" fill="#565d66">
                runs-on: [self-hosted, macmini]
              </text>
              <text x="557" y="222" textAnchor="middle" fontSize="11.5" fill="#565d66">
                docker / 版本 / 磁盘 / 容器健康
              </text>
              <text x="557" y="242" textAnchor="middle" fontSize="11" fill="#8b929b">
                查岗不过 → 这步整个跳过
              </text>
              <text x="360" y="284" textAnchor="middle" fontSize="11.5" fill="#8b929b">
                两个 job 一份剧本：一个站在系统外面看，一个站在系统里面摸
              </text>
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            同一份 runner-watchdog.yml 里的两个 job：check-runner 在 GitHub 云机器上跑，canary 在
            mini 本机跑；canary 声明了 needs: check-runner，查岗不过它直接被跳过。
          </figcaption>
        </figure>
        <p>
          除了闹钟，剧本还留了 <Term>workflow_dispatch</Term>{" "}
          手动按钮——刚改完设施想立刻验证、或怀疑哪里不对想马上巡一轮时，不用干等明早 7 点：
        </p>
        <CodeBlock command="gh workflow run runner-watchdog.yml" />
      </ArticleSection>

      <ArticleSection title="为什么拆成两个 job：不能让病人给自己量体温">
        <p>
          图里最要紧的设计是<strong className="text-ink">巡检拆在两个地方跑</strong>。canary
          那些体检项都得在 mini 本机执行——摸
          docker、看磁盘，不上这台机器摸不着。但只有本机体检有一个致命盲区：
          <strong className="text-ink">mini 整个挂了，体检任务根本无人认领</strong>
          ，不会有失败、不会有告警，只有沉默——和 runner 离线两个月没人发现，是同一种沉默。
        </p>
        <p>
          所以查岗这一步必须放在 GitHub 免费的云机器（<InlineCode>ubuntu-latest</InlineCode>
          ）上：它不依赖 mini 的死活，永远跑得起来，才能替你报出"人不在"。而 canary 用{" "}
          <InlineCode>needs: check-runner</InlineCode> 挂在查岗后面还有一层讲究：runner
          离线时查岗直接判失败，canary
          被顺势跳过——否则这份任务会派给一台不在线的机器，滞留在队列里显示 queued，比红灯更迷惑。
        </p>
        <p>
          最后一个已知边界：GitHub 对公开仓库有条规矩，仓库连续 60 天没有活动，定时 workflow
          会被自动停用——项目彻底搁置时，守夜线自己也会睡着。平时的活跃提交会不断重置这个计时器；真被停用了也不难救：回来后去
          Actions 页把它手动 Enable 一下就行，一次点击的事。
        </p>
        <p>
          查岗具体怎么查？凭什么一台云机器能查到你家 runner
          的状态？这就得说到一把钥匙了——下一站，查岗与钥匙。
        </p>
      </ArticleSection>
    </>
  );
}
