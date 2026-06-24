/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useMemo } from 'react';
import { BlogItem, ParsedScenario, ScenarioConfig } from '../types';
import { parseBlogContent } from '../utils/parser';
import { FileText, Play, Plus, BookOpen, AlertCircle, Layout, HelpCircle, RotateCcw } from 'lucide-react';

interface BlogEditorProps {
  blogs: BlogItem[];
  selectedBlogId: string;
  onSelectBlog: (id: string) => void;
  onUpdateBlog: (id: string, updated: Partial<BlogItem>) => void;
  onCreateBlog: () => void;
  onPlayScenario: (scenario: ParsedScenario) => void;
  onLoadSample: (sampleId: string) => void;
  scenarios: Record<string, ScenarioConfig>;
}

export default function BlogEditor({
  blogs,
  selectedBlogId,
  onSelectBlog,
  onUpdateBlog,
  onCreateBlog,
  onPlayScenario,
  onLoadSample,
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
    <div className="max-w-4xl mx-auto flex flex-col gap-6 p-4 md:p-6" id="blog-editor-root">
      {/* Editor & Scenario Play Area */}
      <div className="flex flex-col gap-6 bg-white border border-zinc-200 rounded-2xl p-5 md:p-8 shadow-sm" id="blog-editor-main">
        {currentBlog ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {parsedScenarios.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {parsedScenarios.map((scenario) => {
                    const config = scenarios[scenario.id];
                    const matchedName = config ? config.name : `カスタム(${scenario.id})`;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => onPlayScenario(scenario)}
                        className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer transform hover:-translate-y-0.5"
                        id={`btn-play-scenario-${scenario.id}`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{scenario.title || matchedName} を再生</span>
                      </button>
                    );
                  })}
                </div>
              )}
              
              <div className="relative shrink-0 flex items-center">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      onLoadSample(val);
                      e.target.value = ""; // reset after selection
                    }
                  }}
                  className="appearance-none bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-bold py-2 pl-3 pr-8 rounded-lg cursor-pointer transition-colors border-none outline-none ring-0 w-[140px] truncate"
                  title="サンプル構成を読み込む"
                >
                  <option value="">▼ サンプルを読み込む</option>
                  <option value="sample-1">・オフィス編（上司と部下）</option>
                  <option value="sample-2">・ファンタジー編（大人数）</option>
                  <option value="sample-3">・複数同時発話編（カレー）</option>
                  <option value="sample-4">・スポット機能編（演出）</option>
                  <option value="sample-5">・新キャラクター紹介</option>
                  <option value="sample-6">・宇宙人のチキュウジン観察</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <div className="flex flex-col notranslate" id="editor-body" translate="no">
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
                className="w-full min-h-[380px] text-xs font-mono p-4 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 bg-zinc-50/60 hover:bg-zinc-50/30 leading-relaxed text-zinc-800 notranslate"
                style={{ tabSize: 2 }}
                translate="no"
                id="textarea-blog-content"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <BookOpen className="w-12 h-12 mb-3 stroke-1" />
            <p className="text-xs">表示可能なブログ記事がありません。新規作成してください。</p>
          </div>
        )}

        {/* Updated How to Use guide at the bottom of the editor */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-xs text-zinc-750 space-y-3" id="editor-instructions-panel">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 border-b border-zinc-250 pb-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Adv_Player ゲームタグの書き方・再生方法</span>
          </div>
          <p className="leading-relaxed text-[11px] text-zinc-650">
            ブログのHTML編集や文章中に以下の会話劇タグを記述すると、Adv_Player が自動で読み取って豪華演出で再生します。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">記述ルール</span>
              <ul className="space-y-2 text-[11px] text-zinc-600">
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1 py-0.5 rounded text-[10.5px] select-all shrink-0">【タイトル】</span>
                  <span className="leading-relaxed">
                    次の行に会話ゲームのタイトル（例: 「佐藤部長の抜き打ちチェック」など）を設定します。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1 py-0.5 rounded text-[10.5px] select-all shrink-0">【上司と部下】</span>
                  <span className="leading-relaxed">
                    アセット設定済みのシーン名で行を開始し、会話劇を始めます（他には：<code className="bg-zinc-200 px-0.5">【ファンタジー遭遇】</code>、<code className="bg-zinc-200 px-0.5">【幼馴染の図書室】</code>）。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1 py-0.5 rounded text-[10.5px] select-all shrink-0">役名: 台詞</span>
                  <span className="leading-relaxed">
                    「名前: セリフ」のように記述します（例「部下: おはようございます」）。名前がない行はナレーションになります。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1 py-0.5 rounded text-[10.5px] select-all shrink-0">【スポット】役名</span>
                  <span className="leading-relaxed">
                    指定したキャラを中央に移動させスポットを当てます。<code className="bg-zinc-200 px-0.5 font-bold">【スポット終了】</code> または他キャラが話すと解除されます。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1 py-0.5 rounded text-[10.5px] select-all shrink-0">【おわり】</span>
                  <span className="leading-relaxed">
                    または <code className="bg-zinc-200 px-0.5 font-bold">【終了】</code> を記載した時点で、会話ゲームを終了させ地文（ブログ通常文）に戻します。
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">記述例</span>
              <pre className="text-[10.5px] leading-relaxed font-mono text-zinc-700 bg-zinc-50 p-2.5 rounded border overflow-x-auto select-all">
{`【タイトル】
サンプル会話劇（サンプル）

【上司と部下】
上司: 部下さん、よくやってくれたね。

部下: ありがとうございます！
【おわり】`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
