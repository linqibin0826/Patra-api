#!/usr/bin/env python3
"""v0.6 验收：源 XML 统计（与库内数字闭环核对）。

用法::

    python3 closed-loop-stats.py pubmed26n1333.xml.gz imported_pmids.txt

``imported_pmids.txt`` 由库导出（一行一个 PMID）::

    docker exec patra-postgres psql -U postgres -d patra_catalog -Atc \\
      "SELECT pmid FROM cat_publication WHERE pmid IS NOT NULL" > imported_pmids.txt

口径 = **成功导入 PMID 集合**：filter 阶段因期刊未入库被丢弃的文献不计入，
所以脚本只统计 imported 集合命中的 PubmedArticle。

作者判定与后端 ``buildAuthorData`` 的 ``deriveDisplayName`` 对齐：
优先 CollectiveName，其次 LastName（+ForeName），两者皆空才跳过。

输出五行，逐项与 runbook 步骤 9 的库内 SQL 对账。

依赖：仅标准库。
"""

# 已知反模式（有意保留）：iterparse 只对 PubmedArticle 调 clear()，不做
# `while art.getprevious() is not None: del root[0]` 的兄弟节点清理——那需要 lxml。
# 标准库 ElementTree 下 root 会累积约 3 万个**已清空**的 PubmedArticle 壳，
# 实测内存占用可忽略（壳无子节点无文本）。本脚本是一次性验收工具，
# 不值得为此引入 lxml 依赖。若将来要扫全量 1334 个文件，再换 lxml。

import gzip
import sys
import xml.etree.ElementTree as ET


def text_of(el) -> str:
    """取元素（含内联标签）的全部文本并去首尾空白；元素为 None 时返回空串。"""
    return "".join(el.itertext()).strip() if el is not None else ""


def main(xml_gz: str, pmids_file: str) -> None:
    """流式扫描 baseline XML，输出与库内核对的五组数。"""
    with open(pmids_file, encoding="utf-8") as fp:
        imported = {line.strip() for line in fp if line.strip()}

    matched = 0
    with_abstract = 0
    valid_authors = 0
    with_orcid = 0
    skipped_authors = 0

    with gzip.open(xml_gz) as f:
        for _, art in ET.iterparse(f, events=("end",)):
            if art.tag != "PubmedArticle":
                continue
            pmid = text_of(art.find(".//MedlineCitation/PMID"))
            if pmid in imported:
                matched += 1
                abst = art.find(".//Article/Abstract")
                if abst is not None and any(
                    text_of(t) for t in abst.findall("AbstractText")
                ):
                    with_abstract += 1
                for au in art.findall(".//AuthorList/Author"):
                    last = text_of(au.find("LastName"))
                    coll = text_of(au.find("CollectiveName"))
                    if not last and not coll:
                        skipped_authors += 1
                        continue
                    valid_authors += 1
                    for ident in au.findall("Identifier"):
                        if ident.get("Source") == "ORCID" and text_of(ident):
                            with_orcid += 1
                            break
            art.clear()

    print(f"基准集文献数(imported_pmids): {len(imported)}")
    print(f"  其中在本 XML 中命中: {matched}")
    print(f"含摘要文献数(应=cat_publication_abstract 行数): {with_abstract}")
    print(f"有效作者数(应=cat_publication_author 行数): {valid_authors}")
    print(f"含ORCID作者数(对照 ORCID 归一化通过/软关联命中报告): {with_orcid}")
    print(f"姓名全空跳过作者数(库内无对应行): {skipped_authors}")

    if matched != len(imported):
        print(
            f"\n[WARN] 命中数 {matched} != 基准集 {len(imported)}，三种可能原因："
            "① imported_pmids.txt 含其他 baseline 文件导入的 PMID；"
            "② 本 XML 与导入用的不是同一份；"
            "③ 本 XML 内同一 PMID 出现多次（Writer first-win 只落一行，"
            "此处却按出现次数计 matched）——用 runbook 步骤 9.1 的 uniq -d "
            "量出重复数即可解释偏差。",
            file=sys.stderr,
        )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    main(sys.argv[1], sys.argv[2])
