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

type ElementNode = Extract<InlineNode, { kind: "element" }>;

/** 排版组白名单：任何位置放行。 */
const FORMATTING_TAGS = new Set(["i", "b", "sub", "sup", "u"]);

/** 公式组白名单：仅列只能出现在 <math> 子树内的标签（math 根标签在 isAllowed 单独放行）。 */
const MATH_TAGS = new Set([
  "mrow",
  "mi",
  "mo",
  "mn",
  "msub",
  "msup",
  "msubsup",
  "mtext",
  "mspace",
  "mstyle",
  "mover",
  "munder",
  "munderover",
  "mfrac",
  "msqrt",
  "semantics",
  "annotation",
]);

/** 标签形态：`<` 后紧跟可选 `/` 与标签名（`<`、`</` 后跟空白按 HTML 规范视为文本）、可选属性段（不含尖括号）、可选自闭合 `/`、`>`。不支持连字符标签名（如 annotation-xml，按字面降级；生产库实查无此标签）。 */
const TAG_RE = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:\s[^<>]*)?\s*\/?\s*>/;

/** 解析深度上限：超过后的开标签按字面输出，防止畸形深嵌套压垮后处理与渲染递归。 */
const MAX_DEPTH = 64;

/**
 * 把带内联标记的文本解析为节点树（栈式单遍扫描）。
 *
 * 铁律：白名单外的一切（未知标签、裸 `<`、孤儿闭合标签）按字面文本输出，
 * 一个字符都不吞；未闭合标签自动闭合到段尾；属性全剥；标签名大小写不敏感。
 * 实体解码发生在文本片段层（flushText），晚于标签识别，解码产物不可能再被识别为标签。
 */
export function parseInlineMarkup(text: string): InlineNode[] {
  const rootChildren: InlineNode[] = [];
  const stack: ElementNode[] = [];
  let buf = "";
  let i = 0;

  const currentChildren = (): InlineNode[] => stack.at(-1)?.children ?? rootChildren;

  const flushText = (): void => {
    if (buf.length > 0) {
      currentChildren().push({ kind: "text", value: decodeEntities(buf) });
      buf = "";
    }
  };

  const inMath = (): boolean => stack.some((element) => element.tag === "math");

  const isAllowed = (tag: string): boolean => {
    if (FORMATTING_TAGS.has(tag)) {
      return true;
    }
    if (tag === "math") {
      return true;
    }
    return MATH_TAGS.has(tag) && inMath();
  };

  while (i < text.length) {
    const ch = text.charAt(i);
    if (ch !== "<") {
      buf += ch;
      i += 1;
      continue;
    }
    const m = TAG_RE.exec(text.slice(i));
    if (m === null) {
      // 裸 `<`（接不出合法标签形态）→ 字面
      buf += ch;
      i += 1;
      continue;
    }
    const isClosing = m[1] === "/";
    const tag = (m[2] ?? "").toLowerCase();
    if (isClosing) {
      let openIdx = -1;
      for (let s = stack.length - 1; s >= 0; s -= 1) {
        if (stack[s]?.tag === tag) {
          openIdx = s;
          break;
        }
      }
      if (openIdx === -1) {
        // 孤儿闭合标签 → 字面（`<` 进 buf，其余字符随后续扫描继续进 buf）
        buf += ch;
        i += 1;
        continue;
      }
      flushText();
      // 弹栈到匹配层：中间未闭合的标签自动闭合
      stack.length = openIdx;
      i += m[0].length;
      continue;
    }
    if (!isAllowed(tag)) {
      // 白名单外标签 → 字面
      buf += ch;
      i += 1;
      continue;
    }
    if (stack.length >= MAX_DEPTH) {
      // 超深开标签 → 字面
      buf += ch;
      i += 1;
      continue;
    }
    flushText();
    const element: ElementNode = { kind: "element", tag, children: [] };
    currentChildren().push(element);
    // 自闭合（如 <mspace/>）不进栈
    if (!/\/\s*>$/.test(m[0])) {
      stack.push(element);
    }
    i += m[0].length;
  }
  flushText();
  // 段尾仍在栈中的元素 = 未被显式/祖先闭合；未闭合的 annotation 只展开不删除
  const unclosed = new Set<InlineNode>(stack);
  return stripAnnotations(rootChildren, unclosed);
}

/**
 * 处理 annotation 元素——它是同一公式的 LaTeX 重复表述：
 * 已闭合的整体丢弃（渲染会使公式显示两遍）；
 * 未闭合的只展开其子节点（上游截断时不吞正文，一个字符都不丢）。
 */
function stripAnnotations(nodes: InlineNode[], unclosed: ReadonlySet<InlineNode>): InlineNode[] {
  const out: InlineNode[] = [];
  for (const node of nodes) {
    if (node.kind === "element") {
      const children = stripAnnotations(node.children, unclosed);
      if (node.tag === "annotation") {
        if (unclosed.has(node)) {
          out.push(...children);
        }
        continue;
      }
      out.push({ ...node, children });
    } else {
      out.push(node);
    }
  }
  return out;
}
