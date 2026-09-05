# Sparta Adamo — Game Design Document (UE5)

**Working title:** Sparta Adamo  
**Engine path:** Unreal Engine 5.4+ (Blueprint-first)  
**Reference MVP:** Browser third-person survival — https://abbytes.github.io/sparta-adamo/  
**Document role:** Design north star for the Unreal build. Systems detail / Blueprint checklist lives in [SYSTEMS.md](./SYSTEMS.md). Setup lives in [README.md](./README.md).

---

## 1. High concept

**One-liner:** A third-person open-world survival game set in a mythic Spartan frontier — gather, craft, build, tame legendary beasts, and rise under the banner of the Mom Tribe and its War-Queen.

**Pitch:** You wash up (or march in) as a lone survivor on a harsh Aegean-fantasy wilderness. Hunger, thirst, and stamina rule every fight and trek. You unlock engrams, raise timber-and-stone outposts, knock out and bond mythical creatures as mounts and war-companions, then earn a place among the Mom Tribe — an original matriarchal war-society led by the War-Queen.

**Tone:** Epic but grounded survival; bronze-and-iron grit meets living myth. Heroic without being a power-fantasy from minute one. Death is a teacher; tribes are a home.

---

## 2. Inspiration vs original IP (important)

### Feel references (high level only)

| Reference | What we borrow *as feel* | What we do **not** copy |
|-----------|--------------------------|-------------------------|
| **ARK: Survival Ascended** | Third-person survival loop: meters, taming via torpor/food, building, engrams, creature mounts, hostile wilds | Dinosaur roster, Island/map IP, UI art, exact formulas, names, story |
| **Fortnite** (traversal / readability) | Clear third-person readability, snappy movement camera, readable silhouettes, approachable onboarding | Battle royale loop, building combat meta, characters, brands, audio/UI |

These are **tonal and systemic touchstones** for designers (“survival pressure like ARK, camera clarity like a polished third-person live service”). They are **not** assets, narratives, or brand affiliations.

### Original IP — Sparta Adamo

- **Title, world, factions, creature names, and story** are original to *Sparta Adamo*.
- **Mom Tribe** and **War-Queen** are original faction / character concepts for this project (not taken from ARK tribes or Fortnite lore).
- Mythical beasts should read as **Spartan-myth hybrids** (bronze-age + legendary fauna), not as ARK species stand-ins with renamed meshes.
- Marketing and store pages should say *“survival craft inspired by the genre”* — never “ARK clone” or misuse Epic/Fortnite trademarks beyond factual engine/store statements.

---

## 3. Player fantasy & pillars

1. **Endure the wild** — Food, water, stamina, and wounds matter every minute.
2. **Make the land yours** — Gather → engram craft → place foundations, walls, fires, stations, beds.
3. **Bond the myth** — Knock out, feed, and ride beasts that feel legendary, not generic livestock.
4. **Belong to a tribe** — Progress from outsider to Mom Tribe recruit under the War-Queen’s gaze.
5. **Traverse an open frontier** — Linked zones with distinct threats and resources, readable like a living world.

---

## 4. Core loop

```
Spawn / wake at bed or camp
    → Explore & gather (fiber, wood, stone, metal, forage, hunt)
        → Manage survival meters (eat, drink, rest stamina)
            → Unlock engrams via XP / level
                → Craft tools, weapons, placeables
                    → Build / expand outpost
                        → Tame mythical beast (torpor → feed → bond)
                            → Push into harder zones
                                → Contact Mom Tribe → prove worth → recruit / quests
                                    → Face War-Queen arc content (diplomacy / trial / war)
```

Session length target (prototype): **20–40 minutes** to first mount + basic shelter.  
Long-term: multi-hour base building and tribe reputation.

---

## 5. Systems overview

### 5.1 Survival meters

| Meter | Role | Prototype rules (align with web MVP) |
|-------|------|--------------------------------------|
| **Health** | Death at 0; regen slowly when Food & Water are healthy | Cap 100; damage from combat / starve |
| **Stamina** | Sprint, melee, future climb/dodge | Drains on sprint-move; regenerates when not sprinting |
| **Food** | Passive drain; 0 contributes to starve damage | Drain faster while sprinting |
| **Water** | Same as food, slightly faster drain | Refill at water sources / waterskin |
| **Torpor** | Used primarily on **beasts** for taming; player may get stunned by heavy hits later | Decays over time |

**Death:** Drop or keep inventory per design toggle (prototype: keep tools, lose some raw resources). Respawn at last **Bed** or tribe camp.

### 5.2 Inventory, crafting, engrams

- Stack-based inventory + **5-slot hotbar** (parity with web: keys 1–5).
- **Engrams** gated by survivor **level** (recipe `engramLevel`).
- Stations: **hand**, **campfire** (cook meat), **crafting station** (advanced).
- Seed recipe set (from MVP): stone pick, spear, torch, waterskin, bandage, campfire, foundation, wall, bed, crafting station, cooked meat.

**Progression fantasy:** Bronze-age pragmatism → iron-tipped war kit → tribe-blessed gear (later tiers).

### 5.3 Building

Placeables (MVP set):

- **Foundation**, **Wall** — shelter footprint  
- **Campfire** — light, cook, warmth (future)  
- **Crafting Station** — unlock higher recipes when nearby  
- **Bed** — spawn point  

Rules for prototype:

- Snap-to-grid or socket snap on foundations.
- Must have resources in inventory; ghost preview (valid/invalid).
- Tribe structures later share ownership / permissions.

Visual direction: timber, hide, bronze fittings — Spartan frontier, not sci-fi metal.

### 5.4 Taming mythical beasts

**Loop (ARK-like structure, original creatures):**

1. Craft knockout tools (club / tranquil spear — expand from MVP spear + torpor).
2. Apply torpor until unconscious (not dead).
3. Feed preferred food while torpor holds.
4. On tame complete: bond, rename, whistle call, mount (`R`), follow/attack commands (`Q` whistle set).

**Design goals:**

- Each beast has a **role** (travel, haul, war, scout) and a **myth hook** (e.g. bronze-maned hunter, shield-backed bulwark — names TBD in art bible).
- Taming should feel tense (wilds aggro, torpor decay, food pressure) but readable for newcomers.

### 5.5 Mom Tribe & War-Queen

| Element | Design intent |
|---------|----------------|
| **Mom Tribe** | Matriarchal war-kinship; camps, scouts, trainers. Not a generic “NPC vendor village.” |
| **Recruitment** | Reputation + trials (deliver resources, tame a beast, defend a pass, survive a night watch). |
| **War-Queen** | Faction apex — quest giver, judgment figure, and late vertical-slice boss/diplomacy pivot. |
| **Player relation** | Outsider → provisional spear → full kin (cosmetics, tribe build rights, unique engrams). |

Avoid reducing the War-Queen to a loot pinata on first contact; first meeting should be **audience / trial**.

### 5.6 Combat (prototype)

- Third-person melee primary (spear); light ranged later.
- Stamina-gated sprint and attacks.
- Creatures and hostile humans/tribals use simple AI (see SYSTEMS.md).
- Mounted combat is a **mid** milestone, not day-one requirement.

### 5.7 Open world zones

| Zone ID | Fantasy | Resources / pressure |
|---------|---------|----------------------|
| **Camp** | Safe-ish starter foothold; Mom Tribe contact edge | Fiber, wood, berries; tutorial beasts |
| **Wilds** | Dense forage and hunt grounds | Stone, meat, mid threats |
| **Pass** | Chokepoint, ambush weather, transit | Metal nodes; patrols |
| **Outpost** | Contested or tribe-held ruins | Higher loot; War-Queen narrative beats |

Implementation can start as **one sandbox map with volumes**, then World Partition / level streaming.

---

## 6. Camera, controls, readability

- Over-the-shoulder / third-person spring arm; collision push-in.
- Fortnite-like **clarity** target: silhouette of player and beasts readable at sprint speed; interact prompts obvious.
- HUD: four meters + hotbar + compact XP/level + contextual prompts (no cluttered MMO chrome in prototype).

---

## 7. Multiplayer (future)

Prototype is **offline single-player**. Design systems (inventory ownership, tribe permissions, save slots) so dedicated/listen server can land later without rewriting item definitions. Do not block the vertical slice on networking.

---

## 8. Art & audio direction (brief)

- **Art:** Mediterranean rugged coast, olive scrub, limestone, timber palisades, bronze accents, cloth and leather. Beasts should feel carved from myth, not photoreal dinos.
- **UI:** Stone / bronze / crimson ink — original chrome; no Fortnite or ARK UI mimicry.
- **Audio:** Wind, forge, tribal drums; beast calls unique per species.

---

## 9. Success criteria for UE vertical slice

Ship-internal “Slice 1” is done when a new player can:

1. Survive 15+ minutes managing Food/Water/Stamina.
2. Gather and craft the MVP tool/weapon set.
3. Place campfire + foundation + bed and respawn there.
4. Knock out and tame **one** mythical beast and mount it.
5. Meet a Mom Tribe scout and complete one recruitment step toward the War-Queen arc.

---

## 10. Document history

| Version | Date | Notes |
|---------|------|-------|
| 0.1 | 2026-09-05 | Initial GDD for UE5 path; aligned with web MVP systems |

Maintainers: keep this GDD in sync when the web MVP (`src/`) changes meter rules, recipes, or zone IDs.
