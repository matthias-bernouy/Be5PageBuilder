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

  // w13c/Base/HeroSection/HeroSection.ts
  var exports_HeroSection = {};
  __export(exports_HeroSection, {
    HeroSection: () => HeroSection
  });

  // w13c/Base/HeroSection/template.html
  var template_default = `<div class="wrapper">
    <div class="text-content">
        <slot name="title"></slot>
        <slot name="content"></slot>
        <slot name="footer"></slot>
    </div>
    <div class="image-container">
        <slot name="image"></slot>
    </div>
</div>`;

  // w13c/Base/HeroSection/style.css
  var style_default = `:host {
    /* Variables de structure */
    --section-bg: var(--bg-surface);
    --section-padding: 4rem 2rem;
    --section-max-width: 1200px;
    --section-gap: 4rem;
    --section-radius: 0px;
    --section-direction: row; /* row ou row-reverse */
    
    /* Variables de texte */
    --section-title-color: var(--text-main);
    --section-title-size: 2.5rem;
    --section-body-color: var(--text-body);
    --section-body-size: 1.125rem;
    
    /* Variables d'image */
    --section-img-width: 450px;
    --section-img-radius: 4px;
    --section-img-shadow: 0 10px 30px rgba(0,0,0,0.1);

    display: block;
    width: 100%;
    background-color: var(--section-bg);
}

.wrapper {
    max-width: var(--section-max-width);
    margin: 0 auto;
    padding: var(--section-padding);
    display: flex;
    flex-direction: var(--section-direction);
    gap: var(--section-gap);
    align-items: center;
    border-radius: var(--section-radius);
}

.text-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

::slotted([slot="title"]) {
    margin: 0;
    font-size: var(--section-title-size);
    color: var(--section-title-color);
    line-height: 1.2;
}

::slotted([slot="content"]) {
    font-size: var(--section-body-size);
    color: var(--section-body-color);
    line-height: 1.7;
    margin: 0;
}

.image-container {
    flex-shrink: 0;
}

::slotted([slot="image"]) {
    display: block;
    width: 100%;
    max-width: var(--section-img-width);
    height: auto;
    border-radius: var(--section-img-radius);
    box-shadow: var(--section-img-shadow);
    object-fit: cover;
}

/* Responsive : On passe en colonne sur mobile */
@media (max-width: 992px) {
    .wrapper {
        flex-direction: column !important;
        text-align: center;
        gap: 2.5rem;
        padding: 2rem 1rem;
    }

    ::slotted([slot="image"]) {
        max-width: 100%;
    }
}`;

  // src/core/Utilities/Component.ts
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

  // w13c/Base/HeroSection/HeroSection.ts
  class HeroSection extends Component {
    constructor() {
      super({
        css: style_default,
        template: template_default
      });
    }
  }
  customElements.define("BE5_TAG_TO_BE_REPLACED", HeroSection);
})();
