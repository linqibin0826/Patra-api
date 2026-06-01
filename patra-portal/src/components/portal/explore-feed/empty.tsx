interface ExploreFeedEmptyProps {
  reason: "empty" | "error";
}

export function ExploreFeedEmpty({ reason }: ExploreFeedEmptyProps) {
  const text = reason === "error" ? "加载失败，请稍后重试" : "暂无文献";
  return (
    <div
      data-feed-state={reason}
      className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border-default bg-paper-50 text-sm text-fg-3"
    >
      {text}
    </div>
  );
}
