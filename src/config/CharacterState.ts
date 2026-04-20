export const CharacterState = {
  Flying: 'flying',
  Walking: 'walking',
} as const;

export type CharacterState = typeof CharacterState[keyof typeof CharacterState];
