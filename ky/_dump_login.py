import pathlib, json

text = pathlib.Path("index.html").read_text(encoding="utf8")
start = text.index('<div id="loginPanel"')
end = text.index('<div id="mainPanel"')
snippet = text[start:end]

info = {
    "login_div_count": text.count('<div id="loginPanel"'),
    "main_div_index": end,
    "start_index": start,
}

pathlib.Path("login_dump.txt").write_text(repr(snippet) + "\n" + repr(info), encoding="utf8")
