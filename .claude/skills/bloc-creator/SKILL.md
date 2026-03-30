---
name: bloc-creator
description: >
  Genere un web component BE5 complet avec son editeur associe, en 4 fichiers
  (component.ts, editor.ts, style.css, template.html). Utiliser ce skill des
  que l'utilisateur demande a creer un composant, un bloc, un element ou un
  widget dans l'architecture BE5.
---

# Creer un Web Component avec Editeur

Genere un composant `[NOM]` compose de **4 fichiers** en respectant exactement
les conventions ci-dessous.

## Structure des fichiers

```
[nom-du-composant]/
├── component.ts
├── editor.ts
├── style.css
└── template.html
```

## Placeholders a remplacer

| Placeholder | Description |
|---|---|
| `[NOM]` | Nom de la classe en PascalCase (ex : `HeroCard`) |

### Constantes systeme -- NE PAS MODIFIER

Les identifiants suivants sont des **constantes reservees au systeme de build**.
Ils doivent apparaitre **tels quels, textuellement** dans le code genere.
Ne jamais les remplacer, les renommer, ni demander leur valeur a l'utilisateur.

| Constante | Role | Ou elle apparait |
|---|---|---|
| `BE5_TAG_TO_BE_REPLACED` | Tag HTML du custom element | `component.ts` (`customElements.define`), `editor.ts` (enregistrement), `tag.ts` de sous-composants |
| `BE5_LABEL_TO_BE_REPLACED` | Libelle affiche dans l'editeur | `editor.ts` (enregistrement) |
| `BE5_GROUP_TO_BE_REPLACED` | Groupe de l'editeur | `editor.ts` (enregistrement) |

---

## component.ts

- Etend `Component` depuis `src/core/Utilities/Component`
- Importe `template.html` et `style.css` avec `{ type: 'text' }`
- Dans le `super()`, toujours passer `template: template as unknown as string` :
  ```ts
  super({ css, template: template as unknown as string });
  ```
- **Ne jamais appeler `super.connectedCallback()`** -- la methode n'existe pas sur `Component`.
- Enregistre l'element :
  ```ts
  customElements.define("BE5_TAG_TO_BE_REPLACED", [NOM]);
  ```
- **Ne jamais implementer `panelConfig` dans le composant.** C'est une responsabilite exclusive de l'`editor.ts`.
- Si le composant a des sous-composants, importer leur fichier `tag.ts` :
  ```ts
  import "./SousComposant/tag";
  ```

---

## editor.ts

**Imports requis :**
- `Editor` depuis `src/core/Editor/Base/Editor`
- `createDefaultElement` depuis son chemin utilitaire
- `disableBlocActions` depuis `src/Be5System/disableBlocActions`

**Regles :**

1. **Slots fixes** : declarer comme proprietes privees typees `HTMLElement`
   (ou `HTMLImageElement` pour les images). Les stocker en propriete de classe
   uniquement s'ils sont utilises dans `init()` ou `panelConfig`.
   Sinon, utiliser une variable locale dans le constructeur.

2. **Constructeur** : avant de creer un slot, verifier s'il existe deja
   dans `this.target` via `querySelector`. S'il existe, le recuperer ;
   sinon le creer avec :
   ```ts
   createDefaultElement(this.target, "slot", "span", "valeur par defaut")
   ```

3. **`init()`** : appeler `disableBlocActions([...slots...])` uniquement sur
   les slots a contenu **fixe et non repetable** (texte simple, image unique).
   Ne pas passer a `disableBlocActions` les slots qui sont des **conteneurs**
   ou des **zones repetables** (composants enfants, listes).

4. **`restore()`** : laisser vide.

5. **`override get panelConfig()`** : implementer **dans l'editeur**
   (pas dans le composant). Toujours utiliser `override`.

6. **Enregistrement final** :
   ```ts
   document.EditorManager.getObserver().register_editor({
     tag: "BE5_TAG_TO_BE_REPLACED",
     cl: [NOM]Editor,
     label: "BE5_LABEL_TO_BE_REPLACED",
     group: "BE5_GROUP_TO_BE_REPLACED"
   });
   ```

### panelConfig -- regles detaillees

Le `panelConfig` est affiche dans un panneau lateral. Les elements crees
dans le getter ne sont pas encore dans le DOM quand on les configure.

**Inputs natifs obligatoires** : utiliser des `<input>` HTML natifs
(pas `w13c-input`) pour les champs texte dans le panelConfig. Les composants
`w13c-input` et `w13c-checkbox` initialisent leur `_input` interne dans
`connectedCallback`, donc `.value` et `.checked` sont des no-op avant
insertion dans le DOM.

```ts
// OK -- input natif, .value fonctionne immediatement
const input = document.createElement("input");
input.value = "foo";

// KO -- w13c-input, _input est null avant connectedCallback
const input = document.createElement("w13c-input");
input.value = "foo"; // no-op !
```

**Exception `w13c-checkbox`** : utiliser `setAttribute("checked", "")`
(pas `.checked = true`) car l'attribut est lu dans `connectedCallback` :
```ts
const cb = document.createElement("w13c-checkbox") as any;
cb.textContent = "Mon option";
if (this.target.hasAttribute("mon-attr")) cb.setAttribute("checked", "");
cb.addEventListener("change", () => {
    this.target.toggleAttribute("mon-attr", cb.checked);
});
```

**Zones repetables** : si le composant a des zones repetables (items de nav,
actions, cartes...), le panelConfig doit offrir pour chacune :
- La **liste** des elements existants avec inputs d'edition (texte, URL...)
- Un bouton **supprimer** par element
- Un bouton **ajouter** qui cree l'element dans le DOM ET ajoute la ligne au panel

Patron type :
```ts
override get panelConfig(): HTMLElement | null {
    const panel = document.createElement("div");

    const list = document.createElement("div");
    this.target.querySelectorAll("mon-selecteur").forEach(el => {
        list.appendChild(this.buildRow(el as HTMLElement));
    });
    panel.appendChild(list);

    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Ajouter";
    addBtn.addEventListener("click", () => {
        const el = this.createNewItem();     // cree dans this.target
        list.appendChild(this.buildRow(el)); // ajoute au panel
    });
    panel.appendChild(addBtn);

    return panel;
}
```

---

## style.css

### Regle d'autonomie complete

Le fichier `style.css` doit etre **entierement autosuffisant**. Toutes les
variables CSS necessaires au composant sont declarees dans ce fichier.
Ne jamais deleguer de variables vers un fichier externe, un theme a importer
ou une feuille de style partagee.

### Convention de declaration

- Dans `:host` : declarer **toutes** les variables locales `--[component]-*`
  avec comme valeur par defaut les variables globales du systeme de design
  et un fallback en dur.
- **Aucune valeur magique** dans les regles CSS -- tout passe par une variable locale.
- Si le composant a des etats visuels (hover, active, disabled...), prevoir
  les variables correspondantes directement dans `:host`.

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

---

## template.html

- Utiliser des `<slot name="...">` correspondant **exactement** aux slots
  declares dans `editor.ts`.

---

## Composants enfants

Quand le composant principal a besoin d'un **sous-composant** (ex : une carte
dans un carrousel, un item dans une liste), appliquer les regles suivantes :

### Structure

```
[nom-du-composant]/
├── component.ts
├── editor.ts
├── style.css
├── template.html
└── SousComposant/
    ├── component.ts    -- export class, PAS de customElements.define
    ├── tag.ts          -- define + export du tag
    ├── style.css
    └── template.html
```

### Regles

1. **Creer le sous-composant** comme un web component a part entiere
   (ses propres `component.ts`, `style.css`, `template.html`).
2. **Ne pas creer d'`editor.ts` pour le sous-composant** sauf si necessaire.
   C'est l'editeur du **composant parent** qui gere les enfants.
3. Le sous-composant utilise les memes conventions (`Component`, variables
   CSS autonomes, pas de `super.connectedCallback()`).

### Tag du sous-composant

Le sous-composant **n'utilise PAS `crypto.randomUUID()`** pour son tag.
Un tag aleatoire change a chaque rechargement et les elements sauvegardes
deviennent des elements HTML inconnus.

Le tag doit etre **deterministe**, derive du tag parent.

**`tag.ts`** exporte une **fonction de registration** qui recoit le tag parent :
```ts
// SousComposant/tag.ts
import { SousComposant } from "./component";

export function registerSousComposant(parentTag: string) {
    const childTag = parentTag + "-item";
    if (!customElements.get(childTag)) {
        customElements.define(childTag, SousComposant);
    }
}
```

Le `component.ts` du sous-composant **exporte** sa classe sans define :
```ts
// SousComposant/component.ts
export class SousComposant extends Component { ... }
// PAS de customElements.define ici
```

### Imports sans couplage

Le composant parent et l'editeur sont buildes en **bundles separes**.
Jamais d'import croise entre `component.ts` et `editor.ts`.

**Le composant parent** declare la constante build et appelle la registration :
```ts
// component.ts du parent
import { registerSousComposant } from "./SousComposant/tag";

const tag = "BE5_TAG_TO_BE_REPLACED";
// ... class + customElements.define(tag, ...) ...
registerSousComposant(tag);
```

**L'editeur** reconstruit le tag enfant de la meme facon :
```ts
// editor.ts du parent
const tag = "BE5_TAG_TO_BE_REPLACED";
const sousComposantTag = tag + "-item";
```

`BE5_TAG_TO_BE_REPLACED` est present dans les deux bundles et remplace
par le build system avec la meme valeur. Le tag enfant est donc identique
dans les deux contextes, sans import croise.

---

## Composants d'input disponibles

A utiliser dans `get panelConfig()` pour construire le panneau de configuration.

| Tag | Classe | Usage | Utilisable dans panelConfig ? |
|---|---|---|---|
| `<input>` natif | -- | Champ texte | **Oui** (recommande) |
| `w13c-checkbox` | `Checkbox` | Case a cocher | Oui (avec `setAttribute`) |
| `w13c-input` | `Input` | Champ texte | **Non** (`.value` no-op avant DOM) |
| `w13c-input-file` | `InputFile` | Upload fichier | A tester |

**`w13c-checkbox`** -- `.checked` ne fonctionne qu'apres `connectedCallback`.
Utiliser `setAttribute("checked", "")` pour la valeur initiale.
Emet un event `change` avec `bubbles: true`.
