# Sparta Adamo

Third-person survival open-world browser game (ARK-inspired).

Live: https://abbytes.github.io/sparta-adamo/

## Run

nmp install && npm run dev
 
Build: npm run build; copy dist/* to docs/

## Controls

Desktop: WASD, mouse look, LMB/Space gather-attack, Shift sprint, E interact, C inventory, 1-5 hotbar, R mount, Q whistle.

Mobile: sticks, USE, SPR, E, INV, hotbar.

## Features

- Health, Stamina, Food, Water
- Gather, craft, build, tame beasts
- Mom Tribo and War-Queen
- Three.js + Vite + TypeScript

## Unreal Engine 5 path

For the native UE5 design and setup track (separate from this web MVP), see **[docs-ue5/](./docs-ue5/)**:

- [docs-ue5/README.md](./docs-ue5/README.md) — Install Epic Launcher + UE 5.4+, create SpartaAdamo, folder layout, web to UE mapping
- [docs-ue5/GDD.md](./docs-ue5/GDD.md) — Game Design Document
- [docs-ue5/SYSTEMS.md](./docs-ue5/SYSTEMS.md) — Blueprint / DataTable implementation checklist

UE docs live in docs-ue5/ so they do not interfere with the GitHub Pages site served from docs/.
