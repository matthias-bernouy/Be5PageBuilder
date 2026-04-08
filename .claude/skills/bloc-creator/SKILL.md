---
name: bloc-creator
description: >
  Génère un web component BE5 complet avec son éditeur associé, en 5 fichiers
  (component.ts, editor.ts, style.css, template.html, configuration.html).
  Utiliser ce skill dès que l'utilisateur demande à créer un composant, un bloc,
  un élément ou un widget dans l'architecture BE5 — même s'il ne mentionne pas
  explicitement les fichiers ou le mot "skill".
---

# Créer un Web Component BE5 avec Éditeur

Génère un composant `[NOM]` composé de **5 fichiers** en respectant exactement
les conventions ci-dessous.

## Structure des fichiers

```
[NomDuComposant]/
├── [NomDuComposant].ts        ← component (classe + customElements.define)
├── [NomDuComposant]Editor.ts  ← éditeur
├── style.css
├── template.html
└── configuration.html         ← panneau de config déclaratif
```

> **Nommage** : le fichier du composant et de l'éditeur portent le nom PascalCase
> de la classe (ex : `Card.ts`, `CardEditor.ts`).

---

## Placeholders système — NE PAS MODIFIER

Les identifiants suivants sont des **constantes réservées au système de build**.
Ils doivent apparaître **tels quels, textuellement** dans le code généré.
Ne jamais les remplacer, les renommer, ni demander leur valeur à l'utilisateur.

| Constante | Rôle | Où elle apparaît |
|---|---|---|
| `BE5_TAG_TO_BE_REPLACED` | Tag HTML du custom element | `[NOM].ts` → `customElements.define` |
| `BE5_LABEL_TO_BE_REPLACED` | Libellé affiché dans la bibliothèque | `registerEditor` (via le build) |
| `BE5_GROUP_TO_BE_REPLACED` | Groupe dans la bibliothèque | `registerEditor` (via le build) |

---

## [NOM].ts — Le composant

**Import exact :**
```ts
import { Component } from 'src/core/Component/core/Component';
```

**Règles :**

- Étend `Component`
- Importe `template.html` et `style.css` avec `{ type: 'text' }`
- Dans le `super()`, toujours caster le template :
  ```ts
  super({ css, template: template as unknown as string });
  ```
- Enregistre l'élément :
  ```ts
  customElements.define("BE5_TAG_TO_BE_REPLACED", [NOM]);
  ```
- **`connectedCallback()`** : ne contient que `this.render()` si nécessaire.
  **Ne jamais appeler `super.connectedCallback()`.**
- Logique métier (getters, event listeners, méthodes) directement dans la classe.

### Exemple complet (Button)

```ts
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Component/core/Component';

export class Button extends Component {
    constructor() {
        super({ css, template: template as unknown as string });
    }

    override connectedCallback(): void {
        this.addEventListener("click", this.onClick);
    }

    onClick = () => {
        const href = this.href;
        if (href) window.open(href, this.target);
    }

    get href(): string | null {
        return this.getAttribute("href");
    }

    get target(): string {
        return this.getAttribute("target") || "_self";
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", Button);
```

---

## [NOM]Editor.ts — L'éditeur

**Imports exacts :**
```ts
import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };
```

**Règles :**

1. **Classe** : `[NOM]Editor extends Editor`

2. **Constructeur** :
   ```ts
   constructor(target: HTMLElement) {
       super(target, "", configuration as unknown as string);
       // 2e arg = CSS éditeur (string vide si aucun)
       // 3e arg = configuration HTML
   }
   ```
   Si le composant nécessite un style éditeur spécifique (désactiver hover,
   annuler des effets visuels en mode édition…), passer le CSS en 2e argument :
   ```ts
   const editorStyle = `.card:hover { transform: unset; box-shadow: unset; }`;
   // ...
   super(target, editorStyle, configuration as unknown as string);
   ```

3. **`init()`** et **`restore()`** : laisser vides sauf besoin spécifique.

4. **Enregistrement** via `registerEditor` :
   ```ts
   registerEditor({ cl: [NOM]Editor });
   ```

### Exemple complet (Card)

```ts
import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };

const editorStyle = `
    .card:hover {
        transform: unset;
        box-shadow: unset;
    }
`;

export class CardEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, editorStyle, configuration as unknown as string);
    }

    init() {}
    restore() {}
}

registerEditor({ cl: CardEditor });
```

---

## style.css

### Règle d'autonomie complète

Le fichier `style.css` est **entièrement autosuffisant**. Toutes les
variables CSS nécessaires au composant sont déclarées dans ce fichier.
Ne jamais déléguer de variables vers un fichier externe ou un thème à importer.

### Convention de déclaration

- Dans `:host` : déclarer **toutes** les variables locales `--[component]-*`
  avec comme valeur par défaut les variables globales du design system
  et un fallback en dur.
- **Aucune valeur magique** dans les règles CSS — tout passe par une variable locale.
- Si le composant a des états visuels (hover, active, disabled…), prévoir
  les variables correspondantes directement dans `:host`.
- Utiliser `attr()` CSS pour les propriétés configurables via attributs :
  ```css
  --grid-gap: attr(spacing px, 32px);
  ```

**Variables globales disponibles :**

| Famille | Variantes |
|---|---|
| `--primary` | `-base`, `-muted`, `-contrasted` |
| `--secondary` | `-base`, `-muted`, `-contrasted` |
| `--success` | `-base`, `-muted`, `-contrasted` |
| `--danger` | `-base`, `-muted`, `-contrasted` |
| `--warning` | `-base`, `-muted`, `-contrasted` |
| `--info` | `-base`, `-muted`, `-contrasted` |
| `--bg` | `-base`, `-surface`, `-overlay` |
| `--text` | `-main`, `-body`, `-muted` |
| `--border` | `-default` |

### Slots stylés

Pour styler les éléments slotés, utiliser `::slotted()` :
```css
::slotted([slot="image"]) {
    width: 100%;
    height: auto;
    object-fit: cover;
}
```

---

## template.html

- Structure HTML sémantique du composant.
- Utiliser des `<slot name="...">` pour chaque zone de contenu éditable.
- Les slots peuvent avoir un contenu par défaut (fallback) :
  ```html
  <slot name="title">Titre par défaut</slot>
  ```
- Le slot par défaut (sans nom) accueille les enfants multiples/répétables.

### Exemple (Card)

```html
<article class="card">
    <div class="card-media">
        <slot name="image"></slot>
    </div>
    <div class="card-content">
        <header>
            <h3 class="card-title">
                <slot name="title">Titre</slot>
            </h3>
        </header>
        <div class="card-resume">
            <slot name="resume"></slot>
        </div>
        <footer class="card-footer">
            <slot name="footer">Footer</slot>
        </footer>
    </div>
</article>
```

---

## configuration.html — Le panneau de configuration déclaratif

Ce fichier définit **de manière déclarative** comment le composant est
configurable dans l'éditeur. Il utilise trois systèmes de synchronisation :

### 1. `<p9r-attr-sync>` — Synchronisation d'attributs

Synchronise des inputs du panneau avec des attributs HTML sur le composant.
Chaque input doit avoir un `name` qui correspond à l'attribut cible.

```html
<p9r-attr-sync>
    <p9r-section data-title="Configuration">
        <select name="variant">
            <option selected value="filled">Rempli</option>
            <option value="outline">Outline</option>
        </select>
        <input type="range" name="spacing" min="16" max="64" value="32">
        <input type="text" name="href" placeholder="https://...">
    </p9r-section>
</p9r-attr-sync>
```

- `<p9r-section data-title="...">` : regroupe visuellement les contrôles avec un titre.
- Tous les types d'inputs natifs sont supportés (`select`, `input[type=range]`,
  `input[type=text]`, etc.).
- La valeur initiale de l'input sert de valeur par défaut si l'attribut
  n'est pas encore présent sur le composant.

### 2. `<p9r-comp-sync>` — Synchronisation de sous-composants (slots)

Définit le contenu par défaut de chaque slot et le comportement éditorial
de ses enfants. **C'est le cœur du système** — il gère automatiquement :
- La création du contenu par défaut si le slot est vide
- Les actions autorisées (delete, duplicate, drag, change component…)
- Le lien parent-identifier pour que l'éditeur du slot connaisse son parent

```html
<!-- Slot simple (texte, image…) — non supprimable, non duplicable -->
<p9r-comp-sync>
    <span slot="title">Titre par défaut</span>
</p9r-comp-sync>

<!-- Slot optionnel — l'utilisateur peut supprimer l'élément -->
<p9r-comp-sync optionnal>
    <span slot="subtitle">Sous-titre optionnel</span>
</p9r-comp-sync>

<!-- Slot avec remplacement de composant autorisé -->
<p9r-comp-sync allow-others-components>
    <p slot="footer">Footer</p>
</p9r-comp-sync>

<!-- Slot multiple — permet d'ajouter, supprimer, dupliquer, réordonner -->
<p9r-comp-sync allow-multiple>
    <p>Item par défaut</p>
</p9r-comp-sync>

<!-- Slot multiple avec ajout inline (boutons +/- sur les côtés) -->
<p9r-comp-sync allow-multiple inline-adding>
    <p>Item</p>
</p9r-comp-sync>
```

**Attributs de `<p9r-comp-sync>` :**

| Attribut | Effet |
|---|---|
| *(aucun)* | Slot fixe : non supprimable, non duplicable, pas de changement de composant |
| `optionnal` | L'utilisateur peut supprimer l'élément du slot |
| `allow-others-components` | Autorise le changement de composant (sur slot simple) |
| `allow-multiple` | Active toutes les actions : ajouter, supprimer, dupliquer, drag, changer composant |
| `inline-adding` | (avec `allow-multiple`) Boutons d'ajout positionnés inline plutôt qu'au-dessus/dessous |

**Comportement par défaut de `<p9r-comp-sync>` (sans attribut) :**
Les enfants du slot sont automatiquement configurés avec :
- `disable-duplicate`, `disable-add-after`, `disable-add-before`, `disable-dragging` = true
- `disable-change-component` = true
- `disable-delete` = true

### 3. `<p9r-image-sync>` — Sélecteur d'image via MediaCenter

Se place **en dehors** de `<p9r-attr-sync>` et `<p9r-comp-sync>`,
directement dans une `<p9r-section>`.

```html
<p9r-section data-title="Icônes">
    <p9r-image-sync slotTarget="icon-left" label="Icône gauche"></p9r-image-sync>
    <p9r-image-sync slotTarget="icon-right" label="Icône droite"></p9r-image-sync>
</p9r-section>
```

| Attribut | Rôle |
|---|---|
| `slotTarget` | Nom du slot où l'`<img>` sera inséré/mis à jour |
| `label` | Label affiché au-dessus de l'aperçu |
| `accept` | Types de médias acceptés (défaut : `"image"`) |

### Exemple complet (Card)

```html
<p9r-attr-sync>
    <p9r-section data-title="Apparence">
    </p9r-section>
</p9r-attr-sync>

<p9r-comp-sync>
    <img slot="image" src="https://placehold.co/600x400" alt="Couverture">
</p9r-comp-sync>

<p9r-comp-sync>
    <span slot="title">Titre de mon super article</span>
</p9r-comp-sync>

<p9r-comp-sync>
    <p slot="resume">Un court résumé...</p>
</p9r-comp-sync>

<p9r-comp-sync allow-others-components>
    <p slot="footer">Footer</p>
</p9r-comp-sync>
```

### Exemple complet (Grid — avec attributs + multiple)

```html
<p9r-attr-sync>
    <p9r-section data-title="Configuration">
        <input type="range" name="min-item-width" min="150" max="1500" step="1" value="300">
        <input type="range" name="fixed-height" min="150" max="1500" step="1" value="350">
        <select name="spacing">
            <option selected value="16">Small</option>
            <option value="32">Medium</option>
            <option value="64">Large</option>
        </select>
    </p9r-section>
</p9r-attr-sync>

<p9r-comp-sync optionnal>
    <span slot="title">Contenu de la grille</span>
</p9r-comp-sync>

<p9r-comp-sync allow-multiple inline-adding>
    <p>Lorem ipsum...</p>
</p9r-comp-sync>
```

---

## Composants enfants (sous-composants)

Quand le composant principal a besoin d'un **sous-composant** (ex : une carte
dans un carrousel, un item dans une liste), appliquer les règles suivantes.

### Structure

```
[NomDuComposant]/
├── [NomDuComposant].ts
├── [NomDuComposant]Editor.ts
├── style.css
├── template.html
├── configuration.html
└── SousComposant/
    ├── SousComposant.ts     ← export class, PAS de customElements.define
    ├── tag.ts               ← define + export de la fonction de registration
    ├── style.css
    └── template.html
```

### Règles

1. **Créer le sous-composant** comme un web component à part entière
   (ses propres fichiers `.ts`, `style.css`, `template.html`).
2. **Ne pas créer d'éditeur pour le sous-composant.**
   C'est l'éditeur du **composant parent** qui gère les enfants via
   `<p9r-comp-sync>` dans son `configuration.html`.
3. Le sous-composant utilise les mêmes conventions (`Component`, variables
   CSS autonomes, pas de `super.connectedCallback()`).

### Tag du sous-composant

Le tag est **déterministe**, dérivé du tag parent. Le composant parent et
l'éditeur sont buildés en **bundles séparés** — jamais d'import croisé
entre le composant et l'éditeur.

**`SousComposant/SousComposant.ts`** — exporte la classe sans define :
```ts
import { Component } from 'src/core/Component/core/Component';
export class SousComposant extends Component { ... }
// PAS de customElements.define ici
```

**`SousComposant/tag.ts`** — exporte une fonction de registration :
```ts
import { SousComposant } from "./SousComposant";

export function registerSousComposant(parentTag: string) {
    const childTag = parentTag + "-item";
    if (!customElements.get(childTag)) {
        customElements.define(childTag, SousComposant);
    }
}
```

**Le composant parent** appelle la registration :
```ts
import { registerSousComposant } from "./SousComposant/tag";

const tag = "BE5_TAG_TO_BE_REPLACED";
customElements.define(tag, [NOM]);
registerSousComposant(tag);
```

**L'éditeur** reconstruit le tag enfant sans import croisé :
```ts
const tag = "BE5_TAG_TO_BE_REPLACED";
const sousComposantTag = tag + "-item";
```
