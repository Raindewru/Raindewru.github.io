import pathlib

path = pathlib.Path("index.html")
text = path.read_text(encoding="utf8")

login_div = '<div id="loginPanel"'
main_div = '<div id="mainPanel"'

start = text.index(login_div)
end = text.index(main_div)

new_block = """<div id="loginPanel" class="login-container">
        <div class="login-title">口语练习</div>
        <div class="login-sub">输入密码进入题库，随机抽题练习口语</div>
        <label class="password-label" for="passwordInput">访问密码</label>
        <div class="password-input-wrapper">
            <input type="password" id="passwordInput" placeholder="请输入密码" autofocus>
        </div>
        <button class="login-btn" id="loginBtn">进入练习</button>
        <div id="loginError" class="error-message"></div>
        <div class="demo-hint">体验密码：<code style="background: #e2e8f0; padding: 3px 8px; border-radius: 30px;">ky666</code><br>如需更新题库，请编辑同目录的 <code>data.json</code></div>
    </div>

"""

path.write_text(text[:start] + new_block + text[end:], encoding="utf8")
