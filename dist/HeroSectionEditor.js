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

  // Blocks/HeroSection/HeroSectionEditor.ts
  var exports_HeroSectionEditor = {};
  __export(exports_HeroSectionEditor, {
    HeroSectionEditor: () => HeroSectionEditor
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

  // Blocks/HeroSection/HeroSectionEditor.ts
  class HeroSectionEditor extends Editor {
    constructor(target) {
      super(target, "");
      this.viewEditor();
      createDefaultElement(this.target, "title", "span", "Title");
      createDefaultElement(this.target, "content", "span", "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ");
      createDefaultElement(this.target, "footer", "span", "footer");
      if (!this.target.querySelector("img")) {
        const img = document.createElement("img");
        img.setAttribute("slot", "image");
        img.src = "https://picsum.photos/200";
        this.target.append(img);
      }
    }
    init() {}
    restore() {}
  }
  document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: HeroSectionEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED"
  });
})();
