import React, { useState, useEffect } from 'react';
import { BackgroundAudioPlayer, CommandButton, cn } from './Shared';
import { PWAInstallButton } from './PWAInstallButton';
import { AUDIO, IMAGES, RACES, CLASSES, BACKSTORIES } from '../data';
import { Character, Stats, Race, CharClass, SaveData } from '../types';
import { loadGame } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, User, ChevronRight, Sword, Shield, Cpu, Zap, Star, X, FileText, Settings } from 'lucide-react';

// ... (existing code)

const SaveManagerModal: React.FC<{ onClose: () => void, onSaveSlotSelected: (slot: number) => void }> = ({ onClose, onSaveSlotSelected }) => {
    
    const [slots, setSlots] = useState<{ id: number; data: SaveData | null }[]>([]);

    useEffect(() => {
        const slotsData = [1, 2, 3, 4].map(id => ({
            id,
            data: loadGame(id)
        }));
        setSlots(slotsData);
    }, []);

    const handleDeleteSave = (slot: number) => {
        localStorage.removeItem(`outer_rim_save_slot_${slot}`);
        setSlots(prev => prev.map(s => s.id === slot ? { ...s, data: null } : s));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-black border border-cyan-900/50 rounded-xl p-6 md:p-8 max-w-sm w-full text-left shadow-[0_0_50px_rgba(8,145,178,0.2)]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-sans font-bold text-cyan-500 uppercase tracking-widest">Save Manager</h2>
                    <button onClick={onClose} className="p-2 text-cyan-700 hover:text-cyan-400">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {slots.map(slot => (
                        <div key={slot.id} className="p-3 border border-cyan-900/30 rounded flex items-center justify-between">
                            <span className="text-cyan-600 font-mono">Slot {slot.id}</span>
                            {slot.data ? (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onSaveSlotSelected(slot.id)}
                                        className="text-xs text-cyan-400 hover:text-cyan-200 uppercase"
                                    >
                                        Select
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteSave(slot.id)}
                                        className="text-xs text-red-500 hover:text-red-300 uppercase"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-600 uppercase">Empty</span>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 pt-4 border-t border-cyan-900/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-300 transition-colors uppercase tracking-widest text-sm font-bold rounded"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const OpeningCrawl: React.FC<{ onFinished: () => void, volume: number }> = ({ onFinished, volume }) => {
    const [phase, setPhase] = useState<'intro' | 'logo' | 'crawl'>('intro');
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [tapCount, setTapCount] = useState(0);

    const handleSkip = React.useCallback(() => {
        setIsFadingOut(true);
        setTimeout(onFinished, 1500);
    }, [onFinished]);

    const handleTap = () => {
        setTapCount(prev => {
            const next = prev + 1;
            if (next >= 5) {
                handleSkip();
                return 0;
            }
            return next;
        });
    };

    useEffect(() => {
        // Phase 1: Blue Intro Text
        const introTimer = setTimeout(() => {
            setPhase('logo');
        }, 4000);

        // Phase 2: Logo Burst
        const logoTimer = setTimeout(() => {
            setPhase('crawl');
        }, 11000); // 4s intro + 7s logo animation

        // Phase 3: Transition 7s before 90s crawl finish (11s delay + 83s)
        const finishTimer = setTimeout(() => {
            handleSkip();
        }, 80000);

        return () => {
            clearTimeout(introTimer);
            clearTimeout(logoTimer);
            clearTimeout(finishTimer);
        };
    }, [handleSkip]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[50] overflow-hidden cursor-pointer"
            onClick={handleTap}
        >
            {phase !== 'intro' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-[url('https://i.postimg.cc/qRtKmN94/eae041e8872e2b60068958ee0ee38884.jpg')] bg-cover pointer-events-none" 
                />
            )}
            
            <AnimatePresence mode="wait">
                {phase === 'intro' && (
                    <motion.div 
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 4, times: [0, 0.2, 0.8, 1] }}
                        className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black"
                    >
                        <h2 className="text-[#4bd5ee] text-xl md:text-3xl font-sans tracking-[0.2em] leading-relaxed drop-shadow-[0_0_15px_rgba(75,213,238,0.5)]">
                            A long time ago in a galaxy far, far away....
                        </h2>
                    </motion.div>
                )}

                {phase === 'logo' && (
                    <motion.div 
                        key="logo"
                        initial={{ scale: 3, opacity: 0 }}
                        animate={{ scale: [3, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ 
                            duration: 8, 
                            times: [0, 0.25, 1],
                            ease: "linear"
                        }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    >
                        <div className="text-center">
                            <h1 className="text-[12rem] md:text-[24rem] font-sans font-black text-[#feda4a] tracking-tight leading-[0.8] drop-shadow-[0_0_50px_rgba(254,218,74,0.3)]">
                                STAR<br/>WARS
                            </h1>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Crawl is always present when phase is crawl, not in AnimatePresence wait mode to allow overlay */}
            {phase === 'crawl' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full relative z-20"
                >
                    <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
                    
                    {/* 3D Crawl Container */}
                    <div className="absolute inset-0 flex justify-center [perspective:1000px] overflow-hidden pointer-events-none">
                        <motion.div 
                            initial={{ y: '100vh', rotateX: 20 }}
                            animate={{ y: '-250%' }}
                            transition={{ duration: 90, ease: "linear" }}
                            className="w-[85%] md:w-[60%] text-[#feda4a] font-extrabold text-center space-y-16 pb-32"
                            style={{ 
                                transformOrigin: '50% 100%',
                                textShadow: '0 0 10px rgba(254, 218, 74, 0.4)'
                            }}
                        >
                            <div className="space-y-8">
                                <h1 className="text-4xl md:text-6xl font-sans tracking-[0.5em] font-black italic">EPISODE I</h1>
                                <h2 className="text-5xl md:text-8xl font-sans uppercase tracking-tight font-black leading-tight">THE OUTER RIM</h2>
                            </div>
                            
                            <div className="text-xl md:text-4xl leading-[1.6] text-center md:text-justify space-y-12 font-sans font-black italic tracking-wide">
                                <p>The shadow of the GALACTIC EMPIRE stretches across the stars, choking freedom and order. Yet in the desolate reaches of the OUTER RIM, the Empire's grip weakens, and a different kind of destiny begins to unfold.</p>
                                <p>Seeking a fresh start, you have found your way to TATOOINE—a harsh desert world of twin suns, endless sand, and limitless, lawless potential.</p>
                                <p>To some, it is a dead-end dustball. To others, it is a wretched hive of scum and villainy. But to you, it represents an opportunity to forge a new path, far from the prying eyes of the Core Worlds.</p>
                                <p>The galaxy is vast, and fortunes are made by those brave enough to seize them. Whether out of desperation, ambition, or a thirst for adventure, it is time to carve out your own legend.</p>
                                <p>The twin suns beat down on the dunes, signaling the dawn of a new era. Tatooine is not just a destination; it is the beginning of your journey...</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
            
            <AnimatePresence>
                {isFadingOut && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black z-[60]"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ChangelogModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-black border border-cyan-900/50 rounded-xl p-6 md:p-8 max-w-2xl w-full text-left shadow-[0_0_50px_rgba(8,145,178,0.2)]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-sans font-bold text-cyan-500 uppercase tracking-widest">System Update Log</h2>
                    <button onClick={onClose} className="p-2 text-cyan-700 hover:text-cyan-400">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                    <div className="border-b border-cyan-900/30 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl text-yellow-500 font-display">v1.3</h3>
                            <span className="text-xs text-cyan-600 font-mono">Latest Payload</span>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 font-sans leading-relaxed">
                            <li><strong>Backstories System:</strong> Added new backstories (Street Rat, Kid Stuff, Wanted, Task Master, Lone Wolf) with unique perks and stat buffs.</li>
                            <li><strong>Factions & Reputation:</strong> Deepened the faction system to include Hutt Cartel, Empire, Rebels, and Local Settlers.</li>
                            <li><strong>Jabba's Palace:</strong> Added full interior location expansion including Throne Room, Dungeon, and Kitchen.</li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-cyan-900/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-300 transition-colors uppercase tracking-widest text-sm font-bold rounded"
                    >
                        Acknowledge
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const InfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-black border border-cyan-900/50 rounded-xl p-6 md:p-8 max-w-2xl w-full text-left shadow-[0_0_50px_rgba(8,145,178,0.2)]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-sans font-bold text-cyan-500 uppercase tracking-widest">Galactic Codex</h2>
                    <button onClick={onClose} className="p-2 text-cyan-700 hover:text-cyan-400">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                    <div className="border-b border-cyan-900/30 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl text-yellow-500 font-display">Traveler Tips</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 font-sans leading-relaxed">
                            <li><strong>Combat Preparation:</strong> Always keep a medpac handy. Encountering aggressive thugs or wildlife is common in the Outer Rim.</li>
                            <li><strong>Reputation Matters:</strong> Working for the Bounty Hunters' Guild or Imperial patrols will alter how certain NPCs react to you.</li>
                            <li><strong>Resting:</strong> You can heal fully by renting a room or heading to a safehouse. Day and night cycle affects enemy encounters and available NPCs.</li>
                        </ul>
                    </div>

                    <div className="border-b border-cyan-900/30 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl text-yellow-500 font-display">Important Locations</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 font-sans leading-relaxed">
                            <li><strong>Mos Eisley Cantina:</strong> The heart of the local underworld. Talk to Wuher or any shady characters looking for hired guns.</li>
                            <li><strong>Bounty Hunters' Guild:</strong> Located in Mos Eisley. Check the job board often to earn credits and reputation.</li>
                            <li><strong>Jundland Wastes:</strong> A dangerous canyon region overrun by Tusken Raiders, but often holds valuable salvage or hidden paths.</li>
                            <li><strong>Grand Arena:</strong> Participate in Podracing in Mos Espa to win massive credit purses.</li>
                        </ul>
                    </div>

                    <div className="border-b border-cyan-900/30 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl text-yellow-500 font-display">Things To Do</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 font-sans leading-relaxed">
                            <li><strong>Take on Bounties:</strong> Visit the Bounty Hunter's Guild in Mos Eisley to hunt down marks for a profit.</li>
                            <li><strong>Podracing:</strong> Head down to Mos Espa Grand Arena and risk it all in high-speed races.</li>
                            <li><strong>Play Sabacc:</strong> Try your luck at the Sabacc tables found in the Mos Eisley Cantina or Casino.</li>
                            <li><strong>Salvage Operations:</strong> Find hidden scrap in the Jundland Wastes to sell or use.</li>
                        </ul>
                    </div>

                    <div className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl text-yellow-500 font-display">Known Threats</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 font-sans leading-relaxed">
                            <li><strong>Tusken Raiders:</strong> Territorial nomads who attack on sight in the Wastes.</li>
                            <li><strong>Street Thugs:</strong> Desperate criminals looking for an easy mark in the alleys of Mos Eisley.</li>
                            <li><strong>Stormtroopers:</strong> Imperial enforcers. They might bother you if you cause trouble or look suspicious.</li>
                            <li><strong>Bounty Hunters:</strong> Rival mercenaries who won't hesitate to eliminate competition for high-paying contracts.</li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-cyan-900/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-300 transition-colors uppercase tracking-widest text-sm font-bold rounded"
                    >
                        Close Codex
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const StartScreen: React.FC<{ onNewGame: () => void, onContinue: (slot: number) => void, hasSave: boolean }> = ({ onNewGame, onContinue, hasSave }) => {
    const [fading, setFading] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showSaveManager, setShowSaveManager] = useState(false);

    const handleNewGameClick = () => {
        setFading(true);
        setTimeout(onNewGame, 1500);
    };

    const handleSlotSelected = (slot: number) => {
        setShowSaveManager(false);
        onContinue(slot);
    };

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
            <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 z-0 opacity-50"
            >
                <img src={IMAGES.START_SCREEN} className="w-full h-full object-cover grayscale-[0.3] brightness-[0.4]" alt="Tatooine" />
            </motion.div>
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-black z-1" />
            <div className="scanline z-2 opacity-10" />

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 text-center mb-16"
            >
                <h1 className="text-6xl md:text-9xl font-sans font-black text-yellow-500 tracking-tight uppercase leading-[0.8] drop-shadow-[0_0_30px_rgba(234,179,8,0.4)] mb-2">
                    THE<br/>OUTER RIM
                </h1>
                <p className="font-title text-cyan-600 tracking-[0.4em] text-[10px] md:text-xs uppercase opacity-70 mt-6 font-bold">
                    A Star Wars Story
                </p>
            </motion.div>

            <div className="z-10 flex flex-col gap-4 w-64 md:w-80">
                <CommandButton 
                    label="Initialize Pilot" 
                    onClick={handleNewGameClick} 
                    className="w-full py-5 text-lg border-yellow-500/50 text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/20"
                    icon={<Play size={18} className="text-yellow-600" />}
                />
                {hasSave && (
                    <div className="flex gap-2">
                        <CommandButton 
                            label="Restore Uplink" 
                            onClick={() => setShowSaveManager(true)} 
                            className="w-full py-5 text-lg border-cyan-800 bg-black/40 flex-grow"
                            icon={<Sparkles size={18} className="text-cyan-600" />}
                        />
                        <button
                            onClick={() => setShowSaveManager(true)}
                            className="p-4 border border-cyan-800 bg-black/40 text-cyan-600 hover:text-cyan-400 hover:border-cyan-600 transition-colors"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                )}
                
                <div className="flex items-center justify-center gap-6 mt-4">
                    <button 
                        onClick={() => setShowInfo(true)}
                        className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                    >
                        <FileText size={14} />
                        Codex
                    </button>
                    <button 
                        onClick={() => setShowChangelog(true)}
                        className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                    >
                        <FileText size={14} />
                        Changelog
                    </button>
                    <PWAInstallButton className="text-xs font-mono text-cyan-500/60 hover:text-cyan-400" />
                </div>
            </div>

            {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
            {showSaveManager && <SaveManagerModal onClose={() => setShowSaveManager(false)} onSaveSlotSelected={handleSlotSelected} />}

            <div className={`absolute inset-0 bg-black transition-opacity duration-[1500ms] ease-in-out pointer-events-none z-20 ${fading ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
};

export const CharacterCreator: React.FC<{ onFinished: (char: Character) => void }> = ({ onFinished }) => {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [selectedRaceId, setSelectedRaceId] = useState<string>(RACES[0].id);
    const [selectedClassId, setSelectedClassId] = useState<string>(CLASSES[0].id);
    const [selectedBackstoryId, setSelectedBackstoryId] = useState<string>(BACKSTORIES[0].id);

    const handleComplete = () => {
        if (!name.trim()) return;
        const race = RACES.find(r => r.id === selectedRaceId)!;
        const charClass = CLASSES.find(c => c.id === selectedClassId)!;
        
        const baseStats: Stats = { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, lck: 5 };
        const finalStats = { ...baseStats };
        
        Object.entries(race.bonuses).forEach(([stat, val]) => {
            if (stat in finalStats) finalStats[stat as keyof Stats] += val;
        });
        Object.entries(charClass.bonuses).forEach(([stat, val]) => {
            if (stat in finalStats) finalStats[stat as keyof Stats] += val;
        });

        // Apply any direct class bonuses to the starting character
        let maxHp = 20 + (finalStats.end * 2);
        if (selectedClassId === 'merc') {
            maxHp += 15; // Battle Hardened buff
        }
        
        const unlockedSkillIds: string[] = [];
        if (selectedClassId === 'mechanic') {
            unlockedSkillIds.push('scavenger'); // Scrapper buff
        }

        const selectedBackstory = BACKSTORIES.find(b => b.id === selectedBackstoryId)!;
        if (selectedBackstory.buff && 'stat' in selectedBackstory.buff) {
            finalStats[selectedBackstory.buff.stat] += selectedBackstory.buff.value;
        }

        onFinished({
            name,
            race,
            charClass,
            stats: finalStats,
            maxHp,
            currentHp: maxHp,
            background: `${selectedBackstory.name}: ${selectedBackstory.description}`,
            party: [],
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            skillPoints: 0,
            unlockedSkillIds,
            unlockedPerkIds: []
        });
    };

    const selectedRaceData = RACES.find(r => r.id === selectedRaceId);
    const selectedClassData = CLASSES.find(c => c.id === selectedClassId);

    return (
        <div className="h-full w-full flex items-start md:items-center justify-center md:bg-gray-950 px-4 py-8 relative overflow-y-auto">
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop')] bg-cover opacity-20 grayscale brightness-50 pointer-events-none" />
            <div className="fixed inset-0 scanline opacity-10 pointer-events-none" />
            
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl bg-black/80 border border-cyan-800/30 rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-2xl relative z-10 m-auto flex-shrink-0"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
                        <User className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-title text-white tracking-tight uppercase">Pilot Registration</h2>
                        <div className="h-1 w-24 bg-cyan-700 mt-2 rounded-full" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div 
                            key="name" 
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <label className="block text-cyan-500 font-display text-sm tracking-widest uppercase">Designation</label>
                            <input 
                                autoFocus
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="ENTER NAME..."
                                className="w-full bg-cyan-950/20 border-b-2 border-cyan-800 p-4 text-2xl font-title text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-cyan-900 uppercase"
                            />
                            <CommandButton 
                                disabled={!name} 
                                label="Biological Scan" 
                                onClick={() => setStep(1)} 
                                className="w-full py-4 text-lg"
                                icon={<ChevronRight size={20} />}
                            />
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div 
                            key="race" 
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        >
                            <label className="block text-cyan-500 font-display text-sm tracking-widest uppercase mb-4">Species selection</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                {RACES.map(r => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => setSelectedRaceId(r.id)} 
                                        className={cn(
                                            "p-4 border transition-all rounded-lg text-left group",
                                            selectedRaceId === r.id ? "bg-cyan-500/20 border-cyan-400 text-white" : "bg-black/40 border-cyan-900/30 text-cyan-700 hover:border-cyan-700"
                                        )}
                                    >
                                        <div className="font-title uppercase text-sm mb-1 group-hover:text-cyan-300">{r.name}</div>
                                        <div className="text-[10px] leading-tight opacity-60 font-sans mb-1">{r.description.slice(0, 80)}...</div>
                                        <div className="text-[10px] text-cyan-400/80 font-sans">Trait: {r.uniqueTrait}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(0)} className="flex-1 py-4 border border-gray-800 text-gray-500 hover:text-white uppercase transition-colors rounded">Abort</button>
                                <CommandButton label="Archetype Calibration" onClick={() => setStep(2)} className="flex-[2] py-4" />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="class" 
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        >
                            <label className="block text-cyan-500 font-display text-sm tracking-widest uppercase mb-4">Class training</label>
                            <div className="flex flex-col gap-3 mb-8">
                                {CLASSES.map(c => (
                                    <button 
                                        key={c.id} 
                                        onClick={() => setSelectedClassId(c.id)} 
                                        className={cn(
                                            "p-4 border transition-all rounded-xl text-left flex items-center gap-4 group",
                                            selectedClassId === c.id ? "bg-yellow-500/10 border-yellow-400 text-white" : "bg-black/40 border-cyan-900/30 text-cyan-700 hover:border-cyan-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-lg border",
                                            selectedClassId === c.id ? "bg-yellow-400/20 border-yellow-400 text-yellow-400" : "bg-gray-900 border-gray-800 text-gray-600"
                                        )}>
                                            {c.id === 'mechanic' ? <Cpu size={20} /> : c.id === 'merc' ? <Shield size={20} /> : c.id === 'bounty_hunter' ? <Sword size={20} /> : <Zap size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-title uppercase text-sm group-hover:text-yellow-400">{c.name}</div>
                                            <div className="text-[10px] opacity-60 font-sans mb-1">{c.description}</div>
                                            <div className="text-[11px] text-yellow-500/80 font-sans mb-0.5">Feature: {c.uniqueBuff}</div>
                                            <div className="text-[11px] text-cyan-500/80 font-sans">Starting Item: {c.startingItem.name} ({c.startingItem.dmg ? `${c.startingItem.dmg} DMG` : c.startingItem.type})</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-800 text-gray-500 uppercase rounded">Back</button>
                                <CommandButton 
                                    label="Dossier Details" 
                                    onClick={() => setStep(3)} 
                                    className="flex-[2] py-4 border-yellow-500/50 text-yellow-500 bg-yellow-500/5" 
                                    icon={<ChevronRight size={20} />}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="background" 
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        >
                            <label className="block text-cyan-500 font-display text-sm tracking-widest uppercase mb-4">Background History</label>
                            <p className="text-sm text-gray-400 mb-4">Your past shapes your future. Select or write your origin.</p>
                            <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                                {BACKSTORIES.map((bs) => (
                                    <button 
                                        key={bs.id} 
                                        onClick={() => setSelectedBackstoryId(bs.id)} 
                                        className={cn(
                                            "p-3 border transition-all rounded-lg text-left text-xs text-gray-300 hover:border-cyan-700",
                                            selectedBackstoryId === bs.id ? "bg-cyan-500/20 border-cyan-400 text-white" : "bg-black/40 border-cyan-900/30"
                                        )}
                                    >
                                        <div className="font-bold text-cyan-400 mb-1">{bs.name}</div>
                                        <div>{bs.description}</div>
                                        {bs.buff && (
                                            <div className="text-yellow-500 text-[10px] mt-1 italic">
                                                Benefit: { 'stat' in bs.buff ? `+${bs.buff.value} ${bs.buff.stat.toUpperCase()}` : `Item: ${bs.buff.item}` }
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex gap-4">
                                <button onClick={() => setStep(2)} className="flex-1 py-4 border border-gray-800 text-gray-500 uppercase rounded">Back</button>
                                <CommandButton 
                                    label="Engage Hyperdrive" 
                                    onClick={handleComplete} 
                                    className="flex-[2] py-4 border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
                                    icon={<Play size={20} />}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
