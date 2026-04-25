export const CharacterState = {
  Flying: 'flying',
  Walking: 'walking',
  Standing: 'standing',
} as const;

export type CharacterState = typeof CharacterState[keyof typeof CharacterState];
