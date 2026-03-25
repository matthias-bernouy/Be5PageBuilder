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

  // src/core/ClientComponent/Navbar/NavbarEditor.ts
  var exports_NavbarEditor = {};
  __export(exports_NavbarEditor, {
    NavbarEditor: () => NavbarEditor
  });

  // src/core/createDefaultElement.ts
  function createDefaultElement(element, targetSlot, tag = "p", text) {
    const currentElement = element.querySelector(`[slot=${targetSlot}]`);
    if (currentElement)
      return currentElement;
    const defaultElement = document.createElement(tag);
    defaultElement.setAttribute("slot", targetSlot);
    if (text)
      defaultElement.innerText = text;
    element.append(defaultElement);
    return defaultElement;
  }

  // src/core/Editor.ts
  class Editor {
    static styleElement;
    rawStyles;
    target;
    constructor(target, styles) {
      this.rawStyles = styles;
      this.target = target;
      document.addEventListener("switch-mode", (e) => {
        if (e.detail === "editor-mode") {
          this.viewEditor();
        } else {
          this.viewClient();
        }
      });
      if (Editor.styleElement == null)
        Editor.styleElement = new Map;
      if (!Editor.styleElement.has(this.target.tagName)) {
        const styleElem = document.createElement("style");
        styleElem.innerHTML = styles;
        Editor.styleElement.set(this.target.tagName, styleElem);
      }
    }
    viewClient() {
      Editor.styleElement.forEach((v, k) => {
        v.remove();
      });
      this.target.removeAttribute("data-is-editor");
      this.target.classList.remove("editor-block");
      this.target.removeAttribute("draggable");
      if (this.target.getAttribute("class") === "") {
        this.target.removeAttribute("class");
      }
      this.restore();
    }
    viewEditor() {
      Editor.styleElement.forEach((v, k) => {
        document.body.append(v);
      });
      this.target.draggable = true;
      this.target.classList.add("editor-block");
      this.target.setAttribute("data-is-editor", "true");
      this.init();
    }
    openConfigPanel() {}
  }

  // src/core/ClientComponent/Navbar/NavbarEditor.ts
  class NavbarEditor extends Editor {
    constructor(target) {
      super(target, "");
      createDefaultElement(this.target, "logo", "span", "MY_LOGO");
      createDefaultElement(this.target, "links", "a", "Accueil");
      createDefaultElement(this.target, "links", "a", "Services");
      createDefaultElement(this.target, "links", "a", "Contact");
      createDefaultElement(this.target, "actions", "button", "S'inscrire");
      this.viewEditor();
    }
    init() {
      const currentBP = this.target.getAttribute("breakpoint") || "768px";
    }
    setBreakpoint(value) {
      this.target.setAttribute("breakpoint", value);
    }
    restore() {
      this.target.removeAttribute("open");
    }
  }
  document.EditorManager.getObserver().register_editor("be5-019d2487-06f5-7000-a56b-df8466062763", NavbarEditor);
})();
