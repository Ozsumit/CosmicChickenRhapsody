"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, Zap, Heart, Sword, Star } from "lucide-react";
import Image from "next/image";
import GameTutorial from "../gametuto";
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
type AttackType = "NORMAL" | "FEATHER_FURY" | "CLUCKINATOR";
const getAttackDamage = (baseAttackDamage: number, wave: number) => {
  return Math.round(baseAttackDamage * Math.pow(1.12, wave));
};

const ATTACK_DAMAGE = {
  NORMAL: 500,
  FEATHER_FURY: 750,
  CLUCKINATOR: 900,
};

const ATTACK_RANGE = {
  NORMAL: 100,
  CLUCKINATOR: 160,
};
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
  type: "HEART" | "STAR";
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
};

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
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
type Projectile = {
  id: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: number;
};
export default function CosmicChickenRhapsody() {
  const [isPaused, setIsPaused] = useState(false);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("highScore") || "0", 10);
  });
  const [tutorialShown, setTutorialShown] = useState(() => {
    return localStorage.getItem("tutorialShown") === "true";
  });

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
      type: "HEART" | "STAR";
    }>
  >([]);

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
  });

  const [playerState, setPlayerState] = useState({
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
    rotation: 0,
    velocity: { x: 0, y: 0 },
  });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [lastMessage, setLastMessage] = useState(
    "Welcome to the Cosmic Arena!"
  );
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
  const ATTACK_COOLDOWN = 350; // 500ms cooldown between attacks
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
      if (particleSystemRef.current && gameAreaRef.current) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const rgb = Array.from(
          ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)
        ).map((v) => v / 255);

        const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
        const canvasRect =
          particleSystemRef.current.gl.canvas.getBoundingClientRect();

        // Convert game area coordinates to canvas coordinates
        const canvasX =
          ((x - gameAreaRect.left) / gameAreaRect.width) * canvasRect.width;
        const canvasY =
          ((y - gameAreaRect.top) / gameAreaRect.height) * canvasRect.height;

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
    [particleSystemRef, gameAreaRef]
  );

  const AttackIndicator = ({ type }: { type: AttackType }) => {
    const colors = {
      NORMAL: "bg-blue-500",
      FEATHER_FURY: "bg-yellow-500",
      CLUCKINATOR: "bg-red-500",
    };

    return (
      <div
        className={`absolute bottom-24 left-4 px-3 py-1 rounded-full text-white ${colors[type]}`}
      >
        {type === "NORMAL" ? "Normal Attack" : type.replace("_", " ")}
      </div>
    );
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

    setAttackType(currentAttackType);
    setCanAttack(false);
    setIsAttacking(true);
    setAttackCooldown(ATTACK_COOLDOWN);

    setTimeout(() => {
      setIsAttacking(false);
    }, 200);

    const attackRange =
      ATTACK_RANGE[
        currentAttackType === "CLUCKINATOR" ? "CLUCKINATOR" : "NORMAL"
      ];
    const baseDamage = ATTACK_DAMAGE[currentAttackType];
    const scaledDamage = getAttackDamage(baseDamage, gameState.wave);

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
  ]);

  const [bossActive, setBossActive] = useState(false);
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
          setLastMessage(`Activated ${powerUpConfig.name}!`);
          createParticles(
            playerState.position.x,
            playerState.position.y,
            powerUpConfig.color,
            20
          );
        } else {
          setLastMessage(`Not enough stars to activate ${powerUpConfig.name}!`);
        }
      }
    },
    [gameState.stars, playerState.position, createParticles]
  );
  const [waveAnnouncement, setWaveAnnouncement] = useState("");
  // const [isPaused, setIsPaused] = useState(false);
  const spawnPowerUp = useCallback(() => {
    const powerUpTypes = ["HEART", "STAR"] as const;
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
    const numEnemies = Math.min(3 + Math.floor(gameState.wave / 2), 20);
    const newEnemies: Enemy[] = [];

    // Only spawn boss every 5 waves, starting from wave 5
    const shouldSpawnBoss = gameState.wave > 0 && gameState.wave % 5 === 0;

    if (shouldSpawnBoss) {
      setBossActive(true);
      setTimeout(() => setBossActive(false), 30000); // Boss fight lasts 30 seconds
    }

    for (let i = 0; i < numEnemies; i++) {
      let x, y;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -30 : GAME_WIDTH + 30;
        y = Math.random() * GAME_HEIGHT;
      } else {
        x = Math.random() * GAME_WIDTH;
        y = Math.random() < 0.5 ? -30 : GAME_HEIGHT + 30;
      }
      setWaveAnnouncement(`Wave ${gameState.wave + 1} `);
      setTimeout(() => setWaveAnnouncement(""), 3000);
      const health = 650 + gameState.wave * 100;
      newEnemies.push({
        id: Date.now() + i,
        type: ["Eggbot", "BroccoliBeast", "SpaceMime"][
          Math.floor(Math.random() * 3)
        ],
        health: health,
        maxHealth: health,
        position: { x, y },
        speed: BASE_ENEMY_SPEED + gameState.wave * 0.05,
        size: BASE_ENEMY_SIZE + gameState.wave * 0.5,
        image: "/images/enemy.png",
      });
    }

    if (shouldSpawnBoss) {
      const bossHealth = 7000 + gameState.wave * 500;
      newEnemies.push({
        id: Date.now() + numEnemies,
        type: "Boss",
        health: bossHealth,
        maxHealth: bossHealth,
        position: { x: GAME_WIDTH / 2, y: -50 },
        speed: BASE_ENEMY_SPEED * 0.5,
        size: BASE_ENEMY_SIZE * 3,
        image: "/images/boss.png",
      });
    }

    setEnemies((prev) => [...prev, ...newEnemies]);
    setGameState((prev) => ({ ...prev, wave: prev.wave + 1 }));
    spawnPowerUp();
  }, [gameState.wave, spawnPowerUp, GAME_HEIGHT, GAME_WIDTH]);
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
    type: "HEART" | "STAR";
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
    (bossPosition: { x: number; y: number }) => {
      const angle = Math.atan2(
        playerState.position.y - bossPosition.y,
        playerState.position.x - bossPosition.x
      );
      const speed = 3;
      const newProjectile: Projectile = {
        id: Date.now(),
        position: { ...bossPosition },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        size: 10,
      };
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

  // Define a reusable restart function
  const restartGame = () => {
    setGameState({
      score: 0,
      wave: 0,
      hearts: 3,
      gameOver: false,
      combo: 1,
      stars: 0,
    });
    setEnemies([]);
    setPowerUps([]);
    setActivePowerUps([]);
    setPlayerState({
      position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
      rotation: 0,
      velocity: { x: 0, y: 0 },
    });
    setLastMessage("Welcome back to the Cosmic Arena!");
    setGameStarted(true);
  };

  useEffect(() => {
    if (gameState.gameOver || !gameStarted || isPaused) return;
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      localStorage.setItem("highScore", gameState.score.toString());
    }
    const movePlayer = () => {
      const moveSpeed = activePowerUps.some((p) => p.type === "FEATHER_FURY")
        ? BASE_PLAYER_SPEED * 1.5
        : BASE_PLAYER_SPEED;

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
      if (attackCooldown > 0) {
        setAttackCooldown((prev) => {
          if (prev <= 16) {
            setCanAttack(true);
            return 0;
          }
          return prev - 16;
        });
      }

      setEnemies((prev) =>
        prev.map((enemy) => {
          const dx = playerState.position.x - enemy.position.x;
          const dy = playerState.position.y - enemy.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          return {
            ...enemy,
            position: {
              x: enemy.position.x + normalizedDx * enemy.speed,
              y: enemy.position.y + normalizedDy * enemy.speed,
            },
          };
        })
      );

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
              hearts: Math.min(prev.hearts + 1, 5),
            }));
            setLastMessage("Extra heart collected!");
            createParticles(powerUp.position.x, powerUp.position.y, "red", 10);
          } else if (powerUp.type === "STAR") {
            setGameState((prev) => ({
              ...prev,
              stars: prev.stars + 10,
            }));
            setLastMessage("10 stars collected!");
            createParticles(
              powerUp.position.x,
              powerUp.position.y,
              "yellow",
              10
            );
          }
          // Add this line to show the collection effect
          setPowerUpEffects((prev) => [
            ...prev,
            { id: Date.now(), position: powerUp.position, type: powerUp.type },
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
      const closestEnemy = enemies.reduce(
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
      if (!isPaused) {
        setEnemies((prev) =>
          prev.map((enemy) => {
            const dx = playerState.position.x - enemy.position.x;
            const dy = playerState.position.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;

            return {
              ...enemy,
              position: {
                x: enemy.position.x + normalizedDx * enemy.speed,
                y: enemy.position.y + normalizedDy * enemy.speed,
              },
            };
          })
        );
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
      enemies.forEach((enemy) => {
        if (enemy.type === "Boss" && Math.random() < 0.02) {
          // 2% chance to shoot each frame
          spawnBossProjectile(enemy.position);
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
    }, 16);
    return () => clearInterval(gameLoop);
  }, [
    gameState.gameOver,
    isPaused,
    activePowerUps,
    projectiles,
    spawnBossProjectile,
    playerState.position,
    isInvulnerable,
    gameState.score,
    highScore,
    createParticles,
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
  }, [gameState.gameOver, activateSpecialPower, gameStarted]);

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
    <div className="flex items-center h-screen w-screen justify-center min-h-screen overflow-hidden bg-black">
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
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white">
            <div className="flex flex-row items-center z-50 gap-4">
              <div className="flex flex-row items-center gap-2">
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
                src="/images/player.png"
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
            <div className="absolute bottom-16 left-4 w-32 h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-100"
                style={{
                  width: `${
                    ((ATTACK_COOLDOWN - attackCooldown) / ATTACK_COOLDOWN) * 100
                  }%`,
                }}
              />
            </div>
            {!tutorialShown && <GameTutorial onClose={startGame} />}

            {!showTutorial && !gameStarted && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white text-2xl">
                Press Space to Start
              </div>
            )}
            {/* Pause Overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
                <h2 className="text-4xl font-bold mb-4">Game Paused</h2>
                <button
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                  onClick={() => setIsPaused(false)}
                >
                  Resume
                </button>
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
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white bg-black/50 p-4 rounded">
                    Press space bar to start
                  </div>
                ) : (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white bg-black/50 p-4 rounded">
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
                ) : (
                  <Star className="w-full h-full text-yellow-500 animate-bounce" />
                )}
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
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
              <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-4">
                Final Score: {Math.floor(gameState.score)}
              </p>
              <p className="text-xl mb-2">High Score: {highScore}</p>
              <p className="text-xl mb-2">Press Space or Click to Restart</p>

              <button
                className="px-4 py-2 bg-purple-600 rounded-lg z-50 hover:bg-purple-700 transition"
                onClick={() => restartGame()}
              >
                Play Again
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-20 left-4 right-4 flex justify-center gap-4">
            {Object.entries(POWER_UPS).map(([key, value], index) => (
              <button
                key={key}
                className={`px-4 py-2 rounded-lg transition ${
                  gameState.stars >= value.cost
                    ? `bg-${value.color}-600 hover:bg-${value.color}-700`
                    : "bg-gray-600 cursor-not-allowed"
                }`}
                onClick={() => activateSpecialPower(index + 1)}
                disabled={gameState.stars < value.cost}
              >
                {value.name} ({value.cost} stars)
              </button>
            ))}
          </div>
          <div
            className={`absolute inset-0 ${
              bossActive ? "bg-red-900/20" : ""
            } transition-colors duration-1000`}
          />
          {/* Controls guide */}
          <div className="absolute bottom-4 right-4 text-white text-sm opacity-50">
            <div>WASD or Arrow keys to move</div>
            <div>Space or E to attack</div>
            <div>1, 2, 3 or Q, F, R keys for special powers</div>
            <div>P to pause/resume the game</div>
          </div>
        </div>
      </div>
    </div>
  );
}
