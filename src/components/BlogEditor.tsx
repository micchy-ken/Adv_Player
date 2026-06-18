/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { BlogItem, ParsedScenario, ScenarioConfig } from '../types';
import { DEFAULT_BLOGS } from '../data/scenarios';
import { parseBlogContent } from '../utils/parser';
import { FileText, Play, Plus, BookOpen, AlertCircle, Layout, HelpCircle, Code } from 'lucide-react';

interface BlogEditorProps {
  blogs: BlogItem[];
  selectedBlogId: string;
  onSelectBlog: (id: string) => void;
  onUpdateBlog: (id: string, updated: Partial<BlogItem>) => void;
  onCreateBlog: () => void;
  onPlayScenario: (scenario: ParsedScenario) => void;
  scenarios: Record<string, ScenarioConfig>;
}

export default function BlogEditor({
  blogs,
  selectedBlogId,
  onSelectBlog,
  onUpdateBlog,
  onCreateBlog,
  onPlayScenario,
  scenarios
}: BlogEditorProps) {
  const currentBlog = useMemo(() => {
    return blogs.find((b) => b.id === selectedBlogId) || blogs[0];
  }, [blogs, selectedBlogId]);

  const parsedScenarios = useMemo(() => {
    if (!currentBlog) return [];
    return parseBlogContent(currentBlog.content);
  }, [currentBlog]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-6" id="blog-editor-root">
      {/* Sidebar: Blog list */}
      <div className="lg:col-span-1 flex flex-col gap-4 bg-zinc-50 border border-zinc-200 rounded-xl p-4 shadow-sm" id="blog-list-sidebar">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            記事一覧
          </h2>
          <button
            onClick={onCreateBlog}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium cursor-pointer shadow-subtle"
            id="btn-new-blog"
          >
            <Plus className="w-3.5 h-3.5" />
            新規作成
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[250px] lg:max-h-[500px] overflow-y-auto pr-1" id="blogs-container">
          {blogs.map((blog) => {
            const isSelected = blog.id === selectedBlogId;
            return (
              <button
                key={blog.id}
                onClick={() => onSelectBlog(blog.id)}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-white border-zinc-200 hover:bg-zinc-50'
                }`}
                id={`blog-item-${blog.id}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold tracking-wider uppercase">
                  <span className={`px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-800'
                  }`}>
                    {blog.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 line-clamp-1">
                  {blog.title || "無題の記事"}
                </h3>
                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                  {blog.description || "説明はありません。"}
                </p>
              </button>
            );
          })}
        </div>

        {/* Short Guide */}
        <div className="mt-auto bg-zinc-100 border border-zinc-200 rounded-lg p-3 text-[11px] text-zinc-600 space-y-2">
          <div className="flex items-center gap-1 font-bold text-zinc-800">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            ゲームタグの使い方
          </div>
          <p className="leading-relaxed">
            本文中に以下のタグを埋め込むとアドベンチャーゲームを生成できます：
          </p>
          <ul className="list-disc pl-4 space-y-1 font-mono bg-zinc-50 p-2 rounded border border-zinc-200/50 text-[10px]">
            <li><span className="text-pink-600">***タイトル***</span><br/>(ゲーム上部表示のタイトル)</li>
            <li><span className="text-pink-600">***上司と部下***</span><br/>(シナリオIDで開始)</li>
            <li><span className="text-amber-700">佐藤: メッセージ</span><br/>(キャラクター名＋コロン)</li>
            <li><span className="text-emerald-700 font-bold">(改行のみの行)</span><br/>(クリック待ち発生)</li>
            <li><span className="text-pink-600">***end***</span><br/>(シナリオを終了)</li>
          </ul>
        </div>
      </div>

      {/* Editor & Scenario Play Area */}
      <div className="lg:col-span-3 flex flex-col gap-4 bg-white border border-zinc-200 rounded-xl p-4 md:p-6 shadow-sm" id="blog-editor-main">
        {currentBlog ? (
          <>
            {/* Meta details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-zinc-100" id="blog-meta-form">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">記事タイトル</label>
                <input
                  type="text"
                  value={currentBlog.title}
                  onChange={(e) => onUpdateBlog(currentBlog.id, { title: e.target.value })}
                  placeholder="記事のタイトルを入力..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-zinc-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">カテゴリ</label>
                <input
                  type="text"
                  value={currentBlog.category}
                  onChange={(e) => onUpdateBlog(currentBlog.id, { category: e.target.value })}
                  placeholder="例: ビジネス、小説、チームワーク"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-zinc-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">記事の説明</label>
                <input
                  type="text"
                  value={currentBlog.description}
                  onChange={(e) => onUpdateBlog(currentBlog.id, { description: e.target.value })}
                  placeholder="一覧に表示する説明文..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-zinc-800"
                />
              </div>
            </div>

            {/* Playable Scenarios Alert Bar */}
            <div className="p-1" id="scenario-play-panel">
              {parsedScenarios.length > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 mt-0.5">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">
                        会話ゲームを生成しました ({parsedScenarios.length}件検出)
                      </h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        本文から会話シーンを抽出してビジュアルノベルゲームを構築しました。
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parsedScenarios.map((scenario) => {
                      const config = scenarios[scenario.id];
                      const matchedName = config ? config.name : `カスタム(${scenario.id})`;
                      return (
                        <button
                          key={scenario.id}
                          onClick={() => onPlayScenario(scenario)}
                          className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer transform hover:-translate-y-0.5"
                          id={`btn-play-scenario-${scenario.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{scenario.title || matchedName} を再生</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      現在、ゲーム用シナリオタグが検出されていません
                    </h4>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      本文中に <code className="bg-amber-100 font-mono text-[10px] px-1 py-0.5 rounded text-amber-900">***上司と部下***</code> や <code className="bg-amber-100 font-mono text-[10px] px-1 py-0.5 rounded text-amber-900">***幼馴染の図書室***</code> などのタグ、会話セリフ、そして <code className="bg-amber-100 font-mono text-[10px] px-1 py-0.5 rounded text-amber-900">***end***</code> タグを追加してください。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div className="flex-1 min-h-[300px] flex flex-col notranslate" id="editor-body" translate="no">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  ブログ本文 (編集可能)
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {currentBlog.content.length} 文字
                </span>
              </div>
              <textarea
                value={currentBlog.content}
                onChange={(e) => onUpdateBlog(currentBlog.id, { content: e.target.value })}
                placeholder="ここにブログの本文を自由に入力してください。会話パートを挟み込むことでゲーム風UIが起動できるようになります。"
                className="w-full flex-1 min-h-[350px] text-xs font-mono p-4 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 bg-zinc-50 hover:bg-zinc-50/50 leading-relaxed text-zinc-800 notranslate"
                style={{ tabSize: 2 }}
                translate="no"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <BookOpen className="w-12 h-12 mb-3 stroke-1" />
            <p className="text-xs">表示可能なブログ記事がありません。新規作成してください。</p>
          </div>
        )}
      </div>
    </div>
  );
}
