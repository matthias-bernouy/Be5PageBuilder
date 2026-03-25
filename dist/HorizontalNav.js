(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __moduleCache = /* @__PURE__ */ new WeakMap;
  var __toCommonJS = (from) => {
    var entry = __moduleCache.get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function")
      __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
        get: () => from[key],
        enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
      }));
    __moduleCache.set(from, entry);
    return entry;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: (newValue) => all[name] = () => newValue
      });
  };

  // src/core/ClientComponent/Navbar/Navbar.ts
  var exports_Navbar = {};
  __export(exports_Navbar, {
    Navbar: () => Navbar
  });

  // src/core/ClientComponent/Navbar/template.html
  var template_default = `<header class="nav-container">
  <div class="nav-wrapper">
    <div class="logo-section">
      <slot name="logo"></slot>
    </div>

    <nav class="desktop-nav">
      <div class="links-wrapper">
        <slot name="links"></slot>
        <div class="nav-indicator"></div>
      </div>
    </nav>

    <div class="actions-section">
      <slot name="actions"></slot>
      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span class="hamburger"></span>
      </button>
    </div>
  </div>

  <div class="mobile-drawer" aria-hidden="true">
    <div class="drawer-header">
      <button class="close-btn">&times;</button>
    </div>
    <div class="drawer-content">
      <slot name="links"></slot>
    </div>
    <div class="drawer-footer">
      <slot name="drawer-footer"></slot>
    </div>
  </div>
  <div class="drawer-overlay"></div>
</header>`;

  // src/core/ClientComponent/Navbar/style.css
  var style_default = `:host {
  /* Global Config */
  --w13c-nav-bg: var(--bg-surface, oklch(100% 0 0));
  --w13c-nav-height: 70px;
  --w13c-nav-padding: 0 2rem;
  --w13c-nav-border: var(--border-default, oklch(92% 0.01 265));
  --w13c-nav-blur: 10px;
  
  /* Links & Interaction */
  --w13c-link-color: var(--text-main, oklch(25% 0.02 265));
  --w13c-link-hover: var(--primary-base, oklch(60% 0.15 265));
  --w13c-indicator-color: var(--primary-base, oklch(60% 0.15 265));
  --w13c-indicator-height: 2px;
  
  /* Drawer */
  --w13c-drawer-bg: var(--bg-surface, oklch(100% 0 0));
  --w13c-drawer-width: 300px;
  --w13c-drawer-z: 1000;

  display: block;
  width: 100%;
  font-family: inherit;
}

:host([sticky]) .nav-container {
  position: fixed;
  top: 0;
  left: 0;
  backdrop-filter: blur(var(--w13c-nav-blur));
  background: color-mix(in oklch, var(--w13c-nav-bg), transparent 10%);
}

.nav-container {
  height: var(--w13c-nav-height);
  background: var(--w13c-nav-bg);
  border-bottom: 1px solid var(--w13c-nav-border);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--w13c-nav-padding);
  gap: 2rem;
}

.logo-section { display: flex; align-items: center; }

.desktop-nav {
  flex: 1;
  display: flex;
  height: 100%;
}

.links-wrapper {
  display: flex;
  gap: 1.5rem;
  position: relative;
  height: 100%;
  align-items: center;
}

::slotted(a) {
  text-decoration: none;
  color: var(--w13c-link-color);
  font-weight: 500;
  transition: color 0.2s ease;
  padding: 0.5rem 0;
}

::slotted(a:hover) { color: var(--w13c-link-hover); }

/* Indicator logic */
.nav-indicator {
  position: absolute;
  bottom: 0;
  height: var(--w13c-indicator-height);
  background: var(--w13c-indicator-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.actions-section { display: flex; align-items: center; gap: 1rem; }

/* Mobile logic handled by JS & dynamic breakpoint */
.menu-toggle { display: none; cursor: pointer; background: none; border: none; }

.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: var(--w13c-drawer-width);
  height: 100vh;
  background: var(--w13c-drawer-bg);
  z-index: var(--w13c-drawer-z);
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-shadow: -5px 0 15px rgba(0,0,0,0.1);
}

:host([open]) .mobile-drawer { right: 0; }
.drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
    opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
:host([open]) .drawer-overlay { opacity: 1; pointer-events: auto; }`;

  // src/core/Component.ts
  if (typeof globalThis.HTMLElement === "undefined") {
    class HTMLElement2 {
    }
    globalThis.HTMLElement = HTMLElement2;
  }
  if (typeof globalThis.customElements === "undefined") {
    globalThis.customElements = {
      define: (tag, constructor) => {},
      get: (tag) => {
        return;
      }
    };
  }

  class Component extends HTMLElement {
    constructor(metadata) {
      super();
      this.attachShadow({ mode: "open" });
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
                <style>${metadata.css}</style>
                ${metadata.template}
            `;
      }
    }
  }

  // src/core/ClientComponent/Navbar/Navbar.ts
  class Navbar extends Component {
    _breakpoint = 768;
    constructor() {
      super({
        css: style_default,
        template: template_default
      });
    }
    connectedCallback() {
      this.updateBreakpoint();
      this.setupListeners();
      this.setupIndicator();
    }
    static get observedAttributes() {
      return ["breakpoint", "open"];
    }
    attributeChangedCallback(name, old, next) {
      if (name === "breakpoint")
        this.updateBreakpoint();
    }
    updateBreakpoint() {
      const bp = this.getAttribute("breakpoint") || "768px";
      this._breakpoint = parseInt(bp);
      const style = document.createElement("style");
      style.textContent = `
            @media (max-width: ${bp}) {
                .desktop-nav { display: none; }
                .menu-toggle { display: block; }
            }
        `;
      this.shadowRoot?.appendChild(style);
    }
    setupListeners() {
      const toggle = this.shadowRoot?.querySelector(".menu-toggle");
      const close = this.shadowRoot?.querySelector(".close-btn");
      const overlay = this.shadowRoot?.querySelector(".drawer-overlay");
      const toggleMenu = () => {
        const isOpen = this.hasAttribute("open");
        isOpen ? this.removeAttribute("open") : this.setAttribute("open", "");
        this.dispatchEvent(new CustomEvent("w13c-nav-toggle", { detail: !isOpen }));
      };
      toggle?.addEventListener("click", toggleMenu);
      close?.addEventListener("click", toggleMenu);
      overlay?.addEventListener("click", toggleMenu);
    }
    setupIndicator() {
      const wrapper = this.shadowRoot?.querySelector(".links-wrapper");
      const indicator = this.shadowRoot?.querySelector(".nav-indicator");
      const slot = this.shadowRoot?.querySelector("nav slot");
      slot?.addEventListener("slotchange", () => {
        const links = slot.assignedElements();
        links.forEach((link) => {
          link.addEventListener("mouseenter", (e) => {
            const target = e.target;
            indicator.style.width = `${target.offsetWidth}px`;
            indicator.style.left = `${target.offsetLeft}px`;
            indicator.style.opacity = "1";
          });
        });
        wrapper?.addEventListener("mouseleave", () => indicator.style.opacity = "0");
      });
    }
  }
  customElements.define("BE5_TAG_TO_BE_REPLACED", Navbar);
})();
