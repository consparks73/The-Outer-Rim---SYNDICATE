import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Character,
  Quest,
  Item,
  SaveData,
  Locations,
  Location,
  DialogueNode,
  Enemy,
} from "../types";
import {
  IMAGES,
  NPC_DATABASE,
  ITEM_DATABASE,
  ENEMIES,
  SECTORS,
  RTC_EVENTS,
} from "../data";
import { Typewriter, CommandButton, cn } from "./Shared";
import { SlicingGame, SabaccGame } from "./Minigames";
import { Podracing } from "./Podracing";
import { TargetRange } from "./TargetRange";
import { SalvageGame } from "./SalvageGame";
import { HoloNet } from "./HoloNet";
import { CharacterSheet } from "./CharacterSheet";
import { Combat } from "./Combat";
import { addXp, updateReputation } from "../utils/rpg";
import { SKILL_TREE } from "../skillsData";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Zap,
  Coins,
  ArrowRightCircle,
  Search,
  MessageSquare,
  Trophy,
  Skull,
  History,
  Menu,
  X,
  MapPin,
  Calendar,
  Moon,
  Sun,
  Backpack,
  Clock,
  Maximize,
  Minimize,
  Tv,
  Gamepad2,
  Music,
  Save,
  Navigation,
  Globe,
  Ship,
  Sparkles,
} from "lucide-react";
import { DailyRewards } from "./DailyRewards";

import { Store } from "./Store";

const scrambleText = (text: string) => {
  return text
    .split("")
    .map((char) => {
      if (
        char === " " ||
        char === '"' ||
        char === "(" ||
        char === ")" ||
        char === "." ||
        char === ","
      )
        return char;
      const chars = "†‡∆∏∑Ωπ…æœ¬˚∆˙©ƒ®†¥";
      return chars[Math.floor(Math.random() * chars.length)];
    })
    .join("");
};

interface DashboardProps {
  gameState: SaveData;
  setGameState: React.Dispatch<React.SetStateAction<SaveData>>;
  locations: Locations;
  onSave: () => void;
  onCombatChange?: (active: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  gameState,
  setGameState,
  locations,
  onSave,
  onCombatChange,
}) => {
  const [dialogueNode, setDialogueNode] = useState<DialogueNode | null>(null);
  const [currentNpcId, setCurrentNpcId] = useState<string | null>(null);
  const [shopNpcId, setShopNpcId] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelTo, setTravelTo] = useState<string | null>(null);
  const [showSectorMap, setShowSectorMap] = useState(false);
  const [showAmbushCinematic, setShowAmbushCinematic] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState<
    | "slicing"
    | "sabacc"
    | "podracing_bet"
    | "podracing_tracker"
    | "shooting_range"
    | "salvage"
    | "holonet"
    | null
  >(null);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [slicingTarget, setSlicingTarget] = useState<string | null>(null);
  const [invSort, setInvSort] = useState<"A-Z" | "Z-A" | "High-Low" | "Rarity">(
    "A-Z",
  );
  const [invFilter, setInvFilter] = useState<
    | "all"
    | "weapon"
    | "consumable"
    | "misc"
    | "furniture"
    | "utility"
    | "clothing"
    | "droid"
  >("all");

  // COMBAT STATE
  const [combatEnemy, setCombatEnemy] = useState<Enemy | null>(null);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerCooldown, setPlayerCooldown] = useState(0);
  const [enemyCooldown, setEnemyCooldown] = useState(0);

  const [logKey, setLogKey] = useState(0);
  const [realTime, setRealTime] = useState(new Date());
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (onCombatChange) {
      onCombatChange(!!combatEnemy);
    }
  }, [combatEnemy, onCombatChange]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [gameState.history, logKey, dialogueNode, scrollToBottom]);

  useEffect(() => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollTop = 0;
    }
  }, [gameState.currentLocationId, showSectorMap]);

  const addToLog = (text: string) => {
    setGameState((prev) => ({
      ...prev,
      history: [...(prev.history || []), text].slice(-50), // Keep last 50 lines
    }));
    setLogKey((k) => k + 1);
  };

  const handleCombatLoss = () => {
    setCombatEnemy(null);
    addToLog(
      "[COMBAT] You were defeated. Transporting to nearby Med Center...",
    );
    setGameState((prev) => ({
      ...prev,
      currentLocationId: "med_center",
      stats: prev.stats
        ? { ...prev.stats, currentHp: Math.floor(prev.stats.maxHp * 0.1) }
        : null,
    }));
  };

  const generateContract = () => {
    const targets = [
      "Gredda the Hutt",
      "Vexon the Sly",
      "Dune Sea Wanderer",
      "Imperial Defector",
      "Smuggler Jax",
      "Renegade Droid",
    ];
    const locs = [
      "Jundland Wastes",
      "Mos Eisley Old Quarter",
      "Krayt Valley",
      "Mos Espa",
      "Anchorhead",
      "Tosche Station",
    ];
    const id = Math.random().toString(36).substring(2, 9);
    const target = targets[Math.floor(Math.random() * targets.length)];
    const loc = locs[Math.floor(Math.random() * locs.length)];
    const reward = 250 + Math.floor(Math.random() * 500);

    const contract: any = {
      id,
      title: `Bounty: ${target}`,
      type: "bounty",
      targetName: target,
      targetLocation: loc,
      reward,
      description: `Target ${target} was last seen near ${loc}. Terminate on sight.`,
      completed: false,
    };
    return contract;
  };

  const triggerEnemyAttack = () => {
    if (!combatEnemy) return;

    const equippedClothing = gameState.equippedClothingId
      ? gameState.inventory.find((i) => i.id === gameState.equippedClothingId)
      : null;
    const armor = equippedClothing?.armor || 0;
    const baseDmg = combatEnemy.dmg + Math.floor(Math.random() * 3) - 1;
    const finalDmg = Math.max(1, baseDmg - armor);

    setGameState((prev) => {
      if (!prev.stats) return prev;
      const newHp = Math.max(0, prev.stats.currentHp - finalDmg);
      return { ...prev, stats: { ...prev.stats, currentHp: newHp } };
    });

    addToLog(
      `[COMBAT] ${combatEnemy.name} hits you for ${finalDmg} damage!${armor > 0 ? ` (${armor} armor absorbed)` : ""}`,
    );
  };

  useEffect(() => {
    const today = new Date().toDateString();
    if (gameState.lastDailyRewardClaimDate !== today) {
      const timer = setTimeout(() => {
        setShowDailyRewards(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastDailyRewardClaimDate]);

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // RTC SYNC: Happy Hour, Midnight, and Background Tasks
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setRealTime(now);

      const hour = now.getHours();
      const shouldBeNight = hour >= 19 || hour < 6;
      if (gameState.isNight !== shouldBeNight) {
        setGameState((prev) => ({ ...prev, isNight: shouldBeNight }));
      }

      // Background Slicing Completion Check
      if (gameState.activeSlicingTask) {
        const elapsed = now.getTime() - gameState.activeSlicingTask.startTime;
        if (elapsed >= gameState.activeSlicingTask.duration * 1000) {
          const target = gameState.activeSlicingTask.targetId;
          setGameState((prev) => ({
            ...prev,
            activeSlicingTask: null,
            unlockedContainers: [...prev.unlockedContainers, target],
          }));
          addToLog(
            `[RTC NOTIFICATION] Decryption complete: Access to ${target} granted.`,
          );
          setLogKey((k) => k + 1);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.activeSlicingTask, gameState.isNight]);

  // Combat Loop Process
  useEffect(() => {
    if (!combatEnemy) return;

    const interval = setInterval(() => {
      setPlayerCooldown((prev) => Math.min(100, prev + 2.5));
      setEnemyCooldown((prev) => {
        const next = prev + 2.0;
        if (next >= 100) {
          // Logic moved out of setter below
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [combatEnemy]);

  // Attack triggers based on cooldown reaching max
  useEffect(() => {
    if (enemyCooldown >= 100 && combatEnemy) {
      triggerEnemyAttack();
      setEnemyCooldown(0);
    }
  }, [enemyCooldown, combatEnemy]);

  // Player death check
  useEffect(() => {
    if (gameState.stats && gameState.stats.currentHp <= 0 && combatEnemy) {
      handleCombatLoss();
    }
  }, [gameState.stats?.currentHp, combatEnemy]);

  const handleCombatWin = () => {
    if (!combatEnemy) return;
    const xp = combatEnemy.xp;
    const credits = combatEnemy.credits;
    const enemyId = combatEnemy.id;

    setGameState((prev) => {
      let newState = {
        ...prev,
        credits: prev.credits + credits,
        defeatedNpcs: [...(prev.defeatedNpcs || []), enemyId],
        history: [...(prev.history || []), `[COMBAT] Defeated ${combatEnemy.name}. Gained ${xp} XP and ${credits} Credits.`].slice(-50),
        quests: prev.quests.map((q) => {
          if (q.id === "q2" && enemyId === "teemo")
            return { ...q, currentStepIndex: 2 }; // Correct index for 'Rescue Kaelen'
          if (q.id === "q3" && enemyId === "thug" && q.currentStepIndex === 2)
            return { ...q, currentStepIndex: 3 };
          return q;
        }),
      };

      // Contract Check
      const currentLocation = locations[prev.currentLocationId];
      const activeContractIdx = newState.activeContracts.findIndex(
        (c) => c.targetLocation === currentLocation.name && !c.completed,
      );
      if (activeContractIdx > -1) {
        const contract = newState.activeContracts[activeContractIdx];
        newState.credits += contract.reward;
        newState.activeContracts = newState.activeContracts.filter(
          (_, i) => i !== activeContractIdx,
        );
        newState.completedDailyContracts = [
          ...(newState.completedDailyContracts || []),
          contract.id,
        ];
        newState.history = [...(newState.history || []), `[CONTRACT COMPLETE] Target eliminated. Reward: ${contract.reward} Credits synced.`].slice(-50);
      }

      // Award XP
      const xpResult = addXp(newState, xp);
      newState = xpResult.state;

      // Quest Step Progression for Combat
      if (
        enemyId === "thug" &&
        newState.currentLocationId === "mos_eisley_old_quarter"
      ) {
        newState.quests = newState.quests.map((q) => {
          if (q.id === "q_tutorial" && q.currentStepIndex === 1)
            return { ...q, currentStepIndex: 2 };
          return q;
        });
      }

      // Major Boss completion logic
      if (enemyId === "teemo") {
        newState.history = [...(newState.history || []), "SYSTEM: Threat neutralized. Kaelen is free to speak."].slice(-50);
      }

      // Reputation for major enemies
      if (enemyId === "teemo") {
        newState = updateReputation(newState, "guild", 20);
      }

      return newState;
    });

    setCombatEnemy(null);
    setDialogueNode(null);
    setCurrentNpcId(null);
  };

  const handlePlayerAttack = () => {
    if (!combatEnemy || playerCooldown < 100) return;
    setPlayerCooldown(0);

    const equippedWeapon = gameState.equippedWeaponId
      ? gameState.inventory.find((i) => i.id === gameState.equippedWeaponId)
      : null;

    const hasBlasterTraining =
      gameState.stats?.unlockedSkillIds.includes("blaster_training");
    const hasDeadeye = gameState.stats?.unlockedSkillIds.includes("deadeye");

    const skillDmgBonus = hasBlasterTraining ? 3 : 0;
    const baseDmg = (equippedWeapon?.dmg || 4) + skillDmgBonus;

    let totalDmg =
      baseDmg + Math.floor(Math.random() * (gameState.stats?.stats.str || 5));

    // Critical Hit Logic
    const critChance = hasDeadeye ? 0.25 : 0.05;
    const isCrit = Math.random() < critChance;

    if (isCrit) {
      totalDmg = Math.floor(totalDmg * 2.0);
      addToLog(`[CRITICAL HIT] Neural sync perfect! Double damage!`);
    }

    const nextHp = Math.max(0, enemyHp - totalDmg);
    setEnemyHp(nextHp);
    addToLog(`[COMBAT] You hit ${combatEnemy.name} for ${totalDmg} damage!`);

    if (nextHp <= 0) {
      handleCombatWin();
    }
  };

  const currentLocation = locations[gameState.currentLocationId];
  const isNight = gameState.isNight;

  // Derived values based on Time of Day
  const activeNpc = currentNpcId ? NPC_DATABASE[currentNpcId] : null;
  const locName = isNight
    ? currentLocation.nightName || currentLocation.name
    : currentLocation.name;
  const locDesc = isNight
    ? currentLocation.nightDescription || currentLocation.description
    : currentLocation.description;

  // Switch to NPC image if talking
  const locImg = activeNpc
    ? isNight && activeNpc.nightImageUrl
      ? activeNpc.nightImageUrl
      : activeNpc.imageUrl
    : isNight
      ? currentLocation.nightImageUrl || currentLocation.imageUrl
      : currentLocation.imageUrl;

  const locExits = isNight
    ? currentLocation.nightExits || currentLocation.exits
    : currentLocation.exits;
  const locNpcs = (isNight
    ? currentLocation.nightNpcs || currentLocation.npcs || []
    : currentLocation.npcs || []
  ).filter((npcId) => {
    const npc = NPC_DATABASE[npcId];
    if (!npc) return false;
    if (npc.reqQuestState) {
      const q = gameState.quests.find((q) => q.id === npc.reqQuestState!.id);
      if (!q) return false;
      if (npc.reqQuestState.completed) return q.status === "completed";
      if (npc.reqQuestState.step !== undefined)
        return (
          q.currentStepIndex >= npc.reqQuestState.step ||
          q.status === "completed"
        );
    }
    if (gameState.defeatedNpcs?.includes(npcId)) return false;
    return true;
  });
  const locActions = isNight
    ? currentLocation.nightActions || currentLocation.actions || []
    : currentLocation.actions || [];

  // Furniture/Utility Actions in Safehouse
  const isSafehouse =
    gameState.currentLocationId === "safehouse" ||
    gameState.currentLocationId === "safehouse_bedroom";
  const furnitureItems = isSafehouse
    ? gameState.inventory.filter(
        (i) => (i.type === "furniture" || i.type === "utility") && i.service,
      )
    : [];

  const locSearchables = isNight
    ? currentLocation.nightSearchables || currentLocation.searchables || []
    : currentLocation.searchables || [];
  const locAmbient = currentLocation.ambient || [];

  const handleContractAction = () => {
    if (gameState.activeContracts.length >= 3) {
      addToLog("Your contract log is full. Finish current jobs first.");
      return;
    }

    // Limit to 3 completed per day
    const today = new Date().toDateString();
    let currentCompleted = gameState.completedDailyContracts || [];

    // Reset if it's a new day
    if (gameState.lastDailyRewardClaimDate !== today) {
      currentCompleted = [];
    }

    if (currentCompleted.length >= 3) {
      addToLog(
        "[GUILD TERMINAL] You have exceeded your daily guild allotment. Return tomorrow.",
      );
      return;
    }

    const newContract = generateContract();
    setGameState((prev) => ({
      ...prev,
      activeContracts: [...prev.activeContracts, newContract],
      completedDailyContracts: currentCompleted,
    }));
    addToLog(
      `[GUILD TERMINAL] Contract assigned: ${newContract.title}. Target: ${newContract.targetLocation}. (${3 - currentCompleted.length - gameState.activeContracts.length - 1} slots remaining)`,
    );
  };

  const checkContractCompletion = (locationName: string) => {
    const contract = gameState.activeContracts.find(
      (c) => c.targetLocation === locationName && !c.completed,
    );
    if (contract) {
      addToLog(`[CONTACT DETECTED] You've located ${contract.targetName}!`);
      startCombat("thug"); // Using thug as base for random bounties
      // After combat win logic needs to be updated to check contracts
    }
  };

  // --- ACTIONS ---

  const executeMove = (exitId: string) => {
    const nextLoc = locations[exitId];
    setDialogueNode(null);
    setCurrentNpcId(null);
    setIsMobileMenuOpen(false);

    setGameState((prev) => {
      const visited = prev.visitedLocations.includes(exitId);

      let cantinaVisits = prev.cantinaVisits || 0;
      if (exitId === "mos_eisley_cantina") {
        cantinaVisits += 1;
      }

      return {
        ...prev,
        currentLocationId: exitId,
        cantinaVisits,
        visitedLocations: visited
          ? prev.visitedLocations
          : [...prev.visitedLocations, exitId],
        history: ["System Initialized.", `Location: ${nextLoc.name}.`],
      };
    });

    const desc = isNight
      ? nextLoc.nightDescription || nextLoc.description
      : nextLoc.description;
    addToLog(desc);

    // Random encounters based on reputation and danger levels
    const locFaction =
      nextLoc.faction ||
      (nextLoc.name.toLowerCase().includes("imperial")
        ? "empire"
        : nextLoc.name.toLowerCase().includes("jabba")
          ? "hutt"
          : nextLoc.name.toLowerCase().includes("mos")
            ? "hutt"
            : "none");

    // Default danger level from location or derived from name/sector
    let baseDanger = nextLoc.dangerLevel || 0;
    if (!nextLoc.dangerLevel) {
      if (nextLoc.name.includes("Wastes") || nextLoc.name.includes("Sea"))
        baseDanger = 5;
      else if (
        nextLoc.name.includes("Outpost") ||
        nextLoc.name.includes("Cantina") ||
        nextLoc.name.includes("Palace")
      )
        baseDanger = 3;
      else baseDanger = 1;
    }

    let encounterMultiplier = 1;
    let fallbackEnemy = "thug";

    if (locFaction !== "none") {
      const rep = gameState.reputation[locFaction] || 0;
      if (rep < 0) {
        encounterMultiplier += Math.abs(rep) / 20; // more negative = more attacks
      }
      if (locFaction === "empire") fallbackEnemy = "stormtrooper";
      else if (locFaction === "hutt") fallbackEnemy = "jabba_enforcer";
      else if (locFaction === "guild") fallbackEnemy = "bounty_hunter";
    }

    // Low reputation with any faction can cause bounty hunters anywhere
    let huntedChance = 0;
    const lowRepFactions = Object.entries(gameState.reputation).filter(
      ([_, rep]: [string, any]) => rep <= -50,
    );
    if (lowRepFactions.length > 0) {
      huntedChance = 0.08;
    }

    const roll = Math.random();
    if (roll < huntedChance) {
      const attackingFaction = lowRepFactions[0][0];
      const enemyType = attackingFaction === "hutt" ? "jabba_enforcer" : "bounty_hunter";
      
      startCombat(enemyType);
      addToLog(
        `[COMBAT] You were tracked down by ${attackingFaction === "hutt" ? "a Gamorrean Guard" : "a bounty hunter"} hired by the ${attackingFaction.toUpperCase()}!`,
      );
    } else if (roll < huntedChance + baseDanger * 0.03 * encounterMultiplier) {
      if (baseDanger >= 5) fallbackEnemy = "tusken"; // dangerous areas default to Tusken Raiders
      startCombat(fallbackEnemy);
      addToLog(
        `[COMBAT] You were ambushed moving into the area by a ${fallbackEnemy.replace("_", " ")}! Danger level in this sector is high.`,
      );
    }
  };

  const handleMove = async (exitId: string) => {
    const nextLoc = locations[exitId];
    if (!nextLoc) return;

    // --- SWOOP GARAGE EXIT BLOCK ---
    // If quest q2 is on step index 2 (Rescue Kaelen), block exit to Old Quarter until conversation finished.
    if (gameState.currentLocationId === "swoop_garage" && exitId !== "safehouse") {
      const q2 = gameState.quests.find((q) => q.id === "q2");
      if (q2 && q2.currentStepIndex === 2) {
        addToLog(
          "Kaelen calls out: 'Hey! Don't just leave yet. We need to talk about what just happened here.'",
        );
        return;
      }
    }

    // Requirement Check
    if (nextLoc.reqQuestState) {
      const quest = gameState.quests.find(
        (q) => q.id === nextLoc.reqQuestState!.id,
      );
      const isCompleted = quest?.status === "completed";
      const hasStep =
        quest &&
        (quest.status === "completed" ||
          quest.currentStepIndex >= nextLoc.reqQuestState!.step);

      const requirementMet = nextLoc.reqQuestState.completed
        ? isCompleted
        : hasStep;

      if (!requirementMet) {
        addToLog(
          `[SECURITY ERROR] Access Denied. Sector ${nextLoc.name} is currently restricted.`,
        );
        if (nextLoc.reqQuestState.completed) {
          addToLog(
            `Clearance code from "${quest?.title || "Unknown Protocol"}" required.`,
          );
        } else {
          addToLog(
            `Further progress in "${quest?.title || "Unknown Protocol"}" needed.`,
          );
        }
        return;
      }
    }

    if (nextLoc.reqItem) {
      const hasItem = gameState.inventory.find((i) => i.id === nextLoc.reqItem);
      if (!hasItem) {
        const item = ITEM_DATABASE.find((i) => i.id === nextLoc.reqItem);
        addToLog(
          `[HARDWARE ERROR] Link failure. ${item?.name || "Required Hardware"} required to interface with ${nextLoc.name}.`,
        );
        return;
      }
    }

    // --- NEW: Safehouse Exit Restriction ---
    if (
      gameState.currentLocationId.includes("safehouse") &&
      exitId === "swoop_garage"
    ) {
      if ((gameState.reputation["kaelenTalkedTo"] || 0) < 1) {
        addToLog(
          "Kaelen: 'Wait! Don't leave yet. We need to talk about our setup here.'",
        );
        setCurrentNpcId("kaelen");
        setDialogueNode(NPC_DATABASE["kaelen"].dialogueTree["setup"]);
        return;
      }
    }

    // --- GAMORREAN AMBUSH ENCOUNTER ---
    if (
      gameState.currentLocationId === "safehouse" &&
      exitId === "swoop_garage" &&
      (gameState.reputation["kaelenTalkedTo"] || 0) >= 1 &&
      gameState.defeatedNpcs?.includes("teemo") &&
      !gameState.flags?.includes("jabbas_ambush_triggered")
    ) {
      setGameState((prev) => ({
        ...prev,
        flags: [...(prev.flags || []), "jabbas_ambush_triggered"],
        currentLocationId: "jabbas_palace",
      }));
      setShowAmbushCinematic(true);
      return;
    }

    // --- SECTOR TRAVEL TRANSITION ---
    const currentLoc = locations[gameState.currentLocationId];
    
    // Explicit bypass for safehouse <-> garage
    const isBaseTransit = (
      (gameState.currentLocationId === "safehouse" && exitId === "swoop_garage") ||
      (gameState.currentLocationId === "swoop_garage" && exitId === "safehouse")
    );

    if (
      !isBaseTransit &&
      nextLoc.sector &&
      currentLoc.sector &&
      nextLoc.sector !== currentLoc.sector
    ) {
      setIsTraveling(true);
      setTravelTo(exitId);
      addToLog(
        `[NAV-LINK] Jumping between sectors: ${currentLoc.sector} -> ${nextLoc.sector}...`,
      );

      // Random space encounter or travel flavor
      const travelMessages = [
        "Jumping to hyperspace... wait, this is Tatooine. Engaging sublight drives.",
        "Maneuvering through canyon passes...",
        "Avoiding Imperial patrol routes...",
        "Sandstorms detected on entry vector. Recalibrating...",
      ];
      addToLog(
        travelMessages[Math.floor(Math.random() * travelMessages.length)],
      );

      setTimeout(() => {
        executeMove(exitId);
        setIsTraveling(false);
        setTravelTo(null);
      }, 3000);
      return;
    }

    executeMove(exitId);
  };

  const [cheatCode, setCheatCode] = useState("");

  const handleCheatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = cheatCode.toLowerCase().trim();

    if (code === "motherlode") {
      setGameState((prev) => ({ ...prev, credits: prev.credits + 5000 }));
      addToLog(
        "ADMIN: Data corruption detected in bank records... +5000 Credits synced.",
      );
    } else if (code === "refill") {
      setGameState((prev) => ({
        ...prev,
        stats: prev.stats
          ? { ...prev.stats, stats: { ...prev.stats.stats, vit: 100 } }
          : null,
      }));
      addToLog("ADMIN: Vitality levels force-recalibrated to 100%.");
    } else if (code === "heist") {
      const legendaries = ITEM_DATABASE.filter((i) => i.rarity === "legendary");
      const randomItem =
        legendaries[Math.floor(Math.random() * legendaries.length)];
      setGameState((prev) => ({
        ...prev,
        inventory: [...prev.inventory, { ...randomItem, count: 1 }],
      }));
      addToLog(
        `ADMIN: Manifest override. ${randomItem.name} added to inventory.`,
      );
    } else {
      addToLog(
        `ADMIN: Invalid access code "${code}". Trace protocol initiated.`,
      );
    }
    setCheatCode("");
  };

  const handleRest = async () => {
    setGameState((prev) => ({
      ...prev,
      stats: prev.stats ? { ...prev.stats, currentHp: prev.stats.maxHp } : null,
    }));

    addToLog(
      "System recalibration complete. Vitality levels at 100%. All systems nominal.",
    );
  };

  const handleFurnitureAction = (item: Item) => {
    if (item.service === "sabacc") {
      setActiveMinigame("sabacc");
      addToLog(`Hosting a private Sabacc game on your ${item.name}.`);
    } else if (item.service === "podracing_live") {
      setActiveMinigame("holonet");
      addToLog("Connecting safehouse terminal to HoloNet Premium network...");
    } else if (item.service === "buff_provider") {
      const now = Date.now();
      if (!item.lastUsedAt || now - item.lastUsedAt > 12 * 3600 * 1000) {
        if (item.buffEffect && gameState.stats) {
          const { stat, value } = item.buffEffect;
          setGameState((prev) => ({
            ...prev,
            stats: prev.stats
              ? {
                  ...prev.stats,
                  stats: {
                    ...prev.stats.stats,
                    [stat]: prev.stats.stats[stat] + value,
                  },
                }
              : null,
            inventory: prev.inventory.map((i) =>
              i.id === item.id ? { ...i, lastUsedAt: now } : i,
            ),
          }));
          addToLog(`Interactive: Used ${item.name}. ${item.description}`);
          addToLog(`STATUS BOOST: +${value} ${stat.toUpperCase()} applied.`);
        }
      } else {
        const remaining = Math.ceil(
          (12 * 3600 * 1000 - (now - item.lastUsedAt)) / 3600000,
        );
        addToLog(`${item.name} is on cooldown. Available in ${remaining}h.`);
      }
    }
  };

  const handleAction = (action: string) => {
    if (action === "Look Around") {
      const detailed = isNight
        ? currentLocation.nightDetailedDescription ||
          currentLocation.detailedDescription
        : currentLocation.detailedDescription;
      addToLog(detailed || "You see nothing unusual.");

      // Trigger chance encounters
      const locFaction =
        currentLocation.faction ||
        (currentLocation.name.toLowerCase().includes("imperial")
          ? "empire"
          : currentLocation.name.toLowerCase().includes("jabba")
            ? "hutt"
            : currentLocation.name.toLowerCase().includes("mos")
              ? "hutt"
              : "none");
      let baseDanger = currentLocation.dangerLevel || 0;
      if (!currentLocation.dangerLevel) {
        if (
          currentLocation.name.includes("Wastes") ||
          currentLocation.name.includes("Sea")
        )
          baseDanger = 5;
        else if (
          currentLocation.name.includes("Outpost") ||
          currentLocation.name.includes("Cantina") ||
          currentLocation.name.includes("Palace")
        )
          baseDanger = 3;
        else baseDanger = 1;
      }

      let encounterMultiplier = 1;
      let fallbackEnemy = "thug";

      if (locFaction !== "none") {
        const rep = gameState.reputation[locFaction] || 0;
        if (rep < 0) {
          encounterMultiplier += Math.abs(rep) / 20;
        }
        if (locFaction === "empire") fallbackEnemy = "stormtrooper";
        else if (locFaction === "hutt") fallbackEnemy = "jabba_enforcer";
        else if (locFaction === "guild") fallbackEnemy = "bounty_hunter";
      }

      const lowRepFactions = Object.entries(gameState.reputation).filter(
        ([_, rep]: [string, any]) => rep <= -50,
      );

      const roll = Math.random();
      if (lowRepFactions.length > 0 && roll < 0.1) {
        const attackingFaction = lowRepFactions[0][0];
        const enemyType = attackingFaction === "hutt" ? "jabba_enforcer" : "bounty_hunter";

        startCombat(enemyType);
        addToLog(
          `[COMBAT] You are tracked down by ${attackingFaction === "hutt" ? "a Gamorrean Guard" : "a bounty hunter"} hired by the ${attackingFaction.toUpperCase()}!`,
        );
        return;
      } else if (roll < baseDanger * 0.05 * encounterMultiplier - 0.1) {
        // -0.1 so it's not too frequent
        if (baseDanger >= 5) fallbackEnemy = "tusken";
        startCombat(fallbackEnemy);
        addToLog(
          `[COMBAT] You are ambushed while taking a look around! Danger level in this sector is high.`,
        );
        return;
      }

      if (currentLocation.encounters) {
        const isTracker = gameState.stats?.charClass?.id === "bounty_hunter";
        const roll = Math.random();
        const encounter = currentLocation.encounters.find((e) => {
          if (e.onlyNight && !isNight) return false;
          if (e.onlyDay && isNight) return false;
          const adjustedChance = isTracker ? e.chance * 1.2 : e.chance;
          return roll < adjustedChance;
        });

        if (encounter) {
          if (encounter.id === "tusken_ambush") {
            startCombat("tusken");
            return;
          }
          addToLog(`> ${encounter.description}`);

          setGameState((prev) => {
            let newState = { ...prev };
            if (encounter.credits) newState.credits += encounter.credits;
            return addXp(newState, encounter.lootLabel ? 10 : 2).state;
          });

          if (encounter.lootDescription && encounter.lootLabel) {
            addToLog(`You found: ${encounter.lootDescription}`);
            if (encounter.item) {
              const itemObj = ITEM_DATABASE.find(
                (i) => i.id === encounter.item,
              );
              if (itemObj) {
                setGameState((prev) => ({
                  ...prev,
                  inventory: [...prev.inventory, itemObj],
                }));
                addToLog(`Received: ${itemObj.name}`);
              }
            }
          }
        }
      }
    } else if (action === "Slice Mainframe") {
      const hasSlicerSpike = gameState.inventory.some(
        (i) => i.id === "slicer_spike",
      );
      if (!hasSlicerSpike) {
        addToLog("You need a Slicer Spike to attempt this hack.");
        return;
      }
      if (gameState.activeSlicingTask) {
        addToLog(
          "A slicing task is already in progress. Link is currently saturated.",
        );
        return;
      }
      if (gameState.unlockedContainers.includes("imperial_records_vault")) {
        addToLog("The vault is already successfully decrypted and open.");
        return;
      }

      addToLog("Connecting Slicer Spike to the Imperial Mainframe...");
      setGameState((prev) => {
        const newInv = [...prev.inventory];
        const spikeIdx = newInv.findIndex((i) => i.id === "slicer_spike");
        if (spikeIdx !== -1) {
          if (newInv[spikeIdx].count > 1) {
            newInv[spikeIdx] = {
              ...newInv[spikeIdx],
              count: newInv[spikeIdx].count - 1,
            };
          } else {
            newInv.splice(spikeIdx, 1);
          }
        }
        return {
          ...prev,
          inventory: newInv,
          activeSlicingTask: {
            startTime: new Date().getTime(),
            duration: 60, // 60 seconds for demo
            targetId: "imperial_records_vault",
          },
        };
      });
      addToLog(
        "Decryption Protocol engaged. Estimated time: 60 seconds. Background process running...",
      );
    } else if (action === "Play Sabacc") {
      if (gameState.credits < 10) {
        addToLog("You need at least 10 credits to play.");
        return;
      }
      setActiveMinigame("sabacc");
    } else if (action === "Use Bed (Rest & Heal)") {
      handleRest();
    } else if (action === "Access Storage") {
      addToLog("Accessing secure encrypted locker... Synchronizing...");
      addToLog(
        "Storage is currently empty. You can store items here in a future update.",
      );
    } else if (action === "Order Drink") {
      const hour = new Date().getHours();
      const cost = hour === 17 || hour === 18 ? 2 : 5; // Happy Hour 5-7PM
      if (gameState.credits >= cost) {
        setGameState((prev: any) => ({
          ...prev,
          credits: prev.credits - cost,
          stats: prev.stats
            ? {
                ...prev.stats,
                currentHp: Math.min(prev.stats.maxHp, prev.stats.currentHp + 5),
              }
            : null,
        }));
        addToLog(
          `You enjoy a refreshing drink. ${cost === 2 ? "(Happy Hour Discount Applied!)" : ""}`,
        );
      } else {
        addToLog("You can't afford a drink.");
      }
    } else if (action === "Collect Daily Stipend") {
      const today = new Date().toDateString();
      if (gameState.lastStipendClaimDate !== today) {
        setGameState((prev) => ({
          ...prev,
          credits: prev.credits + 50,
          lastStipendClaimDate: today,
        }));
        addToLog("Guild Stipend Collected: 50 Credits.");
      } else {
        addToLog(
          "You have already collected your stipend for today. Come back tomorrow.",
        );
      }
    } else if (action === "Access Betting Terminal") {
      setActiveMinigame("podracing_bet");
    } else if (action === "Enter Grand Stands") {
      if (gameState.activeRace && !gameState.activeRace.completed) {
        if (
          gameState.activeRace.type === "rookie" &&
          gameState.activeRace.startTime === 0
        ) {
          setGameState((prev) => ({
            ...prev,
            activeRace: prev.activeRace
              ? { ...prev.activeRace, startTime: Date.now() + 5000 }
              : null,
          }));
        }
        setActiveMinigame("podracing_tracker");
      } else if (gameState.activeRace && gameState.activeRace.completed) {
        addToLog(
          "The previous race has finished. Place a new bet to watch another.",
        );
      } else {
        addToLog(
          "There is no active race at the moment. Place a bet at the terminal to trigger a Rookie event.",
        );
      }
    } else if (action === "Range Practice") {
      setActiveMinigame("shooting_range");
      addToLog(
        "Entering the Bounty Guild's training range... Synchronizing simulator.",
      );
    } else if (action === "Salvage Scraps") {
      setActiveMinigame("salvage");
      addToLog("Opening the salvage bay. Calibrating workshop tools.");
    } else if (action === "Access Contract Terminal") {
      handleContractAction();
    } else if (action === "Secure Residency Status") {
      const q6 = gameState.quests.find((q) => q.id === "q6");
      if (q6 && q6.currentStepIndex === 3) {
        setGameState((prev) => ({
          ...prev,
          quests: prev.quests.map((q) => {
            if (q.id === "q6")
              return { ...q, status: "completed", currentStepIndex: 4 };
            if (q.id === "q_endless") return { ...q, status: "active" };
            return q;
          }),
        }));
        addToLog(
          "CREDENTIALS ACCEPTED. You are now a permanent resident of Mos Eisley. The Empire recognizes your status—for a price.",
        );
        addToLog(
          "MAIN QUEST COMPLETE: You have survived and established a foothold on Tatooine.",
        );
        addToLog("NEW QUEST ACTIVE: Outer Rim Legend (Endless Mode unlocked).");
      } else {
        addToLog(
          "ACCESS DENIED. Indefinite residency requires active reputation data (Complete previous quest steps).",
        );
      }
    } else if (action === "Manage Residence") {
      addToLog("Managing Safehouse Inventory... System ready.");
      const furniture = gameState.inventory.filter(
        (i) => i.type === "furniture" || i.type === "utility",
      );
      if (furniture.length > 0) {
        addToLog(`Active Systems: ${furniture.map((f) => f.name).join(", ")}.`);
      } else {
        addToLog(
          "Residence is currently at baseline. Acquire furniture to unlock new interactions.",
        );
      }
    } else if (action.includes("(1500cr)")) {
      if (gameState.credits >= 1500) {
        setGameState((prev) => {
          let repKey: "empire" | "hutt" | "guild" | "rebellion" = "empire";
          let successLog = "";
          let amount = 25;

          if (action.includes("Imperial Fines")) {
            repKey = "empire";
            successLog =
              "You bribed the records clerk and paid off your 1500cr Imperial fines. Transgressions cleared.";
            amount = Math.max(0, 50 - (prev.reputation.empire || 0)); // pushes neg up to 0, or gives +25 if already near
          } else if (action.includes("Hutt")) {
            repKey = "hutt";
            successLog =
              "You paid a Hutt Enforcer 1500cr. They will forget about your 'mistakes'... for now.";
            amount = Math.max(0, 50 - (prev.reputation.hutt || 0));
          } else if (action.includes("Guild")) {
            repKey = "guild";
            successLog =
              "You submitted a 1500cr donation to the Guild Master. Your standing has improved significantly.";
          } else if (action.includes("Rebellion")) {
            repKey = "rebellion";
            successLog =
              "You funneled 1500cr of supplies to the Rebel Alliance. They are grateful for your support.";
          }

          if (amount < 25) amount = 25; // Guarantee at least +25

          return {
            ...prev,
            credits: prev.credits - 1500,
            reputation: {
              ...prev.reputation,
              [repKey]: (prev.reputation[repKey] || 0) + amount,
            },
          };
        });

        let msg = "";
        if (action.includes("Imperial Fines"))
          msg =
            "You bribed the records clerk and paid off your 1500cr Imperial fines.";
        else if (action.includes("Hutt"))
          msg =
            "You paid a Hutt Enforcer 1500cr. They will forget about your 'mistakes'... for now.";
        else if (action.includes("Guild"))
          msg =
            "You submitted a 1500cr donation to the Guild Master. Your standing has improved significantly.";
        else if (action.includes("Rebellion"))
          msg =
            "You funneled 1500cr of supplies to the Rebel Alliance. They are grateful for your support.";

        addToLog(`Payment Confirmed. ${msg}`);
      } else {
        addToLog(
          `Insufficient credits. You need 1500cr to perform this action.`,
        );
      }
    }
  };

  const handleSearch = (searchableId: string) => {
    const target = locSearchables.find((s) => s.id === searchableId);
    if (!target) return;

    // Check if already looted/unlocked
    if ((gameState.lootedContainers || []).includes(searchableId)) {
      addToLog("Empty.");
      return;
    }

    // Check requirements
    if (target.reqQuestState) {
      const quest = gameState.quests.find(
        (q) => q.id === target.reqQuestState!.id,
      );
      if (!quest || quest.currentStepIndex < target.reqQuestState.step) {
        addToLog("You don't see anything of interest yet.");
        return;
      }
    }

    if (target.locked && !gameState.unlockedContainers.includes(searchableId)) {
      const hasSlicerSpike = gameState.inventory.some(
        (i) => i.id === "slicer_spike",
      );
      if (!hasSlicerSpike) {
        addToLog(
          `Access Denied: ${target.label} is locked. You need a Slicer Spike to bypass the security.`,
        );
        return;
      }
      setSlicingTarget(searchableId);
      setActiveMinigame("slicing");
      return;
    }

    // Success
    addToLog(target.description);

    const hasScavenger =
      gameState.stats?.unlockedSkillIds.includes("scavenger");
    const scavBonus = hasScavenger ? Math.floor(Math.random() * 20) + 10 : 0;

    setGameState((prev) => {
      let newState = { ...prev };
      if (target.credits) newState.credits += target.credits + scavBonus;
      if (scavBonus > 0)
        addToLog(
          `[SCAVENGER] Found an extra ${scavBonus} credits in the debris.`,
        );
      return addXp(newState, target.locked ? 20 : 5).state;
    });

    if (target.item) {
      const itemObj = ITEM_DATABASE.find((i) => i.id === target.item);
      if (itemObj) {
        setGameState((prev) => ({
          ...prev,
          inventory: [...prev.inventory, itemObj],
        }));
        addToLog(`Found: ${itemObj.name}`);
      }
    }

    // Quest Updates
    if (target.questUpdate) {
      setGameState((prev) => ({
        ...prev,
        quests: prev.quests.map((q) => {
          if (q.id === target.questUpdate!.id) {
            const updatedQ = {
              ...q,
              currentStepIndex: target.questUpdate!.step,
            };
            if (target.questComplete) {
              updatedQ.status = "completed";
              // Mark all steps as complete
              updatedQ.steps = updatedQ.steps.map((s) => ({
                ...s,
                completed: true,
              }));
            }
            return updatedQ;
          }
          return q;
        }),
      }));
      addToLog("Quest Updated.");
      if (target.questComplete) addToLog(`Quest Completed: ${target.id}`);
    }

    if (target.startQuest) {
      setGameState((prev) => ({
        ...prev,
        quests: prev.quests.map((q) =>
          q.id === target.startQuest
            ? { ...q, status: "active", currentStepIndex: 1 }
            : q,
        ),
      }));
      const quest = gameState.quests.find((q) => q.id === target.startQuest);
      addToLog(`New Quest: ${quest?.title || "Unknown Protocol"}`);
    }

    setGameState((prev) => ({
      ...prev,
      lootedContainers: [...(prev.lootedContainers || []), searchableId],
    }));
  };

  // --- DIALOGUE ---

  const startDialogue = (npcId: string) => {
    const npc = NPC_DATABASE[npcId];
    if (!npc) return;
    setCurrentNpcId(npcId);

    // Handle aggressive NPCs or special conditions
    if (npcId === "stormtrooper" && Math.random() < 0.1) {
      addToLog("The Stormtrooper loses patience and draws his blaster!");
      startCombat("thug"); // Using thug stats for a random trooper combat
      return;
    }

    // Determine greeting based on conditions
    let greetingId =
      isNight && npc.nightGreetingId ? npc.nightGreetingId : npc.greetingId;

    if (npc.conditionalGreetings) {
      for (const cond of npc.conditionalGreetings) {
        let match = true;

        if (cond.reqQuestState) {
          const quest = gameState.quests.find(
            (q) => q.id === cond.reqQuestState.id,
          );
          if (!quest) {
            match = false;
          } else {
            const stepMatch =
              cond.reqQuestState.step !== undefined
                ? quest.currentStepIndex === cond.reqQuestState.step
                : true;
            const completionMatch =
              cond.reqQuestState.completed !== undefined
                ? (quest.status === "completed") ===
                  cond.reqQuestState.completed
                : true;
            if (!stepMatch || !completionMatch) match = false;
          }
        }

        if (match && cond.reqReputation) {
          const rep = gameState.reputation[cond.reqReputation.id] || 0;
          if (rep < cond.reqReputation.min) match = false;
        }

        if (match && cond.reqItem) {
          const hasItem = gameState.inventory.some(
            (i) => i.id === cond.reqItem && i.count > 0,
          );
          if (!hasItem) match = false;
        }

        if (match && cond.reqRace) {
          if (gameState.stats?.race?.id !== cond.reqRace) match = false;
        }

        if (match && cond.reqBackgroundContains) {
          if (
            !gameState.stats?.background
              ?.toLowerCase()
              .includes(cond.reqBackgroundContains.toLowerCase())
          )
            match = false;
        }

        if (match) {
          greetingId = cond.greetingId;
          break;
        }
      }
    }

    setDialogueNode(npc.dialogueTree[greetingId]);
  };

  const startCombat = (enemyId: string) => {
    const enemy = ENEMIES[enemyId];
    if (enemy) {
      setCombatEnemy({ ...enemy });
      setEnemyHp(enemy.hp);
      setEnemyCooldown(0);
      setPlayerCooldown(50); // Start with half momentum
      addToLog(`[COMBAT] ENCOUNTER: ${enemy.name}`);
      addToLog(enemy.introText);
    }
  };

  const handleDialogueOption = (opt: any) => {
    if (opt.action) {
      // Create a proxy for gameState mutations
      const gameProxy = {
        credits: gameState.credits,
        gameState,
        setShopNpcId,
        setGameState,
        setCredits: (fn: any) =>
          setGameState((prev) => ({ ...prev, credits: fn(prev.credits) })),
        addToLog: addToLog,
        updateQuest: (qid: string, step: number) =>
          setGameState((prev) => ({
            ...prev,
            quests: prev.quests.map((q) =>
              q.id === qid ? { ...q, currentStepIndex: step } : q,
            ),
          })),
        completeQuest: (qid: string) =>
          setGameState((prev) => ({
            ...prev,
            quests: prev.quests.map((q) =>
              q.id === qid
                ? {
                    ...q,
                    status: "completed",
                    steps: q.steps.map((s) => ({ ...s, completed: true })),
                  }
                : q,
            ),
          })),
        setInventory: (fn: any) =>
          setGameState((prev) => ({ ...prev, inventory: fn(prev.inventory) })),
        setStats: (fn: any) =>
          setGameState((prev) => ({ ...prev, stats: fn(prev.stats) })),
        setQuests: (fn: any) =>
          setGameState((prev) => ({ ...prev, quests: fn(prev.quests) })),
        setDefeatedNpcs: (fn: any) =>
          setGameState((prev) => ({
            ...prev,
            defeatedNpcs: fn(prev.defeatedNpcs),
          })),
        updateReputation: (factionId: string, amount: number) =>
          setGameState((prev) => updateReputation(prev, factionId, amount)),
        startCombat: (enemyId: string) => startCombat(enemyId),
      };
      opt.action(gameProxy);
    }

    if (opt.nextId) {
      const npc = NPC_DATABASE[currentNpcId!];
      setDialogueNode(npc.dialogueTree[opt.nextId]);
    } else {
      setDialogueNode(null);
      setCurrentNpcId(null);
    }
  };

  // --- RENDER HELPERS ---

  const renderMinigame = () => {
    const hasLogicBuffer =
      gameState.stats?.unlockedSkillIds.includes("logic_buffer");
    const slicingBonus =
      (gameState.activeDroidId === "r2_unit" ? 0.3 : 0) +
      (hasLogicBuffer ? 0.2 : 0);

    if (activeMinigame === "slicing") {
      return (
        <SlicingGame
          difficulty="medium"
          bonus={slicingBonus}
          onClose={() => setActiveMinigame(null)}
          onWin={() => {
            setActiveMinigame(null);
            setGameState((prev) => {
              const newInv = [...prev.inventory];
              const spikeIdx = newInv.findIndex((i) => i.id === "slicer_spike");
              if (spikeIdx !== -1) {
                if (newInv[spikeIdx].count > 1) {
                  newInv[spikeIdx] = {
                    ...newInv[spikeIdx],
                    count: newInv[spikeIdx].count - 1,
                  };
                } else {
                  newInv.splice(spikeIdx, 1);
                }
              }
              const newState = {
                ...prev,
                inventory: newInv,
                unlockedContainers: [
                  ...prev.unlockedContainers,
                  slicingTarget!,
                ],
              };
              return addXp(newState, 25).state;
            });
            addToLog(
              "Access Granted. Slicer Spike consumed. Security systems bypassed.",
            );
            setTimeout(() => handleSearch(slicingTarget!), 0);
          }}
          onLose={() => {
            setActiveMinigame(null);
            addToLog("Slicing failed. Security lockout engaged.");
          }}
        />
      );
    }
    if (activeMinigame === "sabacc") {
      return (
        <SabaccGame
          betAmount={10}
          onClose={() => setActiveMinigame(null)}
          onFinish={(result, amount) => {
            setActiveMinigame(null);
            if (result === "win") {
              setGameState((prev) => {
                const newState = { ...prev, credits: prev.credits + amount };
                return addXp(newState, 15).state;
              });
              addToLog(`You won the hand! gained ${amount} credits.`);
            } else if (result === "lose") {
              setGameState((prev) => ({ ...prev, credits: prev.credits - 10 }));
              addToLog("You lost the hand.");
            } else {
              addToLog("Draw. Credits returned.");
            }
          }}
        />
      );
    }
    if (
      activeMinigame === "podracing_bet" ||
      activeMinigame === "podracing_tracker"
    ) {
      return (
        <Podracing
          gameState={gameState}
          mode={activeMinigame === "podracing_bet" ? "betting" : "tracker"}
          onClose={() => setActiveMinigame(null)}
          onBetPlaced={(driverId, amount, isMain, startTime) => {
            setGameState((prev) => ({
              ...prev,
              credits: prev.credits - amount,
              activeRace: {
                type: isMain ? "main" : "rookie",
                startTime: startTime,
                betDriverId: driverId,
                betAmount: amount,
                completed: false,
              },
            }));
          }}
          onRaceFinished={(winnerId, payout) => {
            setActiveMinigame(null);
            setGameState((prev) => ({
              ...prev,
              credits: prev.credits + payout,
              activeRace: { ...prev.activeRace!, completed: true },
            }));
            if (payout > 0) {
              addToLog(
                `RACE UPDATE: Your driver won! You received ${payout} credits.`,
              );
            } else {
              addToLog(`RACE UPDATE: Your driver lost. Better luck next time.`);
            }
          }}
        />
      );
    }
    if (activeMinigame === "shooting_range") {
      return (
        <TargetRange
          onClose={() => setActiveMinigame(null)}
          onFinish={(score, credits) => {
            setActiveMinigame(null);
            setGameState((prev) => {
              let newState = { ...prev, credits: prev.credits + credits };
              newState = addXp(newState, Math.floor(score / 5)).state;
              newState = updateReputation(newState, "guild", 1);
              return newState;
            });
            addToLog(
              `Training session concluded. Final Score: ${score}. Credits Synced: +${credits}.`,
            );
          }}
        />
      );
    }
    if (activeMinigame === "salvage") {
      return (
        <SalvageGame
          onClose={() => setActiveMinigame(null)}
          onFinish={(parts, credits) => {
            setActiveMinigame(null);
            setGameState((prev) => {
              let newState = { ...prev, credits: prev.credits + credits };
              newState = addXp(newState, parts * 20).state;
              return newState;
            });
            addToLog(
              `Salvage operation complete. ${parts} parts recovered. Credits Earned: +${credits}.`,
            );
            if (parts >= 4) {
              // Chance to find a random item
              const roll = Math.random();
              if (roll < 0.3) {
                const item = ITEM_DATABASE.find((i) => i.id === "2"); // Power Cell
                if (item) {
                  setGameState((prev) => ({
                    ...prev,
                    inventory: [...prev.inventory, { ...item, count: 1 }],
                  }));
                  addToLog(
                    "Bonus: You salvaged a functional Power Cell from the debris.",
                  );
                }
              }
            }
          }}
        />
      );
    }
    if (activeMinigame === "holonet") {
      return (
        <HoloNet
          onClose={() => setActiveMinigame(null)}
          onOpenTracker={() => {
            if (gameState.activeRace && !gameState.activeRace.completed) {
              setActiveMinigame("podracing_tracker");
            } else {
              addToLog(
                "SYSTEM: No live pro signals detected. Proceed to Arena for manual uplink.",
              );
            }
          }}
        />
      );
    }
    return null;
  };

  const handleUseItem = useCallback(
    (item: Item) => {
      if (item.type === "weapon") {
        const isEquipping = gameState.equippedWeaponId !== item.id;
        setGameState((prev) => ({
          ...prev,
          equippedWeaponId: isEquipping ? item.id : null,
        }));
        addToLog(`${isEquipping ? "Equipped" : "Unequipped"} ${item.name}.`);
        return;
      }

      if (item.type === "clothing") {
        const isEquipping = gameState.equippedClothingId !== item.id;
        setGameState((prev) => ({
          ...prev,
          equippedClothingId: isEquipping ? item.id : null,
        }));
        addToLog(`${isEquipping ? "Equipped" : "Unequipped"} ${item.name}.`);
        return;
      }

      if (item.type === "droid") {
        const isActivating = gameState.activeDroidId !== item.id;
        setGameState((prev) => ({
          ...prev,
          activeDroidId: isActivating ? item.id : null,
        }));
        addToLog(`${isActivating ? "Activated" : "Deactivated"} ${item.name}.`);
        return;
      }

      if (item.heal) {
        setGameState((prev) => {
          if (!prev.stats) return prev;
          const newHp = Math.min(
            prev.stats.maxHp,
            prev.stats.currentHp + item.heal!,
          );
          const newInv = prev.inventory
            .map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
            .filter((i) => i.count > 0);
          return {
            ...prev,
            stats: { ...prev.stats, currentHp: newHp },
            inventory: newInv,
          };
        });
        addToLog(`Used ${item.name}. Status: Recovered ${item.heal} HP.`);
      } else if (item.buffEffect) {
        setGameState((prev) => {
          if (!prev.stats) return prev;
          const { stat, value } = item.buffEffect!;
          const newStats = {
            ...prev.stats.stats,
            [stat]: prev.stats.stats[stat] + value,
          };
          const newInv = prev.inventory
            .map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
            .filter((i) => i.count > 0);
          return {
            ...prev,
            stats: { ...prev.stats, stats: newStats },
            inventory: newInv,
          };
        });
        addToLog(
          `Used ${item.name}. Effect: +${item.buffEffect.value} ${item.buffEffect.stat.toUpperCase()} applied.`,
        );
      } else if (item.repModifier) {
        setGameState((prev) => {
          let newState = { ...prev };
          Object.entries(item.repModifier!).forEach(([faction, amount]) => {
            newState = updateReputation(newState, faction, amount);
          });
          const newInv = prev.inventory
            .map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
            .filter((i) => i.count > 0);
          newState.inventory = newInv;
          return newState;
        });
        addToLog(`Processed ${item.name}. Faction recognition updated.`);
      } else if (item.service === "buff_provider") {
        const now = Date.now();
        if (!item.lastUsedAt || now - item.lastUsedAt > 12 * 3600 * 1000) {
          if (item.buffEffect && gameState.stats) {
            const { stat, value } = item.buffEffect;
            setGameState((prev) => {
              if (!prev.stats) return prev;
              const newStats = {
                ...prev.stats.stats,
                [stat]: prev.stats.stats[stat] + value,
              };
              const newInv = prev.inventory.map((i) =>
                i.id === item.id ? { ...i, lastUsedAt: now } : i,
              );
              return {
                ...prev,
                stats: { ...prev.stats, stats: newStats },
                inventory: newInv,
              };
            });
            addToLog(
              `Acquired ${item.name} support. ${stat.toUpperCase()} enhanced.`,
            );
          }
        } else {
          addToLog(
            `Coolant levels normalizing. Service available in ${Math.ceil((12 * 3600 * 1000 - (now - item.lastUsedAt)) / 3600000)} hours.`,
          );
        }
      } else {
        addToLog(`Cannot use ${item.name} in current state.`);
      }
    },
    [
      gameState.equippedWeaponId,
      gameState.equippedClothingId,
      gameState.activeDroidId,
      gameState.stats,
      addToLog,
      updateReputation,
    ],
  );

  const handleCombatUseItem = (item: Item) => {
    if (item.heal) {
      setGameState((prev) => {
        if (!prev.stats) return prev;
        const newHp = Math.min(
          prev.stats.maxHp,
          prev.stats.currentHp + item.heal!,
        );
        const newInv = prev.inventory
          .map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
          .filter((i) => i.count > 0);
        return {
          ...prev,
          stats: { ...prev.stats, currentHp: newHp },
          inventory: newInv,
        };
      });
      addToLog(`[COMBAT] Used ${item.name}. Healed for ${item.heal}.`);
      setPlayerCooldown((prev) => Math.max(0, prev - 30));
    }
  };

  const isGreedoUnlocked = gameState.quests.some(
    (q) => q.id === "q2" && (q.status === "active" || q.status === "completed"),
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      {showAmbushCinematic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-black border border-red-900/50 rounded-xl p-6 md:p-10 max-w-lg w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.2)]"
          >
            <h2 className="text-3xl font-sans font-bold text-red-600 uppercase tracking-widest mb-6">Ambush!</h2>
            <div className="space-y-4 text-red-100/80 font-mono text-sm md:text-base mb-8">
              <p>As you step out of the safehouse, two massive Gamorrean Guards ambush you from the shadows!</p>
              <p>Before you can draw your weapon, a heavy blow strikes the back of your head.</p>
              <p>You black out...</p>
              <p className="text-cyan-400 mt-6 block">You awaken groggy on a cold stone floor in Jabba's Palace.</p>
            </div>
            <button
              onClick={() => {
                setShowAmbushCinematic(false);
                setCurrentNpcId("bib_fortuna");
                setDialogueNode(NPC_DATABASE["bib_fortuna"].dialogueTree["ambush_intro"]);
              }}
              className="px-8 py-3 bg-red-900/20 text-red-500 border border-red-900/50 rounded hover:bg-red-900/40 hover:text-red-400 uppercase tracking-widest font-bold transition-all"
            >
              Wake Up
            </button>
          </motion.div>
        </div>
      )}
      {showDailyRewards && (
        <DailyRewards
          gameState={gameState}
          onClose={() => setShowDailyRewards(false)}
          onClaimed={(credits, item, newStreak) => {
            setGameState((prev) => {
              const newInv = item
                ? [...prev.inventory, { ...item, count: 1 }]
                : prev.inventory;
              return {
                ...prev,
                credits: prev.credits + credits,
                inventory: newInv,
                dailyStreak: newStreak,
                lastDailyRewardClaimDate: new Date().toDateString(),
              };
            });
            addToLog(
              `[REWARD] Claimed daily login reward: ${credits} credits${item ? ` and ${item.name}` : ""}.`,
            );
            setShowDailyRewards(false);
          }}
        />
      )}
      {renderMinigame()}

      {isCharacterSheetOpen && (
        <CharacterSheet
          gameState={gameState}
          onClose={() => setIsCharacterSheetOpen(false)}
          onUpdateStats={(newStats, remainingPoints) => {
            setGameState((prev) => {
              if (!prev.stats) return prev;
              const bonusHp = prev.stats.unlockedSkillIds.includes("toughness")
                ? 10
                : 0;
              const maxHp = 20 + newStats.end * 2 + bonusHp;
              return {
                ...prev,
                stats: {
                  ...prev.stats,
                  stats: newStats,
                  skillPoints: remainingPoints,
                  maxHp,
                  currentHp: Math.min(prev.stats.currentHp, maxHp),
                },
              };
            });
            addToLog("Bio-metrics updated. Neural interface re-calibrated.");
          }}
          onUnlockSkill={(skillId, cost) => {
            setGameState((prev) => {
              if (!prev.stats) return prev;
              const newUnlocked = [...prev.stats.unlockedSkillIds, skillId];
              let newMaxHp = prev.stats.maxHp;
              if (skillId === "toughness") newMaxHp += 10;

              return {
                ...prev,
                stats: {
                  ...prev.stats,
                  skillPoints: prev.stats.skillPoints - cost,
                  unlockedSkillIds: newUnlocked,
                  maxHp: newMaxHp,
                  currentHp:
                    skillId === "toughness"
                      ? prev.stats.currentHp + 10
                      : prev.stats.currentHp,
                },
                history: [
                  ...(prev.history || []),
                  `UNLOCKED SKILL: ${SKILL_TREE.find((s) => s.id === skillId)?.name}`,
                ],
              };
            });
            addToLog(
              `Skill Acquisition successful: ${SKILL_TREE.find((s) => s.id === skillId)?.name}`,
            );
          }}
          onUnlockPerk={(perkId) => {
            // Perks are level based - for now we'll just track if user wants to select them if we had a cap
          }}
        />
      )}

      {/* BACKGROUND SCANLINE & NOISE */}
      <div className="scanline opacity-20 pointer-events-none" />
      <div className="moving-scanline opacity-5" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      {/* TOP HUD - STATS BAR */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="h-auto md:h-16 py-3 md:py-0 border-b border-cyan-900/80 bg-black/90 backdrop-blur-md flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-6 z-30 shadow-[0_5px_30px_rgba(0,0,0,0.8)] gap-4"
      >
        {/* Left Section: Identity & Level */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setIsCharacterSheetOpen(true)}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center relative overflow-hidden shadow-inner hidden sm:flex">
              <span className="text-cyan-500 font-title text-lg group-hover:scale-110 transition-transform tracking-tighter">
                {gameState.stats?.name.substring(0, 2).toUpperCase()}
              </span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500 opacity-80"></div>
            </div>
            <div className="flex flex-col text-left justify-center pb-0.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-title text-sm md:text-base tracking-wide uppercase group-hover:text-cyan-400 transition-colors leading-none">
                  {gameState.stats?.name}
                </span>
                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 font-bold text-[8px] rounded-[3px] uppercase border border-yellow-500/30 leading-none shadow-[0_0_8px_rgba(234,179,8,0.2)]">
                  LVL {gameState.stats?.level}
                </span>
              </div>
              <span className="text-[9px] text-cyan-600 font-display tracking-widest uppercase leading-none">
                {gameState.stats?.charClass?.name || "Unknown"}
              </span>
            </div>
          </button>
        </div>

        {/* Center Section: Core Bars (HP & XP) */}
        <div className="flex-1 flex flex-row items-center justify-center gap-4 md:gap-8 w-full md:w-auto order-last md:order-none">
          <div className="flex flex-col flex-1 max-w-[150px] md:max-w-[200px]">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[7px] text-cyan-600 uppercase tracking-widest leading-none">
                Vitality
              </span>
              <span
                className={cn(
                  "font-mono text-[9px] leading-none",
                  (gameState.stats?.currentHp || 0) < 10
                    ? "text-red-500"
                    : "text-green-400",
                )}
              >
                {gameState.stats?.currentHp || 0} /{" "}
                {gameState.stats?.maxHp || 100}
              </span>
            </div>
            <div className="h-1 md:h-1.5 bg-black/80 rounded-full overflow-hidden border border-cyan-900/50">
              <motion.div
                animate={{
                  width: `${((gameState.stats?.currentHp || 0) / (gameState.stats?.maxHp || 100)) * 100}%`,
                }}
                className={cn(
                  "h-full",
                  (gameState.stats?.currentHp || 0) < 10
                    ? "bg-red-500 shadow-[0_0_10px_red]"
                    : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
                )}
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 max-w-[150px] md:max-w-[200px]">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[7px] text-cyan-600 uppercase tracking-widest leading-none">
                Experience
              </span>
              <span className="text-[9px] font-mono text-white/40 leading-none">
                {gameState.stats?.xp} / {gameState.stats?.xpToNextLevel}
              </span>
            </div>
            <div className="h-1 md:h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/10">
              <motion.div
                animate={{
                  width: `${((gameState.stats?.xp || 0) / (gameState.stats?.xpToNextLevel || 1)) * 100}%`,
                }}
                className="h-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Resources & Actions */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0 justify-end">
          {gameState.activeSlicingTask && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-950/40 border border-red-500/40 backdrop-blur-md rounded-[4px] animate-pulse shrink-0">
              <Zap className="text-red-500" size={10} />
              <span className="text-[8px] text-red-300 font-mono tracking-tighter uppercase whitespace-nowrap leading-none mt-[1px]">
                SLICING:{" "}
                {Math.max(
                  0,
                  Math.ceil(
                    gameState.activeSlicingTask.duration -
                      (realTime.getTime() -
                        gameState.activeSlicingTask.startTime) /
                        1000,
                  ),
                )}
                s
              </span>
            </div>
          )}

          <div className="hidden xl:flex items-center gap-4 text-[9px] font-mono border-r border-cyan-900/50 pr-5 mr-1 mb-0.5">
            <span className="text-cyan-700">
              STR
              <span className="text-white ml-1.5">
                {gameState.stats?.stats.str}
              </span>
            </span>
            <span className="text-cyan-700">
              INT
              <span className="text-white ml-1.5">
                {gameState.stats?.stats.int}
              </span>
            </span>
            <span className="text-cyan-700">
              CHA
              <span className="text-white ml-1.5">
                {gameState.stats?.stats.cha}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-0.5 bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/20">
            <Coins size={12} className="text-yellow-500/80" />
            <span className="font-title text-[13px] text-yellow-400 font-medium tracking-wide">
              {gameState.credits}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-0.5 text-cyan-500">
            <Clock size={12} className="opacity-60" />
            <span className="text-[11px] font-mono tracking-widest mt-[1px]">
              {realTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 md:pl-4 border-l border-cyan-900/50">
            <button
              onClick={toggleFullScreen}
              className="p-1.5 bg-black border border-cyan-900/50 rounded-[4px] text-cyan-700 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? <Minimize size={13} /> : <Maximize size={13} />}
            </button>

            <button
              onClick={onSave}
              className="p-1.5 bg-black border border-cyan-900/50 rounded-[4px] text-cyan-700 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
              title="Save Game"
            >
              <Save size={13} />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 bg-cyan-950/40 border border-cyan-800 rounded-[4px] text-cyan-400 hover:bg-cyan-900/80 transition-colors relative"
            >
              {isMobileMenuOpen ? <X size={15} /> : <Backpack size={15} />}
              {gameState.inventory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-black"></span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
        {/* VIEWPORT (30% height) */}
        <div className="h-[30%] min-h-[220px] bg-slate-900 overflow-hidden relative shrink-0 border-b-2 border-cyan-500/10 box-border group">
          <AnimatePresence mode="wait">
            {isTraveling ? (
              <motion.div
                key="travel-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-32 h-32 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Navigation
                      className="text-cyan-400 animate-pulse"
                      size={40}
                    />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-title text-cyan-400 tracking-[0.5em] uppercase animate-flicker">
                    Traveling...
                  </h2>
                  <p className="text-[10px] font-display text-cyan-800 uppercase tracking-widest italic">
                    {locations[gameState.currentLocationId]?.sector ||
                      "Tatooine"}{" "}
                    —&gt; {locations[travelTo!]?.sector || "Deep Desert"}
                  </p>
                </div>
                <div className="moving-scanline opacity-20" />
              </motion.div>
            ) : null}
            {combatEnemy ? (
              <Combat
                type="viewport"
                gameState={gameState}
                enemy={combatEnemy}
                enemyHp={enemyHp}
                playerCooldown={playerCooldown}
                enemyCooldown={enemyCooldown}
                onAttack={handlePlayerAttack}
                onUseItem={handleCombatUseItem}
                onFlee={() => setCombatEnemy(null)}
              />
            ) : (
              <motion.img
                key={locImg}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.7 }}
                src={locImg}
                alt={locName}
                className="w-full h-full object-cover"
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

          {/* Location Badge */}
          <div className="absolute top-2 left-4 md:top-4 md:left-6 flex items-center gap-3">
            <div className="p-1 px-2 bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded text-cyan-400">
              <Globe size={10} className="inline mr-1" />
              <span className="text-[8px] md:text-[10px] uppercase font-display tracking-widest">
                Sector:{" "}
                {currentLocation.sector ||
                  (gameState.isNight ? "Sector Shadow" : "Sector Light")}
              </span>
            </div>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-2 left-4 md:bottom-4 md:left-8 flex flex-col">
            <h1 className="text-2xl md:text-4xl font-title text-white uppercase tracking-tighter glow-cyan leading-none mb-0.5">
              {locName}
            </h1>
            <p className="max-w-xl text-[8px] md:text-[10px] text-cyan-200/60 font-display italic tracking-wide">
              {locDesc}
            </p>
          </div>
        </div>

        {/* LOGS / NPC DIALOGUE (20% height) */}
        <div className="h-[20%] min-h-0 bg-black/40 flex flex-col p-3 md:p-4 border-b-2 border-cyan-500/10 relative shrink-0 overflow-hidden box-border">
          <div
            className="flex-1 overflow-y-auto no-scrollbar pr-4 space-y-3"
            ref={scrollRef}
          >
            <AnimatePresence mode="wait">
              {dialogueNode ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={currentNpcId}
                  className="flex flex-col border-l-4 border-yellow-500 p-4 bg-yellow-500/5 rounded-r-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-yellow-500 font-title uppercase tracking-[0.3em] text-[10px]">
                      <MessageSquare size={14} />
                      <span>
                        Communication Link: {NPC_DATABASE[currentNpcId!].name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setDialogueNode(null);
                        setCurrentNpcId(null);
                      }}
                      className="text-[8px] font-title text-yellow-900 hover:text-yellow-500 uppercase tracking-widest transition-colors"
                    >
                      [Terminate Link]
                    </button>
                  </div>
                  <div className="flex gap-4 items-start">
                    {NPC_DATABASE[currentNpcId!].imageUrl && (
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden border border-yellow-500/30 shrink-0 bg-black shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                        <img
                          src={NPC_DATABASE[currentNpcId!].imageUrl}
                          alt={NPC_DATABASE[currentNpcId!].name}
                          className="w-full h-full object-cover grayscale brightness-75 contrast-125"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="text-white text-sm md:text-lg leading-relaxed italic font-display animate-flicker flex-1">
                      {(() => {
                        const npc = NPC_DATABASE[currentNpcId!];
                        const needsTranslation =
                          npc.language &&
                          gameState.activeDroidId !== "protocol_droid";
                        const displayText = needsTranslation
                          ? scrambleText(dialogueNode.text)
                          : dialogueNode.text;
                        return (
                          <div
                            className={cn(
                              needsTranslation &&
                                "font-mono text-cyan-500 bg-cyan-950/20 p-2 rounded",
                            )}
                          >
                            <Typewriter
                              text={`"${displayText}"`}
                              textKey={displayText}
                              onUpdate={scrollToBottom}
                            />
                            {needsTranslation && (
                              <p className="text-[10px] text-red-500 uppercase mt-2 not-italic font-bold tracking-widest">
                                [TRANSLATION MODULE REQUIRED]
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2 min-h-full">
                  {gameState.history.map((line, i) => (
                    <motion.div
                      initial={
                        i === gameState.history.length - 1
                          ? { opacity: 0, x: -10 }
                          : {}
                      }
                      animate={{ opacity: 1, x: 0 }}
                      key={`${i}-${logKey}`}
                      className={cn(
                        "break-words leading-relaxed p-2 px-3 rounded-lg border-l-2 font-mono text-xs md:text-sm",
                        line.startsWith(">")
                          ? "text-cyan-600 italic border-cyan-900/30 bg-cyan-950/5"
                          : line.startsWith("[COMBAT]")
                            ? "text-red-400 border-red-500 bg-red-950/20"
                            : line.startsWith("System")
                              ? "text-yellow-400 border-yellow-900 bg-yellow-900/10 text-[10px] font-bold uppercase tracking-widest"
                              : "text-gray-300 border-cyan-500/20 bg-white/5",
                      )}
                    >
                      {i === gameState.history.length - 1 ? (
                        <Typewriter text={line} textKey={logKey} onUpdate={scrollToBottom} />
                      ) : (
                        line
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* TACTICAL CONSOLE (50% height) */}
        <div className="h-[50%] min-h-0 bg-black/60 flex flex-col md:flex-row overflow-hidden shrink-0 border-b-2 border-cyan-500/5 box-border">
          <AnimatePresence mode="wait">
            {combatEnemy ? (
              <Combat
                type="console"
                gameState={gameState}
                enemy={combatEnemy}
                enemyHp={enemyHp}
                playerCooldown={playerCooldown}
                enemyCooldown={enemyCooldown}
                onAttack={handlePlayerAttack}
                onUseItem={handleCombatUseItem}
                onFlee={() => setCombatEnemy(null)}
              />
            ) : dialogueNode ? (
              <motion.div
                key="dialogue-options"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare size={16} className="text-yellow-500" />
                  <h2 className="text-[10px] font-title text-yellow-500 tracking-[0.4em] uppercase">
                    Dialogue Protocols
                  </h2>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto no-scrollbar pr-2">
                  {dialogueNode.options.map((opt, idx) => {
                    if (
                      opt.reqSkill &&
                      gameState.stats &&
                      (gameState.stats.stats[opt.reqSkill] || 0) <
                        (opt.reqVal || 0)
                    )
                      return null;
                    if (
                      opt.reqItem &&
                      !gameState.inventory.find((i) => i.id === opt.reqItem)
                    )
                      return null;
                    if (opt.reqQuestState) {
                      const q = gameState.quests.find(
                        (q) => q.id === opt.reqQuestState!.id,
                      );
                      if (!q || q.currentStepIndex !== opt.reqQuestState!.step)
                        return null;
                    }
                    if (opt.reqCredits && gameState.credits < opt.reqCredits)
                      return null;
                    if (
                      opt.reqRace &&
                      gameState.stats?.race?.id !== opt.reqRace
                    ) {
                      return null;
                    }
                    if (
                      opt.reqBackgroundContains &&
                      !gameState.stats?.background
                        ?.toLowerCase()
                        .includes(opt.reqBackgroundContains.toLowerCase())
                    ) {
                      return null;
                    }
                    if (opt.reqReputation) {
                      const rep =
                        gameState.reputation[opt.reqReputation.id] || 0;
                      if (rep < opt.reqReputation.min) return null;
                    }
                    if (
                      opt.reqTime &&
                      ((opt.reqTime === "day" && isNight) ||
                        (opt.reqTime === "night" && !isNight))
                    )
                      return null;

                    return (
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(234, 179, 8, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        key={idx}
                        onClick={() => handleDialogueOption(opt)}
                        className="text-left text-cyan-400 hover:text-yellow-400 p-4 rounded-xl transition-all border border-cyan-900/30 hover:border-yellow-500/50 flex items-center justify-between bg-black/40 group h-fit relative overflow-hidden"
                      >
                        <div className="flex flex-col gap-1">
                          {opt.reqSkill && (
                            <span className="text-[7px] text-yellow-500 font-bold uppercase tracking-widest bg-yellow-500/10 px-1 w-fit rounded leading-tight mb-1">
                              {opt.reqSkill} [{opt.reqVal}+] CHECK
                            </span>
                          )}
                          {opt.reqRace && (
                            <span className="text-[7px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 px-1 w-fit rounded leading-tight mb-1">
                              [ SPECIES: {opt.reqRace} ]
                            </span>
                          )}
                          {opt.reqBackgroundContains && (
                            <span className="text-[7px] text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-1 w-fit rounded leading-tight mb-1">
                              [ ORIGIN KNOWN ]
                            </span>
                          )}
                          <span className="uppercase font-display text-sm tracking-wide">
                            {opt.label}
                          </span>
                        </div>
                        <ArrowRightCircle
                          size={18}
                          className="text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="nav-systems"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col md:flex-row overflow-hidden"
              >
                {/* NAVIGATION SECTION */}
                <div className="flex-1 p-4 md:p-6 flex flex-col border-r-2 border-cyan-500/10 overflow-hidden box-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <History size={16} className="text-indigo-400" />
                      <h2 className="text-[10px] font-title text-indigo-400 tracking-[0.4em] uppercase">
                        Tactical Navigation
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowSectorMap(!showSectorMap)}
                      className="p-1 px-2 border border-cyan-500/30 rounded text-[8px] font-title uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                      {showSectorMap ? "Back to Exits" : "Sector Map"}
                    </button>
                  </div>
                  <div
                    className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4"
                    ref={navScrollRef}
                  >
                    {showSectorMap ? (
                      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {Object.entries(
                          Object.values(locations).reduce(
                            (acc: Record<string, any[]>, loc: any) => {
                              if (loc.sector) {
                                if (!acc[loc.sector]) acc[loc.sector] = [];
                                acc[loc.sector].push(loc);
                              }
                              return acc;
                            },
                            {} as Record<string, any[]>,
                          ),
                        ).map(([sectorName, locs]) => {
                          const isCurrent =
                            currentLocation.sector === sectorName;
                          return (
                            <div
                              key={sectorName}
                              className={cn(
                                "p-3 rounded-lg border transition-all",
                                isCurrent
                                  ? "bg-cyan-500/10 border-cyan-500/50 shadow-cyan"
                                  : "bg-white/5 border-white/10",
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Globe
                                    size={10}
                                    className={
                                      isCurrent
                                        ? "text-cyan-400"
                                        : "text-gray-500"
                                    }
                                  />
                                  <h3
                                    className={cn(
                                      "text-[10px] font-title uppercase tracking-widest",
                                      isCurrent
                                        ? "text-cyan-400"
                                        : "text-gray-400",
                                    )}
                                  >
                                    {sectorName}
                                  </h3>
                                </div>
                                {isCurrent && (
                                  <span className="text-[8px] bg-cyan-500 text-black px-1 rounded font-bold">
                                    CURRENT SECTOR
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {locs.map((l) => (
                                  <div
                                    key={l.id}
                                    className={cn(
                                      "text-[8px] px-1.5 py-0.5 border rounded font-display",
                                      l.id === gameState.currentLocationId
                                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                                        : "bg-black/40 border-white/5 text-gray-500",
                                    )}
                                  >
                                    {l.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        <div className="p-3 rounded-lg border border-white/5 bg-black/20 opacity-40 grayscale">
                          <div className="flex items-center gap-2 mb-2">
                            <Ship size={10} className="text-gray-500" />
                            <h3 className="text-[10px] font-title uppercase tracking-widest text-gray-500">
                              Outer Rim Reach
                            </h3>
                          </div>
                          <p className="text-[8px] font-display text-gray-600 italic">
                            No hyperspace coordinates available for this sector.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {locExits
                            .filter((exitId) => {
                              // Special rule: Must talk to Kaelen before leaving garage
                              if (
                                gameState.currentLocationId === "swoop_garage" &&
                                exitId === "mos_eisley_old_quarter"
                              ) {
                                const q = gameState.quests.find(
                                  (q) => q.id === "q2",
                                );
                                if (q && q.currentStepIndex === 2) return false;
                              }

                              const loc = locations[exitId];
                              if (!loc) return false;
                              if (!loc.hideIfLocked) return true;

                              let isLocked = false;
                              if (loc.reqQuestState) {
                                const q = gameState.quests.find(
                                  (q) => q.id === loc.reqQuestState!.id,
                                );
                                const met = loc.reqQuestState.completed
                                  ? q?.status === "completed"
                                  : q &&
                                    (q.status === "completed" ||
                                      q.currentStepIndex >=
                                        loc.reqQuestState.step);
                                if (!met) isLocked = true;
                              }
                              if (
                                loc.reqItem &&
                                !gameState.inventory.find(
                                  (i) => i.id === loc.reqItem,
                                )
                              )
                                isLocked = true;

                              return !isLocked;
                            })
                            .map((exitId) => {
                              const loc = locations[exitId];
                              if (!loc) return null;

                              let isLocked = false;
                              if (loc.reqQuestState) {
                                const q = gameState.quests.find(
                                  (q) => q.id === loc.reqQuestState!.id,
                                );
                                const met = loc.reqQuestState.completed
                                  ? q?.status === "completed"
                                  : q &&
                                    (q.status === "completed" ||
                                      q.currentStepIndex >=
                                        loc.reqQuestState.step);
                                if (!met) isLocked = true;
                              }
                              if (
                                loc.reqItem &&
                                !gameState.inventory.find(
                                  (i) => i.id === loc.reqItem,
                                )
                              )
                                isLocked = true;

                              return (
                                <button
                                  key={exitId}
                                  onClick={() => handleMove(exitId)}
                                  className={cn(
                                    "group relative flex items-center justify-between p-3 px-4 rounded-xl border transition-all text-left h-fit",
                                    isLocked
                                      ? "border-red-900/30 bg-red-950/5 opacity-60 cursor-not-allowed"
                                      : "border-indigo-500/20 bg-black/40 hover:bg-indigo-500/10 hover:border-indigo-400",
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        "w-1 h-6 transition-colors rounded-full",
                                        isLocked
                                          ? "bg-red-900"
                                          : "bg-indigo-900 group-hover:bg-indigo-400",
                                      )}
                                    />
                                    <span
                                      className={cn(
                                        "font-title text-xs tracking-wide uppercase",
                                        isLocked
                                          ? "text-red-900"
                                          : "text-indigo-100",
                                      )}
                                    >
                                      {loc.name}
                                      {isLocked && (
                                        <span className="ml-2 text-[8px] font-mono opacity-50">
                                          [LOCKED]
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  {isLocked ? (
                                    <Skull
                                      size={14}
                                      className="text-red-900 ml-2"
                                    />
                                  ) : (
                                    <ArrowRightCircle
                                      size={16}
                                      className="text-indigo-900 group-hover:text-indigo-400 transition-all"
                                    />
                                  )}
                                </button>
                              );
                            })}
                        </div>

                        {/* INHABITANTS */}
                        {locNpcs.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[8px] text-gray-500 font-mono tracking-widest uppercase mb-1">
                              Local Signatures Detected
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {locNpcs
                                .filter((id) => {
                                  if (gameState.defeatedNpcs?.includes(id))
                                    return false;
                                  if (id === "greedo" && !isGreedoUnlocked)
                                    return false;

                                  // Gating Kaelen in Garage
                                  if (
                                    id === "kaelen" &&
                                    gameState.currentLocationId ===
                                      "swoop_garage" &&
                                    !gameState.defeatedNpcs?.includes("teemo")
                                  ) {
                                    return false;
                                  }

                                  const npc = NPC_DATABASE[id];
                                  const hour = realTime.getHours();
                                  if (npc?.onlyBetween) {
                                    const [start, end] = npc.onlyBetween;
                                    if (start < end) {
                                      if (hour < start || hour >= end)
                                        return false;
                                    } else {
                                      if (hour < start && hour >= end)
                                        return false;
                                    }
                                  }
                                  return true;
                                })
                                .map((npcId) => {
                                  const npc = NPC_DATABASE[npcId];
                                  return (
                                    <button
                                      key={npcId}
                                      onClick={() => startDialogue(npcId)}
                                      className={cn(
                                        "group relative flex items-center justify-between p-3 px-4 rounded-xl border transition-all text-left h-fit",
                                        currentNpcId === npcId
                                          ? "border-yellow-500 bg-yellow-500/20"
                                          : "border-cyan-500/20 bg-black/40 hover:bg-cyan-500/10 hover:border-cyan-400",
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <User
                                          size={14}
                                          className={
                                            currentNpcId === npcId
                                              ? "text-yellow-500"
                                              : "text-cyan-600"
                                          }
                                        />
                                        <span
                                          className={cn(
                                            "font-title text-xs tracking-wide uppercase",
                                            currentNpcId === npcId
                                              ? "text-yellow-100"
                                              : "text-cyan-100",
                                          )}
                                        >
                                          {npc.name}
                                        </span>
                                      </div>
                                      <MessageSquare
                                        size={16}
                                        className={
                                          currentNpcId === npcId
                                            ? "text-yellow-500"
                                            : "text-cyan-600 opacity-40 group-hover:opacity-100"
                                        }
                                      />
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* SYSTEMS SECTION */}
                <div className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden box-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap size={16} className="text-cyan-400" />
                    <h2 className="text-[10px] font-title text-cyan-400 tracking-[0.4em] uppercase">
                      Systems Interlink
                    </h2>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 no-scrollbar">
                    <div className="flex flex-wrap gap-2">
                      {locActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleAction(action)}
                          className="flex-1 min-w-[120px] flex items-center gap-2 p-2 px-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg text-cyan-400 font-display text-[10px] uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
                        >
                          {action.includes("Look") ? (
                            <Search size={12} />
                          ) : (
                            <Zap size={12} />
                          )}
                          {action}
                        </button>
                      ))}
                      {furnitureItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleFurnitureAction(item)}
                          className="flex-1 min-w-[120px] flex items-center gap-2 p-2 px-3 bg-yellow-950/20 border border-yellow-500/20 rounded-lg text-yellow-400 font-display text-[10px] uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
                        >
                          {item.service === "sabacc" && <Gamepad2 size={12} />}
                          {item.service === "podracing_live" && (
                            <Tv size={12} />
                          )}
                          {item.service === "buff_provider" && (
                            <Sparkles size={12} />
                          )}
                          {item.name}
                        </button>
                      ))}
                      {locSearchables
                        .filter(
                          (s) =>
                            !(gameState.lootedContainers || []).includes(s.id) ||
                            s.locked,
                        )
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleSearch(s.id)}
                            className={cn(
                              "flex-1 min-w-[120px] flex items-center gap-2 p-2 px-3 border rounded-lg font-display text-[10px] uppercase tracking-widest transition-all",
                              s.locked &&
                                !gameState.unlockedContainers.includes(s.id)
                                ? "bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black"
                                : "bg-cyan-950/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black",
                            )}
                          >
                            {s.locked &&
                            !gameState.unlockedContainers.includes(s.id) ? (
                              <X size={12} />
                            ) : (
                              <Search size={12} />
                            )}
                            {s.label}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {shopNpcId && (
          <Store
            npcId={shopNpcId}
            gameState={gameState}
            setGameState={setGameState}
            onClose={() => setShopNpcId(null)}
          />
        )}
      </AnimatePresence>

      {/* INVENTORY / QUESTS MODAL (Responsive Overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-950 border-2 border-cyan-500 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] shadow-[0_0_100px_rgba(6,182,212,0.2)]"
            >
              <div className="bg-cyan-500 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Backpack className="text-black" />
                  <h2 className="text-xl font-title text-black tracking-widest uppercase">
                    Cargo Bay 94
                  </h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-black hover:scale-110 transition-transform"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                <div>
                  <h3 className="text-cyan-500 font-display text-[10px] tracking-[0.4em] uppercase mb-4 border-b border-cyan-900 pb-2 flex justify-between items-center">
                    <span>Manifest Inventory</span>
                    <div className="flex gap-2 text-[10px] font-mono font-normal">
                      <select
                        className="bg-black text-cyan-400 border border-cyan-900/50 rounded px-1 outline-none"
                        value={invFilter}
                        onChange={(e) => setInvFilter(e.target.value as any)}
                      >
                        <option value="all">All</option>
                        <option value="weapon">Weapons</option>
                        <option value="clothing">Clothing</option>
                        <option value="droid">Droids</option>
                        <option value="consumable">Consumables</option>
                        <option value="misc">Misc</option>
                      </select>
                      <select
                        className="bg-black text-cyan-400 border border-cyan-900/50 rounded px-1 outline-none"
                        value={invSort}
                        onChange={(e) => setInvSort(e.target.value as any)}
                      >
                        <option value="A-Z">A-Z</option>
                        <option value="Z-A">Z-A</option>
                        <option value="High-Low">Qty</option>
                        <option value="Rarity">Rarity</option>
                      </select>
                    </div>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {gameState.inventory.length === 0 && (
                      <p className="text-gray-600 italic">No cargo found.</p>
                    )}
                    {gameState.inventory
                      .filter((i) =>
                        invFilter === "all" ? true : i.type === invFilter,
                      )
                      .sort((a, b) => {
                        if (invSort === "A-Z")
                          return a.name.localeCompare(b.name);
                        if (invSort === "Z-A")
                          return b.name.localeCompare(a.name);
                        if (invSort === "High-Low") return b.count - a.count;
                        if (invSort === "Rarity") {
                          const rVals: Record<string, number> = {
                            common: 0,
                            uncommon: 1,
                            rare: 2,
                            legendary: 3,
                          };
                          return (
                            (rVals[b.rarity] || 0) - (rVals[a.rarity] || 0)
                          );
                        }
                        return 0;
                      })
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-cyan-500/30 transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-title text-sm tracking-wide">
                                  {item.name}
                                </span>
                                <span
                                  className={cn(
                                    "text-[9px] uppercase px-1.5 py-0.5 rounded border leading-none font-bold",
                                    item.rarity === "legendary"
                                      ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
                                      : item.rarity === "rare"
                                        ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                                        : item.rarity === "uncommon"
                                          ? "border-green-500/50 text-green-400 bg-green-500/10"
                                          : "border-gray-500/50 text-gray-400 bg-gray-500/10",
                                  )}
                                >
                                  {item.rarity}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500 uppercase">
                                {item.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {item.type === "weapon" && (
                                <button
                                  onClick={() => handleUseItem(item)}
                                  className={cn(
                                    "px-3 py-1 text-[10px] font-title uppercase rounded-lg transition-all",
                                    gameState.equippedWeaponId === item.id
                                      ? "bg-yellow-500 text-black"
                                      : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black",
                                  )}
                                >
                                  {gameState.equippedWeaponId === item.id
                                    ? "Equipped"
                                    : "Equip"}
                                </button>
                              )}
                              {item.type === "clothing" && (
                                <button
                                  onClick={() => handleUseItem(item)}
                                  className={cn(
                                    "px-3 py-1 text-[10px] font-title uppercase rounded-lg transition-all",
                                    gameState.equippedClothingId === item.id
                                      ? "bg-cyan-500 text-black"
                                      : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black",
                                  )}
                                >
                                  {gameState.equippedClothingId === item.id
                                    ? "Equipped"
                                    : "Equip"}
                                </button>
                              )}
                              {item.type === "droid" && (
                                <button
                                  onClick={() => handleUseItem(item)}
                                  className={cn(
                                    "px-3 py-1 text-[10px] font-title uppercase rounded-lg transition-all",
                                    gameState.activeDroidId === item.id
                                      ? "bg-green-500 text-black"
                                      : "bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black",
                                  )}
                                >
                                  {gameState.activeDroidId === item.id
                                    ? "Active"
                                    : "Activate"}
                                </button>
                              )}
                              {(item.heal ||
                                item.repModifier ||
                                item.buffEffect ||
                                item.type === "consumable") && (
                                <button
                                  onClick={() => {
                                    handleUseItem(item);
                                  }}
                                  className="px-3 py-1 bg-white/10 text-white text-[10px] font-title uppercase rounded-lg hover:bg-white hover:text-black transition-all"
                                >
                                  Use
                                </button>
                              )}
                              {item.count > 1 && (
                                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono text-xs font-bold font-title">
                                  x{item.count}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-gray-400 italic mt-1 leading-snug">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-yellow-500 font-display text-[10px] tracking-[0.4em] uppercase mb-4 border-b border-yellow-900 pb-2">
                    Active Protocols
                  </h3>
                  <div className="space-y-4">
                    {gameState.quests.filter((q) => q.status === "active")
                      .length === 0 && (
                      <p className="text-gray-600 italic">Static connection.</p>
                    )}
                    {gameState.quests
                      .filter((q) => q.status === "active")
                      .map((q) => (
                        <div
                          key={q.id}
                          className="p-5 border-l-4 border-yellow-500 bg-yellow-500/5 rounded-r-2xl"
                        >
                          <div className="text-yellow-400 font-title text-sm uppercase tracking-widest mb-1">
                            {q.title}
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed font-display">
                            {q.steps[q.currentStepIndex].description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-red-500 font-display text-[10px] tracking-[0.4em] uppercase mb-4 border-b border-red-900 pb-2 flex justify-between">
                    <span>Active Contracts</span>
                    <span className="text-[8px] font-mono opacity-60">
                      DAILY ALLOWANCE:{" "}
                      {gameState.completedDailyContracts?.length || 0} / 3
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {gameState.activeContracts.length === 0 && (
                      <p className="text-gray-600 italic">
                        No bounties tracked.
                      </p>
                    )}
                    {gameState.activeContracts.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-5 border-l-4 border-red-500 bg-red-950/20 rounded-r-2xl relative overflow-hidden"
                      >
                        <div className="absolute right-2 top-2 opacity-10">
                          <Skull size={40} />
                        </div>
                        <div className="text-red-400 font-title text-sm uppercase tracking-widest mb-1 flex items-center justify-between">
                          <span>{c.title}</span>
                          <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded text-red-500 font-bold tracking-tighter">
                            {c.reward}c
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed font-display mb-2">
                          {c.description}
                        </p>
                        <div className="text-red-300/60 font-mono text-[9px] uppercase">
                          Last Known Location:{" "}
                          <span className="text-red-300 font-bold">
                            {c.targetLocation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADMIN TERMINAL */}
                <div className="pt-4 border-t border-cyan-900/40">
                  <h3 className="text-cyan-800 font-display text-[8px] tracking-[0.4em] uppercase mb-3">
                    System Access Console
                  </h3>
                  <form onSubmit={handleCheatSubmit} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-800">
                      USR&gt;
                    </span>
                    <input
                      type="text"
                      value={cheatCode}
                      onChange={(e) => setCheatCode(e.target.value)}
                      placeholder="ENTER OVERRIDE..."
                      className="w-full bg-black/40 border border-cyan-900/30 rounded-xl py-3 pl-16 pr-4 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 placeholder:text-cyan-900/20 uppercase"
                    />
                  </form>
                  <div className="mt-2 text-[7px] text-cyan-900/40 font-mono flex gap-3 uppercase">
                    <span>MOTHERLODE</span>
                    <span>REFILL</span>
                    <span>HEIST</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
