(function (global) {
  const DEFAULT_SESSION_HOURS = 6;
  const configPromise = fetch("/config/app-config.json", { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({}));
  const controllers = new Set();
  const LOCAL_CODE_FORMAT = /^[a-z0-9]{8}$/;
  const LOCAL_AUTH_HASHES = Object.freeze({
    animal: "6295474ba83ca8ff94411deef5f032466db32c48bad202fa2c7b4a6e8177ba87",
    heian: "f00dca6ee7bea660c2e25eeeea4524e80d3ec1dfeb4106912f59b81f5d5cf933",
    mbtia: "9b9ceffc2954a938fcd6a2add583574c87e8e8ed885708ac4644b523b0b05eff",
    nxfg: "f38ebdcc98ea0f4515d4a517ed087bc637cd332ea848c1181ae24d3e400ffc77",
    nxxg: "49a3f878e3e492d7e392b5c4a9a7547844111626c3308f9f1acd2384e3b2f207",
    rskx: "d3ad922ab2996f77e2cea3a8d8496cfb7efd2d0126d77fde783aa63a7be2a240",
    shh: "724b1608f323de8398dc8fd24b490c08ad244834bb0ae86eec2ee7c5aca66412",
    sl90: "b91a3dbf5667bcbccf53f016c3c40a77e2df3fb255547032e00f3cc2dcaffa3e",
    tianfu: "ba131838709b07770cd513fab07fce3c915591f93227e78f1b3f2e7197858fd0",
    xgcs: "da9ef1c062ef9bc66361fc1046986ff1bf5157d254cfd30ab325f196ceb40720",
    xlnl: "89dcb9fc339a456864f73b7752a892141b558d433937490e70fbf3f19780e959",
    xpcs: "2b36e45c575a77c4d2437665c47d94b5df9da7e40ada7ecaba3c88a48bd89620",
    year: "727904916e50e2c19243e8088bf225c0a0262b4ef32961b7d7f637135ab3fb51",
    ysjt: "0d77e2b5292f2db9f15c106ec770d91c81bc3c7a9c5f0cad0217485d34f52a25",
    yzcs: "9c23efc8ed4dd5c8666e8f57a5f2d88d4f5fc9a67b6d1a44937cb5b98734c6da",
    zaqx: "73573da486888655998062088311a4466c2a6147334835ddf11ef0db548d47d3",
  });

  function parseBoolean(value, fallback) {
    if (typeof value === "undefined" || value === null) return fallback;
    return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
  }

  function getLocalPepper() {
    return ["5ics", "local", "auth", "v1#2026"].join(".");
  }

  function toHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function fallbackHash(input) {
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < input.length; i += 1) {
      const code = input.charCodeAt(i);
      h1 ^= code;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 ^= code + ((h2 << 5) >>> 0) + (h2 >>> 2);
      h2 >>>= 0;
    }
    let out = "";
    for (let i = 0; i < 8; i += 1) {
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822519) >>> 0;
      h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489917) >>> 0;
      out += h1.toString(16).padStart(8, "0");
      out += h2.toString(16).padStart(8, "0");
    }
    return out.slice(0, 64);
  }

  async function sha256Hex(input) {
    if (global.crypto && global.crypto.subtle && global.TextEncoder) {
      const bytes = new global.TextEncoder().encode(input);
      const digest = await global.crypto.subtle.digest("SHA-256", bytes);
      return toHex(new Uint8Array(digest));
    }
    return fallbackHash(input);
  }

  async function validateLocalCode(testType, rawCode) {
    const normalizedType = String(testType || "").trim().toLowerCase();
    const expected = LOCAL_AUTH_HASHES[normalizedType];
    if (!expected) return false;
    const code = String(rawCode || "").trim().toLowerCase();
    if (!LOCAL_CODE_FORMAT.test(code)) return false;
    const source = `${normalizedType}|${code}|${getLocalPepper()}`;
    const digest = await sha256Hex(source);
    return digest === expected;
  }

  class AuthorizationController {
    constructor(options) {
      this._explicitSessionHours = Boolean(options && Object.prototype.hasOwnProperty.call(options, "sessionHours"));
      this.options = Object.assign(
        {
          testType: null,
          apiBase: window.location.origin,
          sessionHours: DEFAULT_SESSION_HOURS,
          autoConsume: true,
          onAuthorized: null,
          redirect: null,
          startButtons: [],
          autoRun: false,
          useServerValidation: false,
          authContext: "start",
        },
        options || {}
      );
      if (!this.options.testType) {
        throw new Error("AuthorizationSDK: testType is required");
      }
      this.state = {
        config: null,
        modal: null,
        serverEndpoint: this.options.apiBase.replace(/\/$/, "") + "/api",
        sessionKey: `auth:${this.options.testType}:session`,
      };
    }

    async bootstrap() {
      await this.loadRemoteConfig();
      if (this.options.startButtons.length) {
        this.attachStartButtons();
      }
      if (this.options.autoRun) {
        this.ensureAuthorized();
      }
      return this;
    }

    async loadRemoteConfig() {
      try {
        const resp = await fetch(`${this.state.serverEndpoint}/public/test-configs`, {
          headers: { Accept: "application/json" },
        });
        const data = await resp.json();
        if (data && data.items) {
          this.state.config = data.items.find((item) => item.test_type === this.options.testType) || null;
        }
        if (!this._explicitSessionHours && this.state.config && this.state.config.session_hours) {
          const hours = Number(this.state.config.session_hours);
          if (Number.isFinite(hours) && hours > 0) {
            this.options.sessionHours = hours;
          }
        }
      } catch (error) {
        console.warn("[AuthorizationSDK] failed to load remote config", error);
        this.state.config = null;
      }
    }

    attachStartButtons() {
      this.options.startButtons.forEach((selector) => {
        const el = document.querySelector(selector.trim());
        if (!el) {
          console.warn(`[AuthorizationSDK] start button not found: ${selector}`);
          return;
        }
        el.addEventListener("click", (evt) => {
          evt.preventDefault();
          this.ensureAuthorized();
        });
      });
    }

    isSessionActive() {
      try {
        const raw = sessionStorage.getItem(this.state.sessionKey);
        if (!raw) return false;
        const data = JSON.parse(raw);
        return data.expiresAt > Date.now();
      } catch (_) {
        return false;
      }
    }

    grantSession() {
      const expiresAt = Date.now() + this.options.sessionHours * 3600 * 1000;
      sessionStorage.setItem(this.state.sessionKey, JSON.stringify({ expiresAt }));
    }

    async ensureAuthorized(callback) {
      const hasConfig = Boolean(this.state.config);
      const authRequired = this.options.useServerValidation
        ? !(hasConfig && this.state.config.auth_required === 0)
        : true;
      const configMode = hasConfig && this.state.config.auth_mode ? this.state.config.auth_mode : "start";
      const context = this.options.authContext || "start";
      if (!authRequired) {
        this.grantSession();
        this.handleAuthorized(callback);
        return true;
      }
      if (this.options.useServerValidation && hasConfig && configMode !== context) {
        this.handleAuthorized(callback);
        return true;
      }
      if (this.isSessionActive()) {
        this.handleAuthorized(callback);
        return true;
      }
      this.openModal(callback);
      return false;
    }

    handleAuthorized(callback) {
      if (typeof callback === "function") {
        callback();
      } else if (typeof this.options.onAuthorized === "function") {
        this.options.onAuthorized();
      } else if (typeof this.options.onAuthorized === "string" && typeof global[this.options.onAuthorized] === "function") {
        global[this.options.onAuthorized]();
      }
      if (this.options.redirect) {
        window.location.href = this.options.redirect;
      }
    }

    openModal(callback) {
      if (this.state.modal) {
        this.state.modal.remove();
      }
      const modal = buildModal(this.state.config, {
        onSubmit: async (codeInput, errorEl) => {
          errorEl.textContent = "";
          errorEl.style.display = "none";
          const code = codeInput.value.trim();
          if (!code) {
            errorEl.textContent = "请输入授权码";
            errorEl.style.display = "block";
            return;
          }
          if (!LOCAL_CODE_FORMAT.test(code.toLowerCase())) {
            errorEl.textContent = "授权码需为8位小写字母或数字";
            errorEl.style.display = "block";
            return;
          }
          const passed = await this.validateCode(code);
          if (passed) {
            this.grantSession();
            this.handleAuthorized(callback);
            modal.remove();
          } else {
            errorEl.textContent = "授权码无效或已失效";
            errorEl.style.display = "block";
          }
        },
        onClose: () => {
          modal.remove();
        },
      });
      this.state.modal = modal;
      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add("visible"), 10);
    }

    async validateCode(code) {
      if (!this.options.useServerValidation) {
        return validateLocalCode(this.options.testType, code);
      }
      try {
        if (this.options.autoConsume) {
          const res = await fetch(`${this.state.serverEndpoint}/auth/consume`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, test_type: this.options.testType }),
          });
          return res.ok;
        }
        const res = await fetch(`${this.state.serverEndpoint}/auth/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, test_type: this.options.testType }),
        });
        return res.ok;
      } catch (error) {
        console.error("[AuthorizationSDK] validate failed", error);
        return false;
      }
    }
  }

  function buildModal(testConfig, hooks) {
    const overlay = document.createElement("div");
    overlay.className = "auth-modal-overlay";
    const card = document.createElement("div");
    card.className = "auth-modal-card";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "auth-close-btn";
    close.setAttribute("aria-label", "关闭");
    close.innerHTML = "&times;";
    close.addEventListener("click", () => {
      overlay.classList.remove("visible");
      setTimeout(() => hooks.onClose(), 200);
    });
    card.appendChild(close);

    const title = document.createElement("h2");
    title.textContent = "授权验证";
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "auth-modal-text";
    desc.textContent = "请输入授权码完成验证。";
    card.appendChild(desc);

    const buttonRow = document.createElement("div");
    buttonRow.className = "auth-link-row";
    const links = buildLinks(testConfig);
    links.forEach((link) => buttonRow.appendChild(link));
    if (links.length) {
      card.appendChild(buttonRow);
    }

    const inputRow = document.createElement("div");
    inputRow.className = "auth-input-row";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "输入授权码";
    const submit = document.createElement("button");
    submit.type = "button";
    submit.textContent = "验证";
    submit.className = "auth-btn";
    inputRow.appendChild(input);
    inputRow.appendChild(submit);
    card.appendChild(inputRow);

    const error = document.createElement("div");
    error.className = "auth-error";
    error.style.display = "none";
    card.appendChild(error);

    submit.addEventListener("click", () => hooks.onSubmit(input, error));
    input.addEventListener("keyup", (evt) => {
      if (evt.key === "Enter") {
        hooks.onSubmit(input, error);
      }
    });

    overlay.appendChild(card);
    overlay.addEventListener("click", (evt) => {
      if (evt.target === overlay) {
        overlay.classList.remove("visible");
        setTimeout(() => hooks.onClose(), 200);
      }
    });
    return overlay;
  }

  function normalizeUrl(url) {
    if (!url) return "";
    let value = String(url).trim();
    if (!value) return "";
    if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(value)) {
      return value;
    }
    if (value.startsWith("//")) {
      return window.location.protocol + value;
    }
    if (value.startsWith("/")) {
      return value;
    }
    if (/^www\./i.test(value) || /^[\w.-]+\.(com|cn|net|org|io|app)(\/|$)/i.test(value)) {
      return "https://" + value;
    }
    return value;
  }

  function buildLinks(testConfig) {
    const links = [];
    if (!testConfig) return links;
    const buttons = Array.isArray(testConfig.buttons) && testConfig.buttons.length
      ? testConfig.buttons
      : Array.isArray(testConfig.purchase_links)
      ? testConfig.purchase_links
      : [];
    buttons.forEach((button, index) => {
      if (button && button.url && button.label && button.show !== false && button.show !== 0) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "auth-link-btn";
        btn.textContent = button.label || `入口${index + 1}`;
        btn.addEventListener("click", () => {
          const targetUrl = normalizeUrl(button.url);
          if (targetUrl) {
            window.open(targetUrl, "_blank", "noopener");
          }
        });
        links.push(btn);
      }
    });
    return links;
  }

  function normalizeOptions(dataset) {
    const opts = Object.assign({}, dataset);
    opts.autoRun = parseBoolean(opts.autoRun, false);
    opts.useServerValidation = parseBoolean(opts.useServerValidation, false);
    opts.autoConsume = parseBoolean(opts.autoConsume, true);
    if (typeof opts.authContext !== "undefined") {
      opts.authContext = String(opts.authContext).toLowerCase();
    }
    if (typeof opts.startButton === "string") {
      opts.startButtons = opts.startButton.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (typeof opts.sessionHours !== "undefined") {
      opts.sessionHours = Number(opts.sessionHours) || DEFAULT_SESSION_HOURS;
    }
    return opts;
  }

  const AuthorizationSDK = {
    async init(options) {
      const controller = new AuthorizationController(options);
      const instance = await controller.bootstrap();
      controllers.add(instance);
      return instance;
    },
    async autoInit(scriptEl) {
      const dataset = normalizeOptions(scriptEl.dataset);
      if (!dataset.testType) return;
      const buttons = dataset.startButtons || [];
      let apiBase = dataset.apiBase;
      if (!apiBase) {
        const cfg = await configPromise;
        if (cfg && cfg.apiBase) {
          apiBase = cfg.apiBase;
        }
      }
      if (!apiBase) {
        apiBase = window.location.origin;
      }
      if (dataset.serverEndpoint) {
        apiBase = dataset.serverEndpoint.replace(/\/api\/?$/, "");
      }
      const opts = {
        testType: dataset.testType,
        apiBase: apiBase,
        startButtons: buttons,
        autoRun: dataset.autoRun || false,
        redirect: dataset.redirect || null,
        onAuthorized: dataset.onAuthorized || null,
        authContext: dataset.authContext || "start",
        useServerValidation: dataset.useServerValidation,
        autoConsume: dataset.autoConsume,
      };
      if (typeof dataset.sessionHours !== "undefined") {
        opts.sessionHours = dataset.sessionHours || DEFAULT_SESSION_HOURS;
      }
      const controller = await AuthorizationSDK.init(opts);
      return controller;
    },
    attachStartButtons() {
      controllers.forEach((controller) => {
        if (controller && typeof controller.attachStartButtons === "function") {
          controller.attachStartButtons();
        }
      });
    },
    getControllers() {
      return Array.from(controllers);
    },
  };

  global.AuthorizationSDK = AuthorizationSDK;

  const current = document.currentScript;
  if (current && current.dataset && current.dataset.testType) {
    AuthorizationSDK.autoInit(current);
  }
})(window);
