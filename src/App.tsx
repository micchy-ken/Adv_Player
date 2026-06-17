/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { BlogItem, ScenarioConfig, ParsedScenario } from './types';
import { DEFAULT_BLOGS, DEFAULT_SCENARIOS } from './data/scenarios';
import BlogEditor from './components/BlogEditor';
import ScenarioManager from './components/ScenarioManager';
import AdventureGameView from './components/AdventureGameView';
import { BookOpen, Sliders, Play, Github, Gamepad2, Info } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [blogs, setBlogs] = useState<BlogItem[]>(DEFAULT_BLOGS);
  const [scenarios, setScenarios] = useState<Record<string, ScenarioConfig>>(DEFAULT_SCENARIOS);
  const [selectedBlogId, setSelectedBlogId] = useState<string>(DEFAULT_BLOGS[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'scenarios'>('editor');
  
  // Game state: when populated, shows the adventure game popup overlay over the whole screen
  const [activePlayScenario, setActivePlayScenario] = useState<ParsedScenario | null>(null);

  // Update specific blog
  const handleUpdateBlog = (id: string, updated: Partial<BlogItem>) => {
    setBlogs((prev) =>
      prev.map((blog) => (blog.id === id ? { ...blog, ...updated } : blog))
    );
  };

  // Add new blank blog post
  const handleCreateBlog = () => {
    const newId = `blog-${Date.now()}`;
    const newBlog: BlogItem = {
      id: newId,
      title: "新しいコラム記事",
      category: "日常コラム",
      description: "アドベンチャータグを埋め込んで読み込みテストを行えます。",
      content: `### 記事の導入部分

ここに日常の話を書きます。
ちょっとしたドラマ仕立ての対話を下に書いてみます。

***タイトル***
放課後の小さな相談会

***幼馴染の図書室***
葵: ねえ、ちょっと時間ある？

颯太: どうしたんだ、そんな真剣な顔して。

葵: ……別に。ただ、ちょっと相談したいことがあっただけよ。
 
颯太: そうか、なんでも聞くよ。

葵: ……やっぱりなんでもない！バカ！
***end***

このように、任意のタイミングでタグを締めくくることでブログと会話劇が自然に融合します。`
    };

    setBlogs((prev) => [newBlog, ...prev]);
    setSelectedBlogId(newId);
  };

  // Upstream update for scenarios
  const handleUpdateScenario = (id: string, updated: ScenarioConfig) => {
    setScenarios((prev) => ({
      ...prev,
      [id]: updated
    }));
  };

  // Upstream insertion of new scenario
  const handleAddScenario = (newScenario: ScenarioConfig) => {
    setScenarios((prev) => ({
      ...prev,
      [newScenario.id]: newScenario
    }));
  };

  // Upstream delete of scenarios
  const handleDeleteScenario = (id: string) => {
    setScenarios((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Play a specific extracted scenario
  const handlePlayScenario = (parsed: ParsedScenario) => {
    setActivePlayScenario(parsed);
  };

  // Find configuration for active scenario
  const activeConfig = activePlayScenario ? scenarios[activePlayScenario.id] : null;

  // Render a safety default config in case blogger used a scenario keyword they haven't configured yet
  const resolvedConfig: ScenarioConfig = activeConfig || {
    id: activePlayScenario?.id || "temp",
    name: "一時的な会話空間",
    backgroundUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    themeColor: "indigo",
    characters: {}
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" id="app-root">
      {/* Top Main Navigation Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/10 shrink-0">
            <Gamepad2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-zinc-950 tracking-tight">
              Blog to Adventure Game Builder
            </h1>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              ブログ会話劇シミュレーター • プロトタイプ
            </p>
          </div>
        </div>

        {/* View Switches & GitHub Info */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tab switches */}
          <div className="bg-zinc-100 p-1 rounded-xl flex border border-zinc-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              id="tab-editor"
            >
              <BookOpen className="w-3.5 h-3.5" />
              記事作成 & プレビュー
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'scenarios'
                  ? 'bg-white text-purple-950 shadow-xs'
                  : 'text-zinc-500 hover:text-purple-950'
              }`}
              id="tab-scenarios"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              演出 & キャスト設定 (JSON)
            </button>
          </div>

          {/* GitHub deployment auto indicator */}
          <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 text-zinc-500 px-3 py-1.5 rounded-xl text-[10px] font-semibold">
            <Github className="w-3.5 h-3.5" />
            <span>CI/CD: Auto Publish</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Automatic Push-to-Deploy enabled" />
          </div>
        </div>
      </header>

      {/* Info Status Board */}
      <section className="bg-emerald-600 font-semibold text-white px-6 py-2.5 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>💡 使い方: 記事本文に会話劇タグを埋め込んで再生ボタンを押します。キャスト設定で表情や背景もカスタマイズ可能！</span>
        </div>
      </section>

      {/* Main Container Content */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto" id="app-body-container">
        {activeTab === 'editor' ? (
          <BlogEditor
            blogs={blogs}
            selectedBlogId={selectedBlogId}
            onSelectBlog={setSelectedBlogId}
            onUpdateBlog={handleUpdateBlog}
            onCreateBlog={handleCreateBlog}
            onPlayScenario={handlePlayScenario}
            scenarios={scenarios}
          />
        ) : (
          <ScenarioManager
            scenarios={scenarios}
            onUpdateScenario={handleUpdateScenario}
            onAddScenario={handleAddScenario}
            onDeleteScenario={handleDeleteScenario}
          />
        )}
      </div>

      {/* Full-Screen Conversation Game Overlay component */}
      <AnimatePresence>
        {activePlayScenario && (
          <AdventureGameView
            scenario={activePlayScenario}
            config={resolvedConfig}
            onClose={() => setActivePlayScenario(null)}
          />
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 mt-auto">
        <p>© 2026 Blog Adventure Game Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}
