---
name: bloc-creator
description: >
  Génère un web component BE5 complet avec son éditeur associé, en 4 fichiers
  (component.ts, editor.ts, style.css, template.html). Utiliser ce skill dès
  que l'utilisateur demande à créer un composant, un bloc, un élément ou un
  widget dans l'architecture BE5 — même s'il ne mentionne pas explicitement
  les 4 fichiers ou le mot "skill".
---

# Créer un Web Component avec Éditeur

Génère un composant `[NOM]` composé de **4 fichiers** en respectant exactement
les conventions ci-dessous.

## Structure des fichiers

```
[nom-du-composant]/
├── component.ts
├── editor.ts
├── style.css
├── template.html
└── SousComposant/          ← uniquement si sous-composant nécessaire
    ├── component.ts
    ├── tag.ts
    ├── style.css
    └── template.html
```

## Placeholders à remplacer

| Placeholder | Description |
|---|---|
| `[NOM]` | Nom de la classe en PascalCase (ex : `HeroCard`) |

### ⚠️ Constantes système — NE PAS MODIFIER

Les identifiants suivants sont des **constantes réservées au système de build**.
Ils doivent apparaître **tels quels, textuellement** dans le code généré.
Ne jamais les remplacer, les renommer, ni demander leur valeur à l'utilisateur.

| Constante | Rôle | Où elle apparaît |
|---|---|---|
| `BE5_TAG_TO_BE_REPLACED` | Tag HTML du custom element | `component.ts` (`customElements.define`), `editor.ts` (enregistrement) |
| `BE5_LABEL_TO_BE_REPLACED` | Libellé affiché dans l'éditeur | `editor.ts` (enregistrement) |
| `BE5_GROUP_TO_BE_REPLACED` | Groupe de l'éditeur | `editor.ts` (enregistrement) |

---

## component.ts

**Import exact :**
```ts
import { Component } from "src/core/Utilities/Component";
```

**Règles :**

- Étend `Component`
- Importe `template.html` et `style.css` avec `{ type: 'text' }`
- Dans le `super()`, toujours passer `template: template as unknown as string` :
  ```ts
  super({ css, template: template as unknown as string });
  ```
- Enregistre l'élément :
  ```ts
  customElements.define("BE5_TAG_TO_BE_REPLACED", [NOM]);
  ```
- Si le composant a des sous-composants, importer et appeler leur registration
  ```ts
  import { registerSousComposant } from "./SousComposant/tag";
  const tag = "BE5_TAG_TO_BE_REPLACED";
  // ... customElements.define(tag, [NOM]);
  registerSousComposant(tag);
  ```

### ⛔ Interdit dans component.ts

- **Ne jamais appeler `super.connectedCallback()`** — la méthode n'existe pas
  sur `Component`.
- **Ne pas implémenter `get panelConfig()` ici.** Ce getter appartient
  exclusivement à l'**Editor** (voir section editor.ts).

---

## editor.ts

**Imports exacts :**
```ts
import { Editor } from "src/core/Editor/core/Editor";
import { createDefaultElement } from "src/core/Utilities/createDefaultElement";
import { disableBlocActions } from "src/Be5System/disableBlocActions";
```

**Règles :**

1. **Classe** : `[NOM]Editor extends Editor`

2. **`super()` dans le constructeur** :
   ```ts
   constructor(target: HTMLElement) {
       super(target); // sans style éditeur
       // ou
       super(target, "mon-style-editor"); // avec CSS spécifique au mode éditeur
   }
   ```

3. **Slots fixes** : déclarer comme propriétés privées typées `HTMLElement`
   (ou `HTMLImageElement` pour les images). Les stocker en propriété de classe
   **uniquement** s'ils sont utilisés dans `init()` ou `panelConfig`.
   Sinon, utiliser une variable locale dans le constructeur.

4. **Constructeur (suite)** : avant de créer un slot, vérifier s'il existe déjà
   dans `this.target` via `querySelector`. S'il existe, le récupérer ;
   sinon le créer avec :
   ```ts
   createDefaultElement(this.target, "slot", "span", "valeur par défaut")
   ```

5. **`init()`** : appeler `disableBlocActions([...slots...])` uniquement sur
   les slots à contenu **fixe et non répétable** (texte simple, image unique).
   Ne pas passer à `disableBlocActions` les slots qui sont des **conteneurs**
   ou des **zones répétables** (composants enfants, listes).

6. **`restore()`** : laisser vide.

7. **`override get panelConfig()`** : implémenter **dans l'éditeur**
   (pas dans le composant). Toujours utiliser le mot-clé `override` :
   ```ts
   override get panelConfig(): HTMLElement | null {
       return null; // remplacer par la création du panneau si nécessaire
   }
   ```
   Le `panelConfig` est affiché dans un **panneau latéral**. Les éléments
   créés dans le getter ne sont pas encore dans le DOM quand on les configure.
   L'éditeur est autonome : il crée les éléments, branche les écouteurs,
   synchronise l'état entre les inputs et `this.target`, et applique les
   changements.

8. **Désactiver les actions de base** : par défaut, supprimer les actions
   inutiles via des attributs `data-disable-*` sur le composant cible.
   En général, toutes les actions doivent être supprimées sauf besoin explicite.
   Quand tu mets un composant en paramètre, en général tu veux garder son fonctionnement cependant.

   Actions disponibles :
   - `data-disable-delete`
   - `data-disable-edit`
   - `data-disable-duplicate`
   - `data-disable-add-before`
   - `data-disable-add-after`
   - `data-disable-save-as-template`

9. **Enregistrement final** :
   ```ts
   document.EditorManager.getObserver().register_editor({
     tag: "BE5_TAG_TO_BE_REPLACED",
     cl: [NOM]Editor,
     label: "BE5_LABEL_TO_BE_REPLACED",
     group: "BE5_GROUP_TO_BE_REPLACED"
   });
   ```

### panelConfig — éléments avec comportements prédéfinis

Certains éléments HTML ont des comportements automatiques quand ils sont
passés dans le `panelConfig` :

| Élément | Comportement automatique |
|---|---|
| `img` | Resize, clic ouvre le Media Center, actions de base |
| `p`, `span`, `a` | RichText, actions de base |

Voir les fichiers `TextEditor`, `ListEditor`, `ImageEditor` pour le détail
de ces comportements.

### Composants d'input pour le panneau

À utiliser dans `override get panelConfig()` pour construire le panneau
de configuration :

| Tag | Usage |
|---|---|
| `w13c-input` | Champ texte générique — attributs : `type`, `placeholder`, `required`, `disabled`, `name`, `value` |
| `w13c-input-file` | Upload de fichier avec drag & drop — expose `.value` (le `File`) et `.name` |
| `w13c-checkbox` | Case à cocher — expose `.checked` (boolean), émet un event `change` |
| `w13c-component` | Ouverture du ComponentLibrary pour la sélection d'un composant |

---

## style.css

### Règle d'autonomie complète

Le fichier `style.css` doit être **entièrement autosuffisant**. Toutes les
variables CSS nécessaires au composant sont déclarées dans ce fichier.
Ne jamais déléguer de variables vers un fichier externe, un thème à importer
ou une feuille de style partagée.

### Convention de déclaration

- Dans `:host` : déclarer **toutes** les variables locales `--[component]-*`
  avec comme valeur par défaut les variables globales du système de design
  et un fallback en dur.
- **Aucune valeur magique** dans les règles CSS — tout passe par une variable locale.
- Si le composant a des états visuels (hover, active, disabled…), prévoir
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
  déclarés dans `editor.ts`.
- Les slots peuvent accueillir des composants externes (boutons, inputs, sous-composants…).

---

## Composants enfants

Quand le composant principal a besoin d'un **sous-composant** (ex : une carte
dans un carrousel, un item dans une liste), appliquer les règles suivantes.

### Structure

```
[nom-du-composant]/
├── component.ts
├── editor.ts
├── style.css
├── template.html
└── SousComposant/
    ├── component.ts    ← export class, PAS de customElements.define
    ├── tag.ts          ← define + export de la fonction de registration
    ├── style.css
    └── template.html
```

### Règles

1. **Créer le sous-composant** comme un web component à part entière
   (ses propres `component.ts`, `style.css`, `template.html`).
2. **Ne pas créer d'`editor.ts` pour le sous-composant** sauf besoin explicite.
   C'est l'éditeur du **composant parent** qui gère les enfants.
3. Le sous-composant utilise les mêmes conventions (`Component`, variables
   CSS autonomes, pas de `super.connectedCallback()`).

### Tag du sous-composant

Le tag est **déterministe**, dérivé du tag parent. Le composant parent et
l'éditeur sont buildés en **bundles séparés** — jamais d'import croisé
entre `component.ts` et `editor.ts`.

**`SousComposant/component.ts`** — exporte la classe sans define :
```ts
import { Component } from "src/core/Utilities/Component";
export class SousComposant extends Component { ... }
// PAS de customElements.define ici
```

**`SousComposant/tag.ts`** — exporte une fonction de registration :
```ts
import { SousComposant } from "./component";

export function registerSousComposant(parentTag: string) {
    const childTag = parentTag + "-item";
    if (!customElements.get(childTag)) {
        customElements.define(childTag, SousComposant);
    }
}
```

**Le composant parent** appelle la registration :
```ts
// component.ts du parent
import { registerSousComposant } from "./SousComposant/tag";

const tag = "BE5_TAG_TO_BE_REPLACED";
customElements.define(tag, [NOM]);
registerSousComposant(tag);
```

**L'éditeur** reconstruit le tag enfant sans import croisé :
```ts
// editor.ts du parent
const tag = "BE5_TAG_TO_BE_REPLACED";
const sousComposantTag = tag + "-item";
```

`BE5_TAG_TO_BE_REPLACED` est présent dans les deux bundles et remplacé
par le build system avec la même valeur. Le tag enfant est donc identique
dans les deux contextes.