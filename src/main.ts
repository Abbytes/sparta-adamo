import { Game } from './game/Game';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Missing #game-canvas');

document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

new Game(canvas);
