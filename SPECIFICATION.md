# CODEX MASTER EXECUTION PROMPT — SHIFT//BREAK × ALEF//OS

> **For OpenAI Codex (coding agent) | Execution specification | Version 1.0**
>
> **This is a build request, not a request for another project proposal.** Inspect the repository and implement the project in working, testable increments. The complete original creative brief and the complete original 14-increment roadmap are preserved verbatim in the appendices. Read this entire document before coding.

## 0. Your role and operating mode

You are the **lead gameplay engineer, creative technologist, 3D web engineer, UI engineer, technical artist, systems architect and QA owner** for a browser-based interactive portfolio called **SHIFT//BREAK × ALEF//OS**.

**Your responsibility is to deliver actual source code, assets you are authorized to use/create, automated tests, docs and runnable builds in the repository — not mockups, high-level advice, or a plan without implementation.** Aim ultimately for the complete version 1.0 described below. Work incrementally; each increment must leave the repository in a usable state. Begin implementation in the current Codex session, starting with any missing foundations.

If the task cannot fit in one coding session, complete as many consecutive validated increments as feasible and leave an unambiguous continuation record; **do not claim an unimplemented feature is finished**. Do not stop at a plan when a working vertical slice can be built. Avoid asking unnecessary questions: inspect the existing project, use the supplied specification, make reversible reasonable engineering decisions and document assumptions. Ask only when access, irreversible actions or missing essential content require it.

**Response language:** report progress and decisions to the owner in **Brazilian Portuguese**. Use clear, maintainable English for code identifiers; write user-facing copy with an easy-to-localize content layer (pt-BR is a reasonable starting locale unless the current project already defines another). Preserve proper names exactly: `SHIFT//BREAK`, `REDLINE`, `BREAKPOINT`, `OVERDRIVE`, `ALEF//OS`, `FLOW`, `DRIFT.exe`, `FIGHT.exe`, `FPS.exe`.

## 1. Source-of-truth hierarchy and interpretation

1. Respect existing repository instructions (`AGENTS.md`, README, tooling, architecture and user modifications), as long as they do not contradict the fundamental project requirements.
2. This execution contract specifies **how** to implement and verify the project.
3. **Appendix A** is the full original **creative/product brief**: use it as the authority for **what the experience is**.
4. **Appendix B** is the full original **14-increment roadmap**: use it as the authority for **delivery sequence, named versions, increment-specific scope and acceptance criteria**.
5. Where a detail is underspecified, choose the smallest technically sound, extensible implementation that preserves the intent; record the choice in an ADR or decision log. Do not silently remove mandatory features.

**Important reconciliation:** the **visitor's final journey** begins with SHIFT//BREAK, but the **engineering implementation** begins with the 3D room + working monitor + ALEF//OS. These are not conflicting instructions. In early builds, allow a direct room/OS path and/or clearly marked development entry points. Integrate the intended opening sequence later at increments 10–12.

The files named `Texto colado(2).txt` and `pt1.txt` from the original request were exact content duplicates, so their content is included **once** in Appendix A. `pt2.txt` is included in Appendix B. No unique specifications have been removed.

## 2. Non-negotiable experience pillars

### 2.1 The conceptual hierarchy

**THIS IS NOT a desktop site introduced by a 3D room. THIS IS a detailed, explorable 3D room containing an actual interactive computer.** The room is the primary continuous world. The OS is a spatially situated tool within that world, and the games are applications running on the computer. Do not shortcut the experience into a normal full-screen webpage masquerading as the desktop.

The player can look around the room, leave the monitor interaction mode, inspect objects and (by the planned expansion) physically explore the room. While using ALEF//OS normally, keep the monitor frame and surrounding room perceptible; a temporary immersive game mode is explicitly permitted, but exiting always returns to the computer within the room.

### 2.2 The designed first-time visitor journey (final product)

1. Open website → polished, minimal `SHIFT//BREAK` entry screen, explicit Start action (for browser audio/input permissions) and unobtrusive **Skip / Go straight to portfolio** path.
2. Play a short cinematic sequence of **REDLINE** (Japanese mountain touge, night, wet asphalt, fog, arcade drift, rival, roadblock) → **BREAKPOINT** (3D side-view fighting on the same road with the car visible and its headlights illuminating the arena) → **OVERDRIVE** (fast first-person combat in connected road/tunnel geography).
3. Genre shifts feel motivated by continuous camera movement and in-world events rather than generic loading screens; the score/skill system `FLOW` persists across all three acts.
4. After final FPS encounter, freeze/hold the final game image, hear a mouse click, **pull the camera back** to reveal the image inside a physical monitor on a physical desk in the 3D room. Spatialize/de-emphasize the game audio into computer speakers. Show a cursor minimizing SHIFT//BREAK to reveal ALEF//OS.
5. Give control of the first-person room camera to the visitor. Allow looking around, interacting with objects, entering/leaving the monitor and accessing all professional information.
6. From ALEF//OS, launch `SHIFT//BREAK`, `DRIFT.exe`, `FIGHT.exe`, `FPS.exe` and other OS applications; closing any launched game returns to the room and monitor correctly, without page reload.

Every stage should work as an integrated product; during development each subsystem must also be independently testable.

### 2.3 Professional content is not optional

The portfolio needs to work for recruiters and visitors who **do not want to play**. The direct portfolio path must expose the author's overview, skills, projects, contact links and résumé access quickly and reliably. Do not require beating any game, discovering a secret or having powerful graphics hardware to read professional content. If WebGL is unavailable, offer a graceful **functional accessible 2D portfolio fallback** while making clear that it is an accessibility/compatibility alternative, *not* the main designed experience.

Never fabricate personal facts, project achievements, screenshots, a résumé PDF or contact details. Use an editable data schema, clearly marked safe placeholders only where source material is missing, and make external links available once real URLs/assets are supplied. Do not create broken pretend résumé-download buttons.

## 3. Implementation scope — required functional systems

### 3.1 Real-time 3D room / embodied navigation

- Compact, carefully composed and furnished developer's room; desk with physical monitor, keyboard, mouse, headphones, chair, window, books/shelf and ambient props.
- Dark/neutral palette, controlled red accents, subtle Japanese/gaming references, material realism (wood, fabric, metal and plastic retain natural properties). Cinematic but readable lighting: monitor spill, indirect lamp, soft shadows, plausible physical scale and composition.
- Camera starts seated at the computer. Mouse look, adjustable sensitivity and pitch limits; later WASD movement, collisions, interaction distance and smooth movement/camera response.
- Click/raycast or focus + interaction key, readable affordances, inspectable objects, audio player, shelf/art/project markers, environmental details and easter eggs. Do not plaster the author's name over surfaces.
- Camera transitions into/out of seated monitor mode must be comfortable and reversible. Handle interrupted transitions, reduced-motion preferences, pointer-lock denial, tab focus loss and resizes.
- Maintain a coherent exterior visible from the window; it can be lightweight geometry/skybox until the room gets its final art.

### 3.2 The genuinely interactive in-world monitor

This is the highest-risk technical part. **Validate it in increments 02–03 before implementing complex gameplay.**

- Render a dynamic real OS UI on a plane aligned with the physical monitor, including perspective and reliable pointer interaction.
- Compare feasible approaches and choose based on **working input mapping, correct 3D perspective, readability, z-order/occlusion, performance, browser compatibility and accessibility**: e.g. DOM/HTML overlay projected and transformed onto the monitor vs dynamic texture/canvas composition vs another proven equivalent. Do not pretend a static screenshot is interactive.
- Account for viewport size, renderer pixel ratio, camera projection, UV-to-pointer mapping, screen mesh aspect ratio, clipping and changes in perspective. A projected overlay must not visually float in front of walls/objects when occluded.
- Capture pointer/keyboard events only in the correct interaction state; prevent room-look and OS UI input from fighting each other. Provide reliable escape/exit behavior and cursor recovery.
- Make the **game-frame-to-monitor reveal** feasible from day one (shared render target, last-frame capture/texture, or equivalent solution); demonstrate it with a diagnostic prototype and explain any chosen limitations.
- OS normal mode should display a physical monitor and portions of the surrounding room. Full-window OS replacement is **not acceptable** as the default solution.

### 3.3 ALEF//OS (functional fake operating system)

Implement these as working applications and reusable UI primitives, not as noninteractive visual props:

- Desktop, wallpaper, icons, taskbar, application menu, functional clock and notifications.
- Window manager: open/close/minimize/maximize/drag, focus and z-index, reasonable viewport constraints, state preservation as appropriate, pointer/keyboard interaction and multi-window behavior.
- File explorer with folders and configured files: `identity.txt`, `about_me.md`, `skills.json`, `resume.pdf` (only when a real asset exists), `projects/`, `gallery/`. Use editors/viewers appropriate to text, JSON/code, images and PDF.
- Portfolio project viewer with descriptions, technologies, screenshots, validated links, repository/demo links when available; schemas for adding and updating projects without editing core window manager code.
- Games library: `SHIFT//BREAK` campaign, standalone `DRIFT.exe`, `FIGHT.exe`, `FPS.exe`; title art/covers/description/status; launch, pause, restart and exit; no page reload. Modules can be unavailable with an honest development-state label *only until their respective increments are built*.
- Terminal with explicit, safe, sandboxed virtual commands and simulated filesystem (not a shell that runs arbitrary system code).
- Music player with playback controls and original/licensed tracks only; must behave gracefully when no audio assets are present.
- Settings for audio, UI theme, wallpaper, graphics quality, mouse sensitivity, reduced motion and useful accessibility choices; save safe preferences locally.
- Achievements, gallery and contact app. Persist user-visible progress appropriately and defensively (schema versioning, migration-safe defaults and storage failures handled).
- Room items may open associated projects/notes/art inside the OS or show in-world info; keep project data single-sourced.

### 3.4 SHIFT//BREAK gameplay and shared FLOW

Implement **three real, playable game systems**, each with its own loop, start/end conditions, failure/restart path, responsive controls, visible feedback and independently launchable mode. They share an authored campaign director/state machine.

**REDLINE / DRIFT.exe**
- Japanese mountain-road downhill at night: guard rails, elevation changes, corners, wet-looking surface, fog/mountains, rival car, roadblock.
- Arcade acceleration/braking/steering/drift physics: skillful but approachable handling, chase camera and collision limits.
- Drift scoring, speed display, tire smoke/skid effects, rival behavior; satisfying finish/transition trigger.
- Avoid real automotive simulation complexity unless needed for fun and stable control. Use authored/procedural reusable roads if assets are unavailable.

**BREAKPOINT / FIGHT.exe**
- 3D side-view arena continuing the road set; the previous car stays in the environment with headlights.
- Light/heavy attacks, dodge, block, counters, combos, hit detection, damage, responsive feedback, opponent AI, win/loss/retry.
- Finish beat introduces an armed enemy; a staged disarm sequence leads to first-person perspective. Use convincing animation/camera even with interim rigs.

**OVERDRIVE / FPS.exe**
- Fast first-person movement: run, slide, dash, aiming, firing, reload, health, ammunition and responsive weapon feedback.
- Enemies with bounded AI and hit reactions; objective-driven short tunnel/road-linked encounters, win/loss/retry, finale.
- Dark environments with controlled red highlights, gun flashes, smoke/sparks and motion-friendly effects.

**FLOW**
- One persistent, testable score/combo/performance model spanning all three acts: drift/precision and passing; fighting combos/perfect evades/counters; FPS accuracy/fast defeats/efficient movement.
- Define explicit scoring events, caps, decay/combos and anti-exploit safeguards; provide HUD and session report.
- Use FLOW to modulate permitted visual/audio intensity without hiding essential game UI. Store final results and achievements.

### 3.5 Audio and genre-shift cinematics

- Music matters as much as the action: electronic rock, drum and bass, breakcore and Japanese-game-action energy, **using original or properly licensed tracks**; never embed copyrighted commercial soundtrack files without permission.
- Build an event-driven music/beat director so important transitions align to appropriate musical moments **without forcing a fixed gameplay timer**. If needed, use authored segment boundaries, beat maps, stingers and crossfades; degrade gracefully if soundtrack files do not yet exist.
- Camera/action director manages REDLINE→BREAKPOINT, BREAKPOINT→OVERDRIVE and FPS→room. Smoothly hand off controls/cameras and unload old game resources after transitions.
- Test interruptions, restarting from checkpoints, low FPS, backgrounding the tab, lost sound context, skips and return-to-OS behavior.
- The finale's mouse click, monitor-frame reveal, changing sound perspective and minimization into ALEF//OS are **signature moments**, not optional effects.

## 4. Stack and architecture guidance

Baseline required by the supplied roadmap: **Three.js + TypeScript + Vite**. Prefer a modest, maintainable, modular architecture. Inspect what already exists before installing or replacing anything. Use an appropriate physics library (e.g. Rapier) only when it materially improves stability/effort; custom deterministic arcade physics is suitable for drift if clearly tested. HTML/CSS can power ALEF//OS, but it must be shown **on the physical 3D monitor**. Avoid unnecessary backends, account systems, hosted services and subscriptions: the browser experience should be deployable as a static web app if possible.

Suggested conceptual boundaries (adapt to existing code rather than blindly imposing folders):

```text
src/
  app/            # composition root, lifecycle, boot and routing / mode controller
  core/           # event bus, state machines, resources, time, settings, storage, errors
  graphics/       # Three.js renderer, cameras, materials, effects, scene lifecycle
  room/           # scene assembly, navigation, interactions, props, monitor geometry
  monitor/        # in-world UI projection, input mapping, OS-to-3D coordination
  os/             # desktop, window manager, shell, app registry, virtual filesystem
    apps/         # explorer, viewers, gallery, contact, settings, terminal, etc.
  games/
    common/       # interfaces, gameplay lifecycle, shared HUD, score and input
    redline/      # driving module
    breakpoint/   # fighting module
    overdrive/    # FPS module
    campaign/     # SHIFT//BREAK director, checkpoints, FLOW
  transitions/    # choreographed camera, scene and audio transitions
  audio/          # audio mixer and music event synchronization
  content/        # editable verified author/project data and translations
  ui/             # reusable UI and accessibility/fallback surfaces
  assets/         # source-owned/licensed resources (prefer optimized GLB etc.)
tests/            # unit, integration and browser e2e
public/           # only distributable static assets
 docs/            # decision logs, increments, content inventory, known limitations
```

**Engineering invariants:**

- The room owns the persistent world state; OS and games are lifecycle-managed modules. Keep game logic decoupled from room rendering; avoid a giant `main.ts` or a single file containing the whole project.
- Centralize app/game input ownership and state transitions; no simultaneous gameplay + window-manager key handlers.
- Use one active render loop or documented rendering orchestration; dispose geometry, material, textures, listeners, animation handles, physics bodies and audio nodes when scenes are unloaded.
- Lazy-load game bundles and major GLB/textures; constrain texture sizes, geometry counts and effects; scale gracefully via configurable quality tiers.
- Keep domain state testable without the WebGL renderer. Avoid mutable globals for performance, progression and window state.
- Use real error boundaries/fallback screens, handle network/asset failures and browser storage errors. Avoid silently swallowing exceptions.
- Do not introduce secrets, hardcoded credentials, tracking or unrequested analytics. External links must be safe and intentional.
- Maintain a content registry and application registry so adding a project/app does not require rewiring scene logic.
- Prefer no paid services or additional subscriptions. Document licenses and provenance for any third-party asset or library.

## 5. UX, visual art direction and accessibility

- SHIFT//BREAK: expressive action, strong typography, deliberate high-contrast red accents, cinematic camera, impactful particles and momentum. Avoid noisy effects that obscure gameplay.
- ALEF//OS: distinctive but restrained, clean, legible, responsive desktop metaphors; polished component states, clear hierarchy, actual affordances, windows that fit inside the view of the monitor.
- Room: intimate, believable, detailed; material/lighting consistency. Visual polish should be iterative, not an excuse to postpone the working monitor prototype.
- Support desktop mouse+keyboard as the primary high-quality experience. Provide a coherent **non-game accessible portfolio mode** for touch/mobile, constrained hardware, accessibility or WebGL failure, without claiming touch FPS controls exist unless implemented.
- Keyboard focus management, readable contrast, labels for non-canvas controls, reduced motion, volume/mute, sensible pause, no unavoidable flashing, pointer-lock release, readable instructions and a discoverable skip flow.
- Browser autoplay policies: create/resume audio context only after user interaction; mute setting persists. Handle resize, visibility changes, DPI and focus loss; avoid endless spinning/loading screens.
- Responsive presentation must **not** mean deforming the 3D monitor, hiding necessary content behind in-world geometry, or making window controls unreachable.

## 6. Testing and measurable quality bar

Use the project's existing tooling if present. Otherwise set up lightweight lint/format/typecheck, a unit test runner (e.g. Vitest) and browser E2E tests (e.g. Playwright when the execution environment supports it). Do not claim browser tests ran if the browser is unavailable.

**Required test areas as features become available:**

| Domain | Minimum validation |
|---|---|
| App boot | no crash; loading states; recoverable asset errors; reload works |
| Camera and room | mouse look and limits; seat/exit; focus loss; later navigation/collision |
| Monitor | clickable UI on real projected monitor; correct cursor mapping on resize/pixel ratio; enters/exits without input leaks; room frame still visible |
| OS windows | launch, focus, move, minimize, maximize, close; bounded layout; multiple windows |
| Portfolio | contact/project navigation; accessible real content; fallback mode; broken-link checks |
| Game launcher | launch, pause/restart/exit, return to room without page reload, resource cleanup |
| REDLINE | throttle, brake, steering, drift score, boundaries, rival/finish conditions |
| BREAKPOINT | hit/collision detection, combos, blocking, dodging, enemy defeat and reset |
| OVERDRIVE | move, dash/slide, shoot/reload, damage, objective win/loss/restart |
| FLOW | all three event types, cross-act persistence, deduped awards, summary/persistence |
| Cinematics | transitions, scene/control continuity, end-frame to monitor and OS reveal |
| System | TypeScript, lint, unit, E2E smoke, production build, browser console errors |

When browser capture is possible, inspect **real screenshots** of the application in at least the room, OS, direct portfolio, a game and the reveal. Do not confuse passing headless unit tests with verified visual quality. Fix readable/layout faults found in the screenshot review before declaring done. Add a reproducible manual QA checklist for behaviors automation cannot cover. Track actual performance rather than inventing FPS numbers.

Each increment is done only if: it runs; the named acceptance criterion from Appendix B passes; no critical existing workflows regress; code/tests/docs are updated; limitations and next actions are recorded. No TODO button should simulate success.

## 7. Versioned delivery roadmap (mandatory order)

Implement in the **same 14 increments** as Appendix B. These summaries do NOT replace the detailed source checklists and completion criteria in that appendix.

| # | Version | Increment | Required outcome |
|---:|---|---|---|
| 01 | 0.1.0 | Project Foundation | Three.js/TS/Vite scaffold, diagnostics, renderer, state, loading, basic tests |
| 02 | 0.2.0 | Room Prototype | physical room and seated mouse-look camera |
| 03 | 0.3.0 | Interactive Monitor | dynamic UI in room; reliable enter/exit and input mapping; reveal technical feasibility |
| 04 | 0.4.0 | OS Core | usable ALEF//OS desktop and window manager on the in-world monitor |
| 05 | 0.5.0 | Portfolio System | files, projects, viewers, content, contact and résumé when supplied |
| 06 | 0.6.0 | Game Launcher | game library + playable launch/return proof of concept; **MVP milestone** |
| 07 | 0.7.0 | REDLINE | drift game playable in isolation |
| 08 | 0.8.0 | BREAKPOINT | fighting game playable in isolation |
| 09 | 0.9.0 | OVERDRIVE | FPS playable in isolation |
| 10 | 0.10.0 | Genre Shift | full racing→fight→FPS continuous campaign and checkpoints |
| 11 | 0.11.0 | Rhythm & Flow | unified FLOW, musical event direction, results and achievements |
| 12 | 0.12.0 | The Reveal | FPS final shot → physical monitor pullback → ALEF//OS; hand over room control |
| 13 | 0.13.0 | World Polish | refined room assets, exploration, interaction, lighting and audio |
| 14 | 1.0.0 | Public Release | audited, accessible, optimized, cross-browser production deliverable |

**MVP is increments 01–06**, not the completed campaign. By 0.6, a recruiter can explore room/monitor, read portfolio and start/exit a small test game. By 1.0, all 12 visitor-success outcomes in Appendix B must be verified. Production order differs from narrative order on purpose.

After finishing each milestone, verify the app still works. Prototype assets are allowed in earlier increments and must not be misrepresented as final art. Do not overbuild future features prematurely; do not break finished ones to implement new ones.

## 8. Autonomous execution and source-control workflow

**First actions — actually do them:**

1. Inspect the current repository (`pwd`, tracked files, `git status`, `AGENTS.md` and project docs). Determine whether this is a new project or an existing implementation. Inventory actual dependencies, commands, source files and available art/assets. Do **not** overwrite an existing application blindly.
2. Identify the highest fully completed increment and the next missing acceptance criteria. If the repo is empty, start at 01; if some implementation exists, verify and continue rather than restarting.
3. Write a short, implementable technical plan in `docs/IMPLEMENTATION_PLAN.md` and a progress ledger in `docs/PROGRESS.md` (increment status, checks, known issues, next actions). Do not let documentation replace coding.
4. Validate the technical spike for monitor UI/projected input mapping early, because that is the main existential risk. Record the chosen approach and rejected options in a concise ADR.
5. Implement the first incomplete increment end-to-end in code, run its applicable tests/build and fix failures. Continue through subsequent increments while tools/time/context permit. At the end of a session, leave a runnable commit/checkpoint and precise remaining work.

**Git rules:** work on an isolated feature branch if git is available; protect `main`/`master` and any user work; no force pushes or destructive resets; no merge without explicit owner approval. Prefer small, coherent commits by validated increment (or vertical slice). For subsequent increments, use distinct feature branches/PRs when repository workflow supports them; when branches must be stacked, document dependencies. If PR creation is not available, produce clean local commits and show the branch/commit references truthfully. Do not claim a PR exists until one is actually created.

**Daily coding loop (repeat for every increment):**

1. **Plan narrowly:** dependencies, acceptance criteria, implementation, risk and test strategy.
2. **Implement fully:** real behavior; accessible UI; appropriate art/assets; lifecycle and error paths.
3. **Integrate:** prove it works with existing states, room and monitor.
4. **Test:** code-level automation + any feasible interactive/browser validation.
5. **Audit:** correctness, input conflicts, UX, performance, accessibility, security, resource leaks and regressions.
6. **Refine:** fix high-priority findings now rather than indefinitely deferring cleanup.
7. **Document and commit:** actual commands/results, decisions, unresolved items, updated increment status.

If any gate fails, fix it before advancing. If blocked by a genuinely unavailable asset or permission, create the best *honestly labeled* safe temporary fallback; log the missing dependency and continue implementing independent work. Do not invent test results, fabricate assets, or claim published deployment if not deployed.

### Explicit prohibitions / anti-patterns

- Do NOT deliver only a README, outline, screenshot, static image, design mock, pseudocode or oversized single-file proof of concept and label it finished.
- Do NOT replace the room-first 3D concept with a standard landing page/desktop UI; the 2D fallback is an additional entry path only.
- Do NOT use a CSS-only fake monitor if it cannot preserve the required perspective/interactions.
- Do NOT hardwire an unlicensed music track, steal copyrighted textures/models, call paid AI APIs, or require hosting subscriptions to make the base app run.
- Do NOT introduce inaccessible motion, permanent pointer capture, fake project links, fake resume files or simulated success buttons.
- Do NOT quietly omit the three playable modes, FLOW, genre transitions, the reveal, or direct portfolio access from the final 1.0 scope.
- Do NOT destroy preexisting files, credentials, docs, repo configuration or user changes to make the prototype simpler.

## 9. End-of-session report format (in Brazilian Portuguese)

Keep the final response concise but factual and specific:

1. **Incremento(s) concluído(s)** — actual versions and meaningful features that work.
2. **Arquivos / módulos alterados** — key paths, relevant technical decisions.
3. **Verificações executadas** — exact build/lint/typecheck/test commands and pass/fail results; distinguish tests not run.
4. **Como executar** — working install/start/build commands and access flow.
5. **Pendências reais** — open defects, missing owner content/assets, incomplete increments, limitations and next concrete implementation step.
6. **Git** — current branch/commit/PR URLs only if they actually exist.

**Your instruction now: inspect this repository, then START BUILDING the first missing increment. Do not ask me to repeat the design or simply rewrite this prompt into a new plan.**

---

# APPENDIX A — ORIGINAL PRODUCT / CREATIVE BRIEF (VERBATIM; AUTHORITATIVE)

The following is original user-supplied source material. Keep every design intention described here; the English execution guidance above is an implementation interpretation, not permission to discard it.

# SHIFT//BREAK × ALEF//OS
### Um portfólio interativo disfarçado de jogo, dentro de um universo 3D

## 1. Visão geral do projeto

**SHIFT//BREAK × ALEF//OS** é um portfólio pessoal desenvolvido para navegador, utilizando Three.js, que combina jogos 3D, transições cinematográficas, exploração em primeira pessoa e um sistema operacional fictício totalmente interativo.

A proposta é transformar a experiência tradicional de visitar um portfólio em algo inesperado, imersivo e memorável.

Em vez de entrar em um site convencional, com seções de apresentação, projetos e contatos, o visitante começa diretamente em um jogo de ação tridimensional, sem saber que está explorando um portfólio.

Durante essa experiência inicial, o jogo muda radicalmente de gênero três vezes, alternando entre corrida, luta e tiro em primeira pessoa. Essas mudanças acontecem de forma abrupta, porém cinematográfica, mantendo a continuidade da ação e acompanhando uma trilha sonora intensa.

Quando a experiência termina, acontece a grande revelação: tudo aquilo estava sendo executado em um computador dentro de um quarto completamente modelado em 3D.

A câmera assume a perspectiva de alguém sentado diante desse computador.

A partir desse momento, o visitante pode explorar o quarto, interagir com os objetos e utilizar o computador, que executa um sistema operacional fictício chamado **ALEF//OS**.

Dentro desse sistema estão os três jogos apresentados anteriormente, outros minijogos, projetos de desenvolvimento, informações pessoais, habilidades, currículo e diferentes conteúdos que compõem o portfólio.

A ideia central é:

**Não é um desktop com um quarto como introdução. É um quarto 3D com um computador interativo dentro dele.**

O quarto é o ambiente principal do portfólio. O sistema operacional é apenas uma das várias coisas com as quais o visitante pode interagir nesse ambiente.

---

## 2. SHIFT//BREAK — A experiência inicial

SHIFT//BREAK é o jogo responsável pela introdução do visitante ao universo do projeto.

Sua principal característica é a mudança repentina de gameplay. O jogador começa em um determinado gênero e, durante a ação, o jogo se transforma em outro completamente diferente.

Apesar das mudanças de mecânica, todos os acontecimentos fazem parte de uma mesma sequência, conectada por cenário, narrativa, câmera e música.

### Ato I — REDLINE: Corrida e drift

A experiência começa em uma estrada de montanha japonesa, conhecida como *touge*.

O jogador controla um carro esportivo japonês em uma descida repleta de curvas fechadas, guard-rails, árvores e mudanças de elevação.

O ambiente possui uma atmosfera cinematográfica, com asfalto levemente molhado, iluminação noturna, neblina sutil e paisagens montanhosas.

A dirigibilidade é arcade, priorizando velocidade, sensação de controle e drifts espetaculares, em vez de uma simulação realista.

O jogador pode acelerar, frear, esterçar e executar derrapagens, acumulando pontuação conforme sua precisão e estilo.

Durante o percurso, um carro adversário surge e inicia uma perseguição.

A música acompanha a intensidade da corrida, aumentando a energia conforme o jogador se aproxima de uma sequência decisiva de curvas.

Em determinado momento, a perseguição termina em um bloqueio na estrada.

O jogador realiza uma última derrapagem, o veículo gira e a câmera acompanha o movimento. Sem cortar para outra cena, a perspectiva se transforma e o protagonista sai do carro.

**O jogo acaba de mudar de gênero.**

### Ato II — BREAKPOINT: Combate corpo a corpo

A câmera assume um enquadramento lateral e o jogo se transforma em uma experiência de luta 3D.

O cenário continua sendo a mesma estrada japonesa.

O carro utilizado anteriormente permanece estacionado ao fundo, com os faróis iluminando a arena improvisada.

O jogador agora controla o protagonista diretamente, podendo executar ataques leves, ataques fortes, esquivas, bloqueios e contra-ataques.

O sistema de combate prioriza fluidez, animações expressivas, impacto dos golpes e combos satisfatórios.

A intenção não é criar um jogo de luta extremamente complexo, mas uma sequência curta, intensa e visualmente marcante.

Os efeitos sonoros, movimentos de câmera e partículas reagem aos ataques, criando uma sensação cinematográfica.

Após derrotar o adversário principal, novos inimigos aparecem.

Um deles utiliza uma arma de fogo.

O protagonista executa uma animação de desarmamento, toma a arma e aponta para os inimigos restantes.

A câmera se aproxima rapidamente até assumir a perspectiva dos olhos do personagem.

**O jogo muda novamente.**

### Ato III — OVERDRIVE: Tiro em primeira pessoa

A experiência se transforma em um FPS de ação rápida.

O jogador agora controla o personagem em primeira pessoa, utilizando armas de fogo para enfrentar inimigos e avançar pelo cenário.

O combate acontece em um túnel e em áreas conectadas à estrada anterior, mantendo a continuidade espacial da experiência.

A movimentação é rápida, com corrida, deslize e dash.

As armas possuem disparos impactantes, efeitos visuais expressivos e animações responsivas.

O combate prioriza velocidade, precisão e movimentação constante.

A iluminação do cenário apresenta contrastes fortes, combinando áreas escuras, luzes vermelhas, fumaça, faíscas e flashes dos disparos.

O jogador avança enfrentando pequenos grupos de adversários até alcançar o confronto final.

Ao derrotar o último inimigo, a música chega ao seu momento decisivo.

O jogo termina.

Mas a experiência ainda não acabou.

---

## 3. FLOW — O sistema que conecta os três jogos

Apesar de SHIFT//BREAK alternar entre três gêneros, todos eles compartilham um mesmo sistema de desempenho chamado **FLOW**.

Esse sistema acompanha a habilidade do jogador durante a experiência completa.

Na corrida, o FLOW aumenta com drifts bem executados, ultrapassagens e manobras precisas.

Na luta, aumenta com combos, esquivas perfeitas e contra-ataques.

No FPS, aumenta com precisão, eliminações rápidas e movimentação eficiente.

O medidor permanece ativo durante todas as mudanças de gameplay.

Assim, o desempenho em um gênero influencia o resultado geral da experiência.

O FLOW também afeta a apresentação audiovisual, intensificando determinados efeitos, animações e elementos da trilha sonora.

Ao finalizar SHIFT//BREAK, o jogador recebe um resumo de sua performance.

Esse resultado pode ser utilizado posteriormente para desbloquear conquistas e desafios adicionais dentro do ALEF//OS.

---

## 4. A música como elemento central

A trilha sonora é uma das partes mais importantes de SHIFT//BREAK.

Toda a experiência é construída para transmitir a sensação de um videoclipe de ação interativo.

A música utiliza uma combinação de rock eletrônico, drum and bass, breakcore e elementos de trilhas de jogos japoneses.

As mudanças entre os gêneros são sincronizadas com momentos específicos da composição.

Por exemplo, a transição entre corrida e luta pode acontecer durante um impacto musical, enquanto a passagem para o FPS acompanha uma mudança na bateria e no ritmo.

A música não precisa obrigar o jogador a seguir um cronômetro rígido.

Em vez disso, determinados acontecimentos do gameplay acionam transições que se alinham aos pontos musicais adequados.

O objetivo é fazer cada mudança parecer perfeitamente coreografada, mesmo quando diferentes jogadores realizam as ações em momentos distintos.

---

## 5. A grande revelação cinematográfica

Após concluir a sequência de FPS, o visitante acredita que chegou ao final do jogo.

O último inimigo é derrotado.

O personagem abaixa a arma.

A música termina.

Durante alguns instantes, a imagem permanece imóvel.

Então, ouve-se um clique de mouse.

A câmera começa a se afastar lentamente da cena.

As bordas de um monitor entram no enquadramento.

Conforme a câmera continua recuando, o visitante percebe que a imagem do jogo está sendo exibida na tela de um computador.

O monitor está sobre uma mesa, em um quarto tridimensional.

A trilha sonora, que antes parecia ocupar todo o ambiente do jogo, passa a soar como se estivesse vindo de caixas de som reais.

A câmera se afasta o suficiente para revelar o teclado, o mouse, a mesa, parte das paredes e os objetos presentes no quarto.

O jogo continua aberto no monitor.

Um cursor aparece na tela e minimiza SHIFT//BREAK.

Por trás dele, surge um sistema operacional desconhecido:

**ALEF//OS.**

A câmera se estabiliza na perspectiva de uma pessoa sentada diante do computador.

A partir desse momento, o visitante recebe o controle da câmera.

Ele pode olhar ao redor, observar o quarto e interagir com o computador.

A principal diferença em relação a uma transição convencional é que **a câmera não entra novamente no monitor**.

O visitante permanece dentro do quarto 3D, olhando fisicamente para a tela à sua frente.

O computador continua sendo um objeto do cenário.

Não existe uma troca definitiva para uma página de desktop em tela cheia.

A perspectiva em primeira pessoa é preservada.

---

## 6. O quarto 3D — O verdadeiro ambiente do portfólio

O quarto é o ambiente central do projeto.

Ele representa um espaço pessoal de criação, desenvolvimento e entretenimento.

Deve parecer um ambiente habitado, com personalidade, mas sem exageros visuais que prejudiquem a navegação.

O estilo combina um quarto contemporâneo de desenvolvedor com iluminação cinematográfica, elementos minimalistas e referências discretas à cultura de jogos.

O ambiente possui uma mesa com computador, monitor, teclado, mouse, fones de ouvido, cadeira e outros acessórios.

Ao redor, existem móveis, objetos decorativos, iluminação ambiente e diferentes elementos interativos.

A direção artística utiliza principalmente tons escuros, cinza, preto e detalhes vermelhos.

Entretanto, o quarto não precisa ser completamente escuro ou monocromático. Materiais como madeira, tecido, metal e plástico devem manter características naturais, dando credibilidade ao ambiente.

A iluminação do monitor afeta a mesa e os objetos próximos.

Uma luminária ou luz indireta complementa a cena.

O ambiente possui profundidade, sombras suaves, reflexos discretos e pequenos detalhes que reforçam sua existência física.

### Navegação em primeira pessoa

O visitante observa o quarto através de uma câmera em primeira pessoa.

Inicialmente, a câmera está posicionada diante do computador, simulando alguém sentado à mesa.

O movimento do mouse permite olhar ao redor.

Dependendo do modo de exploração definido na implementação, o jogador poderá levantar da cadeira e caminhar pelo quarto utilizando WASD.

Quando o jogador se aproxima de um objeto interativo, um indicador discreto informa que ele pode utilizá-lo.

Ao pressionar a tecla de interação, o sistema executa a ação correspondente.

Por exemplo:

- Clicar no monitor permite interagir com o ALEF//OS.
- Interagir com uma estante pode revelar projetos ou referências.
- Examinar determinados objetos pode desbloquear informações, conquistas ou segredos.
- Interagir com um aparelho de som permite controlar a música ambiente.
- Olhar pela janela revela o exterior do ambiente, ampliando a sensação de mundo.

O quarto não precisa ser enorme.

É preferível criar um espaço relativamente compacto, extremamente detalhado e repleto de interações significativas.

### Interação com o computador

Ao interagir com o monitor, a câmera pode se aproximar ligeiramente da mesa, oferecendo uma visualização confortável da tela.

Entretanto, a perspectiva continua sendo a de alguém sentado diante de um monitor real.

O jogador ainda percebe as bordas do monitor e parte do ambiente ao redor.

O cursor do mouse passa a controlar o sistema operacional exibido na tela.

Ao sair do modo de interação, o cursor é liberado e o jogador volta a controlar a câmera do quarto.

O computador deve parecer funcional e não apenas uma textura estática.

Suas janelas, aplicativos, arquivos e menus precisam responder às ações do usuário.

---

## 7. ALEF//OS — Um sistema operacional dentro do mundo 3D

ALEF//OS é um sistema operacional fictício desenvolvido especialmente para o portfólio.

Sua interface combina características de sistemas operacionais tradicionais com uma identidade visual própria, inspirada em interfaces minimalistas, tecnologia e jogos.

A área de trabalho possui wallpaper personalizado, ícones, barra de tarefas, menu de aplicativos, notificações, explorador de arquivos e janelas.

Todas essas funcionalidades são utilizadas diretamente dentro do monitor tridimensional.

O sistema operacional funciona como um ambiente de exploração de conteúdo e também como a principal central de acesso aos projetos.

### Biblioteca de jogos

Um dos aplicativos mais importantes do ALEF//OS é a biblioteca de jogos.

Nela, o visitante encontra SHIFT//BREAK e os três gêneros apresentados na experiência inicial.

Os aplicativos principais são:

**SHIFT//BREAK:** permite repetir a campanha completa, incluindo corrida, luta, FPS e transições.

**DRIFT.exe:** abre um modo independente de corrida, com desafios de drift, pontuação e possíveis pistas adicionais.

**FIGHT.exe:** abre o jogo de luta isoladamente, permitindo praticar combos e enfrentar novos adversários.

**FPS.exe:** abre o modo de tiro, com desafios de precisão, combate e movimentação.

Além desses jogos, o ALEF//OS pode receber outros aplicativos jogáveis no futuro.

A biblioteca funciona como uma plataforma expansível, permitindo adicionar experiências sem modificar a estrutura original do projeto.

Ao iniciar um jogo pelo computador, a tela do monitor apresenta a inicialização correspondente.

Durante a execução, o visitante passa a controlar o jogo exibido na tela.

Quando necessário, o jogo pode assumir a apresentação em tela cheia para melhorar a jogabilidade, mas isso é tratado como um modo temporário de execução.

Ao encerrar a partida, o visitante retorna ao computador dentro do quarto 3D.

### Explorador de arquivos

O explorador de arquivos é a principal ferramenta para apresentar informações pessoais e profissionais.

Ele possui uma estrutura de pastas semelhante à de um sistema operacional tradicional.

Dentro da pasta pessoal do usuário, o visitante encontra arquivos como:

**identity.txt:** nome, idade, localização geral, formação e área de atuação.

**about_me.md:** apresentação pessoal, interesses, trajetória e objetivos.

**skills.json:** linguagens de programação, frameworks, bibliotecas e ferramentas.

**resume.pdf:** currículo profissional, com opção de visualização e download.

**projects/:** diretório contendo os trabalhos de desenvolvimento.

**gallery/:** coleção de imagens, artes, capturas de jogos, modelos 3D e experimentos.

Cada formato utiliza um aplicativo apropriado.

Arquivos de texto abrem em um bloco de notas.

Arquivos JSON abrem em um editor de código.

Imagens abrem em um visualizador.

Arquivos PDF abrem em um leitor de documentos.

Pastas de projetos abrem no explorador, com arquivos, imagens, descrições e links.

O objetivo é permitir que o visitante conheça o desenvolvedor de maneira natural, como se estivesse explorando seu computador pessoal.

### Aplicativos adicionais

O sistema também possui aplicativos complementares.

**Terminal:** interface de comandos que permite explorar diretórios, consultar informações, executar comandos fictícios e descobrir recursos secretos.

**Music Player:** aplicativo de reprodução musical com trilhas originais, controle de volume e playlists.

**Settings:** configurações de tema, wallpaper, áudio, qualidade gráfica, sensibilidade e opções de acessibilidade.

**Achievements:** conquistas relacionadas ao progresso nos jogos, à exploração do quarto e à descoberta de segredos.

**Gallery:** visualizador de imagens, modelos, interfaces e trabalhos criativos.

**Contact:** central de contato com links profissionais, GitHub, LinkedIn e e-mail.

Esses aplicativos contribuem para a sensação de que o ALEF//OS é um sistema operacional funcional, e não apenas uma interface decorativa.

---

## 8. O portfólio integrado ao mundo

Um dos objetivos do projeto é evitar que todas as informações fiquem limitadas a janelas e arquivos.

O quarto também pode apresentar partes do portfólio de maneira física.

Por exemplo, um quadro na parede pode mostrar uma arte desenvolvida pelo criador.

Uma estante pode conter objetos representando jogos e projetos.

Uma pequena coleção de dispositivos pode permitir acessar protótipos e experimentos.

Um caderno sobre a mesa pode apresentar anotações, ideias ou conceitos de desenvolvimento.

Determinados objetos podem conter easter eggs relacionados aos projetos apresentados no computador.

Essas interações não substituem os arquivos do ALEF//OS, mas complementam a experiência.

O visitante pode conhecer os mesmos projetos por caminhos diferentes.

Isso cria a sensação de estar explorando um ambiente pessoal, em vez de simplesmente percorrer as seções de um site.

---

## 9. Identidade artística do projeto

SHIFT//BREAK e ALEF//OS compartilham uma identidade visual, mas possuem atmosferas diferentes.

**SHIFT//BREAK** representa ação, velocidade, intensidade e mudanças abruptas.

Sua linguagem visual utiliza movimentos de câmera expressivos, efeitos de impacto, tipografia forte, contrastes marcantes e uma trilha sonora agressiva.

**ALEF//OS** representa exploração, criatividade, organização e descoberta.

Sua interface é mais calma, minimalista e funcional.

O quarto estabelece a conexão entre essas duas identidades.

Ele possui elementos da estética do jogo, como detalhes vermelhos, referências japonesas e iluminação cinematográfica, mas também apresenta características de um ambiente real e pessoal.

A intenção é que a experiência comece extremamente intensa e, depois da revelação, se transforme em algo contemplativo e explorável.

O visitante sai de uma sequência de ação para um espaço onde pode investigar, experimentar e descobrir coisas no próprio ritmo.

---

## 10. Transições entre jogos e ambiente

Todas as transições devem preservar a sensação de continuidade.

Durante SHIFT//BREAK, as mudanças entre corrida, luta e FPS acontecem por movimentos de câmera e acontecimentos dentro do próprio jogo.

Na revelação final, o jogo deixa de ser uma experiência que ocupa a tela inteira e passa a ser apresentado como um programa executado no monitor de um quarto 3D.

Depois que o ALEF//OS é revelado, o quarto permanece como o ambiente principal.

Ao iniciar outro jogo pelo computador, existem duas possibilidades de apresentação.

**Modo imersivo:** a câmera se aproxima do monitor e o jogo assume a tela inteira, oferecendo maior conforto para jogar.

**Modo monitor:** o jogo continua sendo renderizado na superfície do monitor, permitindo visualizar o ambiente ao redor enquanto ele é executado.

A experiência inicial SHIFT//BREAK utiliza o modo imersivo.

Os aplicativos adicionais podem utilizar o modo mais apropriado para suas mecânicas.

Em ambos os casos, ao encerrar o jogo, a câmera retorna à perspectiva em primeira pessoa dentro do quarto.

O visitante nunca perde a noção de que está utilizando um computador localizado em um ambiente tridimensional.

---

## 11. Tecnologia e arquitetura

O projeto será desenvolvido principalmente utilizando Three.js e tecnologias web modernas.

**Three.js** será responsável pela renderização dos cenários tridimensionais, personagens, veículos, objetos, câmeras e pelo quarto.

**TypeScript** será utilizado para organizar a lógica do projeto, os sistemas de gameplay e o gerenciamento dos aplicativos.

**HTML e CSS** poderão ser utilizados para construir a interface interna do ALEF//OS, desde que ela seja apresentada visualmente dentro da tela do monitor 3D.

Uma abordagem possível é renderizar interfaces web em uma superfície dinâmica associada ao monitor, ou utilizar uma camada HTML alinhada à perspectiva da tela.

A escolha final dependerá de testes de desempenho, fidelidade visual e precisão das interações.

**Rapier ou uma solução de física personalizada** poderá controlar colisões, movimentação e interações físicas.

O sistema de áudio utilizará recursos do navegador para reprodução, controle espacial e sincronização com os acontecimentos do jogo.

Modelos 3D serão armazenados preferencialmente em formatos otimizados, como GLB.

O projeto deverá utilizar carregamento progressivo de recursos, evitando manter todos os jogos e ambientes pesados carregados simultaneamente.

### Estrutura conceitual

O sistema será dividido em cinco partes principais:

1. **Game Director:** gerencia a campanha SHIFT//BREAK, seus estados, eventos e transições.
2. **Gameplay Modules:** implementa os modos de corrida, luta e FPS.
3. **Room Environment:** controla o quarto 3D, a câmera em primeira pessoa e as interações com objetos.
4. **ALEF//OS:** gerencia o desktop, as janelas, os arquivos, a biblioteca e os aplicativos.
5. **Transition Manager:** coordena as mudanças cinematográficas entre os jogos, o quarto e o computador.

Essa divisão permite desenvolver e expandir cada parte sem comprometer o restante do projeto.

---

## 12. Experiência do visitante

O fluxo principal deve acontecer da seguinte maneira:

**Primeiro acesso**

O visitante entra no site e encontra uma tela de inicialização minimalista com o nome SHIFT//BREAK.

Um botão permite iniciar a experiência.

Também existe uma opção discreta para acessar diretamente o portfólio, evitando obrigar visitantes profissionais a concluir os jogos.

**Campanha inicial**

O visitante participa da sequência de corrida, luta e FPS.

A música, os cenários e as transições conectam as três experiências.

**Revelação**

Ao finalizar a campanha, a câmera se afasta e revela que o jogo estava sendo executado em um computador.

**Exploração do quarto**

O visitante passa a controlar a câmera em primeira pessoa e pode observar o ambiente.

**Interação com o computador**

Ao utilizar o monitor, o jogador acessa o ALEF//OS.

**Exploração do portfólio**

O visitante abre arquivos pessoais, examina projetos, visualiza habilidades, consulta o currículo e descobre outras informações.

**Novas experiências**

O visitante pode iniciar novamente SHIFT//BREAK, acessar os três jogos separadamente ou experimentar outros aplicativos disponíveis.

**Exploração livre**

Ao sair do computador, o visitante continua dentro do quarto, podendo explorar o cenário e descobrir interações adicionais.

O projeto não possui um encerramento obrigatório após a revelação.

O quarto e o computador tornam-se um espaço permanente de exploração.

---

## 13. Expansão futura

A estrutura do ALEF//OS permite que o portfólio continue evoluindo sem precisar ser reconstruído.

Novos projetos podem ser adicionados como pastas ou aplicativos.

Novos jogos podem aparecer na biblioteca.

Novas artes e modelos podem ser colocados na galeria.

O quarto pode receber objetos interativos relacionados aos trabalhos mais recentes.

Atualizações maiores podem incluir novos ambientes, mudanças na iluminação, eventos especiais ou áreas desbloqueáveis.

Também é possível criar pequenas narrativas ambientais, nas quais o visitante descobre informações e segredos a partir dos objetos, arquivos e acontecimentos presentes no quarto.

O sistema operacional pode evoluir visualmente conforme novas versões do portfólio são lançadas, reforçando a ideia de um software pessoal em constante desenvolvimento.

---

## 14. Prioridades de desenvolvimento

O projeto será desenvolvido gradualmente, priorizando a qualidade e a integração entre os sistemas.

**Primeira fase — Protótipo do quarto e computador**

Criar o ambiente 3D, a câmera em primeira pessoa, a interação com o monitor e uma versão inicial funcional do ALEF//OS.

Essa fase valida a principal característica do portfólio: utilizar um computador dentro de um quarto tridimensional.

**Segunda fase — Sistema operacional**

Implementar janelas, arquivos, explorador, aplicativos, biblioteca de jogos e conteúdos profissionais.

**Terceira fase — SHIFT//BREAK**

Desenvolver separadamente os protótipos de drift, luta e FPS, priorizando mecânicas responsivas e divertidas.

**Quarta fase — Integração dos jogos**

Conectar os três modos, desenvolver o FLOW e sincronizar as transições com a música.

**Quinta fase — Revelação cinematográfica**

Implementar a passagem final do FPS para o quarto 3D e a descoberta do computador.

**Sexta fase — Polimento**

Aprimorar animações, iluminação, efeitos visuais, áudio, desempenho, controles, acessibilidade e detalhes da interface.

**Sétima fase — Expansão**

Adicionar minijogos, novos objetos interativos, segredos, conquistas e conteúdos ao portfólio.

A ordem de produção não precisa ser a mesma ordem apresentada ao visitante. Desenvolver primeiro o quarto e o ALEF//OS permite construir uma base funcional para o portfólio enquanto SHIFT//BREAK ainda está em produção.

---

## 15. Objetivo final

SHIFT//BREAK × ALEF//OS não pretende ser apenas um site visualmente impressionante.

O objetivo é apresentar as habilidades, os interesses e a criatividade do desenvolvedor por meio de uma experiência que utiliza essas próprias competências.

A programação é demonstrada pelo funcionamento dos jogos e do sistema operacional.

O conhecimento de desenvolvimento 3D aparece nos cenários, objetos, iluminação, câmeras e interações.

A capacidade de criar interfaces é apresentada pelo ALEF//OS.

O design de jogos é demonstrado pelas mecânicas, pelo FLOW e pelas transições.

A criatividade aparece na forma como todos esses elementos são conectados.

O visitante não precisa apenas ler que o criador sabe desenvolver jogos, sistemas e experiências digitais.

**Ele pode experimentar tudo isso diretamente.**

A campanha SHIFT//BREAK funciona como uma introdução intensa e inesperada.

A revelação do computador transforma completamente a percepção do visitante.

O quarto 3D estabelece um ambiente pessoal e explorável.

O ALEF//OS organiza o conteúdo profissional e permite acessar novos jogos e aplicativos.

Juntos, esses elementos formam um portfólio que não é simplesmente visitado, mas explorado.

**SHIFT//BREAK é a experiência que captura a atenção.**

**ALEF//OS é o sistema que apresenta o desenvolvedor.**

**O quarto 3D é o universo que conecta tudo.**

### Conceito central

*Você entra para jogar. Descobre que estava usando um computador. E percebe que aquele computador é a porta de entrada para o universo criativo de seu desenvolvedor.*

---

# APPENDIX B — ORIGINAL 14-INCREMENT ROADMAP (VERBATIM; AUTHORITATIVE)

The following is the original user-supplied roadmap, including all checklists, rules and acceptance criteria. The implementation must follow it.

# SHIFT//BREAK × ALEF//OS
## Plano de Desenvolvimento Incremental — Roadmap V1.0

### Objetivo

Desenvolver um portfólio 3D interativo em Three.js que combine um quarto explorável em primeira pessoa, um computador funcional com o sistema ALEF//OS e o jogo SHIFT//BREAK, composto por corrida, luta e FPS.

O desenvolvimento será dividido em **14 incrementos**, organizados em cinco grandes etapas.

Cada incremento deve produzir uma versão executável, testável e integrada ao trabalho anterior.

---

# ETAPA 1 — FUNDAÇÃO DO PROJETO

*Objetivo: criar a estrutura técnica e comprovar que o computador pode funcionar dentro do quarto 3D.*

## Incremento 01 — Estrutura inicial

**Versão 0.1.0 — Project Foundation**

Implementar:

- Criar o projeto com Three.js, TypeScript e Vite.
- Organizar a arquitetura em módulos independentes.
- Configurar renderização, câmera, iluminação e gerenciamento de cenas.
- Criar um sistema central de estados.
- Preparar carregamento de modelos e recursos.
- Implementar tratamento básico de erros.
- Configurar lint, formatação e testes iniciais.
- Criar uma cena simples de diagnóstico.

**Entrega:** uma aplicação 3D funcional no navegador, com estrutura preparada para receber novos sistemas.

**Critério de conclusão:** o projeto inicia sem erros, renderiza uma cena e permite alternar entre estados de teste sem recarregar a página.

## Incremento 02 — Quarto 3D inicial

**Versão 0.2.0 — Room Prototype**

Implementar:

- Construir o quarto usando geometria simples, sem modelos detalhados inicialmente.
- Adicionar chão, paredes, teto e janela.
- Criar mesa, cadeira e monitor.
- Implementar iluminação ambiente básica.
- Posicionar a câmera em primeira pessoa diante do computador.
- Permitir observar o quarto movimentando o mouse.
- Implementar limites de rotação da câmera e configurações de sensibilidade.

**Entrega:** um quarto tridimensional simples, navegável visualmente.

**Critério de conclusão:** o visitante consegue olhar ao redor e identificar o computador como um objeto físico dentro do ambiente.

## Incremento 03 — Interação com o computador

**Versão 0.3.0 — Interactive Monitor**

Implementar:

- Criar a superfície visual do monitor.
- Exibir uma interface de teste na tela.
- Permitir entrar e sair do modo de interação.
- Implementar controle de cursor e cliques.
- Mapear corretamente o posicionamento do mouse na superfície do monitor.
- Preservar a perspectiva do quarto ao utilizar o computador.
- Testar renderização de interfaces HTML/CSS no contexto do monitor 3D.
- Validar a viabilidade de exibir posteriormente o último quadro do jogo na tela.

**Entrega:** computador interativo dentro do quarto.

**Critério de conclusão:** o visitante consegue olhar ao redor, interagir com o monitor, clicar em elementos da interface e retornar ao controle da câmera.

**Marco de validação 1:** confirmar a viabilidade técnica da principal característica do portfólio antes de investir nos jogos.

---

# ETAPA 2 — CONSTRUÇÃO DO ALEF//OS

*Objetivo: transformar o computador em um ambiente funcional de apresentação profissional e entretenimento.*

## Incremento 04 — Sistema operacional básico

**Versão 0.4.0 — OS Core**

Implementar:

- Área de trabalho com wallpaper personalizado.
- Ícones de aplicativos.
- Barra de tarefas.
- Menu de aplicativos.
- Sistema de janelas.
- Arrastar, minimizar, maximizar e fechar janelas.
- Gerenciamento de foco entre aplicativos.
- Notificações básicas.
- Relógio do sistema.

**Entrega:** ALEF//OS funcional dentro do monitor 3D.

**Critério de conclusão:** é possível abrir e controlar múltiplas janelas sem sair do quarto.

## Incremento 05 — Portfólio e arquivos

**Versão 0.5.0 — Portfolio System**

Implementar:

- Explorador de arquivos com navegação entre pastas.
- Diretório pessoal contendo informações do desenvolvedor.
- Arquivos de apresentação e habilidades.
- Visualizador de textos e código.
- Visualizador de imagens.
- Acesso ao currículo PDF.
- Pastas individuais para os projetos.
- Visualização de descrições, tecnologias, imagens e links.
- Aplicativo de contato com GitHub, LinkedIn e e-mail.
- Conteúdo centralizado em arquivos de dados para facilitar futuras atualizações.

**Entrega:** portfólio profissional utilizável dentro do computador.

**Critério de conclusão:** um visitante consegue conhecer o desenvolvedor, visualizar projetos e acessar meios de contato sem precisar executar os jogos.

## Incremento 06 — Biblioteca e execução de aplicativos

**Versão 0.6.0 — Game Launcher**

Implementar:

- Aplicativo de biblioteca de jogos.
- Interface com capas, títulos e descrições.
- Botões para iniciar, reiniciar e encerrar jogos.
- Gerenciamento dos estados do jogo e do desktop.
- Sistema de pausa.
- Retorno ao quarto após encerrar um jogo.
- Carregamento e descarregamento de recursos.
- Um jogo de teste simples para validar o fluxo de execução.

**Entrega:** biblioteca capaz de executar uma experiência jogável de teste e retornar ao ALEF//OS.

**Critério de conclusão:** é possível iniciar um jogo a partir do monitor, jogar, sair e continuar explorando o quarto sem reiniciar a aplicação.

**Marco de validação 2:** o portfólio já funciona como um produto independente, mesmo sem SHIFT//BREAK completo.

---

# ETAPA 3 — DESENVOLVIMENTO DOS TRÊS JOGOS

*Objetivo: criar e validar cada gênero separadamente antes de conectá-los cinematograficamente.*

## Incremento 07 — Sistema de corrida

**Versão 0.7.0 — REDLINE**

Implementar:

- Modelo inicial do carro.
- Sistema de aceleração, freio e direção.
- Física arcade de drift.
- Câmera de perseguição em terceira pessoa.
- Trecho inicial de touge japonês.
- Colisões e limites da pista.
- Efeitos de pneus, fumaça e derrapagem.
- Sistema de velocidade e pontuação.
- Veículo adversário com comportamento básico.
- Modo independente acessível pelo ALEF//OS.

**Entrega:** DRIFT.exe jogável.

**Critério de conclusão:** o jogador consegue completar uma pista curta, executar drifts e receber pontuação com controles consistentes.

## Incremento 08 — Sistema de luta

**Versão 0.8.0 — BREAKPOINT**

Implementar:

- Personagem jogável.
- Movimentação e câmera lateral dinâmica.
- Ataques leves e fortes.
- Bloqueio, esquiva e contra-ataque.
- Sistema de vida e dano.
- Detecção de acertos.
- Combos básicos.
- Inimigo com IA simples.
- Animações e efeitos de impacto.
- Arena de combate baseada na estrada.
- Modo independente acessível pelo ALEF//OS.

**Entrega:** FIGHT.exe jogável.

**Critério de conclusão:** é possível enfrentar e derrotar um adversário utilizando ataques, defesa e combos de maneira responsiva.

## Incremento 09 — Sistema FPS

**Versão 0.9.0 — OVERDRIVE**

Implementar:

- Câmera em primeira pessoa.
- Movimentação com teclado e mouse.
- Corrida, dash e deslize.
- Arma principal com disparos e recarga.
- Sistema de mira e detecção de tiros.
- Inimigos com IA básica.
- Sistema de vida e dano.
- Animações e efeitos dos disparos.
- Cenário inicial de túnel.
- Interface de munição e vida.
- Modo independente acessível pelo ALEF//OS.

**Entrega:** FPS.exe jogável.

**Critério de conclusão:** o jogador consegue atravessar uma arena curta, enfrentar inimigos e finalizar um objetivo.

**Marco de validação 3:** os três gêneros funcionam individualmente, com interfaces, controles e mecânicas próprias.

---

# ETAPA 4 — SHIFT//BREAK COMPLETO

*Objetivo: conectar os três jogos e construir a experiência cinematográfica.*

## Incremento 10 — Integração de gameplay

**Versão 0.10.0 — Genre Shift**

Implementar:

- Criar um controlador central da campanha.
- Conectar corrida, luta e FPS.
- Compartilhar os dados de desempenho.
- Implementar as transições entre os modos.
- Criar eventos que iniciam as mudanças de gameplay.
- Preservar continuidade dos cenários e personagens.
- Gerenciar a troca de controles e câmeras.
- Adicionar checkpoints e reinício.
- Testar a sequência inteira sem telas de carregamento convencionais.

**Entrega:** campanha SHIFT//BREAK jogável do início ao fim.

**Critério de conclusão:** o jogador completa a sequência corrida → luta → FPS em uma única sessão contínua.

## Incremento 11 — FLOW e trilha sonora

**Versão 0.11.0 — Rhythm & Flow**

Implementar:

- Medidor FLOW compartilhado entre os três gêneros.
- Sistema de combos e multiplicadores.
- Pontuação por drift, combate e precisão.
- Feedback visual de desempenho.
- Sistema centralizado de áudio.
- Trilha sonora sincronizada aos acontecimentos.
- Transições musicais entre os gêneros.
- Efeitos visuais associados ao FLOW.
- Tela final de resultados.
- Registro de pontuações e conquistas.

**Entrega:** experiência completa com progressão de desempenho e identidade musical.

**Critério de conclusão:** o FLOW funciona durante toda a campanha e os principais acontecimentos se alinham aos momentos musicais previstos.

## Incremento 12 — Revelação cinematográfica

**Versão 0.12.0 — The Reveal**

Implementar:

- Sequência de encerramento do FPS.
- Captura ou preservação do último quadro do jogo.
- Apresentação desse quadro no monitor do quarto.
- Movimento cinematográfico de afastamento da câmera.
- Revelação gradual das bordas do monitor e do quarto.
- Transição do áudio do jogo para o ambiente físico.
- Minimização cinematográfica do SHIFT//BREAK.
- Exibição do ALEF//OS no monitor.
- Posicionamento final da câmera em primeira pessoa.
- Transferência do controle para o visitante.
- Notificação de conclusão da campanha.

**Entrega:** transição cinematográfica contínua entre o FPS e o quarto 3D.

**Critério de conclusão:** o visitante termina a campanha, observa a câmera revelar o quarto e consegue utilizar o computador sem entrar em uma página de desktop convencional.

**Marco de validação 4:** a experiência principal do projeto está completa, desde a primeira corrida até a exploração do ALEF//OS.

---

# ETAPA 5 — ACABAMENTO E LANÇAMENTO

*Objetivo: transformar os protótipos em uma experiência estável, visualmente consistente e pronta para apresentação.*

## Incremento 13 — Polimento e expansão do quarto

**Versão 0.13.0 — World Polish**

Implementar:

- Substituir geometrias temporárias por modelos definitivos.
- Refinar materiais, texturas e iluminação.
- Adicionar móveis e objetos decorativos.
- Implementar exploração do quarto com WASD.
- Adicionar colisões com móveis e paredes.
- Criar objetos interativos.
- Implementar música ambiente.
- Adicionar efeitos sonoros posicionais.
- Desenvolver detalhes ambientais e easter eggs.
- Refinar animações e transições.
- Melhorar a interface do ALEF//OS.
- Implementar configurações de qualidade gráfica.

**Entrega:** quarto 3D visualmente completo e explorável.

**Critério de conclusão:** o ambiente possui qualidade visual consistente, interações funcionais e navegação confortável.

## Incremento 14 — Qualidade, otimização e publicação

**Versão 1.0.0 — Public Release**

Implementar:

- Auditoria geral da arquitetura.
- Identificação de código redundante.
- Correção de bugs.
- Testes de integração e regressão.
- Otimização de modelos, texturas e animações.
- Carregamento progressivo de recursos.
- Monitoramento de memória e desempenho.
- Tratamento de perda de foco e redimensionamento.
- Configurações de áudio, controles e acessibilidade.
- Opção de pular a campanha inicial.
- Acesso direto ao portfólio.
- Testes em diferentes navegadores e resoluções.
- Interface de carregamento e recuperação de erros.
- Revisão das informações pessoais e dos projetos.
- Build de produção e publicação.

**Entrega:** SHIFT//BREAK × ALEF//OS 1.0, publicado e funcional.

**Critério de conclusão:** os fluxos principais estão estáveis, os conteúdos profissionais são acessíveis e a experiência pode ser utilizada sem assistência do desenvolvedor.

---

# Regras de desenvolvimento incremental

Cada incremento deve seguir o mesmo ciclo de trabalho:

1. **Planejamento:** definir escopo, dependências, critérios de aceitação e riscos.
2. **Implementação:** desenvolver somente as funcionalidades previstas.
3. **Integração:** conectar a nova funcionalidade aos sistemas existentes.
4. **Testes:** executar testes automatizados aplicáveis e validar manualmente as interações.
5. **Auditoria:** procurar bugs, problemas de arquitetura, desempenho, acessibilidade e usabilidade.
6. **Refinamento:** corrigir os problemas identificados e melhorar a qualidade.
7. **Registro:** documentar o que foi feito, limitações e decisões técnicas.
8. **Entrega:** gerar uma versão executável e registrar o incremento no Git.

### Regras obrigatórias

- Não iniciar o próximo incremento com falhas críticas abertas no atual.
- Não implementar funcionalidades futuras fora do escopo sem justificativa técnica.
- Não reescrever sistemas funcionais desnecessariamente.
- Preservar compatibilidade com funcionalidades anteriores.
- Cada incremento deve ser executável e verificável.
- Usar recursos temporários quando a arte definitiva atrasar a validação técnica.
- Priorizar qualidade, estabilidade e manutenibilidade.
- Registrar alterações importantes e decisões arquiteturais.
- Manter testes de regressão para comportamentos já concluídos.
- Fazer desenvolvimento em branches próprias, com revisão antes de integrar à branch de desenvolvimento.
- Evitar dependências e serviços pagos desnecessários.

---

# Marcos de entrega

| Marco | Versões | Resultado |
|---|---|---|
| Protótipo técnico | 0.1–0.3 | Quarto com monitor interativo |
| Portfólio funcional | 0.4–0.6 | ALEF//OS com arquivos, projetos e biblioteca |
| Jogos independentes | 0.7–0.9 | Corrida, luta e FPS jogáveis |
| Experiência integrada | 0.10–0.12 | Campanha, FLOW, música e revelação |
| Versão pública | 0.13–1.0 | Quarto completo e lançamento |

---

# Priorização do MVP

O primeiro produto mínimo viável não será SHIFT//BREAK completo.

Será um **quarto 3D com um computador funcional que permite explorar o portfólio e executar uma pequena experiência de teste**.

Isso corresponde aos incrementos 01 a 06.

Essa escolha permite validar precocemente os elementos mais importantes e tecnicamente arriscados do projeto.

Depois, cada novo jogo poderá ser acrescentado ao ALEF//OS assim que estiver funcional, sem depender da conclusão da campanha cinematográfica.

O projeto deve sempre possuir uma versão utilizável, mesmo durante o desenvolvimento.

---

# Critério de sucesso da versão 1.0

A versão 1.0 estará pronta quando um visitante conseguir:

1. Entrar no site e iniciar SHIFT//BREAK.
2. Jogar a sequência de corrida, luta e FPS.
3. Experimentar as transições entre os três gêneros.
4. Receber uma pontuação final baseada no FLOW.
5. Presenciar a revelação cinematográfica do computador.
6. Assumir o controle da câmera dentro do quarto 3D.
7. Interagir com o monitor sem perder a perspectiva do ambiente.
8. Utilizar o ALEF//OS, abrir aplicativos e explorar arquivos.
9. Conhecer os projetos, as habilidades e as informações do desenvolvedor.
10. Iniciar novamente qualquer um dos jogos pelo computador.
11. Retornar ao quarto e continuar explorando livremente.
12. Acessar o conteúdo profissional diretamente, caso prefira não jogar.

**Princípio do projeto: cada incremento deve deixar o portfólio mais completo, sem comprometer aquilo que já funciona.**

---

## Final instruction to Codex

Treat Appendix A and Appendix B as the authoritative specification and acceptance test inventory. **Act on the repository now:** first inspect, then build, verify and document the next incomplete increment. Preserve the central 3D-room-with-working-computer vision at every stage. Maintain the full 1.0 objective and never confuse a development MVP with the finished product.
