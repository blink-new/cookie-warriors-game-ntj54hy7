export interface Position {
  x: number;
  y: number;
}

export interface CookieType {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  magicalElement: string;
  ability: string;
  health: number;
  damage: number;
  speed: number;
  size: number;
  emoji: string;
  description: string;
}

export interface Cookie extends Position {
  id: string;
  type: CookieType;
  health: number;
  maxHealth: number;
  isSelected: boolean;
  direction: number;
  lastAttack: number;
}

export interface CakeMonster extends Position {
  id: string;
  health: number;
  maxHealth: number;
  type: 'basic' | 'boss';
  size: number;
  speed: number;
  damage: number;
  lastAttack: number;
}

export interface GameState {
  cookies: Cookie[];
  monsters: CakeMonster[];
  score: number;
  wave: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';
  selectedCookieType: string;
}