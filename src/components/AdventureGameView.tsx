/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ParsedScenario, ScenarioConfig, DialogueItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, X, ChevronRight, CornerDownLeft, Eye, MessageSquare, FastForward } from 'lucide-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isSkip, setIsSkip] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const typewriterTimer = useRef<NodeJS.Timeout | null>(null);
  const audioSynth = useMemo(() => new RetroAudioSynth(), []);

  // Backlog logs previous dialogue strings
  const [backlog, setBacklog] = useState<{ speakerName?: string; text: string; color?: string }[]>([]);

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
  const findCharacterConfig = (speaker: string | undefined) => {
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

    // Fuzzy fallbacks for specific default scenarios
    const lowerSpeaker = cleanSpeaker.toLowerCase();
    if (config.id === "上司と部下" || config.id.includes("上司")) {
      if (lowerSpeaker.includes("上司") || lowerSpeaker.includes("佐藤") || lowerSpeaker.includes("部長") || lowerSpeaker.includes("ボス")) {
        return Object.values(config.characters).find(c => c.key === "上司" || c.key === "佐藤" || c.position === "left");
      }
      if (lowerSpeaker.includes("部下") || lowerSpeaker.includes("鈴木") || lowerSpeaker.includes("社員") || lowerSpeaker.includes("くん")) {
        return Object.values(config.characters).find(c => c.key === "部下" || c.key === "鈴木" || c.position === "right");
      }
    }
    if (config.id === "ファンタジー遭遇") {
      if (lowerSpeaker.includes("勇者") || lowerSpeaker.includes("アルス")) {
        return Object.values(config.characters).find(c => c.key === "勇者" || c.position === "left");
      }
      if (lowerSpeaker.includes("魔王") || lowerSpeaker.includes("ルシファー")) {
        return Object.values(config.characters).find(c => c.key === "魔王" || c.position === "right");
      }
    }
    if (config.id === "幼馴染の図書室") {
      if (lowerSpeaker.includes("葵") || lowerSpeaker.includes("あおい")) {
        return Object.values(config.characters).find(c => c.key === "葵" || c.position === "left");
      }
      if (lowerSpeaker.includes("颯太") || lowerSpeaker.includes("そうた")) {
        return Object.values(config.characters).find(c => c.key === "颯太" || c.position === "right");
      }
    }

    // Default: find any character whose key matches or is close
    const foundByKeyMatch = Object.values(config.characters).find(
      c => c.key.includes(cleanSpeaker) || cleanSpeaker.includes(c.key)
    );
    if (foundByKeyMatch) return foundByKeyMatch;

    return null;
  };

  // Play intro sound on start
  useEffect(() => {
    // Trigger on first render of the overlay
    audioSynth.playIntro();
    return () => {
      if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    };
  }, []);

  // Trigger typed content update on step changes
  useEffect(() => {
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

    // Handle dialogue types
    const textToType = currentStep.text || '';
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
            // Check if user hasn't already advanced since completed
            handleNext();
          }, 1800);
        }
      }
    }, speed);

    return () => {
      if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    };
  }, [currentIndex, isSkip, scenario]);

  // Handle auto advance triggers when toggling autoplay
  useEffect(() => {
    if (isAutoplay && !isTyping && currentStep) {
      const waitTime = currentStep.type === 'click-wait' ? 1000 : 1800;
      const t = setTimeout(() => {
        handleNext();
      }, waitTime);
      return () => clearTimeout(t);
    }
  }, [isAutoplay, isTyping, currentIndex]);

  // Advance story
  const handleNext = () => {
    if (isTyping && currentStep && currentStep.type === 'dialogue') {
      // Click during typewriter skips/instant-displays the text
      if (typewriterTimer.current) {
        clearInterval(typewriterTimer.current);
        typewriterTimer.current = null;
      }
      setTypedText(currentStep.text || '');
      setIsTyping(false);

      const speakerData = findCharacterConfig(currentStep.speaker);
      setBacklog(prev => [
        ...prev,
        {
          speakerName: speakerData?.displayName || currentStep.speaker,
          text: currentStep.text || '',
          color: speakerData?.color
        }
      ]);
      return;
    }

    // Go to next item
    if (currentIndex < scenario.items.length - 1) {
      audioSynth.playNext();
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
    setTypedText('');
    setIsTyping(false);
    setBacklog([]);
    audioSynth.playIntro();
  };

  // Determine active speaker highlight
  const activeSpeakerKey = currentStep?.speaker;
  const resolvedSpeakerConfig = findCharacterConfig(activeSpeakerKey);

  // Render character entries
  const renderedCharacters = useMemo(() => {
    return Object.values(config.characters).map((charConfig) => {
      const isSpeaking = resolvedSpeakerConfig?.key === charConfig.key;
      const existsOnStage = currentStep?.type === 'dialogue'; // hide or grey out when click waits
      const isLeft = charConfig.position === 'left';

      // Decide sprite classes based on active state
      const highlightClass = isSpeaking
        ? 'brightness-100 contrast-100 scale-105 z-20 shadow-2xl ring-4 ring-white/50'
        : 'brightness-50 contrast-90 scale-95 z-10';

      return (
        <motion.div
          key={charConfig.key}
          initial={{ opacity: 0, x: isLeft ? -120 : 120, y: 20 }}
          animate={{ opacity: existsOnStage ? 1 : 0.6, x: 0, y: 0 }}
          exit={{ opacity: 0, x: isLeft ? -100 : 100 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className={`flex flex-col items-center pointer-events-none select-none max-w-[200px] sm:max-w-[250px] transition-all duration-300 ${highlightClass}`}
        >
          {/* Avatar frame */}
          <div className="relative rounded-2xl overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-xl aspect-square w-32 sm:w-44 md:w-52">
            <img
              src={charConfig.avatarUrl}
              alt={charConfig.displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            
            {/* Status light tag */}
            {isSpeaking && (
              <div className="absolute top-2 right-2 bg-rose-500 text-[9px] text-white px-1.5 py-0.5 rounded font-black tracking-widest uppercase animate-pulse">
                TALKING
              </div>
            )}
          </div>

          {/* Label banner */}
          <div
            style={{ backgroundColor: charConfig.color }}
            className="mt-3 px-4 py-1.5 rounded-lg text-white font-bold text-xs sm:text-sm tracking-wide shadow-md border border-white/20 whitespace-nowrap min-w-[100px] text-center"
          >
            {charConfig.displayName}
          </div>
        </motion.div>
      );
    });
  }, [config, activeSpeakerKey, currentStep]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between bg-zinc-950 font-sans text-zinc-100"
      id="adventure-game-overlay"
    >
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
      <header className="relative z-20 flex items-center justify-between p-4 md:px-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Adventure Mode Active
          </span>
          <h1 className="text-sm md:text-base font-black tracking-tight text-white drop-shadow">
            {scenario.title || config.name}
          </h1>
        </div>

        {/* Dashboard Tools */}
        <div className="flex items-center gap-2">
          {/* Backlog viewer button */}
          <button
            onClick={() => setShowLog(!showLog)}
            className={`p-2 rounded-lg border text-xs gap-1 flex items-center transition-colors cursor-pointer ${
              showLog ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-black/40 text-zinc-300 border-white/10 hover:bg-black/60'
            }`}
            title="会話ログ"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">ログ({backlog.length})</span>
          </button>

          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-zinc-300 transition-colors cursor-pointer"
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Close adventure game button */}
          <button
            onClick={onClose}
            className="p-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-all shadow-lg hover:rotate-90 duration-200 cursor-pointer"
            title="ゲームを終了"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Stage: Character Area */}
      <main className="relative z-10 flex-1 flex items-end justify-between px-6 sm:px-16 md:px-24 pb-4 select-none">
        <div className="absolute inset-0 bg-transparent z-0 pointer-events-none" />

        {/* Left Character Slot */}
        <div className="w-1/3 flex justify-start">
          {renderedCharacters.filter((_, idx) => idx % 2 === 0)}
        </div>

        {/* Center / Narrator Slot or Info Indicator */}
        <div className="w-1/3 flex justify-center pb-12 self-center">
        </div>

        {/* Right Character Slot */}
        <div className="w-1/3 flex justify-end">
          {renderedCharacters.filter((_, idx) => idx % 2 !== 0)}
        </div>
      </main>

      {/* Bottom Segment: UI, controls, and dialog box */}
      <footer className="relative z-20 bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          
          {/* Sub-Controller Rails */}
          <div className="flex items-center justify-between px-1">
            {/* Progress counter */}
            <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-3 py-1 rounded-full border border-white/5">
              SCENE PROGRESS:{' '}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSkip(false);
                  setIsAutoplay(!isAutoplay);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                  isAutoplay
                    ? 'bg-amber-600 text-white border-amber-500 font-black animate-pulse'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>オート再生: {isAutoplay ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => {
                  setIsAutoplay(false);
                  setIsSkip(!isSkip);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                  isSkip
                    ? 'bg-rose-600 text-white border-rose-500 font-black'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
                title="セリフ演出をスキップして高速で進めます"
              >
                <FastForward className="w-3 h-3" />
                <span>スキップ: {isSkip ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white px-3 py-1 rounded-full text-[10px] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>最初から</span>
              </button>
            </div>
          </div>

          {/* Interactive Dialogue container */}
          <div
            onClick={handleNext}
            className={`group relative min-h-[140px] rounded-2xl p-5 md:p-6 shadow-2xl transition-all cursor-pointer select-none backdrop-blur border bg-black/75 hover:bg-black/85 ${
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
                  className="absolute -top-3.5 left-6 px-4 py-1 rounded-lg text-white font-black text-xs tracking-wider uppercase shadow-md border border-white/20 whitespace-nowrap"
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
                  className="absolute -top-3.5 left-6 bg-zinc-700 px-4 py-1 rounded-lg text-white font-black text-xs tracking-wider uppercase shadow-md border border-white/20 whitespace-nowrap"
                >
                  {currentStep.speaker}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Main Text Content */}
            <div className="text-sm md:text-base leading-relaxed font-medium md:font-bold tracking-wide mt-2">
              {currentStep ? (
                currentStep.type === 'click-wait' ? (
                  <span className="text-yellow-400 font-mono italic animate-pulse">
                    ーーー クリックでストーリーを進行 ーーー
                  </span>
                ) : (
                  <span>
                    {typedText}
                    {isTyping && (
                      <span className="inline-block w-1 h-4 ml-1 bg-yellow-400 animate-ping" />
                    )}
                  </span>
                )
              ) : (
                <div className="text-center py-6">
                  <h3 className="text-sm font-bold text-zinc-400">シナリオの終わりに到達しました</h3>
                  <p className="text-[11px] text-zinc-500 mt-1">「最初から」ボタンで再度体験するか、右上の×ボタンで記事編集に戻れます。</p>
                </div>
              )}
            </div>

            {/* Glowing Advanced Trigger Icon */}
            {currentStep && (
              <div className="absolute bottom-4 right-4 text-zinc-400 group-hover:text-yellow-400 hover:scale-110 transition-all flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-widest font-mono hidden sm:inline group-hover:opacity-100 opacity-60">
                  {isTyping ? "SKIP" : "NEXT"}
                </span>
                <ChevronRight className={`w-4 h-4 ${isTyping ? 'animate-bounce' : 'animate-pulse'}`} />
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
            onClick={onClose}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-widest uppercase">
                SCENE END
              </h2>
              <p className="text-zinc-400 text-sm animate-pulse">
                画面をクリックして閉じる
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
