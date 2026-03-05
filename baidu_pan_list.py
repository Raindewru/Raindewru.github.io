import requests
import webbrowser
import json
import os
import sys
from urllib.parse import urlencode

# ========== 配置你的应用信息 ==========
APP_KEY = "lLRDwc01kyO0uMP74KBJnSXmezJ0Beuq"      # AppKey（即API Key）
SECRET_KEY = "kwRdIN55ESajmlBVxovZfWvg6J1m9vt4"   # SecretKey
APP_ID = "122234347"                               # AppID（某些接口需要）
REDIRECT_URI = "oob"                               # 使用oob模式，授权码会显示在页面
TOKEN_FILE = "baidu_token.json"                     # 保存token的文件
# =====================================


def setup_console_utf8():
    """在 Windows 终端中尽量使用 UTF-8，减少中文乱码。"""
    for stream_name in ("stdin", "stdout", "stderr"):
        stream = getattr(sys, stream_name, None)
        if stream and hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8")
            except Exception:
                pass

def get_access_token():
    """获取access_token，优先从本地读取，若失效则重新授权"""
    # 尝试从文件读取已有token
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, 'r', encoding='utf-8') as f:
                token_data = json.load(f)
                # 检查是否过期（简单判断，实际应检查expires_in）
                if token_data.get('access_token'):
                    print("使用本地缓存的access_token")
                    return token_data['access_token']
        except Exception as exc:
            print(f"读取本地token失败，将重新授权: {exc}")
    
    # 没有token或已失效，开始授权流程
    print("请按照以下步骤授权获取access_token：")
    
    # 1. 获取授权码（code）
    auth_url = "https://openapi.baidu.com/oauth/2.0/authorize?" + urlencode({
        "response_type": "code",
        "client_id": APP_KEY,
        "redirect_uri": REDIRECT_URI,
        "scope": "basic,netdisk",   # 需要网盘权限
        "display": "popup"
    })
    print(f"请在浏览器中打开以下链接并授权：\n{auth_url}")
    webbrowser.open(auth_url)  # 自动打开浏览器
    
    code = input("请输入授权后页面显示的 code：").strip()
    
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
    except requests.RequestException as exc:
        print(f"网络请求失败：{exc}")
        return None

    token_data = res.json()
    
    if 'access_token' not in token_data:
        print("获取token失败：", token_data)
        return None
    
    # 保存到文件（实际可保存expires_in用于判断过期）
    with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
        json.dump(token_data, f, ensure_ascii=False, indent=2)
    print("access_token已保存到本地")
    return token_data['access_token']

def get_baidu_error_msg(errno):
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

def list_files(access_token, dir_path="/", show_all=True):
    """调用文件列表接口"""
    # 自动修正路径格式（确保以 / 开头）
    if not dir_path.startswith('/'):
        dir_path = '/' + dir_path
    
    url = "https://pan.baidu.com/rest/2.0/xpan/file"
    params = {
        "method": "list",
        "access_token": access_token,
        "dir": dir_path
    }
    if not show_all:
        params["web"] = "web"  # 只返回当前目录，不递归？官方参数待确认
    try:
        resp = requests.get(url, params=params, timeout=20)
    except requests.RequestException as exc:
        print(f"网络请求失败：{exc}")
        return None

    data = resp.json()
    
    if data.get('errno') != 0:
        errno = data.get('errno')
        error_msg = get_baidu_error_msg(errno)
        print(f"API调用失败 [错误码 {errno}]：{error_msg}")
        print(f"  请求目录: {dir_path}")
        if errno == -7:
            print(f"  建议: 尝试输入'/'（根目录）或者使用完整路径如'/我的文件'")
        return None
    
    return data.get('list', [])

def print_file_list(file_list, indent=0):
    """递归打印目录树（仅一级，如需递归需额外调用）"""
    for item in file_list:
        prefix = "  " * indent
        if item['isdir']:
            print(f"{prefix}[DIR]  {item['server_filename']}/")
            # 若要递归，可再次调用list_files传入该目录路径
        else:
            size = item['size']
            size_str = f"{size/1024/1024:.1f} MB" if size > 1024*1024 else f"{size/1024:.1f} KB"
            print(f"{prefix}[FILE] {item['server_filename']} ({size_str})")

def main():
    setup_console_utf8()

    # 1. 获取access_token
    token = get_access_token()
    if not token:
        return
    
    # 2. 指定要查看的目录（可修改）
    print("\n网盘目录格式说明：")
    print("  - 根目录：/ 或直接按回车")
    print("  - 子目录：我的文件 或 /我的文件（自动补全 /）")
    print("  - 深层目录：/我的文件/照片")
    target_dir = input("\n请输入要查看的网盘目录：").strip()
    if not target_dir:
        target_dir = "/"
    
    # 3. 调用接口获取文件列表
    print(f"正在获取目录 {target_dir} 的内容...")
    files = list_files(token, target_dir)
    if files is None:
        return
    
    # 4. 打印列表
    print(f"\n目录 {target_dir} 下的文件：")
    print_file_list(files)
    
    # 5. 可选：保存到文本文件
    save = input("\n是否将文件列表保存到文本文件？(y/n)：").strip().lower()
    if save == 'y':
        filename = input("请输入文件名（默认file_list.txt）：").strip() or "file_list.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            for item in files:
                f.write(f"{item['server_filename']}\n")
        print(f"已保存到 {filename}")

if __name__ == "__main__":
    main()