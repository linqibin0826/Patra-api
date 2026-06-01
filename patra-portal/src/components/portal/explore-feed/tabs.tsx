"use client";

import { Clock, Quote } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FeedTab } from "@/types/portal";

const TABS: { value: FeedTab; label: string; Icon: typeof Clock }[] = [
  { value: "recent", label: "最近更新", Icon: Clock },
  { value: "cited", label: "高被引", Icon: Quote },
];

export function ExploreFeedTabs({ currentTab }: { currentTab: FeedTab }) {
  const router = useRouter();
  return (
    <Tabs
      value={currentTab}
      onValueChange={(v) => {
        const tab = v as FeedTab;
        router.push(`/?tab=${tab}`, { scroll: false });
      }}
      className="flex-col!"
    >
      <TabsList
        variant="line"
        className="flex h-auto w-full items-center justify-start gap-0 rounded-none border-b border-border-default bg-transparent p-0"
      >
        {TABS.map(({ value, label, Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="group/feed-tab relative -mb-px flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-fg-3 shadow-none transition-colors duration-150 hover:text-ink-900 data-active:border-clay-500! data-active:text-ink-900!"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
