# Sparta Adamo

Open-world 2D top-down RPG MVP. Play as Commander Adamo (bronze armor, crimson cape). Explore the wilds, craft gear, recruit a Sparta tribe, and crush the Mom Tribe War-Queen.

Tone: gritty epic. Procedural geometric sprites. No paid APIs.

## How to run

```bash
cd sparta-adamo
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### Production build

```bash
npm run build
npm run preview
```

## Controls

- WASD / Arrow keys: Move
- Space or Left click: Attack (spear slash)
- Shift: Block (reduces damage)
- E: Interact (anvil, bench, recruit, rescue)
- ESC: Manual save to localStorage

## Features (MVP)

1. Title to Start - new game or continue from save; clear save option
2. Open map zones - Sparta Camp, The Wilds, Mountain Pass, Mom Tribe Outpost
3. Combat - patrol/chase AI, player HP, Shift block, War-Queen mini-boss
4. Leveling - XP from kills; auto boosts HP / damage / shield
5. Crafting - gather bronze_scrap, herb, wood
   - Anvil: 3 scrap + 2 wood = spear upgrade
   - Bench: 2 herb + 1 wood = bandage (+40 HP)
6. Tribe - rescue captive in Mountain Pass; hire warrior at camp for 3 bronze
7. Quests - HUD objectives guide gather, recruit, clear outpost, defeat queen
8. HUD - HP, level/XP, materials, tribe size, objective, zone
9. Save/Load - auto-save + ESC; continue from title
10. Game over / Victory screens

## Suggested first run

1. Leave Sparta Camp north into The Wilds
2. Gather scrap, herb, and wood
3. Return to camp - forge spear at Anvil, bandage at Bench
4. Hire a warrior at camp (3 bronze)
5. Rescue captive in Mountain Pass (northwest)
6. Clear Mom Tribe Outpost and defeat the War-Queen

## Project structure

```
sparta-adamo/
|-- index.html, package.json, tsconfig.json, vite.config.ts, README.md
|-- public/
`-- src/
    |-- main.ts
    |-- scenes/   TitleScene, WorldScene, GameOverScene, VictoryScene
    |-- entities/ Player, Enemy, Follower, Pickup
    |-- systems/  SpriteFactory, MapBuilder, CraftingSystem, LevelSystem
    |-- ui/       HUD
    `-- utils/    types, SaveSystem, colors
```

## Tech

- Vite 5 + TypeScript
- Phaser 3 (Arcade Physics)
- Procedural sprites via Phaser Graphics

## License

MVP demo - free to play and modify.
