# PageBuilder — Audit

## Problèmes structurels

### Zéro test automatisé

`test/` contient des blocs de démo, pas d'assertions. `find -name "*.test.ts"` → 0 fichier.

Les invariants fragiles qui bénéficieraient d'une couverture :
- Lifecycle `Editor` (`viewEditor` / `viewClient` réversibles, aucun attribut résiduel).
- Sealing opaque (`_sealOpaqueSubtree` + barrière dans `make_it_editor`).
- `MutationObserver` sur ajout/suppression/déplacement de blocs.
- `EditorManager.save` upsert avec renommage de path/identifier.
- `page.post.ts` sur reserved paths + invalidation de cache (home ref).

Vingtaine de tests intégration (happy-dom ou Playwright) couvriraient l'essentiel. C'est aujourd'hui l'angle mort majeur : les régressions sur ces invariants passent inaperçues jusqu'à ce qu'un bloc en production se casse.

---

### `DragManager.ts` trop minimal

- Pas d'indicateur visuel de drop.
- Pas de garde : on peut potentiellement drop un bloc dans son propre descendant (→ détachement de l'arbre).
- Pas d'auto-scroll quand on approche des bords du viewport.
- `insertBefore(this.draggedElement!, ...)` : non-null assertion qui throwera si `handleDragOver` se déclenche sans `handleDragStart` préalable (drag natif depuis l'extérieur de la page).

Layouts imbriqués (grid, columns) vont révéler ces limites.

---

### Singletons globaux sur `document`

`document.EditorManager`, `document.compIdentifierToEditor`. Pattern pragmatique mais :
- Impossible à instancier deux fois (multi-iframe, preview, tests parallèles).
- Couple tout le système à un singleton implicite → tests unitaires du moindre `Editor` nécessitent de mock `document.EditorManager`.

Si le besoin multi-instance n'existe pas, OK — mais à documenter explicitement dans `Editor.ts` / `EditorManager.ts`.

---

### Perte de typage dans `ConfigPanel` / `Editor`

```ts
const panelItems = this._panelConfig.querySelectorAll('*') as unknown as any[];
panelItems.forEach((item) => { ... });
```

```ts
const elements = Array.from(this.querySelectorAll("*")) as any[];
for (const element of elements) {
    if (element.init) element.init();
}
```

Une interface explicite (`interface Configurable { init(): void }`) + filtrage typé (`instanceof` ou test sur `customElements.get(tag)`) remplacerait les `as any[]` et ferait échouer le build si un nouveau input oublie `init()`. 69 occurrences de `any` dans `src/**/*.ts` — pas catastrophique mais concentrées dans les zones fragiles.

---

### CLI — duplication env + API

`CLI_importBloc.ts`, `CLI_listBlocs.ts`, `CLI_dev.ts` lisent tous `P9R_URL` / `P9R_TOKEN` et construisent leurs requêtes authentifiées à la main. Un petit `cliClient.ts` exportant `getEnv()` + `apiFetch(path, init)` supprimerait la répétition et centraliserait la gestion d'erreur auth/connectivité.

---

### `routing.ts:84` — `registerAPIFolder` ne valide pas la méthode HTTP

```ts
const method = parts[1]?.toUpperCase() || "GET";
runner.addEndpoint(method as any, endpointUrl, ...)
```

Un fichier mal nommé (`foo.typo.ts`) enregistre silencieusement un endpoint avec une méthode bidon. Whitelist `GET/POST/PUT/PATCH/DELETE` avec erreur explicite au boot éviterait le piège.

---

### Build à la première requête

`registerUIFolder` appelle `Bun.build` à l'intérieur du handler pour chaque `*.client.ts`. C'est caché via `cachedResponseAsync`, mais sur cold start l'admin paie le build à la première visite de chaque page (premier clic = latence visible). Pré-build au boot rendrait le comportement plus prévisible et fail-fast si un bundle est cassé.

---

## Nice-to-haves

- **Typo** `Editor.ts:38` : "Critial" → "Critical".
- **Code mort** `Editor.ts:37-39` : la vérif de collision `crypto.randomUUID()` ne se déclenchera jamais — à supprimer.
- **Pas de CI visible.** Un `bun typecheck` en pre-commit (et idéalement en GitHub Action) attraperait la dérive `any` et les imports cassés avant le runtime.
- **`Component.ts`** injecte `metadata.template` via `innerHTML`. OK tant que le template vient d'un asset bundlé (`import template from './template.html' with { type: 'text' }`), mais l'invariant "jamais de string dynamique ici" mérite d'être écrit en commentaire au-dessus du constructeur, sinon un futur contributeur passera une template literal interpolée et ouvrira un vecteur XSS.

---

## Ordre d'attaque suggéré

1. Bugs 1-4 (tous localisés, ~1h total).
2. Écrire quelques tests intégration sur le lifecycle `Editor` + `ObserverManager` — profitera aussi à valider les fixes ci-dessus.
3. Durcir `DragManager` (garde descendant + indicateur visuel).
4. Cleanup `any` dans `ConfigPanel` + factoriser le client CLI.
5. Pré-build des `*.client.ts` au boot + validation des méthodes HTTP dans `registerAPIFolder`.
