/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ParsedScenario, ScenarioConfig, DialogueItem, CharacterConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, X, ChevronRight, CornerDownLeft, Eye, MessageSquare, FastForward, Gamepad2 } from 'lucide-react';

interface AdventureGameViewProps {
  scenario: ParsedScenario;
  config: ScenarioConfig;
  onClose: () => void;
}

// Retro Synthesized Audio System
class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine', gainVal: number = 0.05) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gainNode.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio failed gracefully (unsupported, permissions, etc.)
    }
  }

  playDialogueType() {
    // Soft high-frequency typewriter tick
    this.playBeep(800 + Math.random() * 200, 0.03, 'sine', 0.015);
  }

  playNext() {
    // Lovely double chord advance sound
    this.playBeep(523.25, 0.1, 'sine', 0.03); // C5
    setTimeout(() => {
      this.playBeep(659.25, 0.15, 'sine', 0.03); // E5
    }, 60);
  }

  playWait() {
    // Soft click-wait event sound
    this.playBeep(330, 0.2, 'triangle', 0.02); // E4
  }

  playIntro() {
    // Beautiful upward intro arpeggio
    const freqs = [261.63, 329.63, 392.00, 523.25]; // C major chord
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        this.playBeep(f, 0.25, 'sine', 0.02);
      }, idx * 100);
    });
  }
}

export default function AdventureGameView({
  scenario,
  config,
  onClose
}: AdventureGameViewProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isSkip, setIsSkip] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [canClose, setCanClose] = useState(false);

  // Prevent accidental quick double clicks/touches from instantly skipping ending screen
  useEffect(() => {
    if (isEnded) {
      const timer = setTimeout(() => {
        setCanClose(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(false);
    }
  }, [isEnded]);

  const typewriterTimer = useRef<NodeJS.Timeout | null>(null);
  const audioSynth = useMemo(() => new RetroAudioSynth(), []);

  // Backlog logs previous dialogue strings
  const [backlog, setBacklog] = useState<{ speakerName?: string; text: string; color?: string }[]>([]);

  // Dynamically populated up to 4 characters from scenario configurations or dialogues
  const [activeCharacters, setActiveCharacters] = useState<CharacterConfig[]>([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  // Flat narrator splitting states
  const [currentSegments, setCurrentSegments] = useState<string[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync mute setting
  useEffect(() => {
    audioSynth.isMuted = isMuted;
  }, [isMuted, audioSynth]);

  // Current dialogue step item
  const currentStep = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= scenario.items.length) {
      return null;
    }
    return scenario.items[currentIndex];
  }, [scenario, currentIndex]);

  // Total dialog lines count (excluding blank click-wait separators for display metrics)
  const dialogueLinesLeftCount = useMemo(() => {
    const totalLines = scenario.items.filter(item => item.type === 'dialogue').length;
    const completedLines = scenario.items.slice(0, currentIndex + 1).filter(item => item.type === 'dialogue').length;
    return { completed: completedLines, total: totalLines };
  }, [scenario, currentIndex]);

  // Helper to find character config by speaker key or displayName
  const findCharacterConfig = useCallback((speaker: string | undefined) => {
    if (!speaker) return null;
    const cleanSpeaker = speaker.trim();
    // Exact key match
    if (config.characters[cleanSpeaker]) {
      return config.characters[cleanSpeaker];
    }
    // Match by displayName
    const foundByDisplayName = Object.values(config.characters).find(
      c => c.displayName && (c.displayName.includes(cleanSpeaker) || cleanSpeaker.includes(c.displayName))
    );
    if (foundByDisplayName) return foundByDisplayName;

    // Fuzzy fallbacks for specific default scenarios (including full English translation support)
    const lowerSpeaker = cleanSpeaker.toLowerCase();
    if (config.id === "上司と部下" || config.id.includes("上司") || config.id.includes("boss") || config.id.includes("subordinate")) {
      if (
        lowerSpeaker.includes("上司") || 
        lowerSpeaker.includes("佐藤") || 
        lowerSpeaker.includes("部長") || 
        lowerSpeaker.includes("ボス") || 
        lowerSpeaker.includes("boss") || 
        lowerSpeaker.includes("sato") || 
        lowerSpeaker.includes("manager") || 
        lowerSpeaker.includes("supervisor")
      ) {
        return Object.values(config.characters).find(c => c.key === "上司" || c.key === "佐藤" || c.position === "left") || null;
      }
      if (
        lowerSpeaker.includes("部下") || 
        lowerSpeaker.includes("鈴木") || 
        lowerSpeaker.includes("社員") || 
        lowerSpeaker.includes("くん") || 
        lowerSpeaker.includes("subordinate") || 
        lowerSpeaker.includes("suzuki") || 
        lowerSpeaker.includes("employee") || 
        lowerSpeaker.includes("staff") || 
        lowerSpeaker.includes("junior")
      ) {
        return Object.values(config.characters).find(c => c.key === "部下" || c.key === "鈴木" || c.position === "right") || null;
      }
    }
    if (config.id === "ファンタジー遭遇" || config.id.includes("fantasy") || config.id.includes("encounter")) {
      if (
        lowerSpeaker.includes("勇者") || 
        lowerSpeaker.includes("アルス") || 
        lowerSpeaker.includes("hero") || 
        lowerSpeaker.includes("arus") || 
        lowerSpeaker.includes("arthur")
      ) {
        return Object.values(config.characters).find(c => c.key === "勇者" || c.position === "left") || null;
      }
      if (
        lowerSpeaker.includes("魔王") || 
        lowerSpeaker.includes("ルシファー") || 
        lowerSpeaker.includes("demon") || 
        lowerSpeaker.includes("lucifer") || 
        lowerSpeaker.includes("satan") || 
        lowerSpeaker.includes("devil")
      ) {
        return Object.values(config.characters).find(c => c.key === "魔王" || c.position === "right") || null;
      }
    }
    if (config.id === "幼馴染の図書室" || config.id.includes("childhood") || config.id.includes("friend") || config.id.includes("library")) {
      if (
        lowerSpeaker.includes("葵") || 
        lowerSpeaker.includes("あおい") || 
        lowerSpeaker.includes("aoi")
      ) {
        return Object.values(config.characters).find(c => c.key === "葵" || c.position === "left") || null;
      }
      if (
        lowerSpeaker.includes("颯太") || 
        lowerSpeaker.includes("そうた") || 
        lowerSpeaker.includes("sota") || 
        lowerSpeaker.includes("souta")
      ) {
        return Object.values(config.characters).find(c => c.key === "颯太" || c.position === "right") || null;
      }
    }

    // Default: find any character whose key matches or is close
    const foundByKeyMatch = Object.values(config.characters).find(
      c => c.key.includes(cleanSpeaker) || cleanSpeaker.includes(c.key)
    );
    if (foundByKeyMatch) return foundByKeyMatch;

    return null;
  }, [config]);

  // Resolve characters to render dynamically on stage (maximum 4)
  useEffect(() => {
    let charKeys: string[] = [];

    if (scenario.initialCharacters && scenario.initialCharacters.length > 0) {
      // 1. Tag based (from 【登場人物】)
      charKeys = scenario.initialCharacters;
    } else {
      // 2. Autofit fallback (scan items to find spoken characters)
      const scannedKeys = new Set<string>();
      scenario.items.forEach(item => {
        if (item.speaker) {
          const cleanSpeaker = item.speaker.trim();
          const configMatch = findCharacterConfig(cleanSpeaker);
          if (configMatch) {
            scannedKeys.add(configMatch.key);
          } else {
            scannedKeys.add(cleanSpeaker);
          }
        }
      });
      charKeys = Array.from(scannedKeys);
    }

    // Resolve actually configuration objects for resolved keys (up to 4)
    const resolved: CharacterConfig[] = [];
    charKeys.slice(0, 4).forEach(key => {
      const configMatch = findCharacterConfig(key);
      if (configMatch) {
        resolved.push(configMatch);
      } else {
        // Fallback placeholder configuration
        resolved.push({
          key,
          displayName: key,
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          color: "#10b981",
          position: "center"
        });
      }
    });

    // If completely empty, pre-populate with default characters up to 4
    if (resolved.length === 0) {
      const defaultChars = Object.values(config.characters).slice(0, 4);
      resolved.push(...defaultChars);
    }

    setActiveCharacters(resolved);
  }, [scenario, config, findCharacterConfig]);

  // Handle auto-splitting long/multi-line narrator plain text into click-to-advance chunks
  useEffect(() => {
    if (!currentStep) {
      setCurrentSegments([]);
      setSegmentIndex(0);
      return;
    }

    if (currentStep.type === 'click-wait') {
      setCurrentSegments(['（クリックして次に進む）']);
      setSegmentIndex(0);
      return;
    }

    const isNarrator = !currentStep.speaker;
    const text = currentStep.text || '';

    if (isNarrator && text.length > 0) {
      // Splitting logic for Plain Text / Narrator (to respect User visual and newline constraints)
      const segments: string[] = [];
      const rawLines = text.split(/\r?\n/);
      
      rawLines.forEach(line => {
        let chunk = line.trim();
        if (!chunk) return;
        
        const maxSegmentLen = 42; // Perfect balance for standard message area
        while (chunk.length > maxSegmentLen) {
          let splitPoint = chunk.substring(0, maxSegmentLen).lastIndexOf('。');
          if (splitPoint === -1) {
            splitPoint = chunk.substring(0, maxSegmentLen).lastIndexOf('、');
          }
          if (splitPoint === -1 || splitPoint < 12) {
            splitPoint = maxSegmentLen;
          }
          segments.push(chunk.substring(0, splitPoint));
          chunk = chunk.substring(splitPoint).trim();
        }
        if (chunk.length > 0) {
          segments.push(chunk);
        }
      });

      setCurrentSegments(segments.length > 0 ? segments : ['']);
      setSegmentIndex(0);
    } else {
      // Speaker specified: keep as single segment to preserve dialogue role structures
      setCurrentSegments([text]);
      setSegmentIndex(0);
    }
  }, [currentIndex, currentStep]);

  // Play intro sound on start
  useEffect(() => {
    // Trigger on first render of the overlay only after started
    if (isStarted) {
      audioSynth.playIntro();
    }
    return () => {
      if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    };
  }, [isStarted]);

  // Trigger typed content update on step and segment changes
  useEffect(() => {
    if (!isStarted) return;

    if (typewriterTimer.current) {
      clearInterval(typewriterTimer.current);
      typewriterTimer.current = null;
    }

    if (!currentStep) {
      setTypedText('');
      setIsTyping(false);
      return;
    }

    if (currentStep.type === 'click-wait') {
      // Clear or display scenic wait
      setTypedText('（クリックして次に進む）');
      setIsTyping(false);
      
      // Auto advance or play wait beep
      audioSynth.playWait();
      if (isSkip) {
        setTimeout(() => handleNext(), 350);
      } else if (isAutoplay) {
        setTimeout(() => handleNext(), 1500);
      }
      return;
    }

    // Handle segmented dialogue types
    const textToType = currentSegments[segmentIndex] || '';
    setTypedText('');
    setIsTyping(true);

    // Skip typing animations if in SKIP mode
    if (isSkip) {
      setTypedText(textToType);
      setIsTyping(false);

      // Append to backlog
      const speakerData = findCharacterConfig(currentStep.speaker);
      setBacklog(prev => [
        ...prev,
        {
          speakerName: speakerData?.displayName || currentStep.speaker,
          text: textToType,
          color: speakerData?.color
        }
      ]);

      // Automatically advance after a short latency
      setTimeout(() => handleNext(), 150);
      return;
    }

    let charIdx = 0;
    const speed = 40; // 40ms per char

    typewriterTimer.current = setInterval(() => {
      charIdx++;
      setTypedText(textToType.substring(0, charIdx));
      
      // Retro typing sound on every even character to prevent overwhelming beeps
      if (charIdx % 2 === 0) {
        audioSynth.playDialogueType();
      }

      if (charIdx >= textToType.length) {
        if (typewriterTimer.current) {
          clearInterval(typewriterTimer.current);
          typewriterTimer.current = null;
        }
        setIsTyping(false);

        // Record to backlog
        const speakerData = findCharacterConfig(currentStep.speaker);
        setBacklog(prev => [
          ...prev,
          {
            speakerName: speakerData?.displayName || currentStep.speaker,
            text: textToType,
            color: speakerData?.color
          }
        ]);

        // Autoplay advance logic
        if (isAutoplay) {
          setTimeout(() => {
            handleNext();
          }, 1800);
        }
      }
    }, speed);

    return () => {
      if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    };
  }, [currentIndex, segmentIndex, currentSegments, isSkip, scenario, isStarted]);

  // Handle auto advance triggers when toggling autoplay
  useEffect(() => {
    if (!isStarted) return;
    if (isAutoplay && !isTyping && currentStep) {
      const waitTime = currentStep.type === 'click-wait' ? 1000 : 1800;
      const t = setTimeout(() => {
        handleNext();
      }, waitTime);
      return () => clearTimeout(t);
    }
  }, [isAutoplay, isTyping, currentIndex, isStarted]);

  // Advance story
  const handleNext = () => {
    if (isTyping && currentStep && currentStep.type === 'dialogue') {
      // Click during typewriter skips/instant-displays the text
      if (typewriterTimer.current) {
        clearInterval(typewriterTimer.current);
        typewriterTimer.current = null;
      }
      const targetTxt = currentSegments[segmentIndex] || '';
      setTypedText(targetTxt);
      setIsTyping(false);

      const speakerData = findCharacterConfig(currentStep.speaker);
      setBacklog(prev => [
        ...prev,
        {
          speakerName: speakerData?.displayName || currentStep.speaker,
          text: targetTxt,
          color: speakerData?.color
        }
      ]);
      return;
    }

    // Is there a pending inner segment left? (Plain text pagination / narrator newlines)
    if (currentStep && currentStep.type === 'dialogue' && segmentIndex < currentSegments.length - 1) {
      audioSynth.playNext();
      setSegmentIndex(prev => prev + 1);
      return;
    }
 
    // Go to next item
    if (currentIndex < scenario.items.length - 1) {
      audioSynth.playNext();
      setSegmentIndex(0);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reached physical end of dialogue events
      setIsAutoplay(false);
      setIsSkip(false);
      setIsEnded(true);
    }
  };

  const handleReset = () => {
    if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    setCurrentIndex(0);
    setSegmentIndex(0);
    setCurrentSegments([]);
    setTypedText('');
    setIsTyping(false);
    setBacklog([]);
    audioSynth.playIntro();
  };

  const activeSpeakerKey = currentStep?.speaker;
  const resolvedSpeakerConfig = findCharacterConfig(activeSpeakerKey);

  // Old active character slot updaters removed

  // Calculate dynamic responsive positions (proportional & overlap preventer)
  const getCharStyle = (index: number, total: number) => {
    const isLandscape = windowSize.width > windowSize.height;
    
    let leftPercent = 50;
    let topPx = 0;
    let widthClass = "w-20 sm:w-28 md:w-36"; // default sizes
    
    // Distribute horizontally
    if (total === 1) {
      leftPercent = 50;
    } else if (total === 2) {
      leftPercent = index === 0 ? 25 : 75;
    } else if (total === 3) {
      leftPercent = 15 + index * 35; // 15%, 50%, 85%
    } else if (total >= 4) {
      leftPercent = 12 + index * 25.3; // 12%, 37.3%, 62.6%, 88%
    }
 
    // Smart vertical displacement to prevent overlapping (anti-overlap stagger algorithm)
    if (!isLandscape) {
      // Portrait / Mobile mode: Less horizontal space
      if (total >= 3) {
        // Mobile portrait + 3/4 characters: 2-line stagger
        topPx = index % 2 === 0 ? -40 : 25;
        widthClass = "w-16 min-[380px]:w-[74px] min-[440px]:w-[84px] sm:w-28";
      } else if (total === 2) {
        widthClass = "w-20 min-[380px]:w-24 min-[440px]:w-28 sm:w-36";
      }
    } else {
      // Landscape: Plenty of horizontal space, but let's downsize for N >= 4 to keep it elegant
      if (total >= 4) {
        widthClass = "w-18 sm:w-24 md:w-32 lg:w-36";
      }
    }
 
    return {
      left: `${leftPercent}%`,
      topPx,
      widthClass
    };
  };

  // Render character entries dynamically on absolute coordinate positions
  const renderCharacter = (charConfig: CharacterConfig, index: number, total: number) => {
    const isSpeaking = resolvedSpeakerConfig?.key === charConfig.key || resolvedSpeakerConfig?.displayName === charConfig.displayName;
    const existsOnStage = currentStep?.type === 'dialogue'; // hide or grey out when click waits
    const hasSpeaker = !!resolvedSpeakerConfig;
    const { left, topPx, widthClass } = getCharStyle(index, total);

    // Decide sprite classes based on active state (Talking: highlighted, listening: dimmed, plain text narrator: deeply dimmed)
    const highlightClass = isSpeaking
      ? 'brightness-100 contrast-100 scale-105 z-20 shadow-2xl ring-2 sm:ring-4 ring-white/50'
      : hasSpeaker
        ? 'brightness-50 contrast-90 scale-95 z-10' // some other character is speaking
        : 'brightness-[0.22] contrast-[0.80] saturate-[0.35] scale-95 z-10'; // plain narrator text mode: deeply dimmed

    return (
      <motion.div
        key={charConfig.key}
        style={{ left, transform: `translateX(-50%) translateY(${topPx}px)` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: existsOnStage ? 1 : 0.6, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 16 }}
        className={`absolute bottom-0 flex flex-col items-center pointer-events-none select-none transition-all duration-300 ${highlightClass}`}
      >
        {/* Avatar frame */}
        <div className={`relative rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-zinc-900 bg-zinc-800 shadow-xl aspect-square ${widthClass}`}>
          <img
            src={charConfig.avatarUrl}
            alt={charConfig.displayName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          
          {/* Status light tag */}
          {isSpeaking && (
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-rose-500 text-[6.5px] sm:text-[9px] text-white px-1 sm:px-1.5 py-0.5 rounded font-black tracking-widest uppercase animate-pulse">
              TALKING
            </div>
          )}
        </div>

        {/* Label banner */}
        <div
          style={{ backgroundColor: charConfig.color }}
          className="mt-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-white font-bold text-[8px] min-[400px]:text-[10px] sm:text-xs tracking-wide shadow-md border border-white/20 whitespace-nowrap min-w-[50px] min-[400px]:min-w-[70px] text-center"
        >
          {charConfig.displayName}
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between bg-zinc-950 font-sans text-zinc-100 h-[100dvh]"
      id="adventure-game-overlay"
    >
      {/* Click-to-Start Title Cover Overlay */}
      <AnimatePresence>
        {!isStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md px-6 text-center select-none"
            id="start-gate-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 95, damping: 18 }}
              className="w-full max-w-sm space-y-7 bg-zinc-900/60 p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl relative"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-emerald-600 rounded-2xl border-4 border-zinc-950 flex items-center justify-center shadow-lg animate-bounce">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2.5 pt-6">
                <span className="text-[9px] text-emerald-400 tracking-[0.25em] font-black uppercase block animate-pulse">
                  Ready to Simulate
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider leading-tight">
                  {scenario.title || config.name}
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full mt-2" />
              </div>

              <p className="text-zinc-400 text-[11px] leading-relaxed max-w-[260px] mx-auto">
                ブログから会話劇シミュレーターを生成しました。BGM演出や文字送りと合わせて楽しむには、下のボタンを押してください。
              </p>

              <button
                onClick={() => setIsStarted(true)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-xl shadow-emerald-950/40 active:translate-y-px cursor-pointer transition-all duration-150"
                id="btn-gate-start"
              >
                タップしてスタート
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background with zoom in effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
        <motion.img
          src={config.backgroundUrl}
          alt="Adventure Game Background"
          referrerPolicy="no-referrer"
          initial={{ scale: 1.15, filter: 'blur(4px)' }}
          animate={{ scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5 }}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>

      {/* Top Header Grid */}
      <header className="relative z-20 flex items-center justify-between p-3 sm:p-4 md:px-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Adventure Mode Active
          </span>
          <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white drop-shadow truncate max-w-[150px] min-[380px]:max-w-[200px] sm:max-w-xs md:max-w-none">
            {scenario.title || config.name}
          </h1>
        </div>

        {/* Dashboard Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Backlog viewer button */}
          <button
            onClick={() => setShowLog(!showLog)}
            className={`p-1.5 sm:p-2 rounded-lg border text-[11px] sm:text-xs gap-1 flex items-center transition-colors cursor-pointer ${
              showLog ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-black/40 text-zinc-300 border-white/10 hover:bg-black/60'
            }`}
            title="会話ログ"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 h-4" />
            <span className="hidden min-[400px]:inline">ログ({backlog.length})</span>
          </button>

          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-zinc-300 transition-colors cursor-pointer"
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 h-4" />}
          </button>

          {/* Close adventure game button */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-all shadow-lg hover:rotate-90 duration-200 cursor-pointer"
            title="ゲームを終了"
          >
            <X className="w-3.5 h-3.5 sm:w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Stage: Character Area */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto select-none min-h-[140px] sm:min-h-[220px]">
        {/* Absolute Wrapper to hold all responsive characters */}
        <div className="absolute inset-x-0 bottom-0 top-0 overflow-visible pointer-events-none">
          <AnimatePresence>
            {activeCharacters.map((char, index) => 
              renderCharacter(char, index, activeCharacters.length)
            )}
          </AnimatePresence>
        </div>

        {/* Clean slots */}<div>

        </div>

        {/* Center slot clean */}


        {/* Right slot clean */}


      </main>

      {/* Bottom Segment: UI, controls, and dialog box */}
      <footer className="relative z-20 bg-gradient-to-t from-black via-black/95 to-transparent pt-3 pb-3 sm:pt-5 sm:pb-6 px-3 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
          
          {/* Sub-Controller Rails */}
          <div className="flex flex-col gap-2 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between px-1">
            {/* Progress counter */}
            <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 bg-black/60 px-3 py-1 rounded-full border border-white/5 self-start min-[520px]:self-auto">
              PROGRESS:{' '}
              <span className="text-yellow-400 font-bold">
                {dialogueLinesLeftCount.completed}
              </span>{' '}
              /{' '}
              <span className="text-zinc-500">
                {dialogueLinesLeftCount.total}
              </span>{' '}
              LINES
            </div>

            {/* Novel mode options */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  setIsSkip(false);
                  setIsAutoplay(!isAutoplay);
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all border cursor-pointer ${
                  isAutoplay
                    ? 'bg-amber-600 text-white border-amber-500 font-black animate-pulse'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Play className="w-2.5 h-2.5 sm:w-3 h-3 fill-current" />
                <span>オート: {isAutoplay ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => {
                  setIsAutoplay(false);
                  setIsSkip(!isSkip);
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all border cursor-pointer ${
                  isSkip
                    ? 'bg-rose-600 text-white border-rose-500 font-black'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
                title="セリフ演出をスキップして高速で進めます"
              >
                <FastForward className="w-2.5 h-2.5 sm:w-3 h-3" />
                <span>スキップ: {isSkip ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5 sm:w-3 h-3" />
                <span>最初から</span>
              </button>
            </div>
          </div>

          {/* Interactive Dialogue container */}
          <div
            onClick={handleNext}
            className={`group relative min-h-[105px] sm:min-h-[135px] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl transition-all cursor-pointer select-none backdrop-blur border bg-black/75 hover:bg-black/85 ${
              resolvedSpeakerConfig ? 'border-zinc-700 ring-2 ring-white/5 shadow-white/5' : 'border-zinc-800'
            }`}
            id="dialogue-click-box"
          >
            {/* Speaker title badge block */}
            <AnimatePresence mode="wait">
              {resolvedSpeakerConfig ? (
                <motion.div
                  key={resolvedSpeakerConfig.key}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  style={{ backgroundColor: resolvedSpeakerConfig.color }}
                  className="absolute -top-3 left-4 sm:left-6 px-3 sm:px-4 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-white font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-md border border-white/20 whitespace-nowrap"
                >
                  {resolvedSpeakerConfig.displayName}
                </motion.div>
              ) : currentStep?.type === 'dialogue' && currentStep.speaker ? (
                // Unrecognized custom character key
                <motion.div
                  key={currentStep.speaker}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute -top-3 left-4 sm:left-6 bg-zinc-700 px-3 sm:px-4 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-white font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-md border border-white/20 whitespace-nowrap"
                >
                  {currentStep.speaker}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Main Text Content */}
            <div className="text-xs sm:text-sm md:text-base leading-relaxed font-semibold sm:font-bold tracking-wide mt-1.5 sm:mt-2">
              {currentStep ? (
                currentStep.type === 'click-wait' ? (
                  <span className="text-yellow-400 font-mono italic animate-pulse text-[11px] sm:text-sm">
                    ーーー クリックでストーリーを進行 ーーー
                  </span>
                ) : (
                  <span>
                    {typedText}
                    {isTyping && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-yellow-400 animate-pulse" />
                    )}
                  </span>
                )
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-400">シナリオの終わりに到達しました</h3>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1">「最初から」ボタンで再度体験するか、右上の×ボタンで記事編集に戻れます。</p>
                </div>
              )}
            </div>

            {/* Glowing Advanced Trigger Icon */}
            {currentStep && (
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-zinc-400 group-hover:text-yellow-400 hover:scale-110 transition-all flex items-center gap-1">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-mono hidden sm:inline group-hover:opacity-100 opacity-60">
                  {isTyping ? "SKIP" : "NEXT"}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 h-4 ${isTyping ? 'animate-bounce' : 'animate-pulse'}`} />
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Backlog Side Panel Modal component */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 flex justify-end"
            id="backlog-overlay"
            onClick={() => setShowLog(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()} // stop click bubbling
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xs font-black tracking-wider uppercase text-zinc-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-yellow-500" />
                  会話履歴 (バックログ)
                </h3>
                <button
                  onClick={() => setShowLog(false)}
                  className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded text-xs transition-colors cursor-pointer"
                >
                  閉じる
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4" id="log-list">
                {backlog.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500 text-xs">
                    まだログはありません。
                  </div>
                ) : (
                  backlog.map((log, index) => (
                    <div key={index} className="text-xs space-y-1 pb-3 border-b border-zinc-800/30">
                      {log.speakerName ? (
                        <div
                          style={{ color: log.color || '#9ca3af' }}
                          className="font-black text-[11px] uppercase tracking-wider"
                        >
                          {log.speakerName}
                        </div>
                      ) : (
                        <div className="text-zinc-500 font-bold text-[10px] tracking-widest">
                          [天の声 / ナレーション]
                        </div>
                      )}
                      <p className="text-zinc-200 leading-relaxed font-medium">{log.text}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Ending Overlay */}
      <AnimatePresence>
        {isEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md px-6 text-center select-none"
            id="ending-screen-overlay"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="w-full max-w-sm space-y-6 bg-zinc-900/40 p-8 rounded-3xl border border-white/5 shadow-2xl"
              id="ending-screen-card"
            >
              <div className="space-y-2">
                <span className="text-[10px] text-emerald-400 tracking-widest font-black uppercase block animate-pulse">
                  Story Completed
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-widest uppercase">
                  SCENE END
                </h2>
                <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full mt-1.5" />
              </div>
              
              <p className="text-zinc-400 text-xs leading-relaxed">
                お疲れ様でした！このシナリオの最後まで到達しました。
              </p>

              <div className="pt-4 flex flex-col gap-3 items-center">
                <button
                  disabled={!canClose}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canClose) onClose();
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all tracking-wider uppercase cursor-pointer ${
                    canClose
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-zinc-850 text-zinc-500 cursor-not-allowed opacity-80'
                  }`}
                  id="btn-ending-close"
                >
                  {canClose ? "ブログ編集に戻る" : "まもなく終了..."}
                </button>
                
                <button
                  disabled={!canClose}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canClose) {
                      handleReset();
                      setIsEnded(false);
                    }
                  }}
                  className={`w-full py-2.5 bg-transparent border border-zinc-800 hover:bg-zinc-850 rounded-xl font-bold text-[11px] transition-all tracking-wider ${
                    canClose
                      ? 'text-zinc-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                      : 'text-zinc-650 cursor-not-allowed'
                  }`}
                  id="btn-ending-reset"
                >
                  最初からやり直す
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
