import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin

# 目标导师名单（按您给出的顺序）
TARGET_NAMES = [
    "白海清", "任志贵", "侯红玲", "张昌明", "赵永强", "崔红", "张政武", "何亚银", "王燕燕", "舒林森",
    "王鹏", "王旭飞", "赵知辛", "王军利", "陈曼龙", "王楠", "崔立堃", "陈建刚", "景敏", "冯荣",
    "王明武", "叶伟", "王金元", "韩晋", "刘菊蓉", "朱永超", "黄崇莉", "魏伟锋", "田伟志", "曹岗林"
]

def normalize_name(name):
    """标准化姓名：去除空格和零宽空格"""
    return name.replace(" ", "").replace("\u200b", "")

LIST_URL = "https://jxxy.snut.edu.cn/szdw/yjsds.htm"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def get_html(url):
    """获取页面HTML，处理异常"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.encoding = 'utf-8'
        if resp.status_code == 200:
            return resp.text
        else:
            print(f"  请求失败 {url}，状态码：{resp.status_code}")
            return None
    except Exception as e:
        print(f"  请求异常 {url}：{e}")
        return None

def build_name_to_link_map(html, base_url):
    """从列表页构建 姓名 -> 个人主页链接 的映射"""
    soup = BeautifulSoup(html, 'html.parser')
    name_link_map = {}
    for a in soup.find_all('a', href=True):
        name = a.get_text(strip=True)
        if not name:
            continue
        href = a['href']
        full_href = urljoin(base_url, href)
        norm_name = normalize_name(name)
        if norm_name not in name_link_map:
            name_link_map[norm_name] = full_href
    return name_link_map

def extract_title_and_content(html):
    """从个人主页提取职称和表单内容"""
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()

    # 1. 提取职称
    title = "其他"
    match = re.search(r'职称[：:]\s*([^，。\n]{2,10})', text)
    if match:
        title_raw = match.group(1)
        if '教授' in title_raw and '副教授' not in title_raw:
            title = '教授'
        elif '副教授' in title_raw:
            title = '副教授'
        else:
            title = '其他'
    else:
        if '教授' in text and '副教授' not in text:
            title = '教授'
        elif '副教授' in text:
            title = '副教授'

    # 2. 提取 <form name="_newscontent_fromname"> 内的所有内容
    form = soup.find('form', attrs={'name': '_newscontent_fromname'})
    content = ""
    if form:
        # 获取表单内部的所有内容（不包含form标签本身）
        content = ''.join(str(child) for child in form.children).strip()
        # 可选：将相对链接转换为绝对链接（简单处理）
        # 这里暂不转换，因为展示时在同一域名下相对路径可能失效，但先保留原样
    else:
        print("  未找到表单 _newscontent_fromname")

    return title, content

def main():
    print("正在获取导师列表页...")
    list_html = get_html(LIST_URL)
    if not list_html:
        print("无法获取列表页，退出。")
        return

    name_link_map = build_name_to_link_map(list_html, LIST_URL)
    print(f"从列表页共提取到 {len(name_link_map)} 个有链接的导师信息")

    results = []
    for idx, raw_name in enumerate(TARGET_NAMES, 1):
        norm_name = normalize_name(raw_name)
        href = name_link_map.get(norm_name)
        print(f"[{idx}/{len(TARGET_NAMES)}] 处理导师：{raw_name}")

        if href:
            print(f"  个人主页：{href}")
            detail_html = get_html(href)
            if detail_html:
                title, content = extract_title_and_content(detail_html)
                print(f"  职称：{title}, 表单内容长度：{len(content)}")
            else:
                title, content = "其他", ""
                print("  无法获取页面")
            time.sleep(1)
        else:
            print("  未找到个人主页链接")
            title, content = "其他", ""

        results.append({
            "name": raw_name,
            "href": href,
            "title": title,
            "content": content   # 存储表单内容HTML
        })

    with open('mentors.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("处理完成，结果已保存至 mentors.json")

if __name__ == "__main__":
    main()