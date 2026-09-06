# Sparta Adamo — Bestiary & Name Canon

**Purpose:** Lock official creature, champion, and relic names for **UE5**, the **TCG**, and the **video trailer**.  
This is the canon list. Do not invent alternate marketing names for these entries without updating this file.

> **Web MVP note:** The GitHub Pages / Vite MVP may still show generic labels (`wolf`, `boar`, `War-Queen`, etc.). That is expected until the web client is renamed. Prefer these locked names for UE5 DataTables, TCG cards, trailer VO/on-screen text, and design docs.

**Related:** [GDD.md](./GDD.md) · [SYSTEMS.md](./SYSTEMS.md) · [README.md](./README.md)

---

## Locked trailer / TCG spotlight names

| Canon name | Role | Notes |
|------------|------|--------|
| **War-Queen Adama** | Mom Tribe outpost boss / wizard champion | Faction apex for Outpost beats; not a first-meet loot pinata. Full title in TCG / trailer; UE5 may use `BP_WarQueenAdama`. |
| **War Mammoth** | Tameable heavy beast (**Guard**) | Slow, high HP / knockback; Guard stance / whistle for outpost defense. |
| **Tribe Drake** | Tameable flying beast (**Flight Bond**) | Aerial mount / scout; Flight Bond unlocks sky traversal once tamed. |

Use these three names verbatim in trailer cards, TCG rarity spotlights, and UE5 creature rows that map to the same fantasy.

---

## Mom Tribe mini-set — beasts (future)

Brief placeholders for the Adamo / Mom Tribe mini-set. Flesh stats and taming loops later; **names are locked**.

| Canon name | Brief |
|------------|--------|
| **Cub Runner** | Early tame; fast ground scout / messenger. |
| **Pack Wolf** | Pack hunter; follow / attack whistle workhorse. |
| **Hide-Tent Boar** | Tough early mount; hide / camp-resource fantasy. |
| **Cliff Goat** | Mountain Pass climber; ledge traversal. |
| **Sky Raptor** | Mid-tier flyer; lighter than Tribe Drake. |
| **Ember Hound** | Heat / forge-adjacent companion; camp defense. |
| **Ironback** | Armored tank; siege / Guard support (below War Mammoth). |
| **Blood Stag** | Wilds apex herbivore; high-risk tame trophy. |

---

## Mom Tribe mini-set — wizards (future)

| Canon name | Brief |
|------------|--------|
| **Mom-Speaker Rhea** | Voice of the tribe; quest / ritual dialogue pivot. |
| **Scout Lysa** | First recruitment contact; trail and Outpost edge. |

---

## Mom Tribe mini-set — relics (future)

| Canon name | Brief |
|------------|--------|
| **Tribe Banner** | Faction identity / rally point; camp or Outpost claim. |
| **Forge of the Moms** | Legendary crafting / engram locus for tribe gear. |

---

## Implementation pointers (UE5)

- Prefer DataTable display names matching this file (`DT_Creatures`, NPC rows, UI).
- Blueprint / asset suffixes can stay camelCase (`BP_WarMammoth`, `BP_TribeDrake`) while **player-facing** strings use the locked names above.
- When renaming web MVP entities, map generics → canon (e.g. wolf → Pack Wolf, boar → Hide-Tent Boar, boss → War-Queen Adama) rather than inventing a third set of names.

---

*Canon lock for Sparta Adamo — Adamo / Mom Tribe naming. Update this doc when TCG or trailer names change.*
