import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sword, Shield, Zap, Target, Star, Brain, Heart, FastForward, Award, X, ChevronUp, Cpu, MessageSquare, Search, Sparkles, Crosshair, Plus, ShieldCheck, Coins, Compass, Skull, Dices, Lock } from 'lucide-react';
import { SaveData, Stats, SkillNode, Perk } from '../types';
import { CommandButton, cn } from './Shared';
import { SKILL_TREE, PERKS } from '../skillsData';

interface CharacterSheetProps {
    gameState: SaveData;
    onClose: () => void;
    onUpdateStats: (newStats: Stats, remainingPoints: number) => void;
    onUnlockSkill: (skillId: string, cost: number) => void;
    onUnlockPerk: (perkId: string) => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, onClose, onUpdateStats, onUnlockSkill, onUnlockPerk }) => {
    const [activeTab, setActiveTab] = useState<'ATTRIBUTES' | 'SKILLS' | 'PERKS'>('ATTRIBUTES');
    const char = gameState.stats;
    if (!char) return null;

    const stats = char.stats;
    const skillPoints = char.skillPoints || 0;

    const handleUpgrade = (stat: keyof Stats) => {
        if (skillPoints <= 0) return;
        const newStats = { ...stats, [stat]: stats[stat] + 1 };
        onUpdateStats(newStats, skillPoints - 1);
    };

    const statLabels: Record<keyof Stats, { l: string, d: string, icon: any }> = {
        str: { l: 'Strength', d: 'Physical power and weapon damage.', icon: Sword },
        per: { l: 'Perception', d: 'Awareness and accuracy in combat.', icon: Target },
        end: { l: 'Endurance', d: 'Overall health and stamina.', icon: Heart },
        cha: { l: 'Charisma', d: 'Social influence and negotiation.', icon: User },
        int: { l: 'Intelligence', d: 'Slicing efficiency and logic.', icon: Brain },
        agi: { l: 'Agility', d: 'Reaction time and movement.', icon: Zap },
        lck: { l: 'Luck', d: 'Chance factors and crit rewards.', icon: Star },
    };

    const factionIcons: Record<string, string> = {
        empire: 'https://img.icons8.com/color/48/galactic-empire.png',
        rebellion: 'https://img.icons8.com/color/48/rebel.png',
        hutt: 'https://img.icons8.com/color/48/jabba-the-hutt.png',
        guild: 'https://img.icons8.com/color/48/mandalorian.png'
    };

    const getSkillIcon = (iconName: string) => {
        const icons: Record<string, any> = {
            Target, Sword, Shield, Zap, Brain, Heart, Star, Cpu, MessageSquare, Search, Sparkles, Crosshair, Plus, ShieldCheck, Coins, Compass, Skull, Dices
        };
        return icons[iconName] || Star;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 font-mono select-none"
        >
            <div className="max-w-4xl w-full h-[85vh] border-2 border-cyan-500/30 bg-cyan-950/10 rounded-3xl relative overflow-hidden flex flex-col shadow-[0_0_100px_rgba(6,182,212,0.15)]">
                {/* AMBIENT BG */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cyber-dust.png')]" />
                </div>

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b border-cyan-500/20 bg-cyan-900/10 backdrop-blur-sm relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center overflow-hidden">
                                <User className="text-cyan-400" size={32} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black font-black text-xs px-2 py-0.5 rounded-lg shadow-lg border-2 border-black">
                                LVL {char.level}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">Authenticated User Identity</span>
                            <span className="text-3xl text-white font-black tracking-tighter uppercase glow-cyan-sm">{char.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded uppercase text-white/60">{char.race.name}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 rounded uppercase text-yellow-500 border border-yellow-500/20">{char.charClass.name}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="p-3 hover:bg-red-500/20 rounded-full transition-colors text-red-500 group">
                        <X size={28} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex bg-black/40 border-b border-cyan-500/10 px-6 gap-8">
                    {(['ATTRIBUTES', 'SKILLS', 'PERKS'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "py-4 text-[10px] font-black tracking-[0.3em] uppercase transition-all relative",
                                activeTab === tab ? "text-cyan-400" : "text-white/30 hover:text-white/60"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 news-scrollbar relative z-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'ATTRIBUTES' && (
                            <motion.div 
                                key="attributes"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 md:grid-cols-12 gap-8"
                            >
                                {/* LEFT COL: STATS */}
                                <div className="md:col-span-5 space-y-8">
                                    <div className="flex justify-between items-end mb-2">
                                         <div className="flex flex-col">
                                            <span className="text-xs text-cyan-500 font-bold uppercase tracking-wider">Base Attributes</span>
                                            {skillPoints > 0 && (
                                                <span className="text-[10px] text-yellow-500 animate-pulse uppercase font-black">Available points: {skillPoints}</span>
                                            )}
                                         </div>
                                         <FastForward size={14} className="text-cyan-500/30" />
                                    </div>

                                    <div className="space-y-3">
                                        {(Object.keys(statLabels) as Array<keyof Stats>).map(key => {
                                            const info = statLabels[key];
                                            const Icon = info.icon;
                                            return (
                                                <div key={key} className="group p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-cyan-500/5 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                                            <Icon size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-white/90 uppercase font-bold tracking-widest">{info.l}</span>
                                                            <span className="text-[9px] text-white/30 hidden sm:block uppercase">{info.d}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xl font-mono text-cyan-400 font-bold">{stats[key]}</span>
                                                        {skillPoints > 0 && (
                                                            <button 
                                                                onClick={() => handleUpgrade(key)}
                                                                className="p-1 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"
                                                            >
                                                                <ChevronUp size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* RIGHT COL: PROGRESS & REP */}
                                <div className="md:col-span-7 space-y-10">
                                    {/* XP PROGRESS */}
                                    <div className="p-8 rounded-3xl bg-black/40 border border-white/10 shadow-inner">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <Award size={20} className="text-yellow-500" />
                                                <span className="text-xs text-white uppercase font-bold tracking-widest">Experience Leveling</span>
                                            </div>
                                            <span className="text-xs font-mono text-white/40">{char.xp} / {char.xpToNextLevel} XP</span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full border border-white/10 overflow-hidden p-0.5 relative">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(char.xp / char.xpToNextLevel) * 100}%` }}
                                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-[8px] text-black/50 font-black tracking-[0.4em] uppercase">System Calibration</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* REPUTATION */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2 px-2">
                                            <Star size={16} className="text-cyan-500" />
                                            <span className="text-xs text-white uppercase font-bold tracking-widest">Faction Standing</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(gameState.reputation || {}).map(([faction, value]: [string, any]) => (
                                                <div key={faction} className="p-4 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/5 overflow-hidden">
                                                        {factionIcons[faction] ? (
                                                            <img src={factionIcons[faction]} className="w-6 h-6 object-contain opacity-70" alt={faction} />
                                                        ) : (
                                                            <User className="text-white/20" size={16} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-[10px] text-white/40 uppercase font-black">{faction}</div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={cn("h-full", value >= 0 ? 'bg-cyan-500' : 'bg-red-500')} 
                                                                    style={{ width: `${Math.min(100, Math.abs(value))}%` }}
                                                                />
                                                            </div>
                                                            <span className={cn("text-xs font-mono font-bold", value >= 0 ? 'text-cyan-400' : 'text-red-400')}>
                                                                {value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'SKILLS' && (
                            <motion.div 
                                key="skills"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-10"
                            >
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl text-white font-black uppercase tracking-tight">Cybernetic Enhancements</h3>
                                        <p className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest">Neural Skill Matrix v4.2</p>
                                    </div>
                                    {skillPoints > 0 && (
                                        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                            <span className="text-xs text-yellow-500 font-black uppercase tracking-widest">Skill Points: {skillPoints}</span>
                                        </div>
                                    )}
                                </div>

                                {(['Combat', 'Slicing', 'Diplomacy', 'Survival'] as const).map(category => (
                                    <div key={category} className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] text-cyan-500/50 font-black uppercase tracking-[0.3em]">{category} Specialization</span>
                                            <div className="h-[1px] flex-1 bg-cyan-500/10" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {SKILL_TREE.filter(s => s.category === category).map(skill => {
                                                const isUnlocked = char.unlockedSkillIds.includes(skill.id);
                                                const canUnlock = skillPoints >= skill.cost && 
                                                                 (!skill.prerequisiteSkillId || char.unlockedSkillIds.includes(skill.prerequisiteSkillId)) &&
                                                                 (!skill.statRequirement || stats[skill.statRequirement.stat] >= skill.statRequirement.value);
                                                
                                                const Icon = getSkillIcon(skill.icon);

                                                return (
                                                    <div 
                                                        key={skill.id} 
                                                        className={cn(
                                                            "p-5 rounded-2xl border transition-all relative overflow-hidden group",
                                                            isUnlocked ? "bg-cyan-500/10 border-cyan-400/50" : "bg-white/5 border-white/10 opacity-70"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between mb-3 relative z-10">
                                                            <div className={cn(
                                                                "p-2 rounded-lg",
                                                                isUnlocked ? "bg-cyan-500 text-black" : "bg-white/10 text-white/30"
                                                            )}>
                                                                <Icon size={20} />
                                                            </div>
                                                            {!isUnlocked && (
                                                                <div className="text-[10px] font-black text-cyan-600 px-2 py-0.5 bg-cyan-950/40 rounded border border-cyan-900">
                                                                    {skill.cost} PTS
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="relative z-10">
                                                            <h4 className="text-xs text-white font-black uppercase tracking-wider mb-1">{skill.name}</h4>
                                                            <p className="text-[9px] text-white/40 leading-relaxed uppercase">{skill.description}</p>
                                                        </div>
                                                        <div className="mt-4 flex items-center justify-between relative z-10">
                                                            {isUnlocked ? (
                                                                <span className="text-[8px] text-cyan-400 font-black uppercase tracking-[0.2em] flex items-center gap-1">
                                                                    <Sparkles size={8} /> Active Enhancement
                                                                </span>
                                                            ) : canUnlock ? (
                                                                <button 
                                                                    onClick={() => onUnlockSkill(skill.id, skill.cost)}
                                                                    className="w-full py-2 bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-colors shadow-[0_4px_10px_rgba(234,179,8,0.2)]"
                                                                >
                                                                    Unlock Segment
                                                                </button>
                                                            ) : (
                                                                <div className="flex flex-col gap-1 w-full">
                                                                    {skill.prerequisiteSkillId && !char.unlockedSkillIds.includes(skill.prerequisiteSkillId) && (
                                                                        <span className="text-[7px] text-red-500 uppercase font-black">Req: {SKILL_TREE.find(s => s.id === skill.prerequisiteSkillId)?.name}</span>
                                                                    )}
                                                                    {skill.statRequirement && stats[skill.statRequirement.stat] < skill.statRequirement.value && (
                                                                        <span className="text-[7px] text-red-500 uppercase font-black">Req: {skill.statRequirement.stat.toUpperCase()} {skill.statRequirement.value}</span>
                                                                    )}
                                                                    {skillPoints < skill.cost && (
                                                                        <span className="text-[7px] text-red-500 uppercase font-black">Insufficient Points</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'PERKS' && (
                            <motion.div 
                                key="perks"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col">
                                    <h3 className="text-xl text-white font-black uppercase tracking-tight">Veteran Credentials</h3>
                                    <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest">Hard-Earned Reputation Perks</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PERKS.map(perk => {
                                        const isUnlocked = char.level >= perk.reqLevel;
                                        const Icon = getSkillIcon(perk.icon);
                                        return (
                                            <div 
                                                key={perk.id}
                                                className={cn(
                                                    "p-6 rounded-3xl border transition-all flex items-center gap-6",
                                                    isUnlocked ? "bg-yellow-500/5 border-yellow-500/30" : "bg-black/40 border-white/5 grayscale opacity-40"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-16 h-16 rounded-2xl flex items-center justify-center border flex-shrink-0",
                                                    isUnlocked ? "bg-yellow-500/20 border-yellow-500 text-yellow-500 glow-yellow-sm" : "bg-white/5 border-white/10 text-white/10"
                                                )}>
                                                    {isUnlocked ? <Icon size={32} /> : <Lock size={32} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm text-white font-black uppercase tracking-tight">{perk.name}</h4>
                                                        {!isUnlocked && (
                                                            <span className="text-[8px] px-1.5 py-0.5 bg-white/10 rounded uppercase font-black text-white/40">LVL {perk.reqLevel}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-white/50 leading-relaxed uppercase">{perk.description}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-cyan-500/5 border-t border-cyan-500/10 flex justify-center">
                    <CommandButton label="Close Dossier" onClick={onClose} className="px-12 bg-white text-black font-black" />
                </div>
            </div>
        </motion.div>
    );
};
