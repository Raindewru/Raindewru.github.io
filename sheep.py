"""羊了个羊这一类叠牌三消的规则。

纯 Python。页面上的操作由 Brython 调用这里。
牌只有没被上层压住时才能点。点进去进七格槽，三张一样的会消掉。
"""


class Tile(object):
    def __init__(self, tid, x, y, z, kind, where):
        self.tid = tid
        self.x = x
        self.y = y
        self.z = z
        self.kind = kind
        self.where = where

    def clone(self, kind=None, where=None):
        return Tile(
            self.tid,
            self.x,
            self.y,
            self.z,
            self.kind if kind is None else kind,
            self.where if where is None else where,
        )


class Game(object):
    def __init__(self, tiles, slot, pile, status):
        self.tiles = tiles
        self.slot = slot
        self.pile = pile
        self.status = status

    def derive(self, tiles, slot, pile, status):
        return Game(tiles, slot, pile, status)


SLOT_LIMIT = 7

LEVELS = ("meadow", "mountain")

KIND_NAMES = (
    "裂开",
    "无语",
    "震惊",
    "歪嘴",
    "哭唧",
    "墨镜",
    "吐舌",
    "生气",
    "睡着",
    "问号",
    "得意",
    "鬼脸",
)


def make_rng(seed):
    state = [seed & 0x7FFFFFFF or 1]

    def rng():
        state[0] = (1103515245 * state[0] + 12345) & 0x7FFFFFFF
        return state[0] / 2147483647.0

    return rng


def _choice(items, rng):
    return items[int(rng() * len(items)) % len(items)]


def _shuffled(items, rng):
    order = list(items)
    index = len(order) - 1
    while index > 0:
        swap = int(rng() * (index + 1))
        if swap > index:
            swap = index
        order[index], order[swap] = order[swap], order[index]
        index -= 1
    return order


def overlaps(a, b):
    return abs(a.x - b.x) < 1 and abs(a.y - b.y) < 1


def _by_id(tiles):
    found = {}
    for tile in tiles:
        found[tile.tid] = tile
    return found


def _index_for_count(count):
    known = _LAYOUT_INDEX.get("_counts")
    if not known:
        known = {}
        known[len(meadow_layout())] = "meadow"
        known[len(mountain_layout())] = "mountain"
        _LAYOUT_INDEX["_counts"] = known
    level_id = known.get(count)
    if level_id is None:
        return None
    return _layout_index(level_id)


def covered(tile, tiles):
    if tile.where != "board":
        return False
    index = _index_for_count(len(tiles))
    on_board = {}
    for other in tiles:
        if other.where == "board":
            on_board[other.tid] = True
    if index is None:
        for other in tiles:
            if other.where != "board" or other.tid == tile.tid:
                continue
            if other.z > tile.z and overlaps(tile, other):
                return True
        return False
    for other_id in index[1][tile.tid]:
        if on_board.get(other_id):
            return True
    return False


def clickable_ids(game):
    if game.status != "playing":
        return []
    free = []
    index = _index_for_count(len(game.tiles))
    if index is None:
        for tile in game.tiles:
            if tile.where == "board" and not covered(tile, game.tiles):
                free.append(tile.tid)
    else:
        covers = index[1]
        on_board = []
        count = len(game.tiles)
        i = 0
        while i < count:
            on_board.append(False)
            i += 1
        for tile in game.tiles:
            if tile.where == "board":
                on_board[tile.tid] = True
        i = 0
        while i < count:
            if on_board[i]:
                blocked = False
                for other_id in covers[i]:
                    if on_board[other_id]:
                        blocked = True
                        break
                if not blocked:
                    free.append(i)
            i += 1
    if game.pile:
        free.append(game.pile[-1])
    return free


def is_clickable(game, tid):
    return tid in clickable_ids(game)


def _clear_slot(slot, tiles):
    kinds = _by_id(tiles)
    counts = {}
    for tid in slot:
        kind = kinds[tid].kind
        counts[kind] = counts.get(kind, 0) + 1
    if not any(count >= 3 for count in counts.values()):
        return list(slot)
    kept = []
    for tid in slot:
        if counts[kinds[tid].kind] < 3:
            kept.append(tid)
    return kept


def _move_tile(tiles, tid, where):
    moved = []
    for tile in tiles:
        if tile.tid == tid:
            moved.append(tile.clone(where=where))
        else:
            moved.append(tile)
    return moved


def _finish(tiles, slot, pile):
    if any(tile.where == "board" for tile in tiles):
        return "playing"
    if slot or pile:
        return "playing"
    return "won"


def click(game, tid):
    if game.status != "playing":
        return game
    lookup = _by_id(game.tiles)
    tile = lookup.get(tid)
    if tile is None:
        return game
    if tile.where == "pile":
        if not game.pile or game.pile[-1] != tid:
            return game
        pile = list(game.pile[:-1])
    elif tile.where == "board":
        if covered(tile, game.tiles):
            return game
        pile = list(game.pile)
    else:
        return game
    slot = _clear_slot(list(game.slot) + [tid], game.tiles)
    slot_ids = set(slot)
    pile_ids = set(pile)
    settled = []
    for item in game.tiles:
        if item.tid in slot_ids:
            settled.append(item.clone(where="slot"))
        elif item.tid in pile_ids:
            settled.append(item.clone(where="pile"))
        elif item.tid == tid or item.where in ("slot", "pile"):
            settled.append(item.clone(where="gone"))
        else:
            settled.append(item)
    status = _finish(settled, slot, pile)
    if status == "playing" and len(slot) >= SLOT_LIMIT:
        status = "lost"
    return game.derive(settled, slot, pile, status)


def move_out(game):
    """把槽里最前面的最多三张摞到一旁，只露出最上面那张。"""
    if game.status != "playing" or not game.slot:
        return game
    take = list(game.slot[:3])
    rest = list(game.slot[3:])
    pile = list(game.pile) + take
    pile_ids = set(pile)
    slot_ids = set(rest)
    tiles = []
    for tile in game.tiles:
        if tile.tid in pile_ids:
            tiles.append(tile.clone(where="pile"))
        elif tile.tid in slot_ids:
            tiles.append(tile.clone(where="slot"))
        else:
            tiles.append(tile)
    return game.derive(tiles, rest, pile, "playing")


def shuffle_board(game, rng):
    if game.status != "playing":
        return game
    board = [tile for tile in game.tiles if tile.where == "board"]
    if len(board) < 2:
        return game
    kinds = _shuffled([tile.kind for tile in board], rng)
    assigned = {}
    for tile, kind in zip(board, kinds):
        assigned[tile.tid] = kind
    tiles = []
    for tile in game.tiles:
        if tile.tid in assigned:
            tiles.append(tile.clone(kind=assigned[tile.tid]))
        else:
            tiles.append(tile)
    return game.derive(tiles, list(game.slot), list(game.pile), game.status)


def board_left(game):
    return sum(1 for tile in game.tiles if tile.where == "board")


def _mask_layer(rows, z, ox, oy):
    positions = []
    for y, row in enumerate(rows):
        for x, cell in enumerate(row):
            if cell == "#":
                positions.append((ox + x, oy + y, z))
    return positions


def _rect_layer(x0, y0, width, height, z):
    positions = []
    y = 0
    while y < height:
        x = 0
        while x < width:
            positions.append((x0 + x, y0 + y, z))
            x += 1
        y += 1
    return positions


def _stagger(x0, y0, z, cols, rows, dx, dy, shift):
    positions = []
    y = 0
    while y < rows:
        x = 0
        nudge = shift if y % 2 else 0
        while x < cols:
            positions.append((x0 + x * dx + nudge, y0 + y * dy, z))
            x += 1
        y += 1
    return positions


def meadow_layout():
    """第一关：九张牌，点几下就会，用来认规则。"""
    return [
        (0.0, 0.15, 0),
        (1.2, 0.0, 0),
        (2.35, 0.2, 0),
        (0.25, 1.3, 0),
        (1.45, 1.15, 0),
        (2.55, 1.35, 0),
        (0.62, 0.48, 1),
        (1.78, 0.38, 1),
        (1.15, 1.0, 1),
    ]


def mountain_layout():
    """第二关：中间一块方阵，左边和底下露出叠层，另外三张伸在外面。"""
    positions = []
    cols = 6
    rows = 5
    depth = 8
    z = 0
    while z < depth:
        stick = (depth - 1 - z) * 0.075
        y = 0
        while y < rows:
            x = 0
            while x < cols:
                positions.append((x + stick * 0.25, y + stick, z))
                x += 1
            y += 1
        if z < depth - 1:
            y = 1
            while y <= 3:
                positions.append((-0.78, y + stick * 0.2, z))
                y += 1
        z += 1
    top = depth
    covers = (
        (0.48, 0.48),
        (2.48, 0.48),
        (4.48, 0.48),
        (0.48, 2.48),
        (2.48, 2.48),
        (4.48, 2.48),
        (0.48, 4.12),
        (2.48, 4.12),
        (4.52, 4.12),
    )
    for cover in covers:
        positions.append((cover[0], cover[1], top))
    positions.append((-1.25, 2.05, top))
    positions.append((0.1, 5.35, top))
    positions.append((5.25, 5.45, top))
    return positions


def layout_for(level_id):
    if level_id == "mountain":
        return mountain_layout()
    return meadow_layout()


def kind_count_for(level_id):
    if level_id == "mountain":
        return 12
    return 3


def _kind_bag(total, kinds):
    if total % 3 != 0:
        raise ValueError("牌数必须是 3 的倍数")
    triples = total // 3
    base = triples // kinds
    extra = triples % kinds
    bag = []
    kind = 0
    while kind < kinds:
        amount = (base + (1 if kind < extra else 0)) * 3
        bag.extend([kind] * amount)
        kind += 1
    return bag


def _exposed(tiles):
    free = []
    for tile in tiles:
        if tile.where == "board" and not covered(tile, tiles):
            free.append(tile)
    return free


def _removal_order(tiles, rng):
    remaining = [tile.clone() for tile in tiles]
    order = []
    while True:
        free = _exposed(remaining)
        if not free:
            break
        if rng() < 0.7:
            top = max(tile.z for tile in free)
            pool = [tile for tile in free if tile.z == top]
        else:
            pool = free
        picked = _choice(pool, rng)
        order.append(picked.tid)
        remaining = _move_tile(remaining, picked.tid, "gone")
    if len(order) != len(tiles):
        raise ValueError("有牌永远被压住")
    return order


def _take(groups, rng, blocked):
    for group in groups:
        pool = [kind for kind in group if kind not in blocked]
        if pool:
            return _choice(pool, rng)
    return None


def _script(order_len, bag, rng, pressure, tight=False, surface_flags=None):
    remaining = {}
    for kind in bag:
        remaining[kind] = remaining.get(kind, 0) + 1
    dock = {}
    sequence = []
    on_surface = set()
    while sum(remaining.values()) > 0:
        dock_len = sum(dock.values())
        pairs = [kind for kind, count in dock.items() if count == 2 and remaining.get(kind, 0) > 0]
        singles = [kind for kind, count in dock.items() if count == 1 and remaining.get(kind, 0) > 0]
        fresh = [kind for kind, count in remaining.items() if count > 0 and dock.get(kind, 0) == 0]
        hide = bool(surface_flags and surface_flags[len(sequence)])
        blocked = on_surface if hide else ()
        if tight:
            # 能过的那条路自己也把槽用到五六格。露在外面的牌不给成对的图案。
            if dock_len >= 5:
                groups = [pairs, singles]
                if dock_len < 6:
                    groups.append(fresh)
                kind = _take(groups, rng, blocked)
            elif singles and dock_len >= 2 and rng() < 0.7:
                kind = _take([singles, fresh, pairs], rng, blocked)
            elif fresh and dock_len < 4:
                kind = _take([fresh, singles, pairs], rng, blocked)
            else:
                kind = _take([singles, fresh, pairs], rng, blocked)
            if kind is None:
                return None
        elif dock_len >= 6:
            if not pairs:
                return None
            kind = _choice(pairs, rng)
        elif pairs and (dock_len >= 4 or rng() < pressure):
            kind = _choice(pairs, rng)
        elif singles and (len(singles) >= 3 or not fresh or rng() < 0.55):
            kind = _choice(singles, rng)
        elif fresh:
            kind = _choice(fresh, rng)
        elif singles:
            kind = _choice(singles, rng)
        elif pairs:
            kind = _choice(pairs, rng)
        else:
            return None
        sequence.append(kind)
        if hide:
            on_surface.add(kind)
        remaining[kind] -= 1
        dock[kind] = dock.get(kind, 0) + 1
        if dock[kind] == 3:
            dock[kind] = 0
        if sum(dock.values()) >= SLOT_LIMIT:
            return None
    if len(sequence) != order_len:
        return None
    return sequence


def _surface_counts(tiles):
    counts = {}
    for tile in tiles:
        if tile.where == "board" and not covered(tile, tiles):
            counts[tile.kind] = counts.get(tile.kind, 0) + 1
    return counts


_LAYOUT_INDEX = {}


def _layout_index(level_id):
    cached = _LAYOUT_INDEX.get(level_id)
    if cached is not None:
        return cached
    positions = layout_for(level_id)
    count = len(positions)
    covers = []
    dependents = []
    index = 0
    while index < count:
        covers.append([])
        dependents.append([])
        index += 1
    index = 0
    while index < count:
        ax, ay, az = positions[index]
        other = 0
        while other < count:
            bx, by, bz = positions[other]
            if bz > az and abs(ax - bx) < 1 and abs(ay - by) < 1:
                covers[index].append(other)
                dependents[other].append(index)
            other += 1
        index += 1
    exposed = []
    index = 0
    while index < count:
        exposed.append(len(covers[index]) == 0)
        index += 1
    zs = []
    index = 0
    while index < count:
        zs.append(positions[index][2])
        index += 1
    cached = (positions, covers, dependents, exposed, zs)
    _LAYOUT_INDEX[level_id] = cached
    return cached


def _removal_order_indexed(covers, dependents, exposed, zs, rng, dig=False):
    count = len(covers)
    left = []
    alive = []
    free = []
    index = 0
    while index < count:
        left.append(len(covers[index]))
        alive.append(True)
        if exposed[index]:
            free.append(index)
        index += 1
    order = []
    while free:
        top = zs[free[0]]
        index = 1
        while index < len(free):
            if zs[free[index]] > top:
                top = zs[free[index]]
            index += 1
        cap = []
        lower = []
        index = 0
        while index < len(free):
            if zs[free[index]] == top:
                cap.append(free[index])
            else:
                lower.append(free[index])
            index += 1
        if dig and lower and rng() < 0.82:
            pool = lower
        elif rng() < 0.7:
            pool = cap
        else:
            pool = free
        picked = _choice(pool, rng)
        kept = []
        index = 0
        while index < len(free):
            if free[index] != picked:
                kept.append(free[index])
            index += 1
        free = kept
        alive[picked] = False
        deps = dependents[picked]
        index = 0
        while index < len(deps):
            dep = deps[index]
            left[dep] -= 1
            if left[dep] == 0 and alive[dep]:
                free.append(dep)
            index += 1
        order.append(picked)
    if len(order) != count:
        raise ValueError("有牌永远被压住")
    return order


def deal(level_id, rng=None, attempts=40):
    game, _order = deal_with_order(level_id, rng, attempts)
    return game


def deal_with_order(level_id, rng=None, attempts=40):
    if rng is None:
        rng = make_rng(1)
    positions, covers, dependents, exposed, zs = _layout_index(level_id)
    total = len(positions)
    if total % 3 != 0:
        raise ValueError("关卡牌数不是 3 的倍数：%d" % total)
    kinds = kind_count_for(level_id)
    exposed_n = 0
    index = 0
    while index < len(exposed):
        if exposed[index]:
            exposed_n += 1
        index += 1
    tight = level_id == "mountain" and exposed_n <= kinds
    if level_id == "mountain":
        attempts = max(attempts, 80)
    pressure = 0.18 if tight else 0.2
    blank = []
    index = 0
    while index < total:
        pos = positions[index]
        blank.append(Tile(index, pos[0], pos[1], pos[2], 0, "board"))
        index += 1
    attempt = 0
    while attempt < attempts:
        attempt += 1
        order = _removal_order_indexed(covers, dependents, exposed, zs, rng, tight)
        flags = None
        if tight:
            flags = []
            index = 0
            while index < len(order):
                flags.append(exposed[order[index]])
                index += 1
        bag = _shuffled(_kind_bag(total, kinds), rng)
        sequence = _script(total, bag, rng, pressure, tight, flags)
        if sequence is None:
            continue
        kind_of = [0] * total
        index = 0
        while index < total:
            kind_of[order[index]] = sequence[index]
            index += 1
        tiles = []
        index = 0
        while index < total:
            tiles.append(blank[index].clone(kind=kind_of[index]))
            index += 1
        return Game(tiles, [], [], "playing"), order
    raise ValueError("这一关没铺出来")


def play_order(game, order):
    current = game
    for tid in order:
        current = click(current, tid)
        if current.status == "lost":
            return current
    return current
