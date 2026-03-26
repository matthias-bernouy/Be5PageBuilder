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

  // w13c/Base/HeroSection/HeroSectionEditor.ts
  var exports_HeroSectionEditor = {};
  __export(exports_HeroSectionEditor, {
    HeroSectionEditor: () => HeroSectionEditor
  });

  // src/core/Editor/Base/Editor.ts
  class Editor {
    static styleElement;
    target;
    _actionBarFeatures = {
      delete: true,
      edit: true,
      duplicate: true,
      addBefore: true,
      addAfter: true,
      saveAsTemplate: false
    };
    constructor(target, styles) {
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
    handleHover = () => {
      document.EditorManager.getBlocActionGroup().setEditor(this);
      document.EditorManager.getBlocActionGroup().open();
    };
    onConfigChange(key, value) {
      console.log("Config change", key, value);
    }
    viewClient() {
      this.restore();
      this.target.removeEventListener("mouseenter", this.handleHover);
      Editor.styleElement.forEach((v, k) => {
        v.remove();
      });
      this.target.removeAttribute("data-is-editor");
      this.target.classList.remove("editor-block");
      this.target.removeAttribute("draggable");
      if (this.target.getAttribute("class") === "") {
        this.target.removeAttribute("class");
      }
      this.target.removeAttribute("data-disable-delete");
      this.target.removeAttribute("data-disable-edit");
      this.target.removeAttribute("data-disable-duplicate");
      this.target.removeAttribute("data-disable-add-before");
      this.target.removeAttribute("data-disable-add-after");
      this.target.removeAttribute("data-enable-save-as-template");
    }
    viewEditor() {
      this.init();
      this.target.addEventListener("mouseenter", this.handleHover);
      Editor.styleElement.forEach((v, k) => {
        document.body.append(v);
      });
      this.target.draggable = true;
      this.target.classList.add("editor-block");
      this.target.setAttribute("data-is-editor", "true");
      if (this.target.getAttribute("data-disable-delete") === "true") {
        this._actionBarFeatures.delete = false;
      }
      if (this.target.getAttribute("data-disable-edit") === "true") {
        this._actionBarFeatures.edit = false;
      }
      if (this.target.getAttribute("data-disable-duplicate") === "true") {
        this._actionBarFeatures.duplicate = false;
      }
      if (this.target.getAttribute("data-disable-add-before") === "true") {
        this._actionBarFeatures.addBefore = false;
      }
      if (this.target.getAttribute("data-disable-add-after") === "true") {
        this._actionBarFeatures.addAfter = false;
      }
      if (this.target.getAttribute("data-enable-save-as-template") === "true") {
        this._actionBarFeatures.saveAsTemplate = true;
      }
    }
    get actionBarConfiguration() {
      return this._actionBarFeatures;
    }
    get configurations() {
      return [];
    }
  }

  // src/core/Utilities/createDefaultElement.ts
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

  // w13c/Base/HeroSection/HeroSectionEditor.ts
  class HeroSectionEditor extends Editor {
    _imageSlot = null;
    constructor(target) {
      super(target, "");
      createDefaultElement(this.target, "title", "span", "Title");
      createDefaultElement(this.target, "content", "span", "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ");
      createDefaultElement(this.target, "footer", "span", "footer");
      if (!this.target.querySelector("img")) {
        const img = document.createElement("img");
        img.setAttribute("slot", "image");
        img.src = "https://picsum.photos/200";
        this.target.append(img);
        this._imageSlot = img;
      } else {
        this._imageSlot = this.target.querySelector("img");
      }
      this.viewEditor();
    }
    init() {
      if (this._imageSlot) {
        this._imageSlot.setAttribute("data-disable-delete", "true");
      }
    }
    restore() {}
  }
  document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: HeroSectionEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED"
  });
})();
