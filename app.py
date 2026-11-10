"""扫雷的页面行为。

这个文件由 Brython 在浏览器里执行。规则在 minesweeper.py。
"""

from browser import document, html, window

try:
    from minesweeper import (
        PRESETS,
        chord,
        cycle_mark,
        format_counter,
        make_rng,
        neighbors,
        new_preset_game,
        remaining_mines,
        reveal,
    )
except Exception as exc:
    document["status"].text = "规则没有载入：" + str(exc)
else:
    FLAG = (
        '<svg viewBox="0 0 24 24" class="glyph" aria-hidden="true">'
        '<path d="M7 21.5V3.5" stroke="#2a241c" stroke-width="2" stroke-linecap="round"/>'
        '<path d="M8 4.2h8.2L13.6 8.4 16.2 12.6H8z" fill="#de3b32"/>'
        '<path d="M5.2 21.5h6.2" stroke="#2a241c" stroke-width="2" stroke-linecap="round"/>'
        "</svg>"
    )
    MINE = (
        '<svg viewBox="0 0 24 24" class="glyph" aria-hidden="true">'
        '<path d="M12 2.2v3.1M12 18.7v3.1M2.2 12h3.1M18.7 12h3.1M4.6 4.6l2.2 2.2M17.2 17.2l2.2 2.2M19.4 4.6l-2.2 2.2M6.8 17.2l-2.2 2.2" '
        'stroke="#1c1915" stroke-width="1.6" stroke-linecap="round"/>'
        '<circle cx="12" cy="12" r="5" fill="#1c1915"/>'
        '<circle cx="10.2" cy="10.1" r="1.3" fill="#f4efe4"/>'
        "</svg>"
    )
    CROSS = (
        '<svg viewBox="0 0 24 24" class="cross" aria-hidden="true">'
        '<path d="M5 5l14 14M19 5 5 19" stroke="#c2412d" stroke-width="2.2" stroke-linecap="round"/>'
        "</svg>"
    )
    FACES = {
        "smile": (
            '<svg viewBox="0 0 64 64" class="face" aria-hidden="true">'
            '<circle cx="24" cy="28" r="3.2" fill="#2a2114"/>'
            '<circle cx="40" cy="28" r="3.2" fill="#2a2114"/>'
            '<path d="M22 40c2.8 6 17.2 6 20 0" fill="none" stroke="#2a2114" stroke-width="3" stroke-linecap="round"/>'
            "</svg>"
        ),
        "oh": (
            '<svg viewBox="0 0 64 64" class="face" aria-hidden="true">'
            '<circle cx="24" cy="26" r="3.2" fill="#2a2114"/>'
            '<circle cx="40" cy="26" r="3.2" fill="#2a2114"/>'
            '<circle cx="32" cy="44" r="6" fill="none" stroke="#2a2114" stroke-width="3"/>'
            "</svg>"
        ),
        "dead": (
            '<svg viewBox="0 0 64 64" class="face" aria-hidden="true">'
            '<path d="M20 22l8 8M28 22l-8 8M36 22l8 8M44 22l-8 8" fill="none" stroke="#2a2114" stroke-width="3" stroke-linecap="round"/>'
            '<path d="M22 46h20" fill="none" stroke="#2a2114" stroke-width="3" stroke-linecap="round"/>'
            "</svg>"
        ),
        "cool": (
            '<svg viewBox="0 0 64 64" class="face" aria-hidden="true">'
            '<rect x="14" y="24" width="15" height="11" rx="3" fill="#2a2114"/>'
            '<rect x="35" y="24" width="15" height="11" rx="3" fill="#2a2114"/>'
            '<path d="M29 29.5h6M14 28 9 23M50 28l5-5" fill="none" stroke="#2a2114" stroke-width="3" stroke-linecap="round"/>'
            '<path d="M22 46c2.6 5 17.4 5 20 0" fill="none" stroke="#2a2114" stroke-width="3" stroke-linecap="round"/>'
            "</svg>"
        ),
    }

    STORAGE_KEY = "saolei-best-v1"
    DIFF_KEYS = {"1": "beginner", "2": "intermediate", "3": "expert"}

    ui = {
        "diff": "beginner",
        "game": None,
        "rng": make_rng(1),
        "cells": [],
        "html_sigs": [],
        "focus": 0,
        "press": None,
        "moved": False,
        "timer": None,
        "swallow_click": False,
        "swallow_menu": False,
        "clock_id": None,
        "started": None,
        "elapsed": 0,
        "records": {"beginner": None, "intermediate": None, "expert": None},
        "fresh": False,
        "mood": "",
    }

    def storage_get(key):
        try:
            value = window.localStorage.getItem(key)
        except Exception:
            return None
        if value is None:
            return None
        text = str(value)
        if text in ("", "null", "undefined", "None"):
            return None
        return text

    def load_records():
        records = {"beginner": None, "intermediate": None, "expert": None}
        raw = storage_get(STORAGE_KEY)
        if not raw:
            return records
        for part in raw.split(","):
            if "=" not in part:
                continue
            name, value = part.split("=", 1)
            if name in records and value.isdigit():
                records[name] = int(value)
        return records

    def save_records():
        parts = []
        for item in PRESETS:
            best = ui["records"][item["id"]]
            parts.append("%s=%s" % (item["id"], "" if best is None else str(best)))
        try:
            window.localStorage.setItem(STORAGE_KEY, ",".join(parts))
        except Exception:
            pass

    def now_ms():
        try:
            return int(window.Date.now())
        except Exception:
            return 0

    def clear_hold():
        if ui["timer"] is not None:
            window.clearTimeout(ui["timer"])
            ui["timer"] = None

    def stop_clock():
        if ui["clock_id"] is not None:
            window.clearInterval(ui["clock_id"])
            ui["clock_id"] = None

    def freeze_clock():
        if ui["started"] is not None:
            ui["elapsed"] = int((now_ms() - ui["started"]) / 1000)
        stop_clock()

    def ensure_clock():
        if ui["started"] is not None:
            return
        ui["started"] = now_ms() or 1

        def tick():
            if ui["started"] is None:
                return
            ui["elapsed"] = int((now_ms() - ui["started"]) / 1000)
            document["lcd-time"].text = format_counter(ui["elapsed"])

        tick()
        ui["clock_id"] = window.setInterval(tick, 200)

    def pointer_type(ev):
        try:
            kind = ev.pointerType
        except Exception:
            return "mouse"
        if not kind:
            return "mouse"
        return str(kind)

    def event_button(ev):
        try:
            return int(ev.button)
        except Exception:
            return 0

    def event_buttons(ev):
        try:
            return int(ev.buttons)
        except Exception:
            return 0

    def is_ctrl(ev):
        try:
            return bool(ev.ctrlKey)
        except Exception:
            return False

    def target_id(ev):
        try:
            ident = ev.target.id
        except Exception:
            return ""
        if not ident:
            return ""
        return str(ident)

    def cell_markup(game, index):
        cell = game.cells[index]
        wrong = game.status == "lost" and cell.mark == "flag" and not cell.mine
        if wrong:
            return MINE + CROSS
        if cell.revealed and cell.mine:
            return MINE
        if cell.revealed and cell.adjacent:
            return '<span class="num n%d">%d</span>' % (cell.adjacent, cell.adjacent)
        if cell.revealed:
            return ""
        if cell.mark == "flag":
            return FLAG
        if cell.mark == "question":
            return '<span class="q">?</span>'
        return ""

    def cell_label(game, index):
        cell = game.cells[index]
        row = index // game.cols + 1
        col = index % game.cols + 1
        place = "第%d行第%d列" % (row, col)
        if cell.revealed and cell.mine:
            return place + "，地雷"
        if cell.revealed and cell.adjacent:
            return place + "，数字 %d" % cell.adjacent
        if cell.revealed:
            return place + "，空白"
        if cell.mark == "flag":
            return place + "，旗帜"
        if cell.mark == "question":
            return place + "，问号"
        return place + "，未翻开"

    def cell_class(game, index, down):
        cell = game.cells[index]
        if cell.revealed and cell.mine and game.hit == index:
            return "cell cell-hit"
        if cell.revealed and cell.mine:
            return "cell cell-mine"
        if game.status == "lost" and cell.mark == "flag" and not cell.mine:
            return "cell cell-wrong"
        if cell.revealed:
            return "cell cell-open"
        base = "cell cell-raised"
        if down:
            return base + " is-down"
        return base

    def pressed_indexes():
        game = ui["game"]
        index = ui["press"]
        if game is None or index is None:
            return []
        cell = game.cells[index]
        if not cell.revealed:
            if cell.mark == "flag":
                return []
            return [index]
        if cell.adjacent == 0:
            return []
        found = []
        for near in neighbors(game.rows, game.cols, index):
            other = game.cells[near]
            if (not other.revealed) and other.mark != "flag":
                found.append(near)
        return found

    def html_signature(game, index):
        cell = game.cells[index]
        return (
            cell.revealed,
            cell.mark,
            cell.mine,
            cell.adjacent,
            game.status,
            game.hit == index,
        )

    def sync_cells():
        game = ui["game"]
        down = set(pressed_indexes())
        for index, elt in enumerate(ui["cells"]):
            signature = html_signature(game, index)
            if ui["html_sigs"][index] != signature:
                elt.html = cell_markup(game, index)
                elt.attrs["aria-label"] = cell_label(game, index)
                ui["html_sigs"][index] = signature
            classes = cell_class(game, index, index in down)
            if elt.class_name != classes:
                elt.class_name = classes

    def mood():
        game = ui["game"]
        if game is None:
            return "smile"
        if game.status == "lost":
            return "dead"
        if game.status == "won":
            return "cool"
        if ui["press"] is not None:
            return "oh"
        return "smile"

def format_span(seconds):
    if seconds is None:
        return "还没有"
    if seconds <= 0:
        return "不到 1 秒"
    return "%d 秒" % seconds


def status_text():
    game = ui["game"]
    if game.status == "ready":
        return "从任意一格开始。第一下是安全的。"
    if game.status == "playing":
        return "数清楚再落子。"
    if game.status == "lost":
        return "踩到了。红底是引爆的那一颗，画叉的是插错的旗。"
    span = format_span(ui["elapsed"])
    if ui["fresh"]:
        return "新纪录，%s。" % span
    return "排完了，用时 %s。" % span

def sync_hud():
    game = ui["game"]
    left = remaining_mines(game)
    mines = document["lcd-mines"]
    mines.text = format_counter(left)
    mines.class_name = "lcd is-neg" if left < 0 else "lcd"
    document["lcd-time"].text = format_counter(ui["elapsed"])
    face = mood()
    if face != ui["mood"]:
        document["face"].html = FACES[face]
        ui["mood"] = face
    document["status"].text = status_text()
    cabinet = document["cabinet"]
    cabinet.class_name = "cabinet is-" + game.status
    for item in PRESETS:
        button = document["diff-" + item["id"]]
        button.class_name = "diff is-on" if item["id"] == ui["diff"] else "diff"
        document["rec-" + item["id"]].text = format_span(ui["records"][item["id"]])

def remember_best():
    if ui["game"].status != "won":
        return False
    diff = ui["diff"]
    previous = ui["records"][diff]
    seconds = ui["elapsed"]
    if previous is not None and previous <= seconds:
        return False
    ui["records"][diff] = seconds
    save_records()
    return True

def finish_if_needed():
    if ui["game"].status not in ("won", "lost"):
        return
    freeze_clock()
    if ui["game"].status == "won":
        ui["fresh"] = remember_best()

def reveal_at(index):
    game = ui["game"]
    if game.status in ("won", "lost"):
        return
    cell = game.cells[index]
    if cell.revealed:
        ui["game"] = chord(game, index, ui["rng"])
        finish_if_needed()
        sync_cells()
        sync_hud()
        return
    if cell.mark == "flag":
        return
    ensure_clock()
    ui["game"] = reveal(game, index, ui["rng"])
    finish_if_needed()
    sync_cells()
    sync_hud()

def cycle_at(index):
    game = ui["game"]
    if game.status in ("won", "lost"):
        return
    ui["game"] = cycle_mark(game, index)
    sync_cells()
    sync_hud()

def move_focus(index, take=False):
    previous = ui["focus"]
    ui["focus"] = index
    if previous != index and previous < len(ui["cells"]):
        ui["cells"][previous].attrs["tabindex"] = "-1"
    current = ui["cells"][index]
    current.attrs["tabindex"] = "0"
    if take:
        current.focus()

def build_board():
    game = ui["game"]
    board = document["board"]
    board.clear()
    board.attrs["style"] = "--cols: %d;" % game.cols
    if game.cols >= 30:
        tier = "wide"
    elif game.cols >= 16:
        tier = "mid"
    else:
        tier = "small"
    board.attrs["data-tier"] = tier
    ui["cells"] = []
    ui["html_sigs"] = []
    ui["focus"] = 0
    ui["mood"] = ""
    for index in range(len(game.cells)):
        button = html.BUTTON()
        button.attrs["type"] = "button"
        button.attrs["role"] = "gridcell"
        button.attrs["tabindex"] = "0" if index == 0 else "-1"
        button.attrs["draggable"] = "false"
        bind_cell(button, index)
        board <= button
        ui["cells"].append(button)
        ui["html_sigs"].append(None)
    sync_cells()
    sync_hud()

def start(diff_id):
    ui["diff"] = diff_id
    seed = now_ms() & 0x7FFFFFFF
    if seed <= 0:
        seed = 1
    ui["rng"] = make_rng(seed)
    ui["game"] = new_preset_game(diff_id)
    ui["fresh"] = False
    ui["press"] = None
    ui["moved"] = False
    ui["elapsed"] = 0
    ui["started"] = None
    ui["swallow_click"] = False
    ui["swallow_menu"] = False
    clear_hold()
    stop_clock()
    build_board()

def bind_cell(button, index):
    def on_click(ev):
        if ui["swallow_click"]:
            ui["swallow_click"] = False
            ev.preventDefault()
            return
        if is_ctrl(ev):
            ev.preventDefault()
            return
        move_focus(index)
        reveal_at(index)

    def on_menu(ev):
        ev.preventDefault()
        if ui["swallow_menu"]:
            ui["swallow_menu"] = False
            return
        if event_buttons(ev) & 1:
            return
        move_focus(index)
        cycle_at(index)

    def on_down(ev):
        button_id = event_button(ev)
        if button_id == 2 and (event_buttons(ev) & 1):
            ui["swallow_menu"] = True
            ui["swallow_click"] = True
            ui["press"] = None
            clear_hold()
            chord_directly(index)
            return
        if button_id == 2 or (button_id == 0 and is_ctrl(ev)):
            return
        if button_id == 1:
            ev.preventDefault()
            chord_directly(index)
            return
        ui["press"] = index
        ui["moved"] = False
        try:
            ui["x"] = ev.clientX
            ui["y"] = ev.clientY
        except Exception:
            ui["x"] = 0
            ui["y"] = 0
        try:
            button.setPointerCapture(ev.pointerId)
        except Exception:
            pass
        sync_cells()
        sync_hud()
        if pointer_type(ev) == "mouse":
            return

        def fire():
            if ui["press"] != index or ui["moved"]:
                return
            ui["swallow_click"] = True
            ui["swallow_menu"] = True
            ui["press"] = None
            cycle_at(index)
            try:
                window.navigator.vibrate(12)
            except Exception:
                pass

        ui["timer"] = window.setTimeout(fire, 420)

    def on_move(ev):
        if ui["press"] != index:
            return
        try:
            dx = ev.clientX - ui["x"]
            dy = ev.clientY - ui["y"]
        except Exception:
            return
        if dx * dx + dy * dy <= 144:
            return
        ui["moved"] = True
        clear_hold()
        ui["press"] = None
        if pointer_type(ev) != "mouse":
            ui["swallow_click"] = True
        sync_cells()
        sync_hud()

    def on_up(ev):
        clear_hold()
        if ui["press"] == index:
            ui["press"] = None
            sync_cells()
            sync_hud()

    button.bind("click", on_click)
    button.bind("contextmenu", on_menu)
    button.bind("pointerdown", on_down)
    button.bind("pointermove", on_move)
    button.bind("pointerup", on_up)
    button.bind("pointercancel", on_up)

def chord_directly(index):
    game = ui["game"]
    if game.status != "playing":
        return
    ui["game"] = chord(game, index, ui["rng"])
    finish_if_needed()
    sync_cells()
    sync_hud()

def on_key(ev):
    try:
        key = str(ev.key)
    except Exception:
        return
    ident = target_id(ev)
    if key in (" ", "Enter") and (ident == "face" or ident.startswith("diff-")):
        return
    if key in DIFF_KEYS:
        ev.preventDefault()
        start(DIFF_KEYS[key])
        return
    if key in ("r", "R"):
        ev.preventDefault()
        start(ui["diff"])
        return
    game = ui["game"]
    if game is None:
        return
    cols = game.cols
    total = game.rows * game.cols
    index = ui["focus"]
    if key == "ArrowLeft":
        ev.preventDefault()
        if index % cols > 0:
            move_focus(index - 1, True)
        return
    if key == "ArrowRight":
        ev.preventDefault()
        if index % cols < cols - 1:
            move_focus(index + 1, True)
        return
    if key == "ArrowUp":
        ev.preventDefault()
        if index - cols >= 0:
            move_focus(index - cols, True)
        return
    if key == "ArrowDown":
        ev.preventDefault()
        if index + cols < total:
            move_focus(index + cols, True)
        return
    if key in (" ", "Enter"):
        ev.preventDefault()
        reveal_at(index)
        return
    if key in ("f", "F"):
        ev.preventDefault()
        cycle_at(ui["focus"])

def boot():
    try:
        ui["records"] = load_records()
        document["face"].bind("click", lambda ev: start(ui["diff"]))
        for item in PRESETS:
            def handler(ev, diff_id=item["id"]):
                ev.preventDefault()
                start(diff_id)

            document["diff-" + item["id"]].bind("click", handler)
        document.bind("keydown", on_key)
        start("beginner")
        document["cabinet"].attrs["data-ready"] = "1"
    except Exception as exc:
        document["status"].text = "开局失败：" + str(exc)

if globals().get("ui") is not None:
    boot()
