// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";

// interface PlayerStats {
//   attackDamage: number;
//   moveSpeed: number;
//   projectileSpeed: number;
//   projectileSize: number;
//   attackRange: number;
// }

// interface GameState {
//   score: number;
//   wave: number;
//   hearts: number;
//   gameOver: boolean;
//   combo: number;
//   stars: number;
//   coins: number; // This will be synced with localStorage
// }

// interface UpgradeMenuProps {
//   playerStats: PlayerStats;
//   coins: number;
//   onUpgrade: (stat: keyof PlayerStats, cost: number) => void;
//   onClose: () => void;
// }

// const INITIAL_UPGRADE_COSTS: Record<keyof PlayerStats, number> = {
//   attackDamage: 100,
//   moveSpeed: 50,
//   projectileSpeed: 75,
//   projectileSize: 60,
//   attackRange: 80,
// };

// const COST_INCREASE_RATE = 1.5;

// const UpgradeMenu: React.FC<UpgradeMenuProps> = ({
//   playerStats,
//   coins,
//   //   gameState,
//   onUpgrade,
//   onClose,
// }) => {
//   const [upgradeCosts, setUpgradeCosts] = useState(INITIAL_UPGRADE_COSTS);

//   const handleUpgrade = (stat: keyof PlayerStats) => {
//     const cost = upgradeCosts[stat];
//     if (coins >= cost) {
//       onUpgrade(stat, cost);
//       setUpgradeCosts((prevCosts) => ({
//         ...prevCosts,
//         [stat]: Math.round(prevCosts[stat] * COST_INCREASE_RATE),
//       }));
//     }
//   };
//   //   const [coins, setCoins] = useState(gameState.coins);/

//   return (
//     <div className="absolute inset-0 bg-black/80 flex z-100 flex-col items-center justify-center text-white ">
//       <h2 className="text-2xl font-bold mb-4">Upgrade Menu</h2>
//       <p className="mb-4">Coins: {coins}</p>
//       {Object.entries(upgradeCosts).map(([stat, cost]) => (
//         <button
//           key={stat}
//           className={`px-4 py-2 rounded-lg mb-2 ${
//             coins >= cost
//               ? "bg-purple-600 hover:bg-purple-700"
//               : "bg-gray-600 cursor-not-allowed"
//           } transition`}
//           onClick={() => handleUpgrade(stat as keyof PlayerStats)}
//           disabled={coins < cost}
//         >
//           Upgrade {stat} ({cost} coins) - Current:{" "}
//           {playerStats[stat as keyof PlayerStats].toFixed(2)}
//         </button>
//       ))}
//       <button
//         className="mt-4 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
//         onClick={onClose}
//       >
//         Close
//       </button>
//     </div>
//   );
// };

// interface DashboardProps {
//   gameState: GameState;
//   playerStats: PlayerStats;
//   onUpgrade: (stat: keyof PlayerStats, cost: number) => void;
// }

// const Dashboard: React.FC<DashboardProps> = ({
//   gameState,
//   playerStats,
//   onUpgrade,
// }) => {
//   const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
//   const [coins, setCoins] = useState(gameState.coins);
//   useEffect(() => {
//     const storedCoins = localStorage.getItem("coins");
//     if (storedCoins) {
//       setCoins(parseInt(storedCoins, 10));
//     }
//   }, []);
//   // Load player state and coins from local storage
//   useEffect(() => {
//     const storedPlayerStats = localStorage.getItem("playerStats");
//     const storedGameState = localStorage.getItem("gameState");

//     if (storedPlayerStats) {
//       const parsedPlayerStats: PlayerStats = JSON.parse(storedPlayerStats);
//       // Update playerStats state if needed
//     }

//     if (storedGameState) {
//       const parsedGameState: GameState = JSON.parse(storedGameState);
//       // Update gameState state if needed
//     }
//   }, []);

//   // Save player state and coins to local storage whenever they change
//   const savePlayerState = (
//     newPlayerStats: PlayerStats,
//     newGameState: GameState
//   ) => {
//     localStorage.setItem("playerStats", JSON.stringify(newPlayerStats));
//     localStorage.setItem("gameState", JSON.stringify(newGameState));
//   };

//   const handleUpgradeClick = () => {
//     setShowUpgradeMenu(true);
//   };

//   const handleCloseUpgradeMenu = () => {
//     setShowUpgradeMenu(false);
//   };

//   // Modify the onUpgrade function to save state after upgrade
//   const handleUpgrade = (stat: keyof PlayerStats, cost: number) => {
//     const newPlayerStats = { ...playerStats, [stat]: playerStats[stat] + 1 }; // Example increment logic
//     const newGameState = { ...gameState, coins: gameState.coins - cost };
//     onUpgrade(stat, cost);
//     savePlayerState(newPlayerStats, newGameState);
//   };

//   return (
//     <div className="p-4 bg-gray-900 text-white">
//       <h1 className="text-2xl font-bold mb-4">Game Dashboard</h1>
//       <div className="flex justify-between mb-4">
//         <div>Score: {gameState.score}</div>
//         <div>Wave: {gameState.wave}</div>
//         <div>Hearts: {gameState.hearts}</div>
//         <div>Stars: {gameState.stars}</div>
//         <div>Coins: {gameState.coins}</div>
//         <button
//           className="px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition"
//           onClick={handleUpgradeClick}
//         >
//           Upgrade Menu
//         </button>
//       </div>
//       <div className="grid grid-cols-3 gap-4 mb-4">
//         {Object.entries(playerStats).map(([stat, value]) => (
//           <Card key={stat}>
//             <CardHeader>{stat}</CardHeader>
//             <CardContent>{value.toFixed(2)}</CardContent>
//           </Card>
//         ))}
//       </div>
//       {showUpgradeMenu && (
//         <UpgradeMenu
//           playerStats={playerStats}
//           coins={gameState.coins}
//           onUpgrade={handleUpgrade} // Use the new handleUpgrade function
//           onClose={handleCloseUpgradeMenu}
//         />
//       )}
//     </div>
//   );
// };

// export { Dashboard, UpgradeMenu };
