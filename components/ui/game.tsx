"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, Zap, Heart, Sword, Star, CoinsIcon } from "lucide-react";
import Image from "next/image";
import GameTutorial from "../gametuto";
import { toast } from "react-hot-toast";
import { soundManager } from "./sound-manager";
import { Button } from "./buttonmsp";
import SoundSettings from "./tuner";
// import { randomInt } from "crypto";
// import toast, { ToastBar } from "react-hot-toast";
// import { Toaster } from "./sonner";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { Dashboard, UpgradeMenu } from "../ui/dashboard";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { SparklesCore } from "./sparkles";

// WebGL shader programs
const VERTEX_SHADER = `
  attribute vec2 position;
  attribute vec4 color;
  attribute float size;
  
  varying vec4 vColor;
  
  void main() {
    vColor = color;
    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = size;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  
  varying vec4 vColor;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord) * 2.0;
    float a = 1.0 - smoothstep(0.8, 1.0, r);
    
    gl_FragColor = vec4(vColor.rgb, vColor.a * a);
  }
`;

class ParticleSystem {
  public gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private particles: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private maxParticles: number;
  private particleCount: number;
  private vertexBuffer: WebGLBuffer;
  private colorBuffer: WebGLBuffer;
  private sizeBuffer: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement, maxParticles: number = 10000) {
    this.gl = canvas.getContext("webgl")!;
    this.maxParticles = maxParticles;
    this.particleCount = 0;
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.program = this.createShaderProgram();
    this.gl.useProgram(this.program);

    this.particles = new Float32Array(maxParticles * 2);
    this.velocities = new Float32Array(maxParticles * 2);
    this.colors = new Float32Array(maxParticles * 4);
    this.sizes = new Float32Array(maxParticles);

    this.vertexBuffer = this.gl.createBuffer()!;
    this.colorBuffer = this.gl.createBuffer()!;
    this.sizeBuffer = this.gl.createBuffer()!;

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  private createShaderProgram(): WebGLProgram {
    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      VERTEX_SHADER
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER
    );

    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    return program;
  }
  public addParticles(
    x: number,
    y: number,
    count: number,
    color: [number, number, number],
    speed: number,
    spread: number = Math.PI / 10, // Reduced spread for a more focused particle effect
    direction: number = 0 // Still controlled by the input
  ) {
    // Convert canvas coordinates to WebGL coordinates
    const glX = (x / this.gl.canvas.width) * 2 - 1;
    const glY = 1 - (y / this.gl.canvas.height) * 2;

    for (let i = 0; i < count && this.particleCount < this.maxParticles; i++) {
      const index = this.particleCount * 2;
      const colorIndex = this.particleCount * 4;

      this.particles[index] = glX;
      this.particles[index + 1] = glY;

      // Calculate angle based on the narrower spread and direction
      const angle = (Math.random() - 0.5) * spread + direction;
      const particleSpeed = (Math.random() * 0.5 + 0.75) * speed; // Reduced speed variability
      this.velocities[index] = Math.cos(angle) * particleSpeed * 0.01;
      this.velocities[index + 1] = Math.sin(angle) * particleSpeed * 0.01;

      this.colors[colorIndex] = color[0];
      this.colors[colorIndex + 1] = color[1];
      this.colors[colorIndex + 2] = color[2];
      this.colors[colorIndex + 3] = Math.random() * 0.4 + 0.6; // Slightly less opacity range

      this.sizes[this.particleCount] = Math.random() * 6 + 3; // Reduced size range for less distraction
      this.particleCount++;
    }

    this.updateBuffers();
  }

  public update() {
    for (let i = 0; i < this.particleCount; i++) {
      const index = i * 2;
      this.particles[index] += this.velocities[index];
      this.particles[index + 1] += this.velocities[index + 1];

      // Fade out
      const colorIndex = i * 4;
      this.colors[colorIndex + 3] *= 0.95;

      // Remove faded particles
      if (this.colors[colorIndex + 3] < 0.01) {
        this.particles[index] = this.particles[this.particleCount * 2 - 2];
        this.particles[index + 1] = this.particles[this.particleCount * 2 - 1];
        this.velocities[index] = this.velocities[this.particleCount * 2 - 2];
        this.velocities[index + 1] =
          this.velocities[this.particleCount * 2 - 1];
        this.colors[colorIndex] = this.colors[this.particleCount * 4 - 4];
        this.colors[colorIndex + 1] = this.colors[this.particleCount * 4 - 3];
        this.colors[colorIndex + 2] = this.colors[this.particleCount * 4 - 2];
        this.colors[colorIndex + 3] = this.colors[this.particleCount * 4 - 1];
        this.sizes[i] = this.sizes[this.particleCount - 1];
        this.particleCount--;
        i--;
      }
    }

    this.updateBuffers();
  }

  private updateBuffers() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.particles.subarray(0, this.particleCount * 2),
      this.gl.DYNAMIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.colors.subarray(0, this.particleCount * 4),
      this.gl.DYNAMIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.sizes.subarray(0, this.particleCount),
      this.gl.DYNAMIC_DRAW
    );
  }

  public render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    const positionLoc = this.gl.getAttribLocation(this.program, "position");
    const colorLoc = this.gl.getAttribLocation(this.program, "color");
    const sizeLoc = this.gl.getAttribLocation(this.program, "size");

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(positionLoc);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.vertexAttribPointer(colorLoc, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(colorLoc);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
    this.gl.vertexAttribPointer(sizeLoc, 1, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(sizeLoc);

    this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
  }
}
const ATTACK_DAMAGE = {
  NORMAL: 500,
  FEATHER_FURY: 750,
  CLUCKINATOR: 900,
};

// const GAME_WIDTH = 800;
// const GAME_HEIGHT = 600;
const PLAYER_SIZE = 40;
const BASE_ENEMY_SIZE = 30;
const BASE_PLAYER_SPEED = 4;
const BASE_ENEMY_SPEED = 1;
const ROTATION_SPEED = 0.2;

const POWER_UPS = {
  FEATHER_FURY: {
    name: "Feather Fury",
    duration: 5000,
    color: "yellow",
    cost: 50,
  },
  YOLK_SHIELD: {
    name: "Yolk Shield",
    duration: 8000,
    color: "orange",
    cost: 75,
  },
  CLUCKINATOR: {
    name: "Cluckinator",
    duration: 10000,
    color: "red",
    cost: 100,
  },
};
const BASE_PLAYER_STATS: PlayerStats = {
  attackDamage: ATTACK_DAMAGE.NORMAL,
  moveSpeed: BASE_PLAYER_SPEED,
  projectileSpeed: 14,
  projectileSize: 7,
  attackRange: 100,
};
const ATTACK_RANGE = {
  NORMAL: 100,
  CLUCKINATOR: 160,
};
// type PlayerStats = {
//   attackDamage: number;
//   moveSpeed: number;
//   projectileSpeed: number;
//   projectileSize: number;
//   attackRange: number;
// };
// type BossType = "LaserChicken" | "EggThrower" | "FeatherStorm";

// Define the player stats type
interface PlayerStats {
  attackDamage: number;
  moveSpeed: number;
  projectileSpeed: number;
  projectileSize: number;
  attackRange: number;
}

// Define the game state type
// interface GameState {
//   score: number;
//   wave: number;
//   hearts: number;
//   gameOver: boolean;
//   combo: number;
//   stars: number;
//   coins: number;
// }
interface Obstacle {
  id: number;
  position: { x: number; y: number };
  size: number;
  type: "Rock" | "Asteroid";
  rotation: number; // Add this line
}

type AttackType = "NORMAL" | "FEATHER_FURY" | "CLUCKINATOR";

type Enemy = {
  id: number;
  type: string;
  health: number;
  maxHealth: number;
  position: { x: number; y: number };
  speed: number;
  size: number;
  image: string;
};

type PowerUp = {
  id: number;
  type: "HEART" | "STAR" | "COINS";
  position: { x: number; y: number };
};

type ActivePowerUp = {
  id: number;
  type: "FEATHER_FURY" | "YOLK_SHIELD" | "CLUCKINATOR";
  duration: number;
  endTime: number;
};

type Particle = {
  id: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  color: string;
  size: number;
  createdAt: number;
  lifetime: number;
};

type Projectile = {
  id: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: number;
  source: "player" | "boss"; // Add this to track who fired the projectile
};
interface Position {
  x: number;
  y: number;
}
const tips = [
  { messege: "Confused?! Press T to view the tutorial guide.", icon: "📖" },
  {
    messege: "Don't forget to dodge! Use obstacles to hide from projectiles.",
    icon: "🥷",
  },
  {
    messege: "Feeling lost? Just follow the cluck of the Cosmic Chicken!",
    icon: "👑",
  },
  {
    messege: "Pro tip: Enemies hate it when you hit them with Projectiles!",
    icon: "🎯",
  },
  { messege: "Keep going, champion! The chicken believes in you.", icon: "📣" },
  {
    messege:
      "You can always take a break... just kidding, the enemies won't stop!",
    icon: "😈",
  },
  {
    messege: "Why did the chicken cross the Cosmic Arena? To watch you fight!",
    icon: "🛣️",
  },
  {
    messege: "Just a headsup, Using shield will not save ypu from projectiles",
    icon: "🛡️",
  },
  { messege: "Press 1, 2, 3 or Q, F, R keys for special powers", icon: "🦹‍♀️" },
  { messege: "Press O to open sound settings ", icon: "🔊" },
  { messege: "Press M to toggle Mute  ", icon: "🔇" },
];
// const BASE_PROJECTILE_DAMAGE = 200;

export default function CosmicChickenRhapsody() {
  // Fetch coins from localStorage on component mount

  // localStorage.setItem("ATTACKDAMAGE", JSON.stringify(ATTACK_DAMAGE.NORMAL));
  // localStorage.setItem("PLAYERSPEED", JSON.stringify(BASE_PLAYER_SPEED));

  const [playerStats, setPlayerStats] =
    useState<PlayerStats>(BASE_PLAYER_STATS);
  const [projectileReloadTime, setProjectileReloadTime] = useState(100);
  // const [playerStats, setPlayerStats] =
  useState<PlayerStats>(BASE_PLAYER_STATS);
  const [activeBoss, setActiveBoss] = useState<Enemy | null>(null);
  // const [coins, setCoins] = useState<Coin[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [projectileDamage, setProjectileDamage] = useState(
    ATTACK_DAMAGE.NORMAL
  );

  const [canShootProjectile, setCanShootProjectile] = useState(true);
  const [projectileReloadProgress, setProjectileReloadProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  // const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [highScore, setHighScore] = useState(0); // Initialize with default value
  const [tutorialShown, setTutorialShown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const gameAreaRef = useRef<HTMLDivElement>(null);
  const [attackType, setAttackType] = useState<AttackType>("NORMAL");
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  // const containerRef = useRef<HTMLDivElement>(null);
  const [powerUpEffects, setPowerUpEffects] = useState<
    Array<{
      id: number;
      position: { x: number; y: number };
      type: "HEART" | "STAR" | "COINS";
    }>
  >([]);

  useEffect(() => {
    // Read values from localStorage only on client-side
    const savedHighScore = parseInt(
      localStorage.getItem("highScore") || "0",
      10
    );
    const savedTutorialShown = localStorage.getItem("tutorialShown") === "true";

    setHighScore(savedHighScore);
    setTutorialShown(savedTutorialShown);
  }, []);
  // const [bosses, setBosses] = useState<Boss[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  // const [terrain, setTerrain] = useState<TerrainChunk[]>([]);

  // Function to generate obstacles

  // ... (previous imports and type definitions)

  // export default function CosmicChickenRhapsody() {
  // ... (previous state definitions)

  const calculateAvoidanceVector = useCallback(
    (enemyPos: Position, obstaclePos: Position, obstacleSize: number) => {
      const dx = enemyPos.x - obstaclePos.x;
      const dy = enemyPos.y - obstaclePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const avoidanceRadius = obstacleSize + 75; // Extra buffer for smoother avoidance

      if (distance < avoidanceRadius) {
        const avoidanceStrength =
          (avoidanceRadius - distance) / avoidanceRadius;
        return {
          x: (dx / distance) * avoidanceStrength,
          y: (dy / distance) * avoidanceStrength,
        };
      }
      return { x: 0, y: 0 };
    },
    []
  );
  const UPGRADE_INCREMENT = 1.2; // or whatever value you want
  // eslint-disable-next-line
  const onUpgrade = (stat: keyof PlayerStats, cost: number) => {
    setGameState((prevState) => ({
      ...prevState,
      coins: prevState.coins - cost,
    }));

    setPlayerStats((prevStats) => ({
      ...prevStats,
      [stat]: prevStats[stat] * UPGRADE_INCREMENT,
    }));
  };
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const getGameDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      return {
        width: clientWidth * 0.96, // 90% of container width
        height: clientHeight * 0.9, // 90% of container height
      };
    }
    return { width: 800, height: 600 }; // Fallback dimensions
  }, []);
  const findClosestEnemy = useCallback(
    (playerPosition: { x: number; y: number }, enemies: Enemy[]) => {
      return enemies.reduce(
        (closest, enemy) => {
          const dx = enemy.position.x - playerPosition.x;
          const dy = enemy.position.y - playerPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < closest.distance) {
            return { enemy, distance };
          }
          return closest;
        },
        { enemy: null, distance: Infinity } as {
          enemy: Enemy | null;
          distance: number;
        }
      );
    },
    []
  );

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      const resizeCanvas = () => {
        // Set canvas size based on the container's dimensions
        const clientWidth = container.clientWidth * 0.9; // 90% of container's width
        const clientHeight = container.clientHeight * 0.95; // 95% of container's height
        canvas.width = clientWidth;
        canvas.height = clientHeight;

        if (particleSystemRef.current) {
          // Update WebGL viewport to match new canvas size
          particleSystemRef.current.gl.viewport(
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      };

      // Initial canvas setup
      resizeCanvas();
      particleSystemRef.current = new ParticleSystem(canvas);

      // Add event listener to resize the canvas when the window is resized
      window.addEventListener("resize", resizeCanvas);

      let animationFrameId: number;

      const animate = () => {
        if (particleSystemRef.current) {
          particleSystemRef.current.update();
          particleSystemRef.current.render();
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, []);

  // Use the function to get current game dimensions
  const gameDimensions = getGameDimensions();
  const updatePlayerStats = (wave: number) => {
    if (wave % 2 === 0) {
      // Every 2 waves
      setPlayerStats((prev) => ({
        attackDamage: prev.attackDamage * 1.15, // 15% increase
        moveSpeed: prev.moveSpeed * 1.08, // 8% increase
        projectileSpeed: prev.projectileSpeed * 1.1, // 10% increase
        projectileSize: Math.min(prev.projectileSize * 1.05, 15), // 5% increase, max size 15
        attackRange: Math.min(prev.attackRange * 1.05, 150), // 5% increase, max range 150
      }));

      // Decrease reload time by 5%, with a minimum of 50 (2.5 seconds)
      setProjectileReloadTime((prev) => Math.max(Math.floor(prev * 0.95), 50));
    }
  };
  // Update game dimensions when the window resizes
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render to update game dimensions
      setGameState((prevState) => ({ ...prevState }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const GAME_WIDTH = gameDimensions.width;
  const GAME_HEIGHT = gameDimensions.height;
  const [gameState, setGameState] = useState({
    score: 0,
    wave: 0,
    hearts: 3,
    gameOver: false,
    combo: 1,
    stars: 0,
    coins: 0, // Add this line
  });

  const [playerState, setPlayerState] = useState({
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
    rotation: 0,
    velocity: { x: 0, y: 0 },
  });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  // const [lastMessage, setLastMessage] = useState(
  //   "Welcome to the Cosmic Arena!"
  // );
  const [isAttacking, setIsAttacking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [attackPointer, setAttackPointer] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchStartPos = useRef<{ [id: number]: { x: number; y: number } }>({});

  const [canAttack, setCanAttack] = useState(true);
  const [attackCooldown, setAttackCooldown] = useState(0);
  const ATTACK_COOLDOWN = 250; // 500ms cooldown between attacks
  // const [isPaused, setIsPaused] = useState(false);

  const createParticles = useCallback(
    (
      x: number,
      y: number,
      color: string,
      count: number,
      speed: number = 1,
      spread: number = Math.PI * 0.5,
      direction: number = 0
    ) => {
      if (particleSystemRef.current && canvasRef.current) {
        switch (color) {
          case "red":
            if (soundManager) soundManager.playSound("explosion");
            break;

          case "orange":
            if (soundManager) soundManager.playSound("hit");
            break;

          case "yellow":
            if (soundManager) soundManager.playSound("shoot");
            break;

          case "blue":
            if (soundManager) soundManager.playSound("powerup");
            break;

          case "gray":
            if (soundManager) soundManager.playSound("hit");
            break;
        }

        // Create temporary canvas for color conversion
        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d")!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const rgb = Array.from(
          ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)
        ).map((v) => v / 255);

        // Get canvas dimensions and position
        const canvasRect = canvasRef.current.getBoundingClientRect();

        // Convert screen coordinates to canvas coordinates
        const canvasX =
          ((x - canvasRect.left) / canvasRect.width) * canvasRef.current.width;
        const canvasY =
          ((y - canvasRect.top) / canvasRect.height) * canvasRef.current.height;

        particleSystemRef.current.addParticles(
          canvasX,
          canvasY,
          count,
          rgb as [number, number, number],
          speed,
          spread,
          direction
        );
      }
    },
    [particleSystemRef]
  );
  const generateObstacles = (count: number): Obstacle[] => {
    const obstacles: Obstacle[] = [];
    const obstacleTypes = ["Rock", "Asteroid"];
    for (let i = 0; i < count; i++) {
      obstacles.push({
        id: Date.now() + i,
        position: {
          x: Math.random() * GAME_WIDTH,
          y: Math.random() * GAME_HEIGHT,
        },
        size: 30 + Math.random() * 50,
        type: obstacleTypes[
          Math.floor(Math.random() * obstacleTypes.length)
        ] as Obstacle["type"],
        rotation: Math.random() * Math.PI * 5, // Random rotation between 0 and 2π
      });
    }
    return obstacles;
  };
  const AttackIndicator = ({ type }: { type: AttackType }) => {
    const colors = {
      NORMAL: "bg-blue-500/50",
      FEATHER_FURY: "bg-yellow-500/50",
      CLUCKINATOR: "bg-red-500/50",
    };

    return (
      <div
        className={`absolute bottom-32 left-4 px-3 py-1 rounded-full text-white ${colors[type]}`}
      >
        {type === "NORMAL" ? "Normal Attack" : type.replace("_", " ")}
      </div>
    );
  };
  const getAttackDamage = (baseAttackDamage: number, wave: number) => {
    return Math.round(baseAttackDamage * Math.pow(1.12, wave));
  };
  const attack = useCallback(() => {
    if (gameState.gameOver || !canAttack) return;

    const currentAttackType = activePowerUps.some(
      (p) => p.type === "FEATHER_FURY"
    )
      ? "FEATHER_FURY"
      : activePowerUps.some((p) => p.type === "CLUCKINATOR")
      ? "CLUCKINATOR"
      : "NORMAL";

    const baseAttackDamage = activePowerUps.some(
      (p) => p.type === "CLUCKINATOR"
    )
      ? playerStats.attackDamage * 1.5
      : playerStats.attackDamage;

    const attackRange =
      ATTACK_RANGE[
        currentAttackType === "CLUCKINATOR" ? "CLUCKINATOR" : "NORMAL"
      ];

    setAttackType(currentAttackType);
    setCanAttack(false);
    setIsAttacking(true);
    setAttackCooldown(ATTACK_COOLDOWN);

    setTimeout(() => {
      setIsAttacking(false);
    }, 200);

    const scaledDamage = getAttackDamage(baseAttackDamage, gameState.wave);

    setEnemies((prev) => {
      return prev
        .map((enemy) => {
          const dx = enemy.position.x - playerState.position.x;
          const dy = enemy.position.y - playerState.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= attackRange) {
            const newHealth = Math.max(0, enemy.health - scaledDamage);
            if (newHealth === 0) {
              createParticles(
                enemy.position.x,
                enemy.position.y,
                "rgba(255, 0, 0, 0.8)",
                20,
                Math.PI / 1,
                7
              );
              if (soundManager) {
                soundManager.playSound("explosion");
              }
              setGameState((prevState) => ({
                ...prevState,
                score: prevState.score + 100 * prevState.combo,
                stars: prevState.stars + 1,
                combo: prevState.combo + 0.1,
              }));
              return null; // Remove the enemy
            }
            // Add hit particles
            createParticles(
              enemy.position.x,
              enemy.position.y,
              "orange",
              30,
              Math.PI / 1,
              7
            );
            return { ...enemy, health: newHealth };
          }
          return enemy;
        })
        .filter(Boolean) as Enemy[];
    });
  }, [
    gameState.gameOver,
    gameState.wave,
    canAttack,
    playerState.position,
    activePowerUps,
    createParticles,
    ATTACK_RANGE,
    playerStats.attackDamage,
    ATTACK_RANGE,
    getAttackDamage,
  ]);

  // ...

  const shootProjectile = useCallback(() => {
    if (canShootProjectile && enemies.length > 0) {
      const closestEnemy = findClosestEnemy(playerState.position, enemies);

      if (closestEnemy.enemy) {
        const dx = closestEnemy.enemy.position.x - playerState.position.x;
        const dy = closestEnemy.enemy.position.y - playerState.position.y;
        const angle = Math.atan2(dy, dx);
        // const speed = 14;

        const projectileSpeed = activePowerUps.some(
          (p) => p.type === "FEATHER_FURY"
        )
          ? playerStats.projectileSpeed * 1.5
          : playerStats.projectileSpeed;

        const newProjectile: Projectile = {
          id: Date.now(),
          position: { ...playerState.position },
          velocity: {
            x: Math.cos(angle) * projectileSpeed,
            y: Math.sin(angle) * projectileSpeed,
          },
          size: playerStats.projectileSize,
          source: "player",
        };

        setPlayerState((prev) => ({
          ...prev,
          rotation: angle,
        }));
        setProjectiles((prev) => [...prev, newProjectile]);
        setCanShootProjectile(false);
        setProjectileReloadProgress(0);
        setIsInvulnerable(true);
        setTimeout(() => setIsInvulnerable(false), 1000);
        createParticles(
          playerState.position.x,
          playerState.position.y,
          "yellow",
          5,
          2
        );
      }
    }
  }, [
    canShootProjectile,
    enemies,
    playerState.position,
    activePowerUps,
    findClosestEnemy,
    createParticles,
    playerStats.projectileSpeed, // Add playerStats.projectileSpeed to the dependency array
    playerStats.projectileSize, // Add playerStats.projectileSize to the dependency array
  ]);

  useEffect(() => {
    if (!canShootProjectile) {
      const reloadInterval = setInterval(() => {
        setProjectileReloadProgress((prev) => {
          if (prev >= projectileReloadTime) {
            clearInterval(reloadInterval);
            setCanShootProjectile(true);
            return projectileReloadTime;
          }
          return prev + 1;
        });
      }, 50); // Update every 50ms for smooth progress

      return () => clearInterval(reloadInterval);
    }
  }, [canShootProjectile, projectileReloadTime]);
  // const [bossActive, setBossActive] = useState(false);
  const activateSpecialPower = useCallback(
    (powerNumber: number) => {
      const powerUpTypes = [
        "FEATHER_FURY",
        "YOLK_SHIELD",
        "CLUCKINATOR",
      ] as const;
      if (powerNumber >= 1 && powerNumber <= 3) {
        const powerType = powerUpTypes[powerNumber - 1];
        const powerUpConfig = POWER_UPS[powerType];

        if (gameState.stars >= powerUpConfig.cost) {
          setActivePowerUps((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: powerType,
              duration: powerUpConfig.duration,
              endTime: Date.now() + powerUpConfig.duration,
            },
          ]);
          setGameState((prev) => ({
            ...prev,
            stars: prev.stars - powerUpConfig.cost,
          }));
          // setLastMessage(`Activated ${powerUpConfig.name}!`);
          createParticles(
            playerState.position.x,
            playerState.position.y,
            powerUpConfig.color,
            20
          );
        }
      }
    },
    [gameState.stars, playerState.position, createParticles]
  );

  const [waveAnnouncement, setWaveAnnouncement] = useState("");
  // const [isPaused, setIsPaused] = useState(false);
  const spawnPowerUp = useCallback(() => {
    const powerUpTypes = ["HEART", "STAR", "COINS"] as const;
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    const powerUp: PowerUp = {
      id: Date.now(),
      type,
      position: {
        x: Math.random() * (GAME_WIDTH - 40) + 20,
        y: Math.random() * (GAME_HEIGHT - 40) + 20,
      },
    };

    setPowerUps((prev) => [...prev, powerUp]);
  }, [GAME_HEIGHT, GAME_WIDTH]);
  const spawnWave = useCallback(() => {
    // Limit maximum enemies to 12
    const numEnemies = Math.min(3 + Math.floor(gameState.wave / 3), 12);
    const newEnemies: Enemy[] = [];

    const shouldSpawnBoss =
      gameState.wave > 0 && gameState.wave % 5 === 0 && !activeBoss;

    // Limit maximum obstacles to 10
    const maxObstacles = 16;
    if (gameState.wave % 3 === 0 && obstacles.length < maxObstacles) {
      const numNewObstacles = Math.min(3, maxObstacles - obstacles.length);
      const newObstacles = generateObstacles(numNewObstacles);
      setObstacles((prev) => [...prev, ...newObstacles]);
    }
    function getRandomInt(min: number, max: number): number {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const randomInt = getRandomInt(1, 5);
    if (gameState.wave % randomInt === 0 && gameState.wave !== 1) {
      // Randomly select a tip
      const randomTip = tips[Math.floor(Math.random() * tips.length)];

      // Display the toast notification
      toast(randomTip.messege, {
        style: {
          fontFamily: "monospace",
          background: "#000000", // Dark background for toast
          color: "#ffff00", // Text color
          borderRadius: "8px",
          border: "1px solid #e7ce5a", // Border
          padding: "12px",
        },
        icon: randomTip.icon, // Optional icon
      });
    }

    // Limit for stats increase
    const MAX_WAVE_MULTIPLIER = 5; // Maximum multiplier for enemy stats
    const MAX_HEALTH = 15000; // Maximum health value
    const MAX_SPEED = BASE_ENEMY_SPEED + 2.0; // Maximum speed value
    const MAX_SIZE = BASE_ENEMY_SIZE + 5.0; // Maximum size value

    // Calculate wave multiplier with an upper limit
    const waveMultiplier = Math.min(
      1 + gameState.wave * 0.03,
      MAX_WAVE_MULTIPLIER
    );

    // Calculate health, speed, and size with limits
    const baseHealth = Math.min(750 + gameState.wave * 150, MAX_HEALTH);
    const baseSpeed = Math.min(
      BASE_ENEMY_SPEED + gameState.wave * 0.04,
      MAX_SPEED
    );
    const baseSize = Math.min(BASE_ENEMY_SIZE + gameState.wave * 0.3, MAX_SIZE);

    for (let i = 0; i < numEnemies; i++) {
      let x, y;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -30 : GAME_WIDTH + 30;
        y = Math.random() * GAME_HEIGHT;
      } else {
        x = Math.random() * GAME_WIDTH;
        y = Math.random() < 0.5 ? -30 : GAME_HEIGHT + 30;
      }

      newEnemies.push({
        id: Date.now() + i,
        type: ["Eggbot", "BroccoliBeast", "SpaceMime"][
          Math.floor(Math.random() * 3)
        ],
        health: baseHealth * waveMultiplier,
        maxHealth: baseHealth * waveMultiplier,
        position: { x, y },
        speed: baseSpeed * waveMultiplier,
        size: baseSize * waveMultiplier,
        image: "/images/enemy.png",
      });
    }

    if (shouldSpawnBoss) {
      const bossHealth = 10000 + gameState.wave * 750;
      const bossType =
        gameState.wave % 15 === 0
          ? "Boss3"
          : gameState.wave % 10 === 0
          ? "Boss2"
          : "Boss";

      const newBoss: Enemy = {
        id: Date.now() + numEnemies,
        type: bossType,
        health: bossHealth,
        maxHealth: bossHealth,
        position: { x: GAME_WIDTH / 2, y: -50 },
        speed: BASE_ENEMY_SPEED * 0.7,
        size: BASE_ENEMY_SIZE * 3,
        image: `/images/${bossType}.png`,
      };
      newEnemies.push(newBoss);
      setActiveBoss(newBoss);
    }

    updatePlayerStats(gameState.wave + 1);
    setWaveAnnouncement(`Wave ${gameState.wave + 1}`);
    setTimeout(() => setWaveAnnouncement(""), 3000);
    setProjectileDamage((prevDamage) => Math.round(prevDamage * 1.15));
    setEnemies((prev) => [...prev, ...newEnemies]);
    setGameState((prev) => ({ ...prev, wave: prev.wave + 1 }));
    spawnPowerUp();
  }, [
    gameState.wave,
    spawnPowerUp,
    GAME_HEIGHT,
    updatePlayerStats,
    GAME_WIDTH,
    obstacles.length,
    generateObstacles,
    activeBoss,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPowerUpEffects((prev) =>
        prev.filter((effect) => Date.now() - effect.id < 1000)
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [powerUpEffects]);
  const PowerUpCollectionEffect = ({
    position,
    type,
  }: {
    position: { x: number; y: number };
    type: "HEART" | "STAR" | "COINS";
  }) => {
    return (
      <div
        className={`absolute text-2xl font-bold ${
          type === "HEART" ? "text-red-500" : "text-yellow-500"
        } animate-bounce`}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {type === "HEART" ? "+1 ❤️" : "+10 ⭐"}
      </div>
    );
  };
  const spawnBossProjectile = useCallback(
    (bossPosition: { x: number; y: number }, speed: number, size: number) => {
      const angle = Math.atan2(
        playerState.position.y - bossPosition.y,
        playerState.position.x - bossPosition.x
      );

      // Increase projectile size and damage, but reduce frequency
      const newProjectile: Projectile = {
        id: Date.now(),
        position: { ...bossPosition },
        velocity: {
          x: Math.cos(angle) * speed * 1.5, // Increased speed
          y: Math.sin(angle) * speed * 1.5,
        },
        size: size * 1.5, // Increased size
        source: "boss",
      };

      setProjectiles((prev) => [...prev].slice(-20)); // Limit max projectiles
      setProjectiles((prev) => [...prev, newProjectile]);
    },
    [playerState.position]
  );

  useEffect(() => {
    const handleRestart = (e: KeyboardEvent) => {
      if (e.key === "v" || (e.key === "V" && gameState.gameOver)) {
        restartGame();
      }
    };

    if (gameState.gameOver) {
      window.addEventListener("keydown", handleRestart);
    }

    // Cleanup listener on unmount or when the game is not over
    return () => {
      window.removeEventListener("keydown", handleRestart);
    };
  }, [gameState.gameOver]);
  // const [coins] = useState(0);

  // Define a reusable restart function
  const restartGame = useCallback(() => {
    const savedCoins = parseInt(localStorage.getItem("coins") || "0", 10);
    setGameState({
      score: 0,
      wave: 0,
      hearts: 3,
      gameOver: false,
      combo: 1,
      stars: 0,
      coins: savedCoins,
    });
    setEnemies([]);
    setPowerUps([]);
    setActiveBoss(null); // Add this line to reset the boss state

    setActivePowerUps([]);
    setPlayerState({
      position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
      rotation: 0,
      velocity: { x: 0, y: 0 },
    });
    setPlayerStats(BASE_PLAYER_STATS);
    setProjectileDamage(ATTACK_DAMAGE.NORMAL);
    setPlayerStats(BASE_PLAYER_STATS); // Reset player stats to base values
    setProjectileReloadTime(100); // Reset projectile reload time
    setGameStarted(true);
  }, [GAME_WIDTH, GAME_HEIGHT]);

  const updateBossBehavior = (boss: Enemy) => {
    const bossSpeed = boss.speed * 0.5;
    const dx = playerState.position.x - boss.position.x;
    const dy = playerState.position.y - boss.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const newX = boss.position.x + (dx / distance) * bossSpeed;
    const newY = boss.position.y + (dy / distance) * bossSpeed;

    // Reduced attack frequencies but increased projectile impact
    let attackChance = 0.01; // Reduced from 0.02
    let projectileSpeed = 4;
    let projectileSize = 15; // Increased size

    switch (boss.type) {
      case "Boss":
        attackChance = 0.01;
        break;
      case "Boss2":
        attackChance = 0.015;
        projectileSpeed = 5;
        projectileSize = 18;
        break;
      case "Boss3":
        attackChance = 0.02;
        projectileSpeed = 6;
        projectileSize = 20;
        break;
    }

    if (Math.random() < attackChance) {
      spawnBossProjectile(boss.position, projectileSpeed, projectileSize);
    }

    return { ...boss, position: { x: newX, y: newY } };
  };

  useEffect(() => {
    if (soundManager) {
      soundManager.loadSound("shoot", "/sounds/shoot.mp3");
      soundManager.loadSound("hit", "/sounds/hit.mp3");
      soundManager.loadSound("explosion", "/sounds/explosion.mp3");
      soundManager.loadSound("powerup", "/sounds/powerup.mp3");
      soundManager.loadSound("bgm", "/sounds/bgm.mp3");

      if (tutorialShown == true) {
        soundManager.playBGM("bgm");
      }
    }
  }, [tutorialShown]); // Dependency array ensures effect runs when `tutorialShown` changes

  useEffect(() => {
    if (gameState.gameOver || !gameStarted || isPaused) return;
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      localStorage.setItem("highScore", gameState.score.toString());
    }
    // const findClosestEnemy = () => {
    //   return enemies.reduce(
    //     (closest, enemy) => {
    //       const dx = enemy.position.x - playerState.position.x;
    //       const dy = enemy.position.y - playerState.position.y;
    //       const distance = Math.sqrt(dx * dx + dy * dy);
    //       if (distance < closest.distance) {
    //         return { enemy, distance };
    //       }
    //       return closest;
    //     },
    //     { enemy: null, distance: Infinity } as { enemy: Enemy | null; distance: number }
    //   );
    // };

    const movePlayer = () => {
      const moveSpeed = activePowerUps.some((p) => p.type === "FEATHER_FURY")
        ? playerStats.moveSpeed * 1.5
        : playerStats.moveSpeed;

      let dx = 0;
      let dy = 0;

      if (
        keysPressed.current.ArrowLeft ||
        keysPressed.current.a ||
        keysPressed.current.A
      )
        dx -= 1;
      if (
        keysPressed.current.ArrowRight ||
        keysPressed.current.d ||
        keysPressed.current.D
      )
        dx += 1;
      if (
        keysPressed.current.ArrowUp ||
        keysPressed.current.w ||
        keysPressed.current.W
      )
        dy -= 1;
      if (
        keysPressed.current.ArrowDown ||
        keysPressed.current.s ||
        keysPressed.current.S
      )
        dy += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx /= magnitude;
        dy /= magnitude;
      }

      setPlayerState((prev) => {
        const newX = Math.max(
          PLAYER_SIZE / 2,
          Math.min(
            GAME_WIDTH - PLAYER_SIZE / 2,
            prev.position.x + dx * moveSpeed
          )
        );
        const newY = Math.max(
          PLAYER_SIZE / 2,
          Math.min(
            GAME_HEIGHT - PLAYER_SIZE / 2,
            prev.position.y + dy * moveSpeed
          )
        );

        // Calculate new rotation based on movement direction
        let newRotation = prev.rotation;
        if (dx !== 0 || dy !== 0) {
          const targetRotation = Math.atan2(dy, dx);
          const rotationDiff = targetRotation - prev.rotation;
          newRotation +=
            Math.sign(rotationDiff) *
            Math.min(Math.abs(rotationDiff), ROTATION_SPEED);
        }

        return {
          ...prev,
          position: { x: newX, y: newY },
          rotation: newRotation,
        };
      });
    };

    const gameLoop = setInterval(() => {
      movePlayer();
      setParticles((prev) => prev.slice(-50));

      // Limit maximum projectiles
      setProjectiles((prev) => prev.slice(-20));
      if (attackCooldown > 0) {
        setAttackCooldown((prev) => {
          if (prev <= 16) {
            setCanAttack(true);
            return 0;
          }
          return prev - 16;
        });
      }
      setProjectiles((prev) =>
        prev
          .map((projectile) => ({
            ...projectile,
            position: {
              x: projectile.position.x + projectile.velocity.x,
              y: projectile.position.y + projectile.velocity.y,
            },
          }))
          .filter(
            (projectile) =>
              projectile.position.x > 0 &&
              projectile.position.x < GAME_WIDTH &&
              projectile.position.y > 0 &&
              projectile.position.y < GAME_HEIGHT
          )
      );

      // Check for projectile collisions with enemies
      // const hitProjectiles: number[] = [];
      setEnemies(
        (prevEnemies) =>
          prevEnemies
            .map((enemy) => {
              const hitByProjectile = projectiles.find((projectile) => {
                if (projectile.source === "boss") return false;
                const dx = projectile.position.x - enemy.position.x;
                const dy = projectile.position.y - enemy.position.y;
                return (
                  Math.sqrt(dx * dx + dy * dy) <
                  (enemy.size + projectile.size) / 2
                );
              });

              if (hitByProjectile) {
                const newHealth = enemy.health - projectileDamage;
                if (newHealth <= 0) {
                  createParticles(
                    enemy.position.x,
                    enemy.position.y,
                    "red",
                    20
                  );
                  if (soundManager) {
                    soundManager.playSound("explosion");
                  }
                  setGameState((prev) => ({
                    ...prev,
                    score:
                      prev.score + (enemy.type.startsWith("Boss") ? 1000 : 100),
                    stars: prev.stars + (enemy.type.startsWith("Boss") ? 5 : 1),
                  }));
                  if (enemy.type.startsWith("Boss")) {
                    setActiveBoss(null);
                  }
                  return null;
                }
                createParticles(
                  enemy.position.x,
                  enemy.position.y,
                  "orange",
                  10
                );
                return { ...enemy, health: newHealth };
              }
              return enemy;
            })
            .filter(Boolean) as Enemy[]
      );

      const playerHit = projectiles.some((projectile) => {
        if (projectile.source === "player") return false; // Player's own projectiles can't hurt them

        const dx = projectile.position.x - playerState.position.x;
        const dy = projectile.position.y - playerState.position.y;
        return (
          Math.sqrt(dx * dx + dy * dy) < (PLAYER_SIZE + projectile.size) / 2
        );
      });

      if (playerHit && !isInvulnerable) {
        setGameState((prev) => ({
          ...prev,
          hearts: prev.hearts - 1,
          gameOver: prev.hearts <= 1,
        }));
        createParticles(
          playerState.position.x,
          playerState.position.y,
          "red",
          20
        );
        setIsInvulnerable(true);
        setTimeout(() => setIsInvulnerable(false), 1000);
      }

      // Check for collisions with obstacles
      setPlayerState((prev) => {
        let newPosition = { ...prev.position };
        obstacles.forEach((obstacle) => {
          const dx = newPosition.x - obstacle.position.x;
          const dy = newPosition.y - obstacle.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < (PLAYER_SIZE + obstacle.size) / 2) {
            const angle = Math.atan2(dy, dx);
            newPosition = {
              x:
                obstacle.position.x +
                Math.cos(angle) * ((PLAYER_SIZE + obstacle.size) / 2),
              y:
                obstacle.position.y +
                Math.sin(angle) * ((PLAYER_SIZE + obstacle.size) / 2),
            };
          }
        });
        return { ...prev, position: newPosition };
      });

      // Handle enemy collisions
      setEnemies((prev) => {
        const hasYolkShield = activePowerUps.some(
          (p) => p.type === "YOLK_SHIELD"
        );

        prev.forEach((enemy) => {
          const dx = enemy.position.x - playerState.position.x;
          const dy = enemy.position.y - playerState.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < (PLAYER_SIZE + enemy.size) / 2 && !isInvulnerable) {
            if (!hasYolkShield) {
              setGameState((prevState) => ({
                ...prevState,
                hearts: prevState.hearts - 0.5,
                gameOver: prevState.hearts <= 1,
              }));
              createParticles(
                playerState.position.x,
                playerState.position.y,
                "red",
                20,
                4
              );
              setIsInvulnerable(true);
              setTimeout(() => setIsInvulnerable(false), 2000);
            } else {
              // Shield hit particles
              createParticles(
                playerState.position.x,
                playerState.position.y,
                "blue",
                15,
                3
              );
            }
          }
        });
        return prev;
      });

      setPowerUps((prev) => {
        const collected: PowerUp[] = [];
        const remaining = prev.filter((powerUp) => {
          const dx = powerUp.position.x - playerState.position.x;
          const dy = powerUp.position.y - playerState.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < (PLAYER_SIZE + 20) / 2) {
            collected.push(powerUp);
            return false;
          }
          return true;
        });

        collected.forEach((powerUp) => {
          if (powerUp.type === "HEART") {
            setGameState((prev) => ({
              ...prev,
              hearts: Math.min(prev.hearts + 1, 10),
            }));
            createParticles(powerUp.position.x, powerUp.position.y, "red", 10);
          } else if (powerUp.type === "STAR") {
            setGameState((prev) => ({
              ...prev,
              stars: prev.stars + 10,
            }));
            createParticles(
              powerUp.position.x,
              powerUp.position.y,
              "yellow",
              10
            );
          } else if (powerUp.type === "COINS") {
            setGameState((prev) => {
              const newCoins = prev.coins + 10;
              localStorage.setItem("coins", newCoins.toString());
              return {
                ...prev,
                coins: newCoins,
              };
            });
            createParticles(powerUp.position.x, powerUp.position.y, "gold", 10);
          }
          setPowerUpEffects((prev) => [
            ...prev,
            {
              id: Date.now(),
              position: powerUp.position,
              type: powerUp.type,
            },
          ]);
        });

        return remaining;
      });

      setActivePowerUps((prev) =>
        prev.filter((powerUp) => Date.now() < powerUp.endTime)
      );

      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            position: {
              x: particle.position.x + particle.velocity.x,
              y: particle.position.y + particle.velocity.y,
            },
          }))
          .filter((particle) => Date.now() - particle.createdAt < 1000)
      );

      if ((keysPressed.current[" "] || keysPressed.current.e) && canAttack) {
        attack();
      }

      const ATTACK_RANGE = activePowerUps.some((p) => p.type === "CLUCKINATOR")
        ? 160
        : 100;

      const findClosestEnemy = () => {
        return enemies.reduce(
          (closest, enemy) => {
            const dx = enemy.position.x - playerState.position.x;
            const dy = enemy.position.y - playerState.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closest.distance && distance <= ATTACK_RANGE) {
              return { enemy, distance };
            }
            return closest;
          },
          { enemy: null, distance: Infinity } as {
            enemy: Enemy | null;
            distance: number;
          }
        );
      };

      const closestEnemy = findClosestEnemy();
      if (closestEnemy.enemy) {
        const dx = closestEnemy.enemy.position.x - playerState.position.x;
        const dy = closestEnemy.enemy.position.y - playerState.position.y;
        const newRotation = Math.atan2(dy, dx);
        setPlayerState((prev) => ({
          ...prev,
          rotation: newRotation,
        }));
      }
      setEnemies((prev) =>
        prev.map((enemy) => {
          if (enemy.type.startsWith("Boss")) {
            return updateBossBehavior(enemy);
          }
          // Existing logic for regular enemies
          const dx = playerState.position.x - enemy.position.x;
          const dy = playerState.position.y - enemy.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let normalizedDx = dx / distance;
          let normalizedDy = dy / distance;

          // Calculate avoidance vectors for all obstacles
          const avoidanceVector = obstacles.reduce(
            (acc, obstacle) => {
              const avoidance = calculateAvoidanceVector(
                enemy.position,
                obstacle.position,
                obstacle.size
              );
              return { x: acc.x + avoidance.x, y: acc.y + avoidance.y };
            },
            { x: 0, y: 0 }
          );

          // Apply avoidance to movement direction
          normalizedDx += avoidanceVector.x;
          normalizedDy += avoidanceVector.y;

          // Normalize the final movement vector
          const magnitude = Math.sqrt(
            normalizedDx * normalizedDx + normalizedDy * normalizedDy
          );
          normalizedDx /= magnitude;
          normalizedDy /= magnitude;

          const newX = enemy.position.x + normalizedDx * enemy.speed;
          const newY = enemy.position.y + normalizedDy * enemy.speed;

          return {
            ...enemy,
            position: { x: newX, y: newY },
          };
        })
      );
      if (!isPaused) {
        setEnemies((prev) =>
          prev.map((enemy) => {
            const dx = playerState.position.x - enemy.position.x;
            const dy = playerState.position.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let normalizedDx = dx / distance;
            let normalizedDy = dy / distance;

            // Calculate avoidance vectors for all obstacles
            const avoidanceVector = obstacles.reduce(
              (acc, obstacle) => {
                const avoidance = calculateAvoidanceVector(
                  enemy.position,
                  obstacle.position,
                  obstacle.size
                );
                return { x: acc.x + avoidance.x, y: acc.y + avoidance.y };
              },
              { x: 0, y: 0 }
            );

            // Apply avoidance to movement direction
            normalizedDx += avoidanceVector.x;
            normalizedDy += avoidanceVector.y;

            // Normalize the final movement vector
            const magnitude = Math.sqrt(
              normalizedDx * normalizedDx + normalizedDy * normalizedDy
            );
            normalizedDx /= magnitude;
            normalizedDy /= magnitude;

            const newX = enemy.position.x + normalizedDx * enemy.speed;
            const newY = enemy.position.y + normalizedDy * enemy.speed;

            return {
              ...enemy,
              position: { x: newX, y: newY },
            };
          })
        );
      }
      setProjectiles((prev) =>
        prev.filter((projectile) => {
          // Check if projectile is within game bounds
          if (
            projectile.position.x < 0 ||
            projectile.position.x > GAME_WIDTH ||
            projectile.position.y < 0 ||
            projectile.position.y > GAME_HEIGHT
          ) {
            return false;
          }

          // Check collision with obstacles
          const hitObstacle = obstacles.some((obstacle) => {
            const dx = projectile.position.x - obstacle.position.x;
            const dy = projectile.position.y - obstacle.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (obstacle.size + projectile.size) / 2;
          });

          if (hitObstacle) {
            createParticles(
              projectile.position.x,
              projectile.position.y,
              "gray",
              5,
              2
            );
            return false;
          }

          // Check collision with player
          const playerDx = projectile.position.x - playerState.position.x;
          const playerDy = projectile.position.y - playerState.position.y;
          const playerDistance = Math.sqrt(
            playerDx * playerDx + playerDy * playerDy
          );

          if (
            playerDistance < (PLAYER_SIZE + projectile.size) / 2 &&
            !isInvulnerable
          ) {
            setGameState((prev) => ({
              ...prev,
              hearts: prev.hearts - 1,
              gameOver: prev.hearts <= 1,
            }));
            createParticles(
              playerState.position.x,
              playerState.position.y,
              "red",
              20,
              4
            );
            setIsInvulnerable(true);
            setTimeout(() => setIsInvulnerable(false), 2000);
            return false;
          }

          return true;
        })
      );
      enemies.forEach((enemy) => {
        if (enemy.type === "Boss" && Math.random() < 0.02) {
          // 2% chance to shoot each frame
          spawnBossProjectile(enemy.position, 3, 10);
        }
        if (enemy.type === "Boss2" && Math.random() < 0.08) {
          // 8% chance to shoot each frame
          spawnBossProjectile(enemy.position, 4, 10);
        }
        if (enemy.type === "Boss3" && Math.random() < 0.1) {
          // 10% chance to shoot each frame
          spawnBossProjectile(enemy.position, 5, 12);
        }
      });
      if (!isInvulnerable) {
        const playerHit = projectiles.some((projectile) => {
          const dx = projectile.position.x - playerState.position.x;
          const dy = projectile.position.y - playerState.position.y;
          return (
            Math.sqrt(dx * dx + dy * dy) < (PLAYER_SIZE + projectile.size) / 2
          );
        });

        if (playerHit) {
          setGameState((prev) => ({
            ...prev,
            hearts: prev.hearts - 1,
            gameOver: prev.hearts <= 1,
          }));
          createParticles(
            playerState.position.x,
            playerState.position.y,
            "red",
            20
          );
          setIsInvulnerable(true);
          setTimeout(() => setIsInvulnerable(false), 1000);
        }
      }
      if (closestEnemy.enemy) {
        setAttackPointer(closestEnemy.enemy.position);
      } else {
        setAttackPointer(null);
      }
      setProjectiles((prev) =>
        prev.filter((projectile) => {
          // Check if projectile is within game bounds
          if (
            projectile.position.x < 0 ||
            projectile.position.x > GAME_WIDTH ||
            projectile.position.y < 0 ||
            projectile.position.y > GAME_HEIGHT
          ) {
            return false;
          }

          // Check collision with obstacles
          const hitObstacle = obstacles.some((obstacle) => {
            const dx = projectile.position.x - obstacle.position.x;
            const dy = projectile.position.y - obstacle.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (obstacle.size + projectile.size) / 2;
          });

          if (hitObstacle) {
            createParticles(
              projectile.position.x,
              projectile.position.y,
              "gray",
              5,
              2
            );
            return false;
          }

          return true;
        })
      );
    }, 16);

    return () => clearInterval(gameLoop);
  }, [
    gameState.gameOver,
    isPaused,
    updateBossBehavior,
    playerStats.moveSpeed,
    // bossAttackPatterns,
    activePowerUps,
    projectiles,
    obstacles,
    calculateAvoidanceVector,
    spawnBossProjectile,
    playerState.position,
    isInvulnerable,
    gameState.score,
    highScore,
    createParticles,
    projectileDamage, // Add projectileDamage to the dependency array

    enemies,
    attack,
    GAME_WIDTH,
    GAME_HEIGHT,
    gameStarted,
    canAttack,
    attackCooldown,
  ]);

  // const [isPaused, setIsPaused] = useState(false);
  const startGame = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem("tutorialShown", "true");
    setTutorialShown(true);

    // if (soundManager !== null) {
    //   soundManager.playBGM("bgm");
    // }
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === "1" || e.key === "q" || e.key === "Q")
        activateSpecialPower(1);
      if (e.key === "2" || e.key === "f" || e.key === "F")
        activateSpecialPower(2);
      if (e.key === "3" || e.key === "r" || e.key === "R")
        activateSpecialPower(3);
      // if (e.key === "p" || e.key === "P") setIsPaused((prev) => !prev);
      if (e.key === "p" || e.key === "P") {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.gameOver, activateSpecialPower]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;
      keysPressed.current[e.key] = true;
      if (!gameStarted && e.key === " ") {
        setGameStarted(true);
      }
      if (e.key === "Shift" || e.key === "x" || e.key === "X") {
        shootProjectile();
      }
      if (e.key === "T" || e.key === "t") {
        setTutorialShown(false);
      }
      if (e.key === "1" || e.key === "q") activateSpecialPower(1);
      if (e.key === "2" || e.key === "f") activateSpecialPower(2);
      if (e.key === "3" || e.key === "r") activateSpecialPower(3);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.gameOver, activateSpecialPower, gameStarted, shootProjectile]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        touchStartPos.current[touch.identifier] = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const startPos = touchStartPos.current[touch.identifier];
        if (startPos) {
          const dx = touch.clientX - startPos.x;
          const dy = touch.clientY - startPos.y;
          setPlayerState((prev) => {
            const newX = Math.max(
              PLAYER_SIZE / 2,
              Math.min(GAME_WIDTH - PLAYER_SIZE / 2, prev.position.x + dx)
            );
            const newY = Math.max(
              PLAYER_SIZE / 2,
              Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, prev.position.y + dy)
            );
            return {
              ...prev,
              position: { x: newX, y: newY },
              rotation: Math.atan2(dy, dx),
            };
          });
          touchStartPos.current[touch.identifier] = {
            x: touch.clientX,
            y: touch.clientY,
          };
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        delete touchStartPos.current[e.changedTouches[i].identifier];
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [GAME_HEIGHT, GAME_WIDTH]);

  useEffect(() => {
    if (enemies.length === 0 && !gameState.gameOver) {
      spawnWave();
    }
  }, [enemies.length, gameState.gameOver, spawnWave]);

  return (
    <div className="flex items-center h-screen w-[100vh] md:w-screen justify-center min-h-screen overflow-hidden bg-black">
      {/* <GameTutorial onClose={} /> */}
      <div
        ref={containerRef}
        className="flex justify-center flex-col items-center w-[100vw] h-full bg-gray-900 overflow-hidden rounded-lg"
      >
        <canvas
          ref={canvasRef}
          className="absolute left-0 overflow-hidden pointer-events-none"
          style={{ zIndex: 1 }}
        />
        <div
          ref={gameAreaRef}
          className="flex bg-gray-900 overflow-hidden rounded-lg"
          style={{
            width: `${gameDimensions.width}px`,
            height: `${gameDimensions.height}px`,
          }}
        >
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white">
            <div className="flex flex-row items-start z-50 gap-4">
              {/* <Dashboard
                gameState={gameState}
                playerStats={playerStats}
                onUpgrade={onUpgrade}
              /> */}
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: gameState.hearts }).map((_, i) => (
                  <Heart key={i} fill="red" className="text-red-500" />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Zap className="text-yellow-500" />
                <span>Wave {gameState.wave}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="text-blue-500" />
                <span>Score: {Math.floor(gameState.score)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sword className="text-purple-500" />
                <span>Combo: x{gameState.combo.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star fill="yellow" className="text-yellow-400" />
                <span>Stars: {gameState.stars}</span>
              </div>
            </div>{" "}
            <div className="flex flex-col z-50 ml-8 justify-center gap-3">
              {Object.entries(POWER_UPS).map(([key, value], index) => (
                <button
                  key={key}
                  className={`px-4 py-2 rounded-lg text-black transition ${
                    gameState.stars >= value.cost
                      ? `bg-yellow-400/50 hover:bg-yellow-600/50`
                      : "bg-white/85 cursor-not-allowed"
                  }`}
                  onClick={() => activateSpecialPower(index + 1)}
                  disabled={gameState.stars < value.cost}
                >
                  {value.name} ({value.cost} stars)
                </button>
              ))}
            </div>
          </div>
          <div className="gameareabgstars absolute h-full w-full inset-0 ">
            {/* Player */}
            <div
              className={`absolute w-[${PLAYER_SIZE}px] h-[${PLAYER_SIZE}px] transform -translate-x-1/2 -translate-y-1/2 transition-transform ${
                isAttacking ? "scale-125" : ""
              } ${isInvulnerable ? "animate-pulse" : ""}`}
              style={{
                left: playerState.position.x,
                top: playerState.position.y,
                transform: `translate(-50%, -50%) rotate(${playerState.rotation}rad)`,
                border: activePowerUps.some((p) => p.type === "YOLK_SHIELD")
                  ? "3px solid blue"
                  : "none",
                borderRadius: "50%",
              }}
            >
              <Image
                src="/images/Player.png"
                alt="Player"
                height={50}
                width={50}
                className={`w-10/12 h-10/12 ${
                  isInvulnerable ? "animate-pulse" : ""
                }`}
                style={{
                  filter: isInvulnerable ? "drop-shadow(0 0 10px red)" : "none",
                }}
              />
            </div>
            {/* Enemies */}
            <div className="absolute bottom-16 left-4 flex flex-col space-y-2">
              {/* Attack Cooldown Bar */}
              <div className="relative w-32 z-50 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: `${
                      ((ATTACK_COOLDOWN - attackCooldown) / ATTACK_COOLDOWN) *
                      100
                    }%`,
                  }}
                />
              </div>

              {/* Projectile Reload Bar */}
              <div className="relative w-32 z-50 h-4 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-100 ease-linear"
                  style={{ width: `${projectileReloadProgress}%` }}
                />
              </div>
            </div>
            {!tutorialShown && <GameTutorial onClose={startGame} />}
            {!showTutorial && !gameStarted && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white text-2xl">
                Press Space to Start
              </div>
            )}

            {projectiles.map((projectile) => (
              <div
                key={projectile.id}
                className="absolute bg-yellow-400 rounded-full"
                style={{
                  left: projectile.position.x,
                  top: projectile.position.y,
                  width: projectile.size,
                  height: projectile.size,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            {/* // Add this to your UI to show the projectile reload progress (if not already present) */}
            {/* Pause Overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-[49]">
                <h2 className="text-4xl font-bold mb-4">Game Paused</h2>
                <button
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                  onClick={() => setIsPaused(false)}
                >
                  Resume
                </button>{" "}
              </div>
            )}
            {enemies.map((enemy) => (
              <div
                key={enemy.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: enemy.position.x,
                  top: enemy.position.y,
                  width: enemy.size,
                  height: enemy.size,
                }}
              >
                <Image
                  width={100}
                  height={100}
                  src={enemy.image || "/images/enemy.png"}
                  alt={enemy.type}
                  className="w-full h-full"
                />
                <div className="absolute -top-4 left-0 w-full h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-100"
                    style={{
                      width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {waveAnnouncement && (
              <>
                {gameState.wave === 1 ? (
                  <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white bg-black/50 p-4 rounded">
                    Press space bar to start
                  </div>
                ) : (
                  <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white bg-black/50 p-4 rounded">
                    {waveAnnouncement}
                  </div>
                )}
              </>
            )}
            {/* Attack pointer */}
            {projectiles.map((projectile) => (
              <div
                key={projectile.id}
                className="absolute bg-red-500 rounded-full"
                style={{
                  left: projectile.position.x,
                  top: projectile.position.y,
                  width: projectile.size,
                  height: projectile.size,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            {/* ... existing game elements ... */}

            {attackPointer && (
              <div
                className="absolute w-8 h-8 border-2 border-red-500 rounded-full animate-pulse"
                style={{
                  left: attackPointer.x,
                  top: attackPointer.y,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
            {/* Power-ups */}
            {powerUps.map((powerUp) => (
              <div
                key={powerUp.id}
                className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: powerUp.position.x,
                  top: powerUp.position.y,
                }}
              >
                {powerUp.type === "HEART" ? (
                  <Heart className="w-full h-full text-red-500 animate-bounce" />
                ) : powerUp.type === "STAR" ? (
                  <Star className="w-full h-full text-yellow-500 animate-bounce" />
                ) : powerUp.type === "COINS" ? (
                  <CoinsIcon className="w-full h-full text-green-500 animate-bounce" />
                ) : null}
              </div>
            ))}

            {/* Particles */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: particle.position.x,
                  top: particle.position.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  opacity: 1 - (Date.now() - particle.createdAt) / 3000,
                }}
              />
            ))}
          </div>
          {powerUpEffects.map((effect) => (
            <PowerUpCollectionEffect
              key={effect.id}
              position={effect.position}
              type={effect.type}
            />
          ))}
          {/* Active power-ups display */}
          <div className="absolute top-16 left-4 flex flex-col gap-2">
            {activePowerUps.map((powerUp) => (
              <div
                key={powerUp.id}
                className="bg-gray-800/50 rounded px-2 py-1 text-sm text-white"
              >
                {POWER_UPS[powerUp.type].name}:{" "}
                {Math.ceil((powerUp.endTime - Date.now()) / 1000)}s
              </div>
            ))}
          </div>
          <AttackIndicator type={attackType} />
          {/* Messages */}
          {/* <Alert className="absolute bottom-4 left-4 right-4 bg-purple-900/80 border-purple-500 text-white">
          <AlertDescription>{lastMessage}</AlertDescription>
        </Alert> */}
          {/* Game Over screen */}
          {gameState.gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col z-10 items-center justify-center text-white">
              <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-4">
                Final Score: {Math.floor(gameState.score)}
              </p>
              <p className="text-xl mb-2">High Score: {highScore}</p>
              <p className="text-xl mb-2">Press V or Click to Restart</p>

              <button
                className="px-4 py-2 bg-purple-600 rounded-lg z-50 hover:bg-purple-700 transition"
                onClick={() => restartGame()}
              >
                Play Again
              </button>
            </div>
          )}
          {/* Controls */}
          <div
            className={`absolute inset-0 ${
              activeBoss ? "bg-red-900/20" : ""
            } transition-colors duration-1000`}
          />
          {/* Render obstaclestry */}
          {obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="absolute -z-1"
              style={{
                left: obstacle.position.x - obstacle.size / 2,
                top: obstacle.position.y - obstacle.size / 2,
                width: obstacle.size,
                height: obstacle.size,
              }}
            >
              <Image
                width={100}
                height={100}
                src={`/images/${obstacle.type}.png`}
                alt={obstacle.type}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Render bosses */}
          {/* Controls guide */}
          <div className="absolute bottom-4 right-4 z-[51] text-white text-sm opacity-50">
            <div className="flex flex-col top-4 right-4   rounded-xl w-max p-2 text-white bg-gray-700/85 text-sm">
              <div>
                Attack: +
                {Math.round(
                  (playerStats.attackDamage / BASE_PLAYER_STATS.attackDamage -
                    1) *
                    100
                )}
                %
              </div>
              <div>
                Speed: +
                {Math.round(
                  (playerStats.moveSpeed / BASE_PLAYER_STATS.moveSpeed - 1) *
                    100
                )}
                %
              </div>
              <div>
                Range: +
                {Math.round(
                  (playerStats.attackRange / BASE_PLAYER_STATS.attackRange -
                    1) *
                    100
                )}
                %
              </div>
            </div>
            <div>WASD or Arrow keys to move</div>
            <div>Space or E to attack</div>
            <div>Shift or X key to shoot</div>
            <div>Press O to open sound settings</div>
            <div>Press M to Toggle mute</div>
            <div>1, 2, 3 or Q, F, R keys for special powers</div>
            <div>P to pause/resume the game</div>
            {soundManager && <SoundSettings soundManager={soundManager} />}
            <Button
              className=" z-50 bg-blue-300/50"
              onClick={() => setTutorialShown(false)}
            >
              Tutorial
            </Button>
          </div>{" "}
        </div>
      </div>
    </div>
  );
}
