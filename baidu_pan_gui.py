import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os
import json
import requests
from urllib.parse import urlencode
import webbrowser
import csv

APP_KEY = "lLRDwc01kyO0uMP74KBJnSXmezJ0Beuq"
SECRET_KEY = "kwRdIN55ESajmlBVxovZfWvg6J1m9vt4"
REDIRECT_URI = "oob"
TOKEN_FILE = "baidu_token.json"
RESOURCE_DIR = "resource"

CATEGORY_KEYWORDS = {
    "考研初试": [
        "考研", "研究生", "硕士", "英语一", "英语二", "数学一", "数学二", "数学三",
        "张宇", "汤家凤", "李永乐", "肖秀荣", "徐涛", "腿姐", "396", "199", "Kira", "张翀",
        "余炳森"
    ],
    "考研复试": [
        "复试", "面试", "英语口语", "专业课", "导师", "调剂", "拟录取"
    ],
    "考公": [
        "公务员", "省考", "国考", "行测", "申论", "公考", "粉笔", "中公", "华图",
        "事业单位", "选调生", "面试", "国省考", "常识", "国省", "超值6+1", "超值7+1",
        "花生十三", "龙飞", "李梦娇", "袁东", "阿里木江", "郭熙", "大宝小宝",
        "安杰", "宋程", "宋捏捏", "雨菲", "晨宇", "张驰", "老牟", "大懒猫", "柳岩",
        "老闻", "鸿哥", "青菜白玉汤", "相丽君", "忧郁牛牛", "叽叽喳某某科小推车",
        "牟", "章意成", "顾斐", "郜爽", "赵月恒", "李一宁", "刘玉芳", "郝曜华",
        "柏刚", "赵建军", "张昌", "左宏帅", "肖超", "苏霖", "黄飞", "黄晓东",
        "韩伟杰", "贾半仙", "傅箭星", "彭升庭", "庄沛智", "张海鹏", "王吉",
        "李旭辉", "王宝平", "李贤民", "赵玲玲", "王仁法", "许凯", "菩提",
        "陈社育", "鲁尚", "王鹍", "系统班", "刷题班", "理论课", "专项班",
        "训练营", "模考", "冲刺", "点睛", "技巧", "考点", "精讲", "快解",
        "必做100题", "速记", "口诀", "刷题", "真题", "模拟", "CG", "上岸村"
    ],
    "四六级": [
        "四级", "六级", "CET4", "CET6", "英语四级", "英语六级", "四六级"
    ],
    "考证": [
        "注会", "CPA", "法考", "司法考试", "教师资格证", "教资", "建造师", "二建", "一建",
        "消防工程师", "会计初级", "会计中级", "经济师", "执业药师", "小黑"
    ]
}

class BaiduPanGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("百度网盘文件列表工具")
        self.root.geometry("750x600")
        self.root.resizable(True, True)
        
        if not os.path.exists(RESOURCE_DIR):
            os.makedirs(RESOURCE_DIR)
        
        csv_dir = os.path.join(RESOURCE_DIR, "csv")
        if not os.path.exists(csv_dir):
            os.makedirs(csv_dir)
        
        self.access_token = None
        self.current_files = []
        self.current_path = "/"
        self.path_history = ["/"]
        self.history_index = 0
        
        self.create_widgets()
        self.load_token()
    
    def create_widgets(self):
        top_frame = ttk.Frame(self.root, padding="10")
        top_frame.pack(fill=tk.X, expand=False)
        
        self.auth_btn = ttk.Button(top_frame, text="授权百度网盘", command=self.authorize)
        self.auth_btn.pack(side=tk.LEFT, padx=5)
        
        self.status_var = tk.StringVar()
        self.status_var.set("未授权")
        self.status_label = ttk.Label(top_frame, textvariable=self.status_var)
        self.status_label.pack(side=tk.LEFT, padx=10)
        
        nav_frame = ttk.Frame(self.root, padding="5")
        nav_frame.pack(fill=tk.X, expand=False)
        
        self.back_btn = ttk.Button(nav_frame, text="◀ 返回", command=self.go_back, state="disabled")
        self.back_btn.pack(side=tk.LEFT, padx=2)
        
        self.forward_btn = ttk.Button(nav_frame, text="▶ 前进", command=self.go_forward, state="disabled")
        self.forward_btn.pack(side=tk.LEFT, padx=2)
        
        self.parent_btn = ttk.Button(nav_frame, text="⬆ 上级", command=self.go_parent)
        self.parent_btn.pack(side=tk.LEFT, padx=2)
        
        self.path_label = ttk.Label(nav_frame, text="当前路径: /", background="#f0f0f0", padding="5")
        self.path_label.pack(side=tk.LEFT, padx=10, fill=tk.X, expand=True)
        
        middle_frame = ttk.Frame(self.root, padding="10")
        middle_frame.pack(fill=tk.BOTH, expand=True)
        
        list_frame = ttk.LabelFrame(middle_frame, text="文件列表（双击文件夹进入，勾选要获取二级目录的文件夹）", padding="10")
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree = ttk.Treeview(list_frame, columns=("check", "name", "type"), show="headings", yscrollcommand=scrollbar.set)
        self.tree.heading("check", text="选择")
        self.tree.heading("name", text="文件名")
        self.tree.heading("type", text="类型")
        self.tree.column("check", width=50, anchor="center")
        self.tree.column("name", width=500)
        self.tree.column("type", width=80)
        self.tree.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.tree.yview)
        
        self.tree.tag_configure('folder', foreground='#1976D2')
        self.tree.tag_configure('file', foreground='#424242')
        self.tree.tag_configure('checked', background='#e8f5e9')
        
        self.tree.bind('<Double-1>', self.on_double_click)
        
        bottom_frame = ttk.Frame(self.root, padding="10")
        bottom_frame.pack(fill=tk.X, expand=False)
        
        self.get_list_btn = ttk.Button(bottom_frame, text="刷新当前文件夹", command=self.refresh_current_folder)
        self.get_list_btn.pack(side=tk.LEFT, padx=5)
        
        self.generate_btn = ttk.Button(bottom_frame, text="获取选中文件夹的二级目录", command=self.generate_sub_files)
        self.generate_btn.pack(side=tk.LEFT, padx=5)
        
        self.select_all_btn = ttk.Button(bottom_frame, text="全选", command=self.select_all)
        self.select_all_btn.pack(side=tk.LEFT, padx=5)
        
        self.deselect_all_btn = ttk.Button(bottom_frame, text="取消全选", command=self.deselect_all)
        self.deselect_all_btn.pack(side=tk.LEFT, padx=5)
        
        self.classify_btn = ttk.Button(bottom_frame, text="生成分类JSON", command=self.run_classify)
        self.classify_btn.pack(side=tk.LEFT, padx=5)
    
    def load_token(self):
        if os.path.exists(TOKEN_FILE):
            try:
                with open(TOKEN_FILE, 'r', encoding='utf-8') as f:
                    token_data = json.load(f)
                    if token_data.get('access_token'):
                        self.access_token = token_data['access_token']
                        self.status_var.set("已授权")
                        self.load_folder("/")
                        return True
            except Exception as exc:
                print(f"读取本地token失败: {exc}")
        return False
    
    def authorize(self):
        auth_url = "https://openapi.baidu.com/oauth/2.0/authorize?" + urlencode({
            "response_type": "code",
            "client_id": APP_KEY,
            "redirect_uri": REDIRECT_URI,
            "scope": "basic,netdisk",
            "display": "popup"
        })
        
        webbrowser.open(auth_url)
        
        code_window = tk.Toplevel(self.root)
        code_window.title("输入授权码")
        code_window.geometry("400x150")
        code_window.transient(self.root)
        code_window.grab_set()
        
        ttk.Label(code_window, text="请输入授权后页面显示的 code：").pack(pady=10)
        code_var = tk.StringVar()
        code_entry = ttk.Entry(code_window, textvariable=code_var, width=40)
        code_entry.pack(pady=5)
        code_entry.focus()
        
        def get_token():
            code = code_var.get().strip()
            if not code:
                messagebox.showerror("错误", "请输入授权码")
                return
            
            token_url = "https://openapi.baidu.com/oauth/2.0/token"
            payload = {
                "grant_type": "authorization_code",
                "code": code,
                "client_id": APP_KEY,
                "client_secret": SECRET_KEY,
                "redirect_uri": REDIRECT_URI
            }
            
            try:
                res = requests.post(token_url, data=payload, timeout=20)
                token_data = res.json()
                
                if 'access_token' not in token_data:
                    messagebox.showerror("错误", f"获取token失败：{token_data}")
                    return
                
                with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
                    json.dump(token_data, f, ensure_ascii=False, indent=2)
                
                self.access_token = token_data['access_token']
                self.status_var.set("已授权")
                messagebox.showinfo("成功", "授权成功！")
                code_window.destroy()
                self.load_folder("/")
            except Exception as exc:
                messagebox.showerror("错误", f"网络请求失败：{exc}")
        
        ttk.Button(code_window, text="确定", command=get_token).pack(pady=10)
    
    def get_baidu_error_msg(self, errno):
        error_map = {
            -7: "请求路径不存在或者文件夹名不存在",
            -8: "请求权限被拒绝",
            -9: "频繁调用，请稍后再试",
            -10: "参数格式错误",
            -11: "用户尚未授权该应用",
            255: "云文件不存在",
        }
        return error_map.get(errno, f"未知错误码 {errno}")
    
    def list_files(self, dir_path="/"):
        if not self.access_token:
            messagebox.showerror("错误", "请先授权百度网盘")
            return None
        
        if not dir_path.startswith('/'):
            dir_path = '/' + dir_path
        
        url = "https://pan.baidu.com/rest/2.0/xpan/file"
        params = {
            "method": "list",
            "access_token": self.access_token,
            "dir": dir_path
        }
        
        try:
            resp = requests.get(url, params=params, timeout=20)
            data = resp.json()
            
            if data.get('errno') != 0:
                errno = data.get('errno')
                error_msg = self.get_baidu_error_msg(errno)
                messagebox.showerror("错误", f"API调用失败 [错误码 {errno}]：{error_msg}\n请求文件夹: {dir_path}")
                return None
            
            return data.get('list', [])
        except Exception as exc:
            messagebox.showerror("错误", f"网络请求失败：{exc}")
            return None
    
    def on_double_click(self, event):
        item_id = self.tree.identify('item', event.x, event.y)
        if not item_id:
            return
        
        values = self.tree.item(item_id, 'values')
        if len(values) < 3:
            return
        
        filename = values[1]
        file_type = values[2]
        
        if file_type == "文件夹":
            new_path = os.path.join(self.current_path, filename).replace('\\', '/')
            if not new_path.startswith('/'):
                new_path = '/' + new_path
            self.load_folder(new_path)
    
    def load_folder(self, path):
        if not self.access_token:
            return
        
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        files = self.list_files(path)
        if files is None:
            return
        
        self.current_files = files
        self.current_path = path
        
        self.path_label.config(text=f"当前路径: {path}")
        
        if self.history_index < len(self.path_history) - 1:
            self.path_history = self.path_history[:self.history_index + 1]
        self.path_history.append(path)
        self.history_index = len(self.path_history) - 1
        
        self.update_nav_buttons()
        
        for item in files:
            if item['isdir']:
                self.tree.insert("", tk.END, values=("", item['server_filename'], "文件夹"), tags=('folder',))
            else:
                self.tree.insert("", tk.END, values=("", item['server_filename'], "文件"), tags=('file',))
    
    def update_nav_buttons(self):
        self.back_btn.config(state="normal" if self.history_index > 0 else "disabled")
        self.forward_btn.config(state="normal" if self.history_index < len(self.path_history) - 1 else "disabled")
        self.parent_btn.config(state="normal" if self.current_path != "/" else "disabled")
    
    def go_back(self):
        if self.history_index > 0:
            self.history_index -= 1
            self.load_folder(self.path_history[self.history_index])
    
    def go_forward(self):
        if self.history_index < len(self.path_history) - 1:
            self.history_index += 1
            self.load_folder(self.path_history[self.history_index])
    
    def go_parent(self):
        if self.current_path != "/":
            parent_path = os.path.dirname(self.current_path)
            if not parent_path:
                parent_path = "/"
            self.load_folder(parent_path)
    
    def refresh_current_folder(self):
        self.load_folder(self.current_path)
    
    def get_selected_items(self):
        selected = []
        for item_id in self.tree.get_children():
            tags = self.tree.item(item_id, 'tags')
            if 'checked' in tags:
                values = self.tree.item(item_id, 'values')
                selected.append(values[1])
        return selected
    
    def select_all(self):
        for item_id in self.tree.get_children():
            values = self.tree.item(item_id, 'values')
            if values[2] == "文件夹":
                self.tree.item(item_id, tags=('checked',))
    
    def deselect_all(self):
        for item_id in self.tree.get_children():
            self.tree.item(item_id, tags=())
    
    def generate_sub_files(self):
        selected_names = self.get_selected_items()
        
        if not selected_names:
            messagebox.showinfo("提示", "请先勾选要获取二级目录的文件夹")
            return
        
        existing_data = {}
        json_file = os.path.join(RESOURCE_DIR, "detailed_files.json")
        if os.path.exists(json_file):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except:
                pass
        
        detailed_data = existing_data.copy()
        
        selected_count = 0
        for item in self.current_files:
            if item['isdir'] and item['server_filename'] in selected_names:
                selected_count += 1
                item_path = os.path.join(self.current_path, item['server_filename']).replace('\\', '/')
                item_info = {
                    '文件名': item['server_filename'],
                    '类型': '文件夹' if item['isdir'] else '文件'
                }
                
                if item['isdir']:
                    sub_files = self.list_files(item_path)
                    if sub_files:
                        sub_file_list = []
                        for sub_item in sub_files:
                            size = sub_item.get('size', 0)
                            size_str = self.format_size(size)
                            sub_file_list.append({
                                '文件名': sub_item['server_filename'],
                                '大小': size_str,
                                '类型': '文件夹' if sub_item['isdir'] else '文件'
                            })
                        item_info['二级文件'] = sub_file_list
                
                detailed_data[item['server_filename']] = item_info
        
        if selected_count == 0:
            messagebox.showinfo("提示", "没有选中任何文件夹")
            return
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(detailed_data, f, ensure_ascii=False, indent=2)
        
        messagebox.showinfo("成功", f"已获取 {selected_count} 个文件夹的二级文件信息")
    
    def format_size(self, size):
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        elif size < 1024 * 1024 * 1024:
            return f"{size / (1024 * 1024):.2f} MB"
        else:
            return f"{size / (1024 * 1024 * 1024):.2f} GB"
    
    def classify_item(self, filename):
        for category, keywords in CATEGORY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in filename:
                    return category
        return "其他"
    
    def load_detailed_json(self):
        json_file = os.path.join(RESOURCE_DIR, "detailed_files.json")
        if not os.path.exists(json_file):
            return {}
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            lowercase_data = {}
            for key, value in data.items():
                lowercase_key = key.lower()
                lowercase_data[lowercase_key] = value
            return lowercase_data
        except Exception as e:
            print(f"读取 JSON 文件时出错: {e}")
            return {}
    
    def load_csv_files(self, directory):
        csv_files = []
        for filename in os.listdir(directory):
            if filename.endswith('.csv'):
                file_path = os.path.join(directory, filename)
                csv_files.append(file_path)
        return csv_files
    
    def read_csv_file(self, file_path):
        data = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
        except Exception as e:
            print(f"读取文件 {file_path} 时出错: {e}")
        return data
    
    def run_classify(self):
        csv_dir = os.path.join(RESOURCE_DIR, "csv")
        if not os.path.exists(csv_dir):
            messagebox.showerror("错误", f"文件夹 {csv_dir} 不存在")
            return
        
        csv_files = self.load_csv_files(csv_dir)
        if not csv_files:
            messagebox.showinfo("提示", f"文件夹 {csv_dir} 中没有CSV文件")
            return
        
        detailed_data = self.load_detailed_json()
        
        category_data = {
            "考研初试": [],
            "考研复试": [],
            "考公": [],
            "四六级": [],
            "考证": [],
            "其他": []
        }
        
        for file_path in csv_files:
            items = self.read_csv_file(file_path)
            
            for item in items:
                filename = item.get('\ufeff文件名', '')
                if not filename:
                    filename = item.get('文件名', '')
                link = item.get('链接', '')
                
                if not filename or not link:
                    continue
                
                category = self.classify_item(filename)
                
                resource_item = {
                    '文件名': filename,
                    '链接': link
                }
                
                if filename.lower() in detailed_data:
                    sub_files = detailed_data[filename.lower()].get('二级文件', [])
                    if sub_files:
                        resource_item['二级文件'] = sub_files
                
                category_data[category].append(resource_item)
        
        for category, items in category_data.items():
            if items:
                output_file = os.path.join(RESOURCE_DIR, f"{category}.json")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(items, f, ensure_ascii=False, indent=2)
        
        messagebox.showinfo("成功", "分类完成！")

if __name__ == "__main__":
    root = tk.Tk()
    app = BaiduPanGUI(root)
    root.mainloop()
