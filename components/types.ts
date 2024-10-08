export interface PlayerStats {
    attackDamage: number;
    moveSpeed: number;
    projectileSpeed: number;
    projectileSize: number;
    attackRange: number;
  }
  
  export interface GameState {
    score: number;
    wave: number;
    hearts: number;
    gameOver: boolean;
    combo: number;
    stars: number;
    coins: number;
  }
  
  export const BASE_PLAYER_STATS: PlayerStats = {
    attackDamage: 10,
    moveSpeed: 5,
    projectileSpeed: 7,
    projectileSize: 6,
    attackRange: 80,
  };
  
  export const INITIAL_GAME_STATE: GameState = {
    score: 0,
    wave: 1,
    hearts: 3,
    gameOver: false,
    combo: 0,
    stars: 0,
    coins: 0,
  };