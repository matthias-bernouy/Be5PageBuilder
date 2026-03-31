# PageBuilder

CMS modulaire basé sur des Web Components, avec un système d'édition visuel inline. Construit avec **Bun** et **MongoDB**.

## Architecture

```
PageBuilder/
├── App.ts                          # Point d'entrée serveur (MongoDB, endpoints, Be5Runner)
├── PageBuilder.ts                  # Orchestration centrale (repos, auth, media, config)
│
├── src/
│   ├── core/
│   │   ├── Utilities/
│   │   │   └── Component.ts        # Classe de base Web Component (shadow DOM, CSS, template)
│   │   │
│   │   ├── Editor/
│   │   │   ├── Base/
│   │   │   │   ├── EditorManager.ts    # Orchestrateur global (document.EditorManager)
│   │   │   │   ├── Editor.ts           # Classe abstraite éditeur (init/restore, panelConfig, actionBar)
│   │   │   │   ├── ObserverManager.ts  # MutationObserver : détecte les composants et instancie les éditeurs
│   │   │   │   ├── DragManager.ts      # Drag-and-drop pour réordonner les blocs
│   │   │   │   └── BlocActionGroup.ts  # Barre d'actions flottante (supprimer, dupliquer, ajouter...)
│   │   │   │
│   │   │   ├── Component/
│   │   │   │   ├── TextEditor.ts       # Éditeur texte inline (contentEditable, raccourcis clavier)
│   │   │   │   ├── ImageEditor.ts      # Éditeur image (MediaCenter, resize)
│   │   │   │   └── ListEditor.ts       # Éditeur listes (ul/ol, gestion des li)
│   │   │   │
│   │   │   ├── BlocConfiguration/
│   │   │   │   ├── PanelItem.ts            # Web Component de base pour la configuration (synchronisation bidirectionnelle)
│   │   │   │   ├── SelectComponent.ts      # Sélecteur de blocs enfants
│   │   │   │   ├── SectionComponent.ts     # Section regroupant des PanelItem
│   │   │   │   └── BlocConfigurationPanel/ # Panneau latéral de configuration
│   │   │   │
│   │   │   ├── BlocLibrary/
│   │   │   │   └── BlocLibrary.ts      # Dialog modale : catalogue de blocs disponibles
│   │   │   │
│   │   │   └── MediaCenter/
│   │   │       └── MediaCenter.ts      # Explorateur de médias (upload, arborescence)
│   │   │
│   │   └── blocs/                      # Blocs natifs
│   │
│   ├── Be5System/
│   │   ├── utilities.ts                # Enregistrement routes (UI, API, CSS, JS)
│   │   └── blocs/
│   │       └── prepare_bloc.ts         # Bundling IIFE + remplacement des placeholders
│   │
│   ├── interfaces/
│   │   ├── contract/                   # Interfaces (PageBuilderRepository, MediaRepository, Auth)
│   │   └── default-provider/           # Implémentations MongoDB
│   │
│   └── cli/
│       └── CLI_importBloc.ts           # CLI pour importer un bloc dans la DB
│
└── w13c/                               # Bibliothèque de Web Components
    ├── Base/                           # Composants de base (Form, HeroSection, Quote, Table, Tag)
    ├── Dialog/                         # LateralDialog, FormDialog
    ├── Layout/                         # Article, LeftMenuLayout
    ├── Menu/                           # LateralMenu, Toolbar
    └── HorizontalActionGroup/          # Barre d'actions horizontale
```

## Concepts clés

### Composant = Web Component + Éditeur

Chaque bloc du CMS est composé de :
1. **Component** (`extends Component`) : le rendu visuel avec shadow DOM
2. **Editor** (`extends Editor`) : la logique d'édition qui se greffe par-dessus en mode éditeur
3. **panel-config.html** : template de configuration utilisant des `PanelItem` pour le panneau latéral

### Cycle de vie

```
Mode client  ──switch-mode──>  Mode éditeur
                                   │
                         ObserverManager détecte les éléments
                                   │
                         Instancie les Editor correspondants
                                   │
                         Editor.viewEditor() → init()
                                   │
                    ┌──────────────┼──────────────────┐
                    │              │                   │
              TextEditor     ImageEditor         PanelConfig
            (contentEditable) (MediaCenter)    (synchronisation)
```

### Communication

Tout passe par des **Custom Events** :
- `switch-mode` : bascule éditeur/client
- `insert` : BlocLibrary → insertion d'un nouveau bloc
- `select-item` : MediaCenter → sélection d'un média
- `p9r-configuration-changed` : PanelItem → changement de configuration

### Import de blocs

```bash
bun run src/cli/CLI_importBloc.ts --path ./w13c/blocs/Quote --name "Citation" --group "Base"
```

Les placeholders (`BE5_TAG_TO_BE_REPLACED`, `BE5_LABEL_TO_BE_REPLACED`, `BE5_GROUP_TO_BE_REPLACED`) sont remplacés par un ID unique (`be5-{uuid}`) et les métadonnées lors du bundling IIFE.

## Stack

- **Runtime** : Bun
- **Base de données** : MongoDB
- **Frontend** : Web Components natifs (shadow DOM, Custom Elements)
- **Bundling** : Bun bundler (IIFE pour injection dynamique)
- **Auth** : JWT
- **Media** : Sharp (traitement d'images)



---- CLAUDE

---                                                                                                                                                                                                                                                                 
  Ce qui va bien                                                                                                                                                                                                                                                      
  - L'architecture est propre : séparation claire Component / Editor / Configuration. Chaque responsabilité a sa place.                                                                                                                                               
  - Le pattern Observer avec MutationObserver pour auto-instancier les éditeurs est malin - zéro couplage entre les composants et le système d'édition.                                                                                                               
  - Les Custom Events pour la communication inter-composants, c'est la bonne approche avec du shadow DOM.                                                                                                                                                             
  - Le système de placeholders (BE5_TAG_TO_BE_REPLACED) + bundling IIFE pour les blocs dynamiques est bien pensé.                                                                                                                                                     
  - L'abstraction Repository (interface + implémentation MongoDB) permet de changer de DB sans toucher au reste.                                                                                                                                                      
  - Le nouveau PanelItem avec data-identifier et synchro lazy est la bonne direction.                                                                                                                                                                                 
                                                                                                                                                                                                                                                                      
  Ce qui ne va pas / points d'attention                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                      
  1. document.EditorManager en global : ça marche mais c'est fragile. Si un script charge avant EditorManager, ça crash silencieusement. Pas de typage fort non plus (il faut un declare global quelque part).                                                        
  2. Double bundling dans prepare_bloc.ts : tu bundles une première fois dans generate_bloc_files(), puis re-bundles dans prepare_bloc(). C'est volontaire ?
  3. Les éditeurs écoutent switch-mode sur document dans le constructor sans jamais removeEventListener. Si un éditeur est détruit et recréé (mutation DOM), les anciens listeners s'accumulent = memory leak.                                                        
  4. Editor.styleElement est un static Map partagé entre toutes les instances. En mode client, viewClient() supprime tous les styles de toutes les instances. Si deux éditeurs du même type existent, l'un peut casser l'autre.                                       
  5. SelectComponent et PanelItem ont des philosophies différentes : PanelItem fait de la synchro bidirectionnelle simple, SelectComponent a son propre rendu complet. L'héritage est un peu forcé — une interface commune ou un mixin serait peut-être plus adapté.  
  6. Pas de cleanup dans les éditeurs : TextEditor ajoute des keydown/paste listeners, ImageEditor ajoute des click listeners, mais restore() ne les retire pas toujours proprement.                                                                                  
  7. w13c/ mélange composants UI réutilisables (Form, Dialog) et composants CMS (HeroSection, Quote). Deux dossiers séparés seraient plus clairs.                                                                                                                     
  8. Les Form components (Input, Button, etc.) utilisent formAssociated et ElementInternals — c'est moderne et bien fait, mais le nommage est incohérent (w13c-input vs p9r-button vs p9r-panel-item).                                                                
  9. Pas de tests. Pour un système aussi interconnecté, un test d'intégration sur le cycle Editor + PanelItem + Component serait utile.                                                                                                                               
                                                                                                                                                                                                                                                                      
  ---                                                                                                                                                                                                                                                                 
  Les points 3, 4 et 6 (memory leaks / cleanup) sont les plus urgents techniquement. Le reste c'est de l'amélioration progressive.                                                                                                                                    
                                                                                                                                