// patra-learn/src/content/articles/l3/notification-philosophy.tsx —— 3 号线第 4 站：通知哲学（全线终点站）
import { ArticleSection } from "@/components/article-section";
import { InlineCode } from "@/components/inline-code";
import { Term } from "@/components/term";

export default function NotificationPhilosophyArticle() {
  return (
    <>
      <ArticleSection title="最后一个问题：出事了，谁来喊你">
        <p>
          三条线走到这里，机器人已经包办了考试、上线、巡逻。只剩一个收尾问题：哪个环节红了灯——巡检抓到磁盘告急、部署失败自动回滚了——这个消息怎么送到你眼前？毕竟守夜线的全部意义就是"坏了要有人知道"，最后一公里送不到，前面全白干。
        </p>
        <p>
          这一站没有新代码，讲的是一次<strong className="text-ink">拆东西</strong>
          的决策——以及为什么"不建"有时候比"建"更需要想清楚。
        </p>
      </ArticleSection>

      <ArticleSection title="曾经有一条专线，后来拆了">
        <p>
          这套系统曾经接过一条独立通知通道：ntfy，一个自建推送服务，配上手机
          App，流水线出事就推一条到手机。听上去很专业——生产系统不都该有独立告警通道吗？
        </p>
        <p>
          2026 年 8 月 28 日，这条通道被整个拆除。理由想明白了就很简单：
          <strong className="text-ink">这是单人 dev 环境</strong>
          。自己发布、自己看结果，出了事要通知的人有且只有一个，而 <Term>GitHub Actions</Term>{" "}
          原生就能在 <Term>workflow</Term> 失败时发通知——前提是你在 GitHub 通知设置里开着 Actions
          失败通知；定时触发的 workflow，收通知的通常是 workflow 文件的创建者或最后改动 cron
          的人，在这里都是同一个人。邮件和 GitHub 手机 App 推送，跟你收 CI
          挂了的通知一模一样，一分钱设施不用建。ntfy 能送到的消息，GitHub 本来就送得到。
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
            <p className="text-sm font-black text-fog">决策前 · ntfy 独立通道</p>
            <ul className="flex flex-col gap-1.5 text-sm leading-6">
              <li>📲 自建推送服务 + 专用手机 App</li>
              <li>🔧 多一个要部署、要维护、要保活的服务</li>
              <li>🕳️ 通知通道自己坏了，谁来通知？又需要一层监控</li>
              <li>👥 版型是抄运维团队的——可受众只有一个人</li>
            </ul>
          </div>
          <div
            className="flex flex-col gap-2 rounded-xl border-2 p-4"
            style={{ borderColor: "#7a5fb8", backgroundColor: "#f1f2ee" }}
          >
            <p className="text-sm font-black" style={{ color: "#7a5fb8" }}>
              决策后 · GitHub 原生通知
            </p>
            <ul className="flex flex-col gap-1.5 text-sm leading-6">
              <li>📱 workflow 失败 → 邮件 + GitHub App 推送</li>
              <li>🆓 平台自带，通知设置里开着就有，零部署零维护</li>
              <li>🧹 少一个能坏的环节，守夜线自身更皮实</li>
              <li>🤫 通知条数没少一条，设施少了一整套</li>
            </ul>
          </div>
        </div>
        <p>
          这次决策还被写进了案发地本身：<InlineCode>cd.yml</InlineCode>{" "}
          的头注释里连日期一起记着这次决策，<InlineCode>runner-watchdog.yml</InlineCode>{" "}
          的头注释也留了一句"不设自建通知通道"——防的是几个月后的自己手痒，又想把它建回来。
        </p>
      </ArticleSection>

      <ArticleSection title="运维克制：不为不存在的场景加设施">
        <p>
          拆 ntfy 不是抠门，是一条原则：
          <strong className="text-ink">不给单人 dev 环境套生产级运维模板</strong>
          。值班表、告警分级、独立通知通道、冗余备份链——这些东西在多人生产团队里每一件都有受众；受众不存在时，它们不会提供安全感，只会提供维护负担，以及"通知系统本身坏了没通知"这种套娃问题。加设施之前先问一句：这是给谁用的？答不上来就不加。
        </p>
        <p>
          克制之后，日常的约定反而清爽。出事了去哪看，就两个地方：手机上收到 GitHub
          通知，点进去就是那次运行的日志，红在哪一步一目了然；或者主动去仓库的 Actions
          页，三条线每一次运行的绿红都列在那里。而平时的默认状态是——
          <strong className="text-ink">无声即安好</strong>：每天早上 7
          点巡检跑完，手机没响，就是全绿；上一站体检单右下角那格"保持安静"，正是这套系统设计出来的常态。
        </p>
      </ArticleSection>

      <ArticleSection title="终点站：回望三条线">
        <p>
          第 13 站到了，列车进终点。回头看整张线路图：<strong className="text-ink">1 号线</strong>
          守在合并之前——开 PR 就开考，<Term>分支保护</Term>拦住不及格的卷子，改哪考哪，考过了 squash
          成一格干净的历史；<strong className="text-ink">2 号线</strong>接在合并之后——mini
          领活、本机打包、部署闭环、三道验货，坏了自己退回上一个好版本；
          <strong className="text-ink">3 号线</strong>守在无人看管的日常——每天 07:00
          查岗加体检，专防"设施坏了没人知道"。三条线对付的其实是同一件事的三个时态：将要坏的（拦在门口）、正在坏的（自动退回）、悄悄坏了的（每天点名）。
        </p>
        <p>
          而这一切背后没有一台"专业"的服务器：一台家里的 Mac mini，不开一个入站端口，只跑审过合进
          main
          的代码，密钥进保险柜不进仓库。六次真实翻车换来六条规则，每条规则都钉在它的案发文件旁边。
        </p>
        <p>
          所以最后记住的不是哪个文件哪行配置，是分工：机器人负责考试、上线、守夜、喊人；你负责的事从头到尾只有三件——
          <strong className="text-ink">写代码，开 PR，点合并</strong>。其余的，交给这张线路图。
        </p>
      </ArticleSection>
    </>
  );
}
