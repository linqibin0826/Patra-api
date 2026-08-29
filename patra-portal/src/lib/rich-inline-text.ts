/** 内联标记节点：文本（实体已解码）或白名单元素（属性已剥）。 */
export type InlineNode =
  | { kind: "text"; value: string }
  | { kind: "element"; tag: string; children: InlineNode[] };

/** 常见命名实体 → 真字符。用 Map 避免对象原型链被外部输入命中。 */
const NAMED_ENTITIES = new Map<string, string>([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", "\u00a0"],
]);

/**
 * 解码常见 HTML 实体（命名 + 十进制 + 十六进制数字实体）。
 * 未知实体与孤立 & 原样保留。
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body.startsWith("#")) {
      const isHex = body.charAt(1) === "x" || body.charAt(1) === "X";
      const code = Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      // 正则已保证至少一位数字，parseInt 不会产出 NaN；0、代理区（U+D800-U+DFFF）、越界码点原样保留。
      if (code === 0 || (code >= 0xd800 && code <= 0xdfff) || code > 0x10ffff) {
        return match;
      }
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES.get(body) ?? match;
  });
}

/**
 * 把带内联标记的文本解析为节点树。
 * 本阶段：纯文本 + 实体解码（标签解析在后续任务加入）。
 */
export function parseInlineMarkup(text: string): InlineNode[] {
  if (text.length === 0) {
    return [];
  }
  return [{ kind: "text", value: decodeEntities(text) }];
}
