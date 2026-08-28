// patra-learn/src/content/articles/l2/native-build.tsx —— 2 号线第 2 站：本机打包
import { ArticleSection } from "@/components/article-section";
import { CodeBlock } from "@/components/code-block";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function NativeBuildArticle() {
  return (
    <>
      <ArticleSection title="一场跑了三个月的芯片格式事故">
        <p>
          先讲这一站存在的理由。CPU 有两大芯片家族：云上 <InlineCode>ubuntu-latest</InlineCode>{" "}
          机器是 x86 阵营（镜像格式叫 amd64），Mac mini 是 Apple Silicon（arm64）。
          <Term>Docker 镜像</Term>
          是按芯片格式打的——格式不对，要么装不上，要么靠转译层硬撑着跑。
        </p>
        <p>
          旧架构里打包都在云端 ubuntu 机器上做：后端靠 QEMU 模拟出 arm64 交叉编译，又慢又险；portal
          更隐蔽——构建产物干脆就是 amd64，推上去、拉回来、在 mini 上靠 macOS 的 Rosetta
          转译层默默跑了三个月，没有任何报错，也没有任何人发现。表面一切正常，实际每一次请求都在"翻译"中损耗，而流水线自始至终绿灯。
        </p>
        <p>
          这类事故最吓人的地方不是坏，是<strong className="text-ink">坏得无声</strong>
          。根治它靠的不是"下次小心"，而是把出错的那个环节从结构上删掉。
        </p>
      </ArticleSection>

      <ArticleSection title="架构决策：打包的机器就是上线的机器">
        <p>
          2026 年 8 月的架构决策：<strong className="text-ink">构建搬回 mini 本机</strong>
          。领到任务的 <Term>runner</Term> 直接在这台 arm64
          机器上编译、打镜像、原地部署——不模拟、不搬运，格式从物理上不可能再错。
        </p>
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
            <svg
              viewBox="0 0 720 396"
              role="img"
              aria-label="旧链路：ubuntu 云机器模拟打包、推到 GHCR、mini 经翻墙代理拉回，三段且脆；新链路：mini 本机原生 arm64 打包原地部署，GHCR 降级为事后备份"
              className="min-w-[640px]"
            >
              <title>旧链路（绕地球一圈）对比新链路（原地打包）</title>
              {/* ===== 旧链路 ===== */}
              <text x="20" y="28" fontSize="12.5" fontWeight="700" fill="#8b929b">
                改造前 —— 镜像绕地球一圈再回家
              </text>
              <rect
                x="20"
                y="44"
                width="200"
                height="86"
                rx="12"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="120"
                y="72"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                ubuntu 云机器
              </text>
              <text x="120" y="94" textAnchor="middle" fontSize="11.5" fill="#565d66">
                QEMU 模拟交叉编译
              </text>
              <text x="120" y="114" textAnchor="middle" fontSize="11.5" fill="#565d66">
                （portal 干脆产出 amd64）
              </text>
              <rect
                x="288"
                y="44"
                width="150"
                height="86"
                rx="12"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="363"
                y="78"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                🏛️ GHCR
              </text>
              <text x="363" y="100" textAnchor="middle" fontSize="11.5" fill="#565d66">
                镜像仓库（在国外）
              </text>
              <rect
                x="512"
                y="44"
                width="188"
                height="86"
                rx="12"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="606"
                y="78"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                🏠 Mac mini
              </text>
              <text x="606" y="100" textAnchor="middle" fontSize="11.5" fill="#565d66">
                经代理拉几百 MB 再部署
              </text>
              <line x1="220" y1="87" x2="280" y2="87" stroke="#8b929b" strokeWidth="1.8" />
              <polygon points="279,82 288,87 279,92" fill="#8b929b" />
              <line
                x1="438"
                y1="87"
                x2="504"
                y2="87"
                stroke="#8b929b"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              <polygon points="503,82 512,87 503,92" fill="#8b929b" />
              <text
                x="471"
                y="74"
                textAnchor="middle"
                fontSize="11.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                翻墙拉回：最脆的一环
              </text>
              <text x="360" y="158" textAnchor="middle" fontSize="11.5" fill="#8b929b">
                网络抖动、EOF、20 分钟超时……还有开头那场芯片格式事故
              </text>
              {/* 分隔线 */}
              <line
                x1="20"
                y1="184"
                x2="700"
                y2="184"
                stroke="#e3e5df"
                strokeWidth="1.5"
                strokeDasharray="3 6"
              />
              {/* ===== 新链路 ===== */}
              <text x="20" y="216" fontSize="12.5" fontWeight="700" fill="#d95b32">
                改造后（现行）—— 就地打包，零距离上线
              </text>
              <rect
                x="20"
                y="232"
                width="452"
                height="130"
                rx="14"
                fill="#ffffff"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text x="42" y="260" fontSize="12.5" fontWeight="700" fill="#22262c">
                🏠 Mac mini 一台机器全包
              </text>
              <rect
                x="42"
                y="276"
                width="122"
                height="66"
                rx="10"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="103"
                y="303"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                ☕ gradlew
              </text>
              <text x="103" y="323" textAnchor="middle" fontSize="11.5" fill="#565d66">
                打 bootJar
              </text>
              <rect
                x="188"
                y="276"
                width="122"
                height="66"
                rx="10"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="249"
                y="303"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                📦 打镜像
              </text>
              <text x="249" y="323" textAnchor="middle" fontSize="11.5" fill="#565d66">
                原生 arm64
              </text>
              <rect
                x="334"
                y="276"
                width="116"
                height="66"
                rx="10"
                fill="#f1f2ee"
                stroke="#d95b32"
                strokeWidth="1.8"
              />
              <text
                x="392"
                y="303"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#22262c"
              >
                🚀 部署
              </text>
              <text x="392" y="323" textAnchor="middle" fontSize="11.5" fill="#565d66">
                本机秒到
              </text>
              <line x1="164" y1="309" x2="182" y2="309" stroke="#d95b32" strokeWidth="2" />
              <polygon points="181,304 190,309 181,314" fill="#d95b32" />
              <line x1="310" y1="309" x2="328" y2="309" stroke="#d95b32" strokeWidth="2" />
              <polygon points="327,304 336,309 327,314" fill="#d95b32" />
              <rect
                x="524"
                y="248"
                width="176"
                height="86"
                rx="12"
                fill="#f1f2ee"
                stroke="#e3e5df"
                strokeWidth="1.5"
              />
              <text
                x="612"
                y="280"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#22262c"
              >
                🏛️ GHCR
              </text>
              <text x="612" y="302" textAnchor="middle" fontSize="11.5" fill="#565d66">
                降级为"备份网盘"
              </text>
              <text x="612" y="322" textAnchor="middle" fontSize="11.5" fill="#565d66">
                传失败也不拦上线
              </text>
              <line
                x1="472"
                y1="292"
                x2="516"
                y2="292"
                stroke="#8b929b"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              <polygon points="515,287 524,292 515,297" fill="#8b929b" />
              <text
                x="494"
                y="280"
                textAnchor="middle"
                fontSize="11.5"
                fill="#8b929b"
                stroke="#fff"
                strokeWidth="3"
                style={{ paintOrder: "stroke" }}
              >
                事后备份
              </text>
              <text
                x="246"
                y="384"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#d95b32"
              >
                打包的机器 = 上线的机器：不模拟、不搬运，格式不可能再错
              </text>
            </svg>
          </div>
          <figcaption className="text-xs text-fog">
            手术的本质是删掉一段路。旧链路"云端打包 → 国外仓库 →
            翻墙拉回家"三段，最脆的翻墙一段曾拖垮 一整个下午；新链路"家里打包 →
            原地上线"一段，那段路物理上不存在了。
          </figcaption>
        </figure>
        <p>
          附带的收益：部署不再需要从外网拉几百 MB 镜像，曾经的 EOF、超时、"下载被掐断显示成
          cancelled"一类的网络事故连根拔掉。
        </p>
      </ArticleSection>

      <ArticleSection title="Java 服务怎么打：bootJar 装进分层镜像">
        <p>
          后端的打包分两步，第一步你很熟：<InlineCode>gradlew bootJar</InlineCode> 打出 fat
          jar。改了几个服务，就把几个服务的 bootJar 任务聚合进同一次 gradlew 调用，比如只改了
          catalog 时相当于：
        </p>
        <CodeBlock command="./gradlew :patra-api:patra-catalog:patra-catalog-boot:bootJar" />
        <p>
          第二步把 jar 装进镜像。五个后端服务共用同一份{" "}
          <InlineCode>patra-infra/docker/service.Dockerfile</InlineCode>
          ——它们都用同一个约定插件打包，产物结构逐字节通用，唯一的参数是端口（
          <InlineCode>--build-arg APP_PORT</InlineCode>）。Dockerfile 里用 Spring Boot 的{" "}
          <InlineCode>jarmode=tools</InlineCode> 把 fat jar 拆成四层，按变化频率排队：约 80MB
          的第三方依赖层只要 build.gradle 不动就永久命中缓存，每次真正要重打的只有你自己代码那几百
          KB 的一层。
        </p>
        <p>
          镜像的版本号不是 1.0、2.0，而是 <strong className="text-ink">commit sha</strong>
          ——每个镜像用它出生那次提交的编号做 tag（同时打一个 <InlineCode>latest</InlineCode>
          ）。"回滚到某一版"因此就是"换回某个提交号的镜像"，精确无歧义。
        </p>
      </ArticleSection>

      <ArticleSection title="portal 怎么打：整条流水线装进 Dockerfile">
        <p>
          portal 走的是另一种哲学：Java 服务是"仓库里先构建、Dockerfile 只负责装"，portal
          则把构建全过程都写进了自己的 <InlineCode>patra-portal/Dockerfile</InlineCode>
          ——三个阶段，装依赖（deps）→ <InlineCode>next build</InlineCode>（builder）→
          精简运行镜像（runner）， pnpm 装依赖和编译都发生在 <InlineCode>docker build</InlineCode>{" "}
          内部。所以 <InlineCode>portal-cd.yml</InlineCode> 里没有任何 gradle 或 pnpm 步骤，一条
          docker build 从源码直达镜像。锁文件不变时依赖层同样命中缓存，套路和后端一致。
        </p>
      </ArticleSection>

      <ArticleSection title="GHCR 的新角色：从必经之路降级为备份网盘">
        <p>
          镜像打好后直接留在本机 Docker daemon 里，部署根本不经过 <Term>GHCR</Term>
          。但每次构建完，流水线还是会顺手把镜像推一份上去——标记为{" "}
          <strong className="text-ink">best-effort</strong>
          ：这一步在剧本里写明允许失败（
          <InlineCode>continue-on-error: true</InlineCode>
          ），推不上去只记一条 warning，绝不拦着上线。
        </p>
        <p>
          留这个备份是为了一种场景：哪天要回滚到旧版本，而本机的镜像缓存恰好被清理了——那时才去 GHCR
          把旧镜像拉回来。它从"部署的必经之路"降级成了"回滚的备源"，从关键链路上退役，脾气再差也影响不到任何人。
        </p>
        <p>
          至此新镜像已经躺在 mini 的本机 daemon 里，就差最后一步：把正在跑的旧容器换下来。这一步远比{" "}
          <InlineCode>docker compose up</InlineCode>{" "}
          一条命令复杂——换上去、验活、出事还得自己退回来。下一站，部署闭环。
        </p>
      </ArticleSection>
    </>
  );
}
