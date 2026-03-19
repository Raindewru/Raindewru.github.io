(function () {
    // 导航切换
    const navSpans = document.querySelectorAll('.nav-links span');
    const pages = {
        home: document.getElementById('homePage'),
        xuang: document.getElementById('xuangPage'),
        xingce: document.getElementById('xingcePage'),
        shenlun: document.getElementById('shenlunPage'),
        zhenti: document.getElementById('zhentiPage'),
        mingshi: document.getElementById('mingshiPage')
    };
    function switchPage(pageId) {
        Object.values(pages).forEach(p => p.classList.remove('active-page'));
        pages[pageId]?.classList.add('active-page');
        navSpans.forEach(span => {
            span.classList.toggle('active', span.dataset.page === pageId);
        });
    }
    navSpans.forEach(span => span.addEventListener('click', e => switchPage(e.target.dataset.page)));

    // 数据源
    const dataFiles = {
        overviewMd: 'data/各单位选岗概述.md', // 文件名与实际一致
        logicMd: 'data/选岗逻辑.md',
        strategyMd: 'data/选岗策略.md',
        categoryMd: 'data/单位分类.md',
        unitJson: 'data/单位简介及选岗参考.json'
    };

    // 状态
    const state = { units: [], categories: [], activeCategory: '' };
    const categoryTabsEl = document.getElementById('categoryTabs');
    const centerContent = document.getElementById('centerContent');

    // 工具
    const escapeHtml = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const labelBold = s => s.replace(/([^：\s]+)：/g, '<strong>$1</strong>：');

    function markdownToHtml(md) {
        const lines = md.split(/\r?\n/);
        const html = [];
        const listStack = []; // {type:'ul'|'ol', depth:int, last:number}
        let tableRows = [];

        const flushLists = depth => {
            while (listStack.length > depth) {
                const last = listStack.pop();
                if (last.type === 'ul') html.push('</ul>');
                else html.push('</ol>');
            }
        };

        const flushTable = () => {
            if (!tableRows.length) return;
            const [header, ...body] = tableRows;
            html.push('<table class="md-table">');
            html.push('<thead><tr>' + header.map(c => `<th>${labelBold(escapeHtml(c.trim()))}</th>`).join('') + '</tr></thead>');
            if (body.length) {
                html.push('<tbody>');
                body.forEach(r => html.push('<tr>' + r.map(c => `<td>${labelBold(escapeHtml(c.trim()))}</td>`).join('') + '</tr>'));
                html.push('</tbody>');
            }
            html.push('</table>');
            tableRows = [];
        };

        const isTableLine = line => /^\s*\|.*\|\s*$/.test(line);
        const parseRow = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
        const isSep = row => row.every(c => /^:?-{3,}:?$/.test(c.trim()));

        const listLine = line => {
            const m = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
            if (!m) return null;
            const indent = Math.floor((m[1] || '').length / 2);
            const type = m[2].endsWith('.') ? 'ol' : 'ul';
            const num = type === 'ol' ? parseInt(m[2], 10) : null;
            return { indent, type, num, text: m[3] };
        };

        lines.forEach(line => {
            // tables
            if (isTableLine(line)) {
                const row = parseRow(line);
                if (tableRows.length === 1 && isSep(row)) return;
                tableRows.push(row);
                return;
            }
            if (tableRows.length) flushTable();

            // lists
            const l = listLine(line);
            if (l) {
                flushLists(l.indent);
                const needNewList = !listStack.length || listStack[listStack.length - 1].type !== l.type || listStack[listStack.length - 1].depth !== l.indent;
                if (needNewList) {
                    if (l.type === 'ol') {
                        const startVal = l.num || 1; // 每个新有序列表默认从1开始，除非显式写明
                        html.push(startVal > 1 ? `<ol start="${startVal}">` : '<ol>');
                        listStack.push({ type: 'ol', depth: l.indent, last: startVal - 1 });
                    } else {
                        html.push('<ul>');
                        listStack.push({ type: 'ul', depth: l.indent, last: 0 });
                    }
                }
                const top = listStack[listStack.length - 1];
                if (top.type === 'ol') {
                    top.last += 1;
                }
                html.push('<li>' + labelBold(escapeHtml(l.text)) + '</li>');
                return;
            } else {
                flushLists(0);
            }

            // headings / paragraphs
            const h = line.match(/^(#{1,6})\s+(.*)$/);
            if (h) html.push(`<h${h[1].length}>${escapeHtml(h[2])}</h${h[1].length}>`);
            else if (line.trim() !== '') html.push('<p>' + labelBold(escapeHtml(line)) + '</p>');
        });

        flushTable();
        flushLists(0);
        return html.join('');
    }

    function setCenter(innerHtml) {
        centerContent.innerHTML = innerHtml;
    }

    function renderMd(title, path) {
        setCenter(`<div class="card-title">${escapeHtml(title)}</div><div class="md-content">加载中...</div>`);
        fetch(encodeURI(path))
            .then(r => r.ok ? r.text() : Promise.reject())
            .then(txt => {
                const content = txt.trim();
                centerContent.querySelector('.md-content').innerHTML = content ? markdownToHtml(content) : '<p>暂无内容</p>';
            })
            .catch(() => centerContent.querySelector('.md-content').innerHTML = '<p style="color:#b44d00;">无法加载文件</p>');
    }

    function renderCategoryTabs() {
        if (!categoryTabsEl) return;
        categoryTabsEl.innerHTML = state.categories.map(c => `<span class="tab-item ${c === state.activeCategory ? 'active-tab' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</span>`).join('');
        categoryTabsEl.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                state.activeCategory = tab.dataset.cat;
                renderCategoryTabs();
                renderUnitList();
            });
        });
    }

    function renderUnitList() {
        const list = state.units.filter(u => !state.activeCategory || u.category === state.activeCategory);
        const items = list.map(u => `
            <div class="unit-item" data-id="${u.id}">
                <span class="unit-name">${escapeHtml(u.name)}</span>
                <span class="unit-badge">选岗参考</span>
            </div>`).join('') || '<p>暂无数据</p>';
        setCenter(`<div class="card-title">📑 单位列表</div><div class="unit-grid">${items}</div>`);
        centerContent.querySelectorAll('.unit-item').forEach(item => {
            item.addEventListener('click', () => {
                const unit = state.units.find(u => u.id === Number(item.dataset.id));
                if (unit) renderUnitDetail(unit);
            });
        });
    }

    function renderUnitDetail(unit) {
        const toList = arr => arr?.length ? `<ul>${arr.map(i => `<li>${escapeHtml(i)}`).join('')}</ul>` : '<p>暂无</p>';
        setCenter(`
            <div class="card-title">📖 ${escapeHtml(unit.name)}</div>
            <div class="detail-row"><strong>主要职责：</strong>${escapeHtml(unit.main_responsibilities || '暂无')}</div>
            <div class="detail-row"><strong>工作内容：</strong>${toList(unit.work_content)}</div>
            <div class="detail-row"><strong>节奏与压力：</strong>${escapeHtml(unit.work_pace || '暂无')}</div>
            <div class="detail-row"><strong>发展空间：</strong>${escapeHtml(unit.development_space || '暂无')}</div>
            <div class="detail-row"><strong>适合专业：</strong>${escapeHtml(unit.suitable_majors || '暂无')}</div>
            <div class="detail-row"><strong>相对低压岗位：</strong>${escapeHtml(unit.lower_intensity_positions || '暂无')}</div>
            <button id="backToList" class="chip" style="margin-top:12px;">返回列表</button>
        `);
        document.getElementById('backToList')?.addEventListener('click', renderUnitList);
    }

    function loadUnitJson() {
        fetch(encodeURI(dataFiles.unitJson))
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(json => {
                state.units = Array.isArray(json) ? json : [];
                state.categories = [...new Set(state.units.map(u => u.category))];
                state.activeCategory = state.categories[0] || '';
                renderCategoryTabs();
                renderUnitList();
            })
            .catch(() => setCenter('<p style="color:#b44d00;">无法加载单位 JSON 数据</p>'));
    }

    function onNavModuleClick(key) {
        switch (key) {
            case 'logic': return renderMd('选岗逻辑', dataFiles.logicMd);
            case 'strategy': return renderMd('选岗策略', dataFiles.strategyMd);
            case 'categoryMd': return renderMd('单位分类', dataFiles.categoryMd);
            case 'overview': return renderMd('各单位选岗概览', dataFiles.overviewMd);
            case 'units':
            default: return renderUnitList();
        }
    }

    document.querySelectorAll('#xuangPage .nav-module li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('#xuangPage .nav-module li').forEach(x => x.classList.remove('active-module'));
            li.classList.add('active-module');
            onNavModuleClick(li.dataset.module);
        });
    });

    function initData() {
        loadUnitJson();      // 先加载 JSON 并默认进入“单位列表”
        onNavModuleClick('units');
    }

    switchPage('home');
    initData();
})();
