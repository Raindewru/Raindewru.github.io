import os
import csv
import json

# 分类关键词定义
CATEGORY_KEYWORDS = {
    "考研初试": [
        "考研", "研究生", "硕士", "英语一", "英语二", "数学一", "数学二", "数学三",
        "张宇", "汤家凤", "李永乐", "肖秀荣", "徐涛", "腿姐", "396", "199","Kira","张翀",
        "余炳森"
    ],
    "考研复试": [
        "复试", "面试", "英语口语", "专业课", "导师", "调剂", "拟录取"
    ],
    "考公": [
        "公务员", "省考", "国考", "行测", "申论", "公考", "粉笔", "中公", "华图",
        "事业单位", "选调生", "面试","国省考","常识","国省","超值6+1","超值7+1",
        "花生十三","龙飞","李梦娇","袁东","阿里木江","郭熙","大宝小宝"        # 公考常见术语
        "公务员", "省考", "国考", "行测", "申论", "公考", "事业单位", "选调生", "面试",
        # 知名讲师/机构（根据上面列表整理）
        "花生十三", "龙飞", "李梦娇", "袁东", "阿里木江", "郭熙", "安杰", "宋程", "宋捏捏",
        "雨菲", "大宝小宝", "晨宇", "张驰", "老牟", "大懒猫", "柳岩", "老闻", "鸿哥",
        "青菜白玉汤", "相丽君", "忧郁牛牛", "叽叽喳喳", "科小推车", "牟", "肖", "章意成",
        "顾斐", "郜爽", "赵月恒", "李一宁", "刘玉芳", "郝曜华", "柏刚", "赵建军", "张昌",
        "左宏帅", "肖超", "苏霖", "黄飞", "黄晓东", "韩伟杰", "贾半仙", "傅箭星", "彭升庭",
        "庄沛智", "张海鹏", "王吉", "李旭辉", "王宝平", "李贤民", "赵玲玲", "王仁法", "许凯",
        "菩提", "陈社育", "鲁尚", "王鹍",
        # 常见课程名称标识
        "系统班", "刷题班", "理论课", "专项班", "训练营", "模考", "冲刺", "点睛", "技巧",
        "考点", "精讲", "快解", "必做100题", "速记", "口诀", "刷题", "真题", "模拟",
        # 机构简称
        "CG", "上岸村", "华图", "中公", "粉笔"
    ],
    "四六级": [
        "四级", "六级", "CET4", "CET6", "英语四级", "英语六级", "四六级"
    ],
    "考证": [
        "注会", "CPA", "法考", "司法考试", "教师资格证", "教资", "建造师", "二建", "一建",
        "消防工程师", "会计初级", "会计中级", "经济师", "执业药师","小黑"
    ]
}

# 合并分类（保留考研初试和考研复试作为独立分类）
MERGED_CATEGORIES = {
    "考公": ["考公"],
    "四六级": ["四六级"],
    "考证": ["考证"]
}

def load_csv_files(directory):
    """加载目录下的所有CSV文件"""
    csv_files = []
    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            file_path = os.path.join(directory, filename)
            csv_files.append(file_path)
    return csv_files

def read_csv_file(file_path):
    """读取CSV文件内容"""
    data = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
    except Exception as e:
        print(f"读取文件 {file_path} 时出错: {e}")
    return data

def classify_item(item):
    """根据关键词对项目进行分类"""
    # 提取文件名（处理 UTF-8 BOM 编码）
    filename = item.get('\ufeff文件名', '')
    if not filename:
        filename = item.get('文件名', '')
    link = item.get('链接', '')
    
    # 遍历所有分类
    for category, keywords in CATEGORY_KEYWORDS.items():
        # 检查文件名是否包含任何关键词
        for keyword in keywords:
            if keyword in filename:
                return category
    
    # 特殊处理：检查是否包含特定关键词
    if '国考' in filename or '省考' in filename or '行测' in filename or '申论' in filename:
        return "考公"
    elif '一建' in filename or '二建' in filename or '消防' in filename or '会计' in filename or '税务师' in filename:
        return "考证"
    
    # 没有匹配到任何分类，返回"其他"
    return "其他"

def merge_categories(classified_data):
    """合并分类"""
    # 初始化合并后的分类，保留考研初试和考研复试
    merged = {
        "考研初试": [],
        "考研复试": [],
        "考公": [],
        "四六级": [],
        "考证": [],
        "其他": []
    }
    
    for category, items in classified_data.items():
        # 保留文件名、链接和二级文件信息
        filtered_items = []
        for item in items:
            # 提取文件名（处理 UTF-8 BOM 编码）
            filename = item.get('文件名', '')
            if not filename:
                filename = item.get('\ufeff文件名', '')
            link = item.get('链接', '')
            sub_files = item.get('二级文件', [])
            filtered_items.append({
                '文件名': filename,
                '链接': link,
                '二级文件': sub_files
            })
        
        if category in ["考研初试", "考研复试", "其他"]:
            # 保留独立分类
            merged[category].extend(filtered_items)
        else:
            # 查找合并后的分类
            for merged_cat, sub_cats in MERGED_CATEGORIES.items():
                if category in sub_cats:
                    merged[merged_cat].extend(filtered_items)
                    break
    
    return merged

def load_detailed_json():
    """加载详细的 JSON 数据"""
    json_file = os.path.join("resource", "detailed_files.json")
    if not os.path.exists(json_file):
        print(f"文件 {json_file} 不存在")
        return {}
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 创建一个小写版本的详细数据，用于匹配
        lowercase_data = {}
        for key, value in data.items():
            lowercase_key = key.lower()
            lowercase_data[lowercase_key] = value
        
        return lowercase_data
    except Exception as e:
        print(f"读取 JSON 文件时出错: {e}")
        return {}

def main():
    # 定义目录路径
    res_directory = "resource"
    
    # 检查目录是否存在
    if not os.path.exists(res_directory):
        print(f"目录 {res_directory} 不存在")
        return
    
    # 加载CSV文件
    csv_files = load_csv_files(res_directory)
    if not csv_files:
        print(f"目录 {res_directory} 中没有CSV文件")
        return
    
    print(f"找到 {len(csv_files)} 个CSV文件")
    for file in csv_files:
        print(f"  - {os.path.basename(file)}")
    
    # 读取所有CSV文件内容
    all_items = []
    for file_path in csv_files:
        items = read_csv_file(file_path)
        print(f"从 {os.path.basename(file_path)} 读取到 {len(items)} 个项目")
        all_items.extend(items)
    
    if not all_items:
        print("没有读取到任何数据")
        return
    
    print(f"总共读取到 {len(all_items)} 个项目")
    
    # 打印第一个项目的所有键，检查字段名
    if all_items:
        print("第一个项目的字段:")
        for key in all_items[0].keys():
            print(f"  - {repr(key)}")
        print("第一个项目的内容:")
        print(f"  文件名: {repr(all_items[0].get('\ufeff文件名', '不存在'))}")
        print(f"  链接: {repr(all_items[0].get('链接', '不存在'))}")
    
    # 加载详细 JSON 数据
    detailed_data = load_detailed_json()
    
    # 分类数据
    classified_data = {}
    for item in all_items:
        # 提取文件名（处理 UTF-8 BOM 编码）
        filename = item.get('\ufeff文件名', '')
        if not filename:
            filename = item.get('文件名', '')
        
        # 分类
        category = classify_item(item)
        
        # 检查是否有详细数据（使用小写匹配）
        if filename.lower() in detailed_data:
            # 添加二级文件信息
            item['二级文件'] = detailed_data[filename.lower()].get('二级文件', [])
        
        if category not in classified_data:
            classified_data[category] = []
        classified_data[category].append(item)
    
    print("分类结果:")
    for category, items in classified_data.items():
        print(f"  {category}: {len(items)} 个项目")
    
    # 合并分类
    merged_data = merge_categories(classified_data)
    
    # 保存为JSON文件
    output_file = os.path.join(res_directory, "classified_data.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"分类完成，结果保存到 {output_file}")
    
    # 打印分类统计
    print("合并后分类统计:")
    for category, items in merged_data.items():
        print(f"{category}: {len(items)} 个项目")

if __name__ == "__main__":
    main()