import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os
import json
import requests
from urllib.parse import urlencode
import webbrowser

# ========== 配置你的应用信息 ==========
APP_KEY = "lLRDwc01kyO0uMP74KBJnSXmezJ0Beuq"      # AppKey（即API Key）
SECRET_KEY = "kwRdIN55ESajmlBVxovZfWvg6J1m9vt4"   # SecretKey
APP_ID = "122234347"                               # AppID（某些接口需要）
REDIRECT_URI = "oob"                               # 使用oob模式，授权码会显示在页面
TOKEN_FILE = "baidu_token.json"                     # 保存token的文件
RESOURCE_DIR = "resource"                           # 保存文件名的目录
# =====================================

class BaiduPanGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("百度网盘文件列表工具")
        self.root.geometry("600x500")
        self.root.resizable(True, True)
        
        # 确保 resource 目录存在
        if not os.path.exists(RESOURCE_DIR):
            os.makedirs(RESOURCE_DIR)
        
        # 全局变量
        self.access_token = None
        
        # 创建界面
        self.create_widgets()
        
        # 尝试加载 token
        self.load_token()
    
    def create_widgets(self):
        # 顶部框架
        top_frame = ttk.Frame(self.root, padding="10")
        top_frame.pack(fill=tk.X, expand=False)
        
        # 授权按钮
        self.auth_btn = ttk.Button(top_frame, text="授权百度网盘", command=self.authorize)
        self.auth_btn.pack(side=tk.LEFT, padx=5)
        
        # 状态标签
        self.status_var = tk.StringVar()
        self.status_var.set("未授权")
        self.status_label = ttk.Label(top_frame, textvariable=self.status_var)
        self.status_label.pack(side=tk.LEFT, padx=10)
        
        # 中间框架
        middle_frame = ttk.Frame(self.root, padding="10")
        middle_frame.pack(fill=tk.BOTH, expand=True)
        
        # 目录输入
        dir_frame = ttk.LabelFrame(middle_frame, text="网盘目录", padding="10")
        dir_frame.pack(fill=tk.X, expand=False, pady=5)
        
        ttk.Label(dir_frame, text="目录路径:").pack(side=tk.LEFT, padx=5)
        self.dir_var = tk.StringVar(value="/")
        self.dir_entry = ttk.Entry(dir_frame, textvariable=self.dir_var, width=50)
        self.dir_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        # 列表框架
        list_frame = ttk.LabelFrame(middle_frame, text="文件列表", padding="10")
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # 滚动条
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 列表视图
        self.tree = ttk.Treeview(list_frame, columns=("name", "type"), show="headings", yscrollcommand=scrollbar.set)
        self.tree.heading("name", text="文件名")
        self.tree.heading("type", text="类型")
        self.tree.column("name", width=400)
        self.tree.column("type", width=100)
        self.tree.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.tree.yview)
        
        # 底部框架
        bottom_frame = ttk.Frame(self.root, padding="10")
        bottom_frame.pack(fill=tk.X, expand=False)
        
        # 获取列表按钮
        self.get_list_btn = ttk.Button(bottom_frame, text="获取文件列表", command=self.get_file_list)
        self.get_list_btn.pack(side=tk.LEFT, padx=5)
        
        # 生成链接按钮
        self.generate_links_btn = ttk.Button(bottom_frame, text="生成详细信息", command=self.generate_links)
        self.generate_links_btn.pack(side=tk.LEFT, padx=5)
    
    def load_token(self):
        """尝试加载本地 token"""
        if os.path.exists(TOKEN_FILE):
            try:
                with open(TOKEN_FILE, 'r', encoding='utf-8') as f:
                    token_data = json.load(f)
                    if token_data.get('access_token'):
                        self.access_token = token_data['access_token']
                        self.status_var.set("已授权")
                        return True
            except Exception as exc:
                print(f"读取本地token失败: {exc}")
        return False
    
    def authorize(self):
        """授权获取 access_token"""
        # 1. 获取授权码（code）
        auth_url = "https://openapi.baidu.com/oauth/2.0/authorize?" + urlencode({
            "response_type": "code",
            "client_id": APP_KEY,
            "redirect_uri": REDIRECT_URI,
            "scope": "basic,netdisk",   # 需要网盘权限
            "display": "popup"
        })
        
        # 打开浏览器
        webbrowser.open(auth_url)
        
        # 弹出输入框
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
            
            # 2. 用code换取access_token
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
                
                # 保存到文件
                with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
                    json.dump(token_data, f, ensure_ascii=False, indent=2)
                
                self.access_token = token_data['access_token']
                self.status_var.set("已授权")
                messagebox.showinfo("成功", "授权成功！")
                code_window.destroy()
            except Exception as exc:
                messagebox.showerror("错误", f"网络请求失败：{exc}")
        
        ttk.Button(code_window, text="确定", command=get_token).pack(pady=10)
    
    def get_baidu_error_msg(self, errno):
        """返回百度API错误码的中文解释"""
        error_map = {
            -7: "请求路径不存在或者目录名不存在（check 'dir' 参数）",
            -8: "请求权限被拒绝",
            -9: "频繁调用，请稍后再试",
            -10: "参数格式错误",
            -11: "用户尚未授权该应用",
            255: "云文件不存在",
        }
        return error_map.get(errno, f"未知错误码 {errno}，详见百度网盘API文档")
    
    def list_files(self, dir_path="/"):
        """调用文件列表接口"""
        if not self.access_token:
            messagebox.showerror("错误", "请先授权百度网盘")
            return None
        
        # 自动修正路径格式（确保以 / 开头）
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
                messagebox.showerror("错误", f"API调用失败 [错误码 {errno}]：{error_msg}\n请求目录: {dir_path}")
                return None
            
            return data.get('list', [])
        except Exception as exc:
            messagebox.showerror("错误", f"网络请求失败：{exc}")
            return None
    
    def get_file_list(self):
        """获取文件列表并显示"""
        dir_path = self.dir_var.get().strip() or "/"
        
        # 清空树
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # 获取文件列表
        files = self.list_files(dir_path)
        if files is None:
            return
        
        # 显示文件列表
        for item in files:
            if item['isdir']:
                self.tree.insert("", tk.END, values=(item['server_filename'], "目录"))
            else:
                self.tree.insert("", tk.END, values=(item['server_filename'], "文件"))
        
        messagebox.showinfo("成功", f"已获取目录 {dir_path} 的文件列表")
    
    def generate_links(self):
        """生成文件和目录链接，包括二级文件"""
        dir_path = self.dir_var.get().strip() or "/"
        
        # 获取文件列表
        files = self.list_files(dir_path)
        if files is None:
            return
        
        if not files:
            messagebox.showinfo("提示", "该目录下没有文件或子目录")
            return
        
        # 生成包含二级文件的 JSON 数据
        self.generate_detailed_json(dir_path, files)
        
        messagebox.showinfo("成功", f"已生成 {len(files)} 个文件/目录的详细信息")
    
    def generate_detailed_json(self, dir_path, files):
        """生成包含二级文件信息的 JSON 数据"""
        detailed_data = {}
        
        for item in files:
            item_path = os.path.join(dir_path, item['server_filename']).replace('\\', '/')
            item_info = {
                '文件名': item['server_filename'],
                '链接': f"https://pan.baidu.com/s/1xxxxxxx",  # 示例链接
                '类型': '目录' if item['isdir'] else '文件'
            }
            
            # 如果是目录，遍历其下的二级文件
            if item['isdir']:
                sub_files = self.list_files(item_path)
                if sub_files:
                    sub_file_list = []
                    for sub_item in sub_files:
                        # 格式化文件大小
                        size = sub_item.get('size', 0)
                        size_str = self.format_size(size)
                        sub_file_list.append({
                            '文件名': sub_item['server_filename'],
                            '大小': size_str,
                            '类型': '目录' if sub_item['isdir'] else '文件'
                        })
                    item_info['二级文件'] = sub_file_list
            
            detailed_data[item['server_filename']] = item_info
        
        # 保存详细数据到 JSON 文件
        json_file = os.path.join(RESOURCE_DIR, "detailed_files.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(detailed_data, f, ensure_ascii=False, indent=2)
        
        # 调用分类脚本处理数据
        self.run_category_script()
    
    def format_size(self, size):
        """格式化文件大小"""
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        elif size < 1024 * 1024 * 1024:
            return f"{size / (1024 * 1024):.2f} MB"
        else:
            return f"{size / (1024 * 1024 * 1024):.2f} GB"
    
    def run_category_script(self):
        """运行分类脚本"""
        try:
            import subprocess
            subprocess.run(['python', 'category_keywords.py'], cwd=os.getcwd(), check=True)
            print("分类脚本运行成功")
        except Exception as e:
            print(f"运行分类脚本时出错: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = BaiduPanGUI(root)
    root.mainloop()