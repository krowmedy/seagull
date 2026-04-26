import * as Phaser from 'phaser';

export const BASE_HUD_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Bangers", "Comic Sans MS", cursive',
  color: '#FFD23F',
  stroke: '#1A1A2E',
  resolution: 4,
};

export function spawnScorePopup(
  scene: Phaser.Scene,
  x: number,
  y: number,
  points: number,
): void {
  const popup = scene.add.text(x, y, `+${points}`, {
    ...BASE_HUD_TEXT_STYLE,
    strokeThickness: 3,
    fontSize: 24,
    padding: { x: 4, y: 4 },
  }).setOrigin(0.5);

  scene.tweens.add({
    targets: popup,
    y: y - 40,
    alpha: 0,
    duration: 600,
    ease: 'Quad.easeOut',
    onComplete: () => popup.destroy(),
  });
}
