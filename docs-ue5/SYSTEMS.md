# Sparta Adamo — UE5 Systems & Blueprint Checklist

Implementation checklist for a Blueprint-first Unreal Engine 5.4+ build.  
Design intent: [GDD.md](./GDD.md) · Setup: [README.md](./README.md) · Web reference: `src/` in this repo / https://abbytes.github.io/sparta-adamo/

Mark items `[x]` as you complete them in the `SpartaAdamo` project.

---

## 0. Project bootstrap

- [ ] Third Person template project named **SpartaAdamo** (UE 5.4+)
- [ ] Folder tree under `Content/SpartaAdamo/` (see README)
- [ ] Enhanced Input: `IMC_Sparta` (or extend template IMC) with actions below
- [ ] `GM_SpartaSurvival`, `PC_Sparta`, `GS_Sparta` (Game State optional early)
- [ ] Default map `M_Sparta_Sandbox`

### Suggested Input Actions

| Action | Keys (prototype) | Consumes |
|--------|------------------|----------|
| `IA_Move` | WASD | — |
| `IA_Look` | Mouse | — |
| `IA_Jump` | Space | — |
| `IA_Sprint` | Shift | Stamina |
| `IA_Primary` | LMB | Stamina (attacks) |
| `IA_Interact` | E | — |
| `IA_Inventory` | C | — |
| `IA_Hotbar1`…`IA_Hotbar5` | 1–5 | — |
| `IA_Mount` | R | — |
| `IA_Whistle` | Q | — |
| `IA_BuildRotate` | Mouse wheel / Q-E while placing | — |

---

## 1. Player (third person)

**Assets**

| Name | Type | Notes |
|------|------|-------|
| `BP_SpartaSurvivor` | Character | Duplicate TP character; attach components below |
| `ABP_SpartaSurvivor` | Anim BP | Sprint / gather / attack / mount layer later |
| `BPC_Interact` | Actor Component | Line/sphere trace; interface `BPI_Interactable` |

**Checklist**

- [ ] Move, look, jump via Enhanced Input
- [ ] Sprint gated by `BPC_Survival.CanSprint`
- [ ] Camera spring arm collision / lag tuned for readability
- [ ] Mesh placeholder OK; tag actor `Player`
- [ ] On death → respawn at bed / camp (hook SaveGame later)
- [ ] Hotbar select updates held mesh / attack profile

---

## 2. SurvivalComponent

**Asset:** `BPC_Survival` (Actor Component on `BP_SpartaSurvivor`)

**Struct:** `S_SurvivalStats`

| Field | Type | Default |
|-------|------|---------|
| Health / MaxHealth | float | 100 |
| Stamina / MaxStamina | float | 100 |
| Food / MaxFood | float | 100 |
| Water / MaxWater | float | 100 |
| Torpor / MaxTorpor | float | 0 / 100 |

**Checklist**

- [ ] Tick drains Food (~every 4s) and Water (~every 3.2s); faster while sprinting
- [ ] Starve damage when Food or Water ≤ 0
- [ ] Stamina drain on sprint-move; regen otherwise
- [ ] Slow Health regen when Food & Water > 40
- [ ] Torpor decay over time
- [ ] API: `Damage`, `Heal`, `Eat`, `Drink`, `CanSprint`, `IsDead`
- [ ] Dispatch events: `OnStatsChanged`, `OnDeath` → HUD / GameMode
- [ ] Optional DataTable row for tuning (`DT_SurvivalTuning`)

**Web parity:** `src/systems/Survival.ts`

---

## 3. Inventory

**Assets**

| Name | Type |
|------|------|
| `BPC_Inventory` | Actor Component |
| `S_ItemStack` | Struct (`ItemId`, `Quantity`) |
| `E_ItemId` | Enum (mirror web `ItemId`) |
| `DT_Items` | Data Table (`S_ItemDef`) |

**`S_ItemDef` columns (suggested)**

`Id`, `DisplayName`, `Description`, `Icon`, `MaxStack`, `bPlaceable`, `HeldMesh`, `PrimaryAction` (Gather / Attack / Consume / Place)

**Seed item IDs (from web MVP)**

`fiber`, `wood`, `stone`, `metal`, `berry`, `meat`, `cookedMeat`, `stonePick`, `spear`, `torch`, `waterskin`, `bandage`, `foundation`, `wall`, `campfire`, `station`, `bed`

**Checklist**

- [ ] Map / array of stacks; `Add`, `Remove`, `Count`, `Has`
- [ ] Hotbar array length 5; `SelectedIndex`
- [ ] Auto-place newly crafted tools onto empty hotbar slot
- [ ] Level, XP, XP-to-next; `AddXp` with curve (~×1.35 + 20)
- [ ] Flags or traces for `bNearCampfire` / `bNearStation`
- [ ] Replicate-ready layout later (keep logic in component, not Widget)

**Web parity:** `src/systems/Inventory.ts`, `src/utils/types.ts`

---

## 4. Crafting / Engrams

**Assets**

| Name | Type |
|------|------|
| `BPC_Crafting` | Actor Component (or Inventory sub-object) |
| `S_Recipe` | Struct |
| `DT_Recipes` | Data Table |
| `DT_Engrams` | Data Table (optional; or use `RequiredLevel` on recipe) |
| `WBP_CraftPanel` | Widget (section of inventory) |

**`S_Recipe` columns**

`OutputItem`, `OutputQty`, `DisplayName`, `RequiredLevel` (engram), `Station` (`Hand` / `Campfire` / `Station`), `Costs` (map or array of `S_ItemStack`), `bPlaceable`

**Seed recipes (web `RECIPES`)**

| Output | Level | Station | Costs (summary) |
|--------|-------|---------|-----------------|
| Stone Pick | 1 | Hand | wood 2, stone 3, fiber 2 |
| Spear | 1 | Hand | wood 4, fiber 2, stone 1 |
| Torch | 1 | Hand | wood 1, fiber 2 |
| Waterskin | 2 | Hand | fiber 6, wood 1 |
| Bandage | 2 | Hand | fiber 8 |
| Campfire | 2 | Hand | wood 8, stone 4 |
| Cooked Meat | 2 | Campfire | meat 1, wood 1 |
| Foundation | 3 | Hand | wood 10, stone 5, fiber 4 |
| Wall | 3 | Hand | wood 6, fiber 4 |
| Bed | 4 | Hand | fiber 12, wood 6 |
| Crafting Station | 5 | Hand | wood 15, stone 10, metal 4 |

**Checklist**

- [ ] `CanCraft` / `Craft` honor level + station proximity + costs
- [ ] Spend inputs then `Inventory.Add(output)`
- [ ] UI lists only unlocked (or shows locked engrams greyed)
- [ ] XP grant on craft / gather / kill / tame (tune in GDD)

---

## 5. Building

**Assets**

| Name | Type |
|------|------|
| `BPC_Building` | Actor Component on player |
| `BP_BuildPreview` | Actor (ghost mesh, valid/invalid material) |
| `BP_Build_Foundation` | Placeable Actor |
| `BP_Build_Wall` | Placeable Actor |
| `BP_Build_Campfire` | Placeable Actor (+ cook volume) |
| `BP_Build_Station` | Placeable Actor (+ craft volume) |
| `BP_Build_Bed` | Placeable Actor (+ spawn ID) |
| `DT_BuildParts` | Data Table (item → actor class, snap rules) |

**Checklist**

- [ ] Enter build mode from hotbar placeable
- [ ] Ghost follows aim; grid or socket snap to foundation
- [ ] Rotation input; surface normal rules for walls
- [ ] On confirm: consume item, spawn actor, register with `GS` / save list
- [ ] Campfire / Station set nearby flags for crafting
- [ ] Bed registers respawn transform for owning player
- [ ] Demolish / pickup (hold interact) for prototype iteration

---

## 6. Taming

**Assets**

| Name | Type |
|------|------|
| `BPC_Taming` | Component on beasts (and optional player knockout applicator) |
| `BP_MythicBeast` | Character / Pawn base |
| `BP_Beast_*` | Per-species children |
| `DT_Creatures` | Data Table |
| `S_CreatureDef` | Struct |

**`S_CreatureDef` columns (suggested)**

`Id`, `DisplayName`, `Mesh`, `MaxHealth`, `MaxTorpor`, `TorporPerHit`, `TorporDecay`, `PreferredFood`, `TameFoodNeeded`, `RideSocket`, `XPOnTame`, `Role` (Travel / War / Haul / Scout)

**Tame loop checklist**

- [ ] Primary on unconscious-capable weapon applies **Torpor**, not only Health
- [ ] At MaxTorpor → unconscious state (anim + disable AI)
- [ ] While unconscious: accept PreferredFood from player inventory; progress bar
- [ ] Torpor must stay above 0 or creature wakes
- [ ] On complete: `bTamed`, set owner, enable mount / whistle
- [ ] `IA_Mount` possess or attach rider; camera adjust
- [ ] `IA_Whistle` → follow / stay / attack target (enum cycle)

**Web parity:** `src/entities/Creature.ts`

---

## 7. AI — Mom Tribe + beasts + hostiles

**Assets**

| Name | Type |
|------|------|
| `AI_Beast_Controller` | AI Controller |
| `BT_Beast_Wild` | Behavior Tree (wander, aggro, flee optional) |
| `BT_Beast_Tamed` | Follow owner, attack whistle target |
| `BP_MomTribe_Scout` | Character NPC |
| `BP_MomTribe_Warrior` | Character NPC |
| `BP_WarQueen` | Character (narrative + combat phases later) |
| `BT_Tribe_Guard` | Patrol / dialogue / combat |
| `BB_Shared` | Blackboard (Target, Home, TribeState) |
| `BPI_Dialogue` / `WBP_TribeDialog` | Recruitment UI |

**Checklist**

- [ ] Wild beasts: idle wander + perception → chase / attack
- [ ] Unconscious / tamed state switches BT or disables wild BT
- [ ] Mom Tribe scout: interact → dialog → first recruitment task
- [ ] Reputation variable on `GS_Sparta` or SaveGame
- [ ] War-Queen: gated encounter (do not aggro on first meet)
- [ ] Pass / Outpost spawners use EQS or simple points

**Web parity:** `src/entities/Enemy.ts`, Mom Tribo / War-Queen features in MVP

---

## 8. World / zones

**Assets**

| Name | Type |
|------|------|
| `M_Sparta_Sandbox` | Map |
| `BP_ZoneVolume` | Trigger volume → `E_ZoneId` |
| `E_ZoneId` | `Camp`, `Wilds`, `Pass`, `Outpost` |
| `BP_ResourceNode_*` | Gatherables (fiber, wood, stone, metal, berry) |
| `BP_Spawner_Beast` | Timed / density spawn |

**Checklist**

- [ ] Four zone volumes update HUD location text
- [ ] Resource nodes: health, tool filter (pick vs hand), respawn timer
- [ ] Loot tables grant correct `E_ItemId` stacks
- [ ] Later: World Partition cells named after zones

**Web parity:** `src/world/World.ts`, `ZoneId` in `types.ts`

---

## 9. HUD / UI

**Assets**

| Name | Type |
|------|------|
| `WBP_HUD` | Main HUD |
| `WBP_MeterBar` | Reusable bar (Health, Stamina, Food, Water) |
| `WBP_Hotbar` | 5 slots + selection chrome |
| `WBP_Inventory` | Grid + craft list + XP/level |
| `WBP_InteractPrompt` | “E — …” |
| `WBP_TamePanel` | Torpor + tame progress (when focused) |
| `WBP_TribeDialog` | Mom Tribe recruitment |
| `UI_PC_HUD` | Widget Component or create in `PC_Sparta.BeginPlay` |

**Checklist**

- [ ] Bind to `BPC_Survival.OnStatsChanged`
- [ ] Hotbar reflects inventory + selection
- [ ] Inventory toggle (`C`) pauses digi-feel or uses input mode Game+UI
- [ ] Damage / starve / level-up feedback (sound + anim)
- [ ] Mobile later: optional touch layout (web MVP already has sticks)

**Web parity:** `src/ui/HUD.ts`

---

## 10. SaveGame

**Assets**

| Name | Type |
|------|------|
| `BP_SpartaSaveGame` | SaveGame Blueprint |
| `BFL_SpartaSave` | Blueprint Function Library (optional) |

**Persist at minimum**

- [ ] Player transform + survival stats
- [ ] Inventory stacks + hotbar + level/XP
- [ ] Placed build actors (class, transform, owner)
- [ ] Tamed beasts (class, stats, tame state, transform)
- [ ] Tribe reputation / recruitment flags
- [ ] Slot name `SpartaAdamo_Slot0`

**Checklist**

- [ ] Save on bed sleep / quit / interval
- [ ] Load in `GM_SpartaSurvival` before pawn possess
- [ ] Version int on save object for migration

---

## 11. Suggested creation order (do in sequence)

1. Player + Survival + HUD meters  
2. `DT_Items` / Inventory / gather one node  
3. Recipes + craft spear/pick  
4. Building ghost + campfire/foundation/bed  
5. One wild beast + torpor tame + mount  
6. Mom Tribe scout dialog + one quest flag  
7. Save/Load round-trip  
8. Expand zones / War-Queen beat  

---

## 12. Naming cheat-sheet

| Prefix | Use |
|--------|-----|
| `BP_` | Blueprint Actor / Character |
| `BPC_` | Blueprint Component |
| `WBP_` | Widget Blueprint |
| `DT_` | Data Table |
| `S_` | Struct |
| `E_` | Enum |
| `BT_` / `BB_` / `AI_` | Behavior Tree / Blackboard / AI Controller |
| `IMC_` / `IA_` | Input Mapping Context / Input Action |
| `GM_` / `PC_` / `GS_` | GameMode / PlayerController / GameState |
| `BPI_` | Blueprint Interface |
| `BFL_` | Blueprint Function Library |
| `ABP_` | Animation Blueprint |
| `M_` | Map |

---

## 13. Definition of done (Slice 1)

Aligned with GDD §9:

- [ ] Survival meters drive gameplay pressure  
- [ ] Gather → craft MVP kit  
- [ ] Place campfire, foundation, bed; respawn works  
- [ ] Tame + mount one mythical beast  
- [ ] Mom Tribe recruitment step completable  
- [ ] Save/Load restores the above  

When Slice 1 is checked off, extend `DT_*` and maps rather than rewriting components.
