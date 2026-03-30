---
name: create-web-components-with-editor
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

- Étend `Component` depuis `src/core/Utilities/Component`
- Importe `template.html` et `style.css` avec `{ type: 'text' }`
- Dans le `super()`, toujours passer `template: template as unknown as string` :
  ```ts
  super({ css, template: template as unknown as string });
  ```
- Enregistre l'élément :
  ```ts
  customElements.define("BE5_TAG_TO_BE_REPLACED", [NOM]);
  ```
- Si le composant a besoin d'un panneau de configuration, implémenter `get panelConfig()` :
  ```ts
  get panelConfig(): HTMLElement | null {
      return null; // remplacer par la création du panneau si nécessaire
  }
  ```
  Le composant est **autonome** pour son panneau : il crée lui-même les éléments,
  branche les écouteurs, synchronise l'état entre les inputs et le panneau, et
  applique les changements sur lui-même.
  Voir la section [Composants d'input disponibles](#composants-dinput-disponibles)
  pour les éléments à utiliser dans le panneau.

---

## editor.ts

**Imports requis :**
- `Editor` depuis `src/core/Editor/Base/Editor`
- `createDefaultElement` depuis son chemin utilitaire
- `disableBlocActions` depuis `src/Be5System/disableBlocActions`

**Règles :**

1. **Slots** : déclarer comme propriétés privées typées `HTMLElement`
   (ou `HTMLImageElement` pour les images)

2. **Constructeur** : avant de créer un slot, vérifier s'il existe déjà
   dans `this.target` via `querySelector`. S'il existe, le récupérer ;
   sinon le créer avec :
   ```ts
   createDefaultElement(this.target, "slot", "span", "valeur par défaut")
   ```

3. **`init()`** : appeler `disableBlocActions([...slots...])` uniquement sur
   les slots à contenu **fixe et non répétable** (texte simple, image unique).
   Ne pas passer à `disableBlocActions` les slots qui sont des **conteneurs**
   ou des **zones répétables** (composants enfants, listes).

4. **`restore()`** : laisser vide.

5. **Enregistrement final** :
   ```ts
   document.EditorManager.getObserver().register_editor({
     tag: "BE5_TAG_TO_BE_REPLACED",
     cl: [NOM]Editor,
     label: "BE5_LABEL_TO_BE_REPLACED",
     group: "BE5_GROUP_TO_BE_REPLACED"
   });
   ```

---

## style.css

### Règle d'autonomie complète

Le fichier `style.css` doit être **entièrement autosuffisant**. Toutes les
variables CSS nécessaires au composant sont déclarées dans ce fichier.
Ne jamais déléguer de variables vers un fichier externe, un thème à importer
ou une feuille de style partagée. Le composant doit fonctionner avec son seul
`style.css`.

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

---

## Composants enfants

Quand le composant principal a besoin d'un **sous-composant** (ex : une carte
dans un carrousel, un item dans une liste), appliquer les règles suivantes :

1. **Créer le sous-composant** comme un web component à part entière
   (ses propres `component.ts`, `style.css`, `template.html`).
2. **Ne pas créer d'`editor.ts` pour le sous-composant** sauf si nécessaire. 
    Par défaut, c'est l'éditeur du **composant
   parent** qui gère la création, la suppression et la configuration des
   enfants.
3. Le sous-composant utilise les mêmes conventions (`Component`, variables
   CSS autonomes, `BE5_TAG_TO_BE_REPLACED`, etc.).
4. Le composant parent référence le tag du sous-composant dans son
   `template.html` et/ou le crée dynamiquement dans son `component.ts`.

---

## Composants d'input disponibles

À utiliser dans `get panelConfig()` pour construire le panneau de configuration.

| Tag | Classe | Usage |
|---|---|---|
| `w13c-input` | `Input` | Champ texte générique |
| `w13c-input-file` | `InputFile` | Upload de fichier avec drag & drop |
| `w13c-checkbox` | `Checkbox` | Case à cocher |

**`w13c-input`** — attributs utiles : `type`, `placeholder`, `required`, `disabled`, `name`, `value`

**`w13c-input-file`** — expose `.value` (le `File` sélectionné) et `.name`

**`w13c-checkbox`** — expose `.checked` (boolean) et émet un event `change`