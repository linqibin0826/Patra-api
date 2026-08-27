// patra-learn/src/content/articles/l2/health-check.tsx —— 2 号线第 4 站：健康检查
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function HealthCheckArticle() {
  return (
    <>
      <ArticleSection title="上线 ≠ 成功：容器起了不等于服务活了">
        <p>
          上一站 <InlineCode>up -d</InlineCode>{" "}
          执行完，命令行安静地返回了。这时候庆祝还太早——它只说明
          <strong className="text-ink">容器进程起来了</strong>，离"服务能接客"还差得远： Spring Boot
          要连数据库、注册进
          Nacos、把上下文初始化完，任何一步炸了，容器都会顶着"刚启动"的外表当僵尸。所以这套体系的立场是：
          <strong className="text-ink">上线不算数，验货才算数</strong>。验货有三道，一道比一道较真。
        </p>
      </ArticleSection>

      <ArticleSection title="第一道：容器自己的体检表">
        <p>
          <Term>docker compose</Term> 的编排文件里，每个应用容器都声明了 healthcheck——容器
          <strong className="text-ink">从内部</strong>定期自查。六个应用共用同一组节奏参数（yml 锚点{" "}
          <InlineCode>x-app-healthcheck</InlineCode>）：每 10 秒查一次、单次 5 秒超时、连挂 15
          次才判不健康，另给 60 秒的 <InlineCode>start_period</InlineCode> 启动豁免期——Spring Boot
          冷启动没那么快，豁免期内失败不计入次数。
        </p>
        <p>
          查的方式是容器内发一个 HTTP 请求：五个后端服务用 curl 探自己的{" "}
          <InlineCode>/actuator/health</InlineCode>；portal 的 node:alpine 镜像没有 curl，用自带的
          busybox wget 探 <InlineCode>/api/health</InlineCode>
          。这道检查的结果写在容器的 health 状态上，是 Docker 层面的"自我感觉"。
        </p>
      </ArticleSection>

      <ArticleSection title="第二道：deploy.sh 站在门外追问">
        <p>
          光靠"自我感觉"不够，deploy.sh 还要<strong className="text-ink">从宿主机这一侧</strong>
          亲自敲门。换新每个服务后，它轮询该服务映射到宿主机的端口：每 5 秒问一次，最多问 30
          次——两分半还没等到健康答复，就按失败处理。端口和路径都来自花名册 services.json，比如问
          catalog 就是：
        </p>
        <CodeBlock command="curl -fs http://127.0.0.1:6300/actuator/health" />
        <p>
          而且光"HTTP 200"还不算数：五个后端服务的花名册里都配了{" "}
          <InlineCode>healthMatch</InlineCode>
          ，响应体里必须真的出现 <InlineCode>&quot;status&quot;:&quot;UP&quot;</InlineCode>{" "}
          才算过——防的是"接口通了但内部依赖是 DOWN"的假健康。portal 没配这一项，按缺省规则 HTTP
          成功即可。
        </p>
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 300"
              role="img"
              aria-label="上线到验货的时序：up -d 之后容器内部每 10 秒自查，deploy.sh 从宿主机每 5 秒轮询 127.0.0.1 最多 30 次，等到 status UP 后再对版验证，全过才记 last-good"
              className="min-w-[640px]"
            >
              <title>上线 → 验货时序</title>
              {/* 泳道标签 */}
              <text x="20" y="52" fontSize="12" fontWeight="700" fill="#22262c">
                容器内部
              </text>
              <text x="20" y="140" fontSize="12" fontWeight="700" fill="#22262c">
                deploy.sh
              </text>
              <text x="20" y="160" fontSize="11.5" fill="#8b929b">
                （宿主机侧）
              </text>
              {/* 泳道线 */}
              <line x1="110" y1="48" x2="700" y2="48" stroke="#e3e5df" strokeWidth="1.5" />
              <line x1="110" y1="136" x2="700" y2="136" stroke="#e3e5df" strokeWidth="1.5" />
              {/* up -d 事件 */}
              <rect
                x="118"
                y="120"
                width="96"
                height="34"
                rx="10"
                fill="#ffffff"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="166"
                y="142"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                up -d
              </text>
              {/* 启动豁免期 */}
              <rect x="230" y="34" width="150" height="28" rx="8" fill="#f1f2ee" />
              <text x="305" y="53" textAnchor="middle" fontSize="11.5" fill="#565d66">
                start_period 60s 豁免
              </text>
              {/* 容器自查 ticks */}
              <circle cx="402" cy="48" r="4" fill="#8b929b" />
              <circle cx="446" cy="48" r="4" fill="#8b929b" />
              <circle cx="490" cy="48" r="4" fill="#8b929b" />
              <text x="446" y="30" textAnchor="middle" fontSize="11.5" fill="#8b929b">
                每 10s 自查（curl / wget）
              </text>
              {/* deploy.sh 轮询 ticks */}
              <circle cx="252" cy="136" r="4" fill="#d95b32" />
              <circle cx="284" cy="136" r="4" fill="#d95b32" />
              <circle cx="316" cy="136" r="4" fill="#d95b32" />
              <circle cx="348" cy="136" r="4" fill="#d95b32" />
              <text
                x="300"
                y="162"
                textAnchor="middle"
                fontSize="11.5"
                fill="#d95b32"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                每 5s 敲门 127.0.0.1，最多 30 次
              </text>
              {/* UP 应答 */}
              <rect
                x="452"
                y="120"
                width="128"
                height="34"
                rx="10"
                fill="#f1f2ee"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="516"
                y="142"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                &quot;status&quot;:&quot;UP&quot;
              </text>
              <line
                x1="490"
                y1="52"
                x2="510"
                y2="116"
                stroke="#8b929b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* 对版 + last-good */}
              <rect
                x="118"
                y="212"
                width="230"
                height="62"
                rx="12"
                fill="#ffffff"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="233"
                y="238"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                🔎 对版验证
              </text>
              <text x="233" y="260" textAnchor="middle" fontSize="11.5" fill="#565d66">
                跑的镜像 == 期望 tag？
              </text>
              <rect
                x="420"
                y="212"
                width="230"
                height="62"
                rx="12"
                fill="#f1f2ee"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="535"
                y="238"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                📒 记 last-good
              </text>
              <text x="535" y="260" textAnchor="middle" fontSize="11.5" fill="#565d66">
                三道全过，这版才算"好用"
              </text>
              <line x1="516" y1="154" x2="260" y2="208" stroke="#d95b32" strokeWidth="2" />
              <polygon points="263,201 251,210 266,211" fill="#d95b32" />
              <line x1="348" y1="243" x2="412" y2="243" stroke="#d95b32" strokeWidth="2" />
              <polygon points="411,238 420,243 411,248" fill="#d95b32" />
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            两条泳道各查各的：容器在里面自查写 health 状态，deploy.sh
            在外面轮询要真答复。外面这道等到 UP 还不收工——还得对版，全过才在小本本上记账。
          </figcaption>
        </figure>
      </ArticleSection>

      <ArticleSection title="localhost 的背叛：一个 IPv6 的坑">
        <p>
          注意上面命令里的 <InlineCode>127.0.0.1</InlineCode>——不是{" "}
          <InlineCode>localhost</InlineCode>
          ，这是踩过坑的讲究。这两个写法平时可以互换，直到 portal 上线那天：它的容器内 healthcheck
          当时写的 localhost，被优先解析成 IPv6 的 <InlineCode>::1</InlineCode>，而 Next.js
          standalone 服务只监听 IPv4；busybox wget 又不会失败后回退去试
          IPv4——于是连接直接被拒。一个完全健康的服务，被体检表判了"病危"。
        </p>
        <p>
          修复后的现状是：portal 容器内的检查和 deploy.sh 宿主机侧的全部轮询，都写死
          127.0.0.1，明确只走 IPv4。后端容器内的检查用的是 curl（失败会回退试 IPv4），localhost
          没炸过，所以保留原样——但 deploy.sh 这一侧不赌任何工具的回退行为，一律
          127.0.0.1。教训一句话：
          <strong className="text-ink">健康检查的地址，不给名字解析留任何发挥空间</strong>。
        </p>
        <p>
          顺带一提，deploy.sh 这类宿主机脚本还有一个环境级的坑：它们跑在 macOS 自带的 bash 3.2（2006
          年的老版本）上，中文文案里 <InlineCode>$VAR</InlineCode>{" "}
          紧跟全角标点时，标点的字节会被并进变量名，直接报"变量不存在"炸掉——所以这套脚本里变量一律写{" "}
          <InlineCode>{`$\{VAR}`}</InlineCode>。这次翻车的完整故事在 3 号线「四项体检」站（事故档案
          #5）。
        </p>
      </ArticleSection>

      <ArticleSection title="第三道：对版验证，防无声掉包">
        <p>
          最阴险的失败长这样：<InlineCode>up</InlineCode>{" "}
          悄悄落到了旧镜像上（比如版本变量没传对），旧版本服务照常健康——前两道检查全绿，但你要上的新代码
          <strong className="text-ink">根本没上去</strong>。表面成功，实际什么都没发生。
        </p>
        <p>
          所以还有第三道 <InlineCode>verify_running_tag</InlineCode>：用{" "}
          <InlineCode>docker inspect</InlineCode> 掏出容器正在跑的镜像（
          <InlineCode>Config.Image</InlineCode>），和期望的 <InlineCode>镜像名:tag</InlineCode>{" "}
          逐字比对——健康但版本不对，照样按失败处理。<Term>Docker 镜像</Term>的 tag 是 commit
          sha，这一比对等于把"跑的就是这次提交"钉死成可验证的事实。
        </p>
        <p>
          三道全过，deploy.sh 才在小本本记下 last-good。那要是没过呢——30
          次没等到、或者对版失败？下一站：机器人翻开小本本，自己把自己退回去。
        </p>
      </ArticleSection>
    </>
  );
}
