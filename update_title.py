import json
import re

with open('c:/Users/WYL21/Desktop/freefile/ds/teachers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for teacher in data:
    html = teacher.get('html', '')
    match = re.search(r'职务职称.*?<td[^>]*>(.*?)</td>', html, re.DOTALL)
    if match:
        title_html = match.group(1)
        title = re.sub(r'<[^>]+>', '', title_html).strip()
        if '副教授' in title:
            teacher['title'] = '副教授'
        elif '教授' in title:
            teacher['title'] = '教授'
        else:
            teacher['title'] = '其他'
    else:
        teacher['title'] = '其他'

counts = {'教授': 0, '副教授': 0, '其他': 0}
for t in data:
    title = t.get('title', '其他')
    counts[title] = counts.get(title, 0) + 1

print(f'教授: {counts["教授"]}')
print(f'副教授: {counts["副教授"]}')
print(f'其他: {counts["其他"]}')

with open('c:/Users/WYL21/Desktop/freefile/ds/teachers.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('更新完成')
