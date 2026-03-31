from pathlib import Path
import json
path = Path('cr/index.html')
text = path.read_text(encoding='utf-8')
start = text.index('const fullQAData = [')
end = text.index('];', start) + 
json_text = text[text.index('[', start):end]
data = json.loads(json_text)
for item in data:
    if item['id'] == 1:
        item['answer'] = '主运动：形成切削、切下切屑最基本、最主要的相对运动，速度最高、消耗功率最大。\\n进给运动：使切削层不断投入切削，从而加工出完整工件表面的运动。'
    if item['id'] == 2:
        item['answer'] = '外传动链：动力源与执行件之间的传动链。\\n内传动链：有严格运动关系的执行件之间的传动链。'
    if item['id'] == 8:
        item['answer'] = '顺铣：铣刀切削速度方向与工件进给方向相同。\\n特点：切削轻快，表面质量好，刀具磨损小；垂直分力向下，工件夹紧稳定；水平分力与进给同向，丝杠有间隙易造成工作台窜动、打刀；刀具先切硬皮，不适宜带硬皮毛坯，多用于精加工。'
    if item['id'] == 9:
        item['answer'] = '逆铣：切削速度方向与工件进给方向相反。\\n特点：切削厚度由零渐增，刀刃挤压滑行，刀具磨损大；切削力上抬工件，易振动；不会造成工作台窜动，适合带硬皮毛坯粗加工。'
    if item['id'] == 17:
        item['answer'] = '(1)铰刀刚性好、导向性好，切削余量小，容易保证孔的尺寸精度和形状精度。\\n(2)铰孔切削速度低、切削力小，加工表面质量好，粗糙度值小。\\n(3)不能校正原有孔的轴线歪斜，孔的位置精度主要由前道工序保证。\\n(4)仅靠钻一扩一铰工艺，难以保证孔与孔之间的位置精度。'
new_json = json.dumps(data, ensure_ascii=False, indent=2)
json_start = text.index('[', start)
result = text[:json_start] + new_json + text[end:]
path.write_text(result, encoding='utf-8')
