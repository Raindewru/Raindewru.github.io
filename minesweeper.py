"""扫雷规则。

纯 Python，不碰页面。浏览器里由 Brython 执行，测试用 CPython 直接跑。
"""


class Cell(object):
    def __init__(self, mine, adjacent, revealed, mark):
        self.mine = mine
        self.adjacent = adjacent
        self.revealed = revealed
        self.mark = mark

    def clone(self):
        return Cell(self.mine, self.adjacent, self.revealed, self.mark)


class Game(object):
    def __init__(self, rows, cols, mines, cells, status, hit, armed):
        self.rows = rows
        self.cols = cols
        self.mines = mines
        self.cells = cells
        self.status = status
        self.hit = hit
        self.armed = armed

    def derive(self, cells, status, hit, armed):
        return Game(self.rows, self.cols, self.mines, cells, status, hit, armed)


PRESETS = (
    {"id": "beginner", "label": "初级", "rows": 9, "cols": 9, "mines": 10, "blurb": "热身"},
    {"id": "intermediate", "label": "中级", "rows": 16, "cols": 16, "mines": 40, "blurb": "正经一局"},
    {"id": "expert", "label": "高级", "rows": 16, "cols": 30, "mines": 99, "blurb": "夜班"},
)

MARKS = ("none", "flag", "question")

_fallback_seed = [1]


def preset(diff_id):
    for item in PRESETS:
        if item["id"] == diff_id:
            return item
    return PRESETS[0]


def new_preset_game(diff_id):
    item = preset(diff_id)
    return create_game(item["rows"], item["cols"], item["mines"])


def create_game(rows, cols, mines):
    if type(rows) is not int or type(cols) is not int or rows < 1 or cols < 1:
        raise ValueError("棋盘尺寸不合法")
    total = rows * cols
    if type(mines) is not int or mines < 1 or mines >= total:
        raise ValueError("雷数不合法")
    cells = [Cell(False, 0, False, "none") for _ in range(total)]
    return Game(rows, cols, mines, cells, "ready", None, False)


def neighbors(rows, cols, index):
    row = index // cols
    col = index % cols
    found = []
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            next_row = row + dr
            next_col = col + dc
            if next_row < 0 or next_col < 0 or next_row >= rows or next_col >= cols:
                continue
            found.append(next_row * cols + next_col)
    return found


def with_mines(state, mine_indices):
    if len(mine_indices) != state.mines:
        raise ValueError("雷数与名单不一致")
    mine_set = set(mine_indices)
    if len(mine_set) != len(mine_indices):
        raise ValueError("雷的位置重复了")
    total = state.rows * state.cols
    for index in mine_indices:
        if type(index) is not int or index < 0 or index >= total:
            raise ValueError("雷的位置超出棋盘")
    cells = []
    for index in range(total):
        cells.append(Cell(index in mine_set, 0, False, "none"))
    for index in range(total):
        if cells[index].mine:
            continue
        count = 0
        for near in neighbors(state.rows, state.cols, index):
            if cells[near].mine:
                count += 1
        cells[index] = Cell(False, count, False, "none")
    return state.derive(cells, "playing" if state.status == "ready" else state.status, None, True)


def _fallback_rng():
    _fallback_seed[0] = (1103515245 * _fallback_seed[0] + 12345) & 0x7FFFFFFF
    return _fallback_seed[0] / 2147483647.0


def make_rng(seed):
    state = [seed & 0x7FFFFFFF or 1]

    def rng():
        state[0] = (1103515245 * state[0] + 12345) & 0x7FFFFFFF
        return state[0] / 2147483647.0

    return rng


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


def arm_game(state, safe_index, rng=None):
    """第一下落子的格子不放雷。棋盘够大时，它周围八格也不放。"""
    if rng is None:
        rng = _fallback_rng
    if state.armed or state.status in ("won", "lost"):
        return state
    total = state.rows * state.cols
    if safe_index < 0 or safe_index >= total:
        return state
    protected = set([safe_index] + neighbors(state.rows, state.cols, safe_index))
    pool = []
    for index in range(total):
        if index not in protected:
            pool.append(index)
    if len(pool) < state.mines:
        pool = []
        for index in range(total):
            if index != safe_index:
                pool.append(index)
    if len(pool) < state.mines:
        return state
    return with_mines(state, _shuffled(pool, rng)[: state.mines])


def _open_area(cells, rows, cols, start):
    opened = [cell.clone() for cell in cells]
    stack = [start]
    while stack:
        index = stack.pop()
        cell = opened[index]
        if cell.revealed or cell.mark == "flag" or cell.mine:
            continue
        opened[index] = Cell(cell.mine, cell.adjacent, True, "none")
        if cell.adjacent != 0:
            continue
        for near in neighbors(rows, cols, index):
            other = opened[near]
            if (not other.revealed) and other.mark != "flag" and (not other.mine):
                stack.append(near)
    return opened


def _safe_open(cells):
    for cell in cells:
        if (not cell.mine) and (not cell.revealed):
            return False
    return True


def _flag_mines(cells):
    flagged = []
    for cell in cells:
        if cell.mine and not cell.revealed:
            flagged.append(Cell(True, cell.adjacent, False, "flag"))
        else:
            flagged.append(cell.clone())
    return flagged


def _show_mines(cells, hit):
    shown = []
    for index, cell in enumerate(cells):
        if index == hit or (cell.mine and cell.mark != "flag"):
            shown.append(Cell(cell.mine, cell.adjacent, True, "none"))
        else:
            shown.append(cell.clone())
    return shown


def reveal(state, index, rng=None):
    if rng is None:
        rng = _fallback_rng
    if state.status in ("won", "lost"):
        return state
    if index < 0 or index >= len(state.cells):
        return state
    current = state.cells[index]
    if current.revealed or current.mark == "flag":
        return state
    armed = state if state.armed else arm_game(state, index, rng)
    target = armed.cells[index]
    if target.mark == "flag":
        return armed
    if target.mine:
        return armed.derive(_show_mines(armed.cells, index), "lost", index, True)
    opened = _open_area(armed.cells, armed.rows, armed.cols, index)
    if _safe_open(opened):
        return armed.derive(_flag_mines(opened), "won", None, True)
    return armed.derive(opened, "playing", None, True)


def cycle_mark(state, index):
    if state.status in ("won", "lost"):
        return state
    if index < 0 or index >= len(state.cells):
        return state
    cell = state.cells[index]
    if cell.revealed:
        return state
    mark = MARKS[(MARKS.index(cell.mark) + 1) % 3]
    cells = [item.clone() for item in state.cells]
    cells[index] = Cell(cell.mine, cell.adjacent, False, mark)
    return state.derive(cells, state.status, state.hit, state.armed)


def chord(state, index, rng=None):
    """数字周围的旗子数量对上之后，掀开其余格子。旗错了就会踩雷。"""
    if rng is None:
        rng = _fallback_rng
    if state.status != "playing":
        return state
    if index < 0 or index >= len(state.cells):
        return state
    cell = state.cells[index]
    if (not cell.revealed) or cell.adjacent == 0:
        return state
    around = neighbors(state.rows, state.cols, index)
    flags = 0
    for near in around:
        if state.cells[near].mark == "flag":
            flags += 1
    if flags != cell.adjacent:
        return state
    current = state
    for near in around:
        other = current.cells[near]
        if other.revealed or other.mark == "flag":
            continue
        current = reveal(current, near, rng)
        if current.status == "lost":
            return current
    return current


def flag_count(state):
    total = 0
    for cell in state.cells:
        if cell.mark == "flag":
            total += 1
    return total


def remaining_mines(state):
    return state.mines - flag_count(state)


def format_counter(value):
    """三位计数：007、042，负数写成 -01。"""
    number = int(value)
    if number < 0:
        magnitude = -number
        if magnitude > 99:
            magnitude = 99
        return "-%02d" % magnitude
    if number > 999:
        number = 999
    return "%03d" % number
