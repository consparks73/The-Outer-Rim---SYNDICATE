import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  StartScreen,
  OpeningCrawl,
  CharacterCreator,
} from "./components/Cinematics";
import { Dashboard } from "./components/Dashboard";
import { BackgroundAudioPlayer, FullscreenButton } from "./components/Shared";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { loadGame, saveGame } from "./utils";
import { initialLocations, initialQuests, AUDIO } from "./data";
import { SaveData, Character, Item, Quest } from "./types";

// Default State for new games
const DEFAULT_GAME_STATE: SaveData = {
  version: 2,
  currentLocationId: "mos_eisley_cantina",
  stats: null,
  inventory: [
    {
      id: "1",
      name: "Blaster Pistol",
      rarity: "rare",
      count: 1,
      type: "weapon",
      dmg: 8,
    },
  ],
  quests: initialQuests,
  credits: 100,
  isNight: false,
  visitedLocations: ["mos_eisley_cantina"],
  lootedContainers: [],
  unlockedContainers: [],
  lastStipendClaimDate: "",
  dailyStreak: 0,
  lastDailyRewardClaimDate: "",
  completedDailyContracts: [],
  history: [
    "System Initialized.",
    "Location: Tatooine, Outer Rim.",
    "Objective: Survive.",
  ],
  defeatedNpcs: [],
  cantinaVisits: 1,
  reputation: { empire: 0, rebellion: 0, hutt: 0, guild: 0 },
  activeContracts: [],
  flags: [],
};

const App = () => {
  const [screen, setScreen] = useState<"START" | "INTRO" | "CREATOR" | "GAME">(
    "START",
  );
  const [gameState, setGameState] = useState<SaveData>(DEFAULT_GAME_STATE);
  const [hasSave, setHasSave] = useState(false);
  const [activeSlot, setActiveSlot] = useState(1);

  // Audio Logic
  const [audioTrack, setAudioTrack] = useState(AUDIO.MENU_THEME);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [isGlobalAudioPlaying, setIsGlobalAudioPlaying] = useState(true);
  const [isCombatActive, setIsCombatActive] = useState(false);

  useEffect(() => {
    // Check if ANY slot has a save (for 'hasSave' state)
    for (let i = 1; i <= 4; i++) {
      if (loadGame(i)) {
        setHasSave(true);
        break;
      }
    }
  }, []);

  // Manage Audio based on Screen and Location
  useEffect(() => {
    if (screen === "START") {
      setAudioTrack(AUDIO.MENU_THEME);
      setAudioVolume(0.4);
      setIsGlobalAudioPlaying(true);
    } else if (screen === "INTRO") {
      setIsGlobalAudioPlaying(false);
      const timer = setTimeout(() => {
        setAudioTrack(AUDIO.MAIN_TITLE);
        setAudioVolume(0.6);
        setIsGlobalAudioPlaying(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (screen === "CREATOR") {
      setAudioTrack(AUDIO.MENU_THEME);
      setAudioVolume(0.4);
      setIsGlobalAudioPlaying(true);
    } else if (screen === "GAME") {
      setIsGlobalAudioPlaying(true);
      const locId = gameState.currentLocationId;
      const exteriorLocations = [
        "mos_eisley_street",
        "mos_eisley_gate",
        "jundland_wastes",
        "lars_homestead",
        "sandcrawler",
        "krayt_valley",
        "jabbas_palace",
        "mos_espa_gate",
        "mos_espa_city",
        "merchant_row",
        "mos_eisley_bazaar",
        "mos_eisley_old_quarter",
        "scrap_shop",
        "spaceport",
      ];

      if (isCombatActive) {
        setAudioTrack(AUDIO.BATTLE_THEME);
        setAudioVolume(0.4);
      } else if (locId === "mos_eisley_cantina") {
        const playSecondTheme = (gameState.cantinaVisits || 1) % 2 === 0;
        setAudioTrack(
          playSecondTheme ? AUDIO.CANTINA_THEME_2 : AUDIO.CANTINA_THEME_1,
        );
        setAudioVolume(0.3);
      } else if (exteriorLocations.includes(locId)) {
        setAudioTrack(AUDIO.EXTERIOR_THEME);
        setAudioVolume(0.3);
      } else {
        setAudioTrack(AUDIO.AMBIENT_THEME);
        setAudioVolume(0.2);
      }
    }
  }, [
    screen,
    gameState.currentLocationId,
    gameState.cantinaVisits,
    isCombatActive,
  ]);

  const handleNewGame = () => {
    setGameState(DEFAULT_GAME_STATE);
    setScreen("INTRO");
  };

  const handleContinue = (slot: number) => {
    const saved = loadGame(slot);
    if (saved) {
      // Migration for new fields
      if (saved.stats) {
        if (!saved.stats.unlockedSkillIds) saved.stats.unlockedSkillIds = [];
        if (!saved.stats.unlockedPerkIds) saved.stats.unlockedPerkIds = [];
      }
      setGameState(saved);
      setActiveSlot(slot);
      setScreen("GAME");
    }
  };

  const handleIntroFinish = () => {
    setScreen("CREATOR");
  };

  const handleCharacterCreated = (char: Character) => {
    const startingItem = char.charClass.startingItem;
    setGameState((prev) => ({
      ...prev,
      stats: char,
      inventory: [...prev.inventory, startingItem],
      equippedWeaponId:
        startingItem.type === "weapon" || startingItem.dmg
          ? startingItem.id
          : prev.equippedWeaponId,
      equippedClothingId:
        startingItem.type === "clothing"
          ? startingItem.id
          : prev.equippedClothingId,
    }));
    setScreen("GAME");
  };

  const handleSave = () => {
    saveGame(gameState, activeSlot);
    setGameState((prev) => ({
      ...prev,
      history: [...prev.history, "Game Saved."],
    }));
  };

  return (
    <div className="w-full h-full relative font-sans select-none">
      <OfflineIndicator />
      {screen !== "GAME" && <FullscreenButton />}
      <BackgroundAudioPlayer
        src={audioTrack}
        volume={audioVolume}
        isPlaying={isGlobalAudioPlaying}
        loop={true}
      />

      {screen === "START" && (
        <StartScreen
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          hasSave={hasSave}
        />
      )}

      {screen === "INTRO" && (
        <OpeningCrawl onFinished={handleIntroFinish} volume={0.6} />
      )}

      {screen === "CREATOR" && (
        <CharacterCreator onFinished={handleCharacterCreated} />
      )}

      {screen === "GAME" && (
        <div className="w-full h-full bg-gray-900 overflow-hidden relative animate-fade-in">
          <Dashboard
            gameState={gameState}
            setGameState={setGameState}
            locations={initialLocations}
            onSave={handleSave}
            onCombatChange={setIsCombatActive}
          />
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
