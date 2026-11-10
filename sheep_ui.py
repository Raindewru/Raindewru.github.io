"""羊了个羊的页面。规则在 sheep.py，这里只负责摆牌和点牌。"""

from browser import document, html, window

import sheep as rules


def _face(fill, features):
    return (
        '<svg viewBox="0 0 64 64" aria-hidden="true">'
        + '<rect width="64" height="64" rx="16" fill="%s"/>' % fill
        + features
        + "</svg>"
    )


FACES = (
    _face("#ffd23a", '<path d="M18 26h6M40 26h6" stroke="#2a241c" stroke-width="4" stroke-linecap="round"/><path d="M14 34c6 16 30 16 36 0" fill="#2a241c"/><path d="M22 42c4 6 16 6 20 0" fill="#ff8b8b"/>'),
    _face("#c47a3a", '<path d="M12 30h12M32 30h12" stroke="#2a241c" stroke-width="4" stroke-linecap="round"/><path d="M26 46h10" stroke="#2a241c" stroke-width="4" stroke-linecap="round"/><path d="M48 14c5 5 3 11 8 14" stroke="#8a4e18" stroke-width="3" fill="none" stroke-linecap="round"/>'),
    _face("#14c4d4", '<path d="M10 16h16M38 16h16" stroke="#08343a" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="30" r="10" fill="#fff"/><circle cx="46" cy="30" r="10" fill="#fff"/><circle cx="20" cy="32" r="4" fill="#08343a"/><circle cx="46" cy="32" r="4" fill="#08343a"/><circle cx="33" cy="50" r="6" fill="#08343a"/>'),
    _face("#ff7a18", '<circle cx="20" cy="26" r="4" fill="#2a241c"/><circle cx="44" cy="32" r="4" fill="#2a241c"/><path d="M18 46c10 4 22-2 28-8" stroke="#2a241c" stroke-width="4" fill="none" stroke-linecap="round"/>'),
    _face("#67c4ff", '<circle cx="22" cy="28" r="4" fill="#2a241c"/><circle cx="42" cy="28" r="4" fill="#2a241c"/><path d="M20 44c6-8 18-8 24 0" stroke="#2a241c" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M16 34c-2 8 2 12 0 16M48 34c2 8-2 12 0 16" stroke="#1d6cb5" stroke-width="3" fill="none" stroke-linecap="round"/>'),
    _face("#2d5bff", '<rect x="10" y="22" width="44" height="16" rx="8" fill="#10182e"/><path d="M20 48c6 6 18 6 24 0" stroke="#10182e" stroke-width="4" fill="none" stroke-linecap="round"/>'),
    _face("#ff4d8d", '<circle cx="22" cy="26" r="4" fill="#2a241c"/><path d="M40 22l4 8-6 2z" fill="#2a241c"/><path d="M24 40c6 6 12 6 16 0" stroke="#2a241c" stroke-width="4" fill="none"/><ellipse cx="36" cy="50" rx="6" ry="8" fill="#e23d55"/>'),
    _face("#ef3d32", '<path d="M14 20l12 6M50 20L38 26" stroke="#2a241c" stroke-width="4" stroke-linecap="round"/><circle cx="22" cy="32" r="4" fill="#2a241c"/><circle cx="42" cy="32" r="4" fill="#2a241c"/><path d="M22 50c6-8 14-8 20 0" stroke="#2a241c" stroke-width="4" fill="none" stroke-linecap="round"/>'),
    _face("#7c5cff", '<path d="M14 30c4 6 10 6 14 0M36 30c4 6 10 6 14 0" stroke="#2a1a66" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="46" r="3" fill="#2a1a66"/><path d="M46 12h5l-2 6h5" stroke="#2a1a66" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    _face("#78d23a", '<path d="M14 24c4-6 10-4 12 2" stroke="#2a241c" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="22" cy="32" r="4" fill="#2a241c"/><circle cx="44" cy="30" r="4" fill="#2a241c"/><path d="M46 14c4 0 6 4 4 8-2 3-4 2-4 5" stroke="#2a241c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="46" cy="32" r="2" fill="#2a241c"/>'),
    _face("#d946ef", '<path d="M14 32c4-8 12-8 16 0M36 32c4-8 12-8 16 0" stroke="#3b0a40" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 46c5 6 15 6 20 0" stroke="#3b0a40" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="12" cy="40" r="5" fill="#ff8ad4"/><circle cx="52" cy="40" r="5" fill="#ff8ad4"/>'),
    _face("#0f9d8a", '<circle cx="22" cy="30" r="8" fill="none" stroke="#08332e" stroke-width="3"/><circle cx="22" cy="30" r="2" fill="#08332e"/><circle cx="44" cy="30" r="4" fill="#08332e"/><path d="M20 48c4-4 8 4 12 0s8 4 12 0" stroke="#08332e" stroke-width="4" fill="none" stroke-linecap="round"/>'),
)


def face_html(kind):
    return '<span class="mark">%s</span>' % FACES[kind]


def fresh_seed():
    try:
        value = int(window.Date.now())
    except Exception:
        value = 1
    return value & 0x7FFFFFFF or 1


def mark_off(element_id, off):
    node = document[element_id]
    node.class_name = "tool tool-strong is-off" if element_id == "restart" and off else (
        "tool is-off" if off else ("tool tool-strong" if element_id == "restart" else "tool")
    )


def build():
    board = document["board"]
    board.clear()
    tiles = ui["game"].tiles
    min_x = min(tile.x for tile in tiles)
    max_x = max(tile.x for tile in tiles)
    min_y = min(tile.y for tile in tiles)
    max_y = max(tile.y for tile in tiles)
    max_z = max(tile.z for tile in tiles)
    if ui["level"] == "meadow":
        step = 72
        tile_w = 68
        tile_h = 68
        lift = 10
    else:
        step = 86
        tile_w = 94
        tile_h = 94
        lift = 6
    pad = 10
    ui["tile_px"] = tile_w
    width = int((max_x - min_x) * step + tile_w + pad * 2)
    height = int((max_y - min_y) * step + tile_h + max_z * lift + pad * 2)
    ui["board_w"] = width
    ui["board_h"] = height
    ui["cells"] = []
    ui["kinds"] = {}
    for tile in tiles:
        left = pad + (tile.x - min_x) * step
        top = pad + max_z * lift + (tile.y - min_y) * step - tile.z * lift
        if ui["level"] == "meadow":
            spin = int(((tile.tid * 13 % 9) - 4) / 3)
        else:
            spin = 0
        button = html.BUTTON()
        button.class_name = "tile is-gone"
        button.attrs["type"] = "button"
        button.attrs["style"] = (
            "left:%dpx;top:%dpx;width:%dpx;height:%dpx;z-index:%d;--spin:%ddeg;"
            % (
                int(left),
                int(top),
                tile_w,
                tile_h,
                int(tile.z * 100 + tile.y * 10 + tile.x),
                spin,
            )
        )
        button.attrs["data-tid"] = str(tile.tid)
        button.bind("click", on_tile)
        board <= button
        ui["cells"].append(button)
        ui["kinds"][tile.tid] = -1


def fit():
    width = ui.get("board_w") or 1
    height = ui.get("board_h") or 1
    table = document["table"]
    avail = table.clientWidth or window.innerWidth or width
    scale = avail / float(width)
    if scale > 1:
        scale = 1
    document["board"].attrs["style"] = (
        "width:%dpx;height:%dpx;transform:scale(%.4f);transform-origin:top center;"
        % (width, height, scale)
    )
    table.attrs["style"] = "height:%dpx;" % int(height * scale + 12)


def paint():
    game = ui["game"]
    free = {}
    for tid in rules.clickable_ids(game):
        free[tid] = True
    lookup = {}
    for tile in game.tiles:
        lookup[tile.tid] = tile
    for tile, node in zip(game.tiles, ui["cells"]):
        name = rules.KIND_NAMES[tile.kind]
        if ui["kinds"].get(tile.tid) != tile.kind:
            node.html = face_html(tile.kind)
            ui["kinds"][tile.tid] = tile.kind
        if tile.where != "board":
            node.class_name = "tile is-gone"
            node.attrs["aria-label"] = name
            continue
        if free.get(tile.tid):
            node.class_name = "tile is-free"
            node.attrs["aria-label"] = name + "，可以拿走"
        else:
            node.class_name = "tile is-covered"
            node.attrs["aria-label"] = name + "，被压住了"

    dock = document["dock"]
    dock.clear()
    dock.class_name = "dock is-pop" if ui.get("pop") else "dock"
    ui["pop"] = False
    for index in range(rules.SLOT_LIMIT):
        cell = html.DIV()
        if index < len(game.slot):
            tile = lookup[game.slot[index]]
            cell.class_name = "slot is-filled"
            cell.html = face_html(tile.kind)
            cell.attrs["aria-label"] = rules.KIND_NAMES[tile.kind]
        else:
            cell.class_name = "slot"
        dock <= cell

    pile = document["pile"]
    if game.pile:
        top = lookup[game.pile[-1]]
        pile.class_name = "pile is-full"
        pile.html = face_html(top.kind) + '<span class="count">%d</span>' % len(game.pile)
        pile.attrs["aria-label"] = "移出的牌，最上面是" + rules.KIND_NAMES[top.kind]
    else:
        pile.class_name = "pile"
        pile.html = ""
        pile.attrs["aria-label"] = "还没有移出的牌"

    left = rules.board_left(game)
    if game.status != "lost":
        ui["banner_held"] = False
    if game.status == "playing":
        if ui["level"] == "meadow":
            document["status"].text = "先点露出来的牌。三张一样就消。还剩 %d 张。" % left
        else:
            document["status"].text = "中间是一块，露出来的没有一对一样。还剩 %d 张。" % left
    elif game.status == "won":
        document["status"].text = "过关了。"
    else:
        document["status"].text = "未通关。"

    banner = document["banner"]
    nxt = document["banner-next"]
    stay = document["banner-stay"]
    if game.status == "won" and ui["level"] == "meadow":
        banner.class_name = "banner is-on"
        document["banner-title"].text = "会了"
        document["banner-text"].text = "点几下就明白了。去第二关，牌叠得更乱。"
        nxt.text = "玩第二关"
        stay.class_name = "ghost is-hidden"
    elif game.status == "won":
        banner.class_name = "banner is-on"
        document["banner-title"].text = "过关了"
        document["banner-text"].text = "这座乱牌山清完了。"
        nxt.text = "再来一座"
        stay.class_name = "ghost is-hidden"
    elif game.status == "lost" and not ui.get("banner_held"):
        banner.class_name = "banner is-on is-lost is-chicken"
        document["banner-title"].text = "哈哈，小菜鸡"
        document["banner-text"].text = "抓住才能重开"
        nxt.text = "重开"
        stay.class_name = "ghost is-hidden"
        if not ui.get("chicken"):
            start_chicken()
    else:
        banner.class_name = "banner"
        stop_chicken()

    document["undo-left"].text = str(ui["undo_left"])
    document["shuffle-left"].text = str(ui["shuffle_left"])
    document["move-left"].text = str(ui["move_left"])
    mark_off("undo", ui["undo_left"] <= 0 or not ui["history"])
    mark_off("shuffle", ui["shuffle_left"] <= 0 or game.status != "playing")
    mark_off("moveout", ui["move_left"] <= 0 or not game.slot or game.status != "playing")
    document["level-meadow"].class_name = "level is-on" if ui["level"] == "meadow" else "level"
    document["level-mountain"].class_name = "level is-on" if ui["level"] == "mountain" else "level"
    document["restart"].class_name = "tool tool-strong"
    document["restart"].text = "重开"


def on_tile(ev):
    ev.preventDefault()
    raw = ev.currentTarget.attrs["data-tid"]
    do_click(int(raw))


def on_pile(ev):
    ev.preventDefault()
    game = ui["game"]
    if game.pile:
        do_click(game.pile[-1])


def do_click(tid):
    game = ui["game"]
    if game.status != "playing":
        return
    nxt = rules.click(game, tid)
    if nxt is game:
        return
    ui["pop"] = len(nxt.slot) < len(game.slot)
    ui["history"].append(game)
    ui["game"] = nxt
    paint()


def do_undo():
    if ui["undo_left"] <= 0 or not ui["history"]:
        return
    ui["undo_left"] -= 1
    ui["game"] = ui["history"].pop()
    ui["pop"] = False
    paint()


def do_shuffle():
    if ui["shuffle_left"] <= 0 or ui["game"].status != "playing":
        return
    nxt = rules.shuffle_board(ui["game"], rules.make_rng(fresh_seed()))
    ui["history"].append(ui["game"])
    ui["shuffle_left"] -= 1
    ui["game"] = nxt
    paint()


def do_move():
    if ui["move_left"] <= 0 or ui["game"].status != "playing":
        return
    nxt = rules.move_out(ui["game"])
    if nxt is ui["game"]:
        return
    ui["history"].append(ui["game"])
    ui["move_left"] -= 1
    ui["game"] = nxt
    paint()


def spawn_mist(x, y, delay_ms):
    node = html.DIV()
    node.class_name = "mist"
    node.attrs["style"] = "left:%dpx;top:%dpx;animation-delay:%dms;" % (int(x), int(y), int(delay_ms))
    document["litter"] <= node

    def forget(node=node):
        try:
            node.remove()
        except Exception:
            pass

    window.setTimeout(forget, 1100 + delay_ms)


def trail(old_x, old_y, x, y):
    steps = 6
    index = 0
    while index < steps:
        part = index / float(steps)
        spawn_mist(
            old_x + (x - old_x) * part + 28,
            old_y + (y - old_y) * part + 34,
            index * 60,
        )
        index += 1


def drop_poop(x, y):
    node = html.DIV()
    node.class_name = "poop"
    node.attrs["style"] = "left:%dpx;top:%dpx;" % (int(x) + 28, int(y) + 68)
    node.html = (
        '<svg viewBox="0 0 32 24" aria-hidden="true">'
        '<ellipse cx="16" cy="17" rx="12" ry="6" fill="#6b3a1f"/>'
        '<ellipse cx="16" cy="12" rx="8" ry="6" fill="#8a4b28"/>'
        '<ellipse cx="16" cy="7" rx="4.5" ry="4.5" fill="#a35b30"/>'
        "</svg>"
    )
    document["litter"] <= node
    ui["poops"].append(node)


def clear_poops():
    for node in ui.get("poops") or []:
        try:
            node.remove()
        except Exception:
            pass
    ui["poops"] = []


def hop():
    rng = ui.get("hop_rng")
    if not ui.get("chicken") or rng is None:
        return
    width = int(window.innerWidth or 360) - 110
    height = int(window.innerHeight or 640) - 110
    if width < 8:
        width = 8
    if height < 8:
        height = 8
    x = int(rng() * width)
    y = int(rng() * height)
    old_x = ui.get("chicken_x")
    old_y = ui.get("chicken_y")
    if old_x is None:
        old_x = x
        old_y = y
    flip = "scaleX(-1)" if x < old_x else "scaleX(1)"
    document["chicken"].attrs["style"] = "left:%dpx;top:%dpx;transform:%s;" % (x, y, flip)
    trail(old_x, old_y, x, y)
    ui["chicken_x"] = x
    ui["chicken_y"] = y
    ui["chicken_gen"] = ui.get("chicken_gen", 0) + 1
    token = ui["chicken_gen"]

    def arrived(token=token, x=x, y=y):
        if token != ui.get("chicken_gen") or not ui.get("chicken"):
            return
        drop_poop(x, y)

    window.setTimeout(arrived, 500)


def queue_hop():
    if not ui.get("chicken"):
        return
    hop()
    ui["chicken_timer"] = window.setTimeout(queue_hop, 540)


def stop_chicken():
    timer = ui.get("chicken_timer")
    if timer is not None:
        window.clearTimeout(timer)
        ui["chicken_timer"] = None
    ui["chicken"] = False
    ui["chicken_x"] = None
    ui["chicken_y"] = None
    clear_poops()
    try:
        document["chicken"].class_name = "chicken"
    except Exception:
        pass


def start_chicken():
    stop_chicken()
    ui["chicken"] = True
    ui["hop_rng"] = rules.make_rng(fresh_seed())
    document["chicken"].class_name = "chicken is-on"
    hop()
    ui["chicken_timer"] = window.setTimeout(queue_hop, 540)


def catch_chicken(ev):
    ev.preventDefault()
    if not ui.get("chicken"):
        return
    stop_chicken()
    request_start(ui["level"])


def banner_action():
    if ui["game"].status == "won" and ui["level"] == "meadow":
        request_start("mountain")
    else:
        request_start(ui["level"])


def stay_here():
    ui["banner_held"] = True
    paint()


def apply_game(level, game):
    ui["level"] = level
    ui["game"] = game
    ui["history"] = []
    ui["undo_left"] = 5
    ui["shuffle_left"] = 2
    ui["move_left"] = 1
    ui["pop"] = False
    ui["banner_held"] = False
    ui["busy"] = False
    build()
    paint()
    fit()
    window.setTimeout(fit, 30)
    document["table"].attrs["data-ready"] = "1"


def prefetch(level):
    if ui.get("ready_level") == level and ui.get("ready_game") is not None:
        return
    try:
        game = rules.deal(level, rules.make_rng(fresh_seed()))
    except Exception:
        return
    if ui.get("level") != level:
        return
    ui["ready_game"] = game
    ui["ready_level"] = level


def show_dealing(level):
    ui["level"] = level
    document["banner"].class_name = "banner is-on"
    document["banner-title"].text = "重开中"
    document["banner-text"].text = "正在铺这一关。"
    document["banner-next"].text = "铺牌中"
    document["banner-stay"].class_name = "ghost is-hidden"
    document["status"].text = "正在重开…"
    document["restart"].text = "重开中"


def request_start(level):
    if ui.get("chicken"):
        document["status"].text = "先抓住那只鸡。"
        return
    if ui.get("busy"):
        return
    ready = ui.get("ready_game")
    if ready is not None and ui.get("ready_level") == level:
        ui["ready_game"] = None
        apply_game(level, ready)
        window.setTimeout(lambda: prefetch(level), 40)
        return
    ui["busy"] = True
    show_dealing(level)

    def go():
        try:
            game = rules.deal(level, rules.make_rng(fresh_seed()))
        except Exception as exc:
            ui["busy"] = False
            document["restart"].text = "重开"
            document["status"].text = "这局没铺好：" + str(exc)
            return
        apply_game(level, game)
        window.setTimeout(lambda: prefetch(level), 40)

    window.setTimeout(go, 20)


def start(level):
    try:
        game = rules.deal(level, rules.make_rng(fresh_seed()))
    except Exception as exc:
        document["status"].text = "这局没铺好：" + str(exc)
        return
    apply_game(level, game)
    window.setTimeout(lambda: prefetch(level), 40)


def main():
    document["level-meadow"].bind("click", lambda ev: request_start("meadow"))
    document["level-mountain"].bind("click", lambda ev: request_start("mountain"))
    document["undo"].bind("click", lambda ev: do_undo())
    document["shuffle"].bind("click", lambda ev: do_shuffle())
    document["moveout"].bind("click", lambda ev: do_move())
    document["restart"].bind("click", lambda ev: request_start(ui["level"]))
    document["banner-next"].bind("click", lambda ev: banner_action())
    document["banner-stay"].bind("click", lambda ev: stay_here())
    document["pile"].bind("click", on_pile)
    document["chicken"].bind("click", catch_chicken)
    try:
        window.bind("resize", lambda ev: fit())
    except Exception:
        pass
    start("meadow")


ui = {
    "level": "meadow",
    "game": None,
    "history": [],
    "undo_left": 5,
    "shuffle_left": 2,
    "move_left": 1,
    "cells": [],
    "kinds": {},
    "pop": False,
    "banner_held": False,
    "busy": False,
    "ready_game": None,
    "ready_level": None,
    "chicken": False,
    "chicken_timer": None,
    "hop_rng": None,
    "chicken_x": None,
    "chicken_y": None,
    "chicken_gen": 0,
    "poops": [],
}

try:
    main()
except Exception as exc:
    document["status"].text = "页面没起来：" + str(exc)
