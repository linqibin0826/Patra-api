import { describe, expect, it } from "vitest";
import { decodeEntities, type InlineNode, parseInlineMarkup } from "@/lib/rich-inline-text";

/** 简写：文本节点。 */
const text = (value: string): InlineNode => ({ kind: "text", value });
/** 简写：元素节点。 */
const el = (tag: string, ...children: InlineNode[]): InlineNode => ({
  kind: "element",
  tag,
  children,
});

/** 递归收集节点树的纯文本内容。 */
function textOf(nodes: InlineNode[]): string {
  return nodes.map((n) => (n.kind === "text" ? n.value : textOf(n.children))).join("");
}
void el;
void textOf;

describe("decodeEntities", () => {
  it("解码命名实体", () => {
    expect(decodeEntities("A &amp; B &lt;= C &gt; D &quot;E&quot; &apos;F&apos;&nbsp;G")).toBe(
      "A & B <= C > D \"E\" 'F'\u00a0G",
    );
  });

  it("解码十进制与十六进制数字实体", () => {
    expect(decodeEntities("&#8722;1 &#x2212;2")).toBe("−1 −2");
  });

  it("未知实体与孤立 & 原样保留", () => {
    expect(decodeEntities("&unknownx; a & b &#xZZ;")).toBe("&unknownx; a & b &#xZZ;");
  });

  it("码点越界与畸形码点原样保留", () => {
    expect(decodeEntities("X&#1114112;Y")).toBe("X&#1114112;Y");
    expect(decodeEntities("X&#99999999999999999999;Y")).toBe("X&#99999999999999999999;Y");
    expect(decodeEntities("X&#0;Y")).toBe("X&#0;Y");
    expect(decodeEntities("X&#xD800;Y")).toBe("X&#xD800;Y");
  });

  it("双重编码只解一层（不递归）", () => {
    expect(decodeEntities("&amp;lt;script&amp;gt;")).toBe("&lt;script&gt;");
  });

  it("原型链成员不被当实体", () => {
    expect(decodeEntities("A &constructor; B")).toBe("A &constructor; B");
  });

  it("缺分号不解码", () => {
    expect(decodeEntities("A &amp B")).toBe("A &amp B");
  });

  it("命名实体大小写敏感（大写不解码）", () => {
    expect(decodeEntities("&LT;i&GT;")).toBe("&LT;i&GT;");
  });
});

describe("parseInlineMarkup · 纯文本", () => {
  it("无标签文本原样输出为单一文本节点", () => {
    expect(parseInlineMarkup("Plain abstract text.")).toEqual([text("Plain abstract text.")]);
  });

  it("空字符串输出空数组", () => {
    expect(parseInlineMarkup("")).toEqual([]);
  });

  it("文本中的实体被解码", () => {
    expect(parseInlineMarkup("A &amp; B")).toEqual([text("A & B")]);
  });
});
