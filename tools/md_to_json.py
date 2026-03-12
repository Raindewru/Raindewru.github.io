from __future__ import annotations
import json
import re
from pathlib import Path
from typing import List, Dict, Any

BASE = Path(__file__).resolve().parents[1]  # freefile/
MD_PATH = BASE / "sl" / "ms" / "detail.md"
OUT_DIR = BASE / "sl" / "ms" / "data"

heading_re = re.compile(r"^(#{2,6})\s+(.*)$")
table_sep_re = re.compile(r"^\s*\|\s*-{3,}")
list_re = re.compile(r"^\s*-\s+(.*)$")

def slugify(text: str) -> str:
    return re.sub(r"\s+", "-", text.strip())

def parse(md_lines: List[str]) -> List[Dict[str, Any]]:
    chapters: List[Dict[str, Any]] = []
    current_ch: Dict[str, Any] | None = None
    blocks: List[Dict[str, Any]] = []
    toc_children: List[Dict[str, Any]] = []

    i = 0
    line_count = len(md_lines)

    def flush_paragraph(buf: List[str]):
        if not buf:
            return
        text = "\n".join(buf)
        blocks.append({
            "id": f"p-{len(blocks)}",
            "type": "paragraph",
            "text": text
        })
        buf.clear()

    para_buf: List[str] = []

    while i < line_count:
        line = md_lines[i].rstrip("\n")

        # Chapter/section headings
        hmatch = heading_re.match(line)
        if hmatch:
            flush_paragraph(para_buf)
            hashes, title = hmatch.groups()
            depth = len(hashes)
            hid = f"h-{len(blocks)}"
            blocks.append({
                "id": hid,
                "type": "heading",
                "depth": depth,
                "text": title,
                "slug": slugify(title)
            })
            if depth == 2:
                # new chapter
                # close previous
                if current_ch is not None:
                    current_ch["toc"][0]["children"] = toc_children
                    current_ch["blocks"] = blocks
                    chapters.append(current_ch)
                # start new
                current_ch = {
                    "meta": {
                        "title": title,
                        "source": "./detail.md",
                        "chapter": len(chapters) + 1
                    },
                    "toc": [{
                        "id": hid,
                        "text": title,
                        "depth": depth,
                        "slug": slugify(title),
                        "children": []
                    }]
                }
                blocks = [blocks[-1]]  # keep the chapter heading as first block
                toc_children = []
            elif depth == 3 and current_ch is not None:
                toc_children.append({
                    "id": hid,
                    "text": title,
                    "depth": depth,
                    "slug": slugify(title)
                })
            i += 1
            continue

        # Tables
        if line.strip().startswith("|"):
            # A table requires a header, then a separator line
            # Gather contiguous lines starting with '|'
            tbl_lines = [line]
            j = i + 1
            while j < line_count and md_lines[j].strip().startswith("|"):
                tbl_lines.append(md_lines[j].rstrip("\n"))
                j += 1
            # Validate table (second line looks like separator)
            if len(tbl_lines) >= 2 and table_sep_re.match(tbl_lines[1]):
                flush_paragraph(para_buf)
                header = [c.strip() for c in tbl_lines[0].strip().strip("|").split("|")]
                rows = []
                for rline in tbl_lines[2:]:  # skip header and separator
                    rows.append([c.strip() for c in rline.strip().strip("|").split("|")])
                blocks.append({
                    "id": f"t-{len(blocks)}",
                    "type": "table",
                    "header": header,
                    "align": ["left"] * len(header),
                    "rows": rows
                })
                i = j
                continue
            # If not a formal table, treat as paragraph fallthrough

        # Lists (consecutive '-' items)
        lmatch = list_re.match(line)
        if lmatch:
            flush_paragraph(para_buf)
            items = [lmatch.group(1)]
            j = i + 1
            while j < line_count:
                m = list_re.match(md_lines[j])
                if m:
                    items.append(m.group(1))
                    j += 1
                else:
                    break
            blocks.append({
                "id": f"ul-{len(blocks)}",
                "type": "list",
                "ordered": False,
                "items": [{"text": it} for it in items]
            })
            i = j
            continue

        # Blank line flushes current paragraph buffer
        if line.strip() == "":
            flush_paragraph(para_buf)
            i += 1
            continue

        # Otherwise accumulate paragraph with exact text (no loss)
        para_buf.append(line)
        i += 1

    # flush last chapter
    flush_paragraph(para_buf)
    if current_ch is not None:
        current_ch["toc"][0]["children"] = toc_children
        current_ch["blocks"] = blocks
        chapters.append(current_ch)

    return chapters


def main():
    text = MD_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()
    chapters = parse(lines)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for ch in chapters:
        idx = ch["meta"]["chapter"]
        out_path = OUT_DIR / f"detail_ch{idx}.json"
        out_path.write_text(json.dumps(ch, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {out_path}")

if __name__ == "__main__":
    main()
