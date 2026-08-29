import { createElement, type ReactNode } from "react";
import { type InlineNode, parseInlineMarkup } from "@/lib/rich-inline-text";

/** InlineNode 树 → React 元素：文本节点由 React 自动转义，元素零属性。 */
function renderNodes(nodes: InlineNode[]): ReactNode[] {
  return nodes.map((node, index) =>
    node.kind === "text"
      ? node.value
      : createElement(node.tag, { key: index }, renderNodes(node.children)),
  );
}

/**
 * 白名单内联富文本：安全渲染 PubMed 标题/摘要中的排版标签（i/b/sub/sup/u）
 * 与 MathML 公式；白名单外内容显示为字面文本。零布局样式，嵌入现有排版即插即用。
 * 调用方须知：返回 Fragment（非包裹元素），字体/字号/行高等样式由调用方的包裹元素提供；
 * 返回 ReactNode，不可用于只接受字符串的位置（title= / aria-label / metadata），那类场景需另行降级为纯文本。
 */
export function RichInlineText({ text }: { text: string }) {
  return <>{renderNodes(parseInlineMarkup(text))}</>;
}
