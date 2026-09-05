# Sparta Adamo — Unreal Engine 5 Setup Guide

This folder is the **UE5 design + implementation path** for *Sparta Adamo*.  
It is separate from the web MVP’s GitHub Pages folder (`docs/`). Do not put these files under `docs/` or you will break the static site deploy.

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) (this file) | Install Epic Launcher + UE 5.4+, create the project, folder layout, web→UE mapping |
| [GDD.md](./GDD.md) | Game Design Document (systems, fantasy, zones, original IP) |
| [SYSTEMS.md](./SYSTEMS.md) | Blueprint / DataTable implementation checklist |

**Web play (MVP):** https://abbytes.github.io/sparta-adamo/

---

## 1. Install Epic Games Launcher + Unreal Engine 5.4+

### Windows

1. Download the **Epic Games Launcher** from [epicgames.com/store/download](https://store.epicgames.com/en-US/download).
2. Install and sign in with an Epic account.
3. Open **Unreal Engine** in the left sidebar → **Library** → **+** next to Engine Versions.
4. Install **Unreal Engine 5.4** or newer (5.5+ is fine). Prefer a version with **Visual Studio** tooling enabled.
5. When prompted, install **Visual Studio 2022** with the **Game development with C++** workload (needed for packaging and C++ plugins even if you stay Blueprint-first).
6. Optional: in Launcher → Library → Engine version → Options, enable **Starter Content** / target platforms you need (Windows first).

**Minimum practical machine:** 16 GB RAM (32 GB recommended), dedicated GPU with up-to-date drivers, SSD with ~80+ GB free for engine + project.

### macOS

1. Download Epic Games Launcher for Mac from the same Epic download page.
2. Install, sign in, open **Unreal Engine** → **Library** → add **UE 5.4+**.
3. Xcode (latest compatible with your macOS) is required for packaging; install from the Mac App Store and accept the license (`sudo xcodebuild -license`).
4. Metal-capable Mac (Apple Silicon recommended). Expect longer cook/package times than a mid-high Windows PC.

> **Note:** Cross-compile / Windows packaging from Mac is limited. Day-to-day Blueprint work is fine on Mac; target Windows cook/package from a Windows machine when shipping.

---

## 2. Create the Third Person project: `SpartaAdamo`

1. Launch Unreal Editor from Epic Games Launcher.
2. **Games** → **Third Person**.
3. Project defaults (recommended for this title):
   - **Blueprint** (start Blueprint-first; add C++ modules later if needed)
   - **Target Platform:** Desktop
   - **Quality Preset:** Maximum (or Scalable on weaker hardware)
   - **Raytracing:** Off for first prototype
   - **Starter Content:** Optional (helpful for blockers; strip later)
4. **Project Name:** `SpartaAdamo` (no spaces).
5. **Location:** e.g. `C:\Dev\SpartaAdamo` or `~/Dev/SpartaAdamo` — keep the project **outside** this git repo unless you intentionally adopt Git LFS / `.gitignore` for `.uasset` binaries.
6. Create. Open the default Third Person map and confirm WASD + mouse look + jump work.

### First editor hygiene

- **Edit → Project Settings → Maps & Modes:** set GameDefaultMap / EditorStartupMap once you have `M_Sparta_Sandbox`.
- **Edit → Plugins:** enable only what you need (Enhanced Input is already default in modern TP templates).
- Save a copy of `ThirdPersonCharacter` / maps under your own names before heavy edits so template updates don’t confuse you.

---

## 3. Recommended Content folder structure

Create these folders under `Content/` (Content Browser → Add → New Folder):

```
Content/
  SpartaAdamo/
    Characters/
      Player/           # BP_SpartaSurvivor, meshes, anims
      Tribe/            # Mom Tribe NPCs, War-Queen
      Beasts/           # Mythical mounts / tameables
    Core/
      Components/       # Survival, Inventory, Crafting, Taming, Building
      GameModes/        # GM_SpartaSurvival, GS_Sparta, PC_Sparta
      Save/             # BP_SpartaSaveGame
    Data/
      DataTables/       # DT_Items, DT_Recipes, DT_Engrams, DT_Creatures, DT_BuildParts
      Enums/            # E_ItemId, E_ZoneId, E_ResourceKind, …
      Structs/          # S_ItemDef, S_Recipe, S_SurvivalStats, …
    Input/              # IMC_Sparta, IA_* actions (or extend template IMC)
    Maps/
      M_Sparta_Sandbox  # Small vertical slice (camp + wilds edge)
      M_Sparta_World    # Later open-world / world-partition map
    Placeables/         # Foundations, walls, campfire, station, bed
    UI/
      HUD/              # WBP_HUD, meters, hotbar
      Inventory/        # WBP_Inventory, craft panel
      Tribe/            # Recruitment / Mom Tribe dialogs
    VFX/ Audio/         # Placeholder folders
    World/
      Zones/            # Level instances or World Partition cells: Camp, Wilds, Pass, Outpost
      Resources/        # Gather nodes (fiber, wood, stone, metal, berry bushes)
```

Keep **engine / Marketplace** packs outside `SpartaAdamo/` so your IP content stays obvious.

---

## 4. How the web MVP maps to UE5

The live browser MVP ([GitHub Pages](https://abbytes.github.io/sparta-adamo/)) is a Three.js + Vite + TypeScript vertical slice. Use it as the **feel + systems reference**, not as code to port line-by-line.

| Web MVP (`src/…`) | Unreal target |
|-------------------|---------------|
| `game/Game.ts` + loop | `GM_SpartaSurvival` + PlayerController tick / timers |
| `game/ThirdPersonCamera.ts` | Third Person template spring arm + camera (Enhanced Input) |
| `game/Input.ts` | `IMC_Sparta` + Input Actions (Move, Look, Sprint, Interact, Inventory, Hotbar, Mount, Whistle) |
| `systems/Survival.ts` | `BPC_Survival` (Health, Stamina, Food, Water, Torpor) |
| `systems/Inventory.ts` + recipes / engrams | `BPC_Inventory`, `BPC_Crafting`, `DT_Items`, `DT_Recipes`, `DT_Engrams` |
| Gather / placeables (foundation, wall, campfire, station, bed) | `BPC_Building` + `BP_BuildPreview` + placeable Actors |
| `entities/Creature.ts` (tame / mount) | `BP_MythicBeast` + `BPC_Taming` (torpor / food loop) |
| `entities/Enemy.ts` + Mom Tribo / War-Queen | `BP_MomTribe_*`, `BP_WarQueen`, Behavior Trees |
| `world/World.ts` zones `camp \| wilds \| pass \| outpost` | Streaming levels or World Partition data layers / named volumes |
| `ui/HUD.ts` | `WBP_HUD` (meters, hotbar, prompts) |
| Local persistence (if any) | `BP_SpartaSaveGame` + SaveGame slots |

### Control parity (aim for the same muscle memory)

| Action | Web | UE5 binding suggestion |
|--------|-----|------------------------|
| Move / look | WASD + mouse | Default TP + Look |
| Gather / attack | LMB / Space | `IA_Primary` |
| Sprint | Shift | `IA_Sprint` (drain stamina via Survival) |
| Interact | E | `IA_Interact` |
| Inventory | C | `IA_Inventory` |
| Hotbar | 1–5 | `IA_Hotbar1`…`5` |
| Mount | R | `IA_Mount` |
| Whistle | Q | `IA_Whistle` (call tamed beast / tribe) |

### Scope advice

1. **Vertical slice first:** one survivor, survival meters, gather → craft spear/pick → place campfire + foundation, tame one beast, meet Mom Tribe scout, die/respawn at bed.
2. Match web meters and recipe names early (`fiber`, `wood`, `stone`, `metal`, `berry`, `meat`, cooked meat, stone pick, spear, torch, waterskin, bandage, foundation, wall, campfire, station, bed).
3. Open-world polish (Fortnite/ARK *feel* of traversal and survival pressure) comes **after** the slice; see [GDD.md](./GDD.md).
4. **IP:** gameplay *feel* may reference ARK Ascended / Fortnite at a high level; names, story, and art direction are original **Sparta Adamo** — see GDD legal/IP notes.

---

## 5. Suggested first-week checklist

- [ ] UE 5.4+ installed; Third Person project `SpartaAdamo` opens
- [ ] Folder tree under `Content/SpartaAdamo/` created
- [ ] Rename/duplicate template character → `BP_SpartaSurvivor`
- [ ] Add `BPC_Survival` + HUD bars for Health / Stamina / Food / Water
- [ ] Add `DT_Items` + `DT_Recipes` seeded from the web recipe list
- [ ] One gatherable resource actor + inventory add
- [ ] Read [GDD.md](./GDD.md) and track tasks in [SYSTEMS.md](./SYSTEMS.md)

When this repo’s web MVP changes, update the mapping table above so UE stays aligned with the playable reference.
