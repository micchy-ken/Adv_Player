/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScenarioConfig, CharacterConfig } from '../types';
import { Sliders, User, Image, Palette, Download, HelpCircle, Package, X } from 'lucide-react';

interface ScenarioManagerProps {
  scenarios: Record<string, ScenarioConfig>;
}

export default function ScenarioManager({ scenarios }: ScenarioManagerProps) {
  const [selectedId, setSelectedId] = useState<string>(Object.keys(scenarios)[0] || '');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const activeScenario = scenarios[selectedId];

  // Export current scenarios as JSON configuration file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenarios, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "adventure_scenarios.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-6" id="scenario-manager-root">
      
      {/* Sidebar - Scenario select & Export */}
      <div className="lg:col-span-1 flex flex-col gap-4 bg-zinc-50 border border-zinc-200 rounded-xl p-4 shadow-sm" id="scenario-sidebar">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-purple-600" />
            登録済みシナリオ一覧
          </h2>
          <div className="flex flex-col gap-1.5" id="scenario-list">
            {Object.keys(scenarios).map((id) => (
              <div key={id} className="group flex items-center justify-between gap-1">
                <button
                  onClick={() => setSelectedId(id)}
                  className={`flex-1 text-left px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedId === id
                      ? 'bg-purple-50 text-purple-950 border-purple-300 ring-1 ring-purple-300/30'
                      : 'bg-white border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div className="text-[11px] font-bold text-zinc-700 mb-1">{id}</div>
                  {scenarios[id].characters && Object.keys(scenarios[id].characters).length > 0 && (
                    <div className="text-[9.5px] font-normal text-zinc-500 overflow-hidden text-ellipsis line-clamp-1 leading-relaxed">
                      {Object.values(scenarios[id].characters).map(c => c.displayName || c.key).join(', ')}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* JSON Backup tools */}
        <div className="border-t border-zinc-200 pt-4 space-y-2.5">
          <h4 className="text-[11px] font-bold text-zinc-700">外部連携ツール</h4>
          <p className="text-[9px] text-zinc-500">将来的なSQL等への移行用データファイルとして出力します。</p>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold tracking-wide py-1.5 px-2 bg-zinc-800 hover:bg-zinc-900 border border-zinc-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              設定を書き出す（JSON）
            </button>
          </div>
        </div>
      </div>

      {/* Editor Main Board (Read Only) */}
      <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl p-4 md:p-6 shadow-sm flex flex-col gap-6" id="scenario-manager-main">
        {activeScenario ? (
          <>
            {/* Top config */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-zinc-800">
                    現在のシナリオID: <span className="font-mono text-purple-600 font-black">【{activeScenario.id}】</span>
                  </h3>
                </div>
              </div>

              <div className="flex gap-4">
                {/* Theme highlight */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-zinc-500" />
                    テーマのアクセント
                  </label>
                  <input
                    type="text"
                    value={activeScenario.themeColor}
                    readOnly
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Scenes config card boards */}
            {activeScenario.scenes && Object.keys(activeScenario.scenes).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-purple-600" />
                    シーン設定 (背景画像の切り替え)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(activeScenario.scenes).map(([sceneName, sceneUrl]: [string, string]) => (
                    <div key={sceneName} className="border border-zinc-200 rounded-xl p-4 flex flex-col gap-3 bg-zinc-50/50">
                      <div className="flex items-start gap-3">
                        <div className="w-24 h-16 rounded-xl border border-zinc-200 overflow-hidden bg-white shrink-0 shadow">
                          <img
                            src={sceneUrl}
                            alt={`Scene ${sceneName}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setExpandedImage(sceneUrl)}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-[10px] font-mono text-zinc-400">
                            シーン名: <span className="text-zinc-700 font-bold font-sans bg-zinc-100 px-1 py-0.5 rounded">【シーン】{sceneName}</span>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-500 mt-2 mb-0.5">画像URL</label>
                            <input
                              type="text"
                              value={sceneUrl}
                              readOnly
                              className="w-full text-xs px-2 py-1 rounded border border-zinc-200 bg-zinc-100 text-zinc-500 font-mono cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Character list config card boards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  登場人物の設定 (キャラクタープロファイル)
                </h3>
              </div>

              {Object.keys(activeScenario.characters).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                  登場人物が登録されていません。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(activeScenario.characters).map(([key, char]: [string, any]) => (
                    <div key={key} className="border border-zinc-200 rounded-xl p-4 flex flex-col gap-3 bg-zinc-50/50 transition-all relative">
                      
                      {/* Key badge / Avatar mini form */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden bg-white shrink-0 shadow">
                          <img
                            src={char.avatarUrl}
                            alt={char.displayName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setExpandedImage(char.avatarUrl)}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-[10px] font-mono text-zinc-400">
                            ブログ紐付け名: <span className="text-zinc-700 font-bold font-sans bg-zinc-100 px-1 py-0.5 rounded">&#123;{char.key}&#125;</span>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-zinc-500">ゲーム内表示名</label>
                            <input
                              type="text"
                              value={char.displayName}
                              readOnly
                              className="w-full text-xs px-2 py-1 rounded border border-zinc-200 bg-zinc-100 text-zinc-500 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Detail configurations (avatar, color, position) */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/50 text-[10px]">
                        <div>
                          <label className="block text-zinc-500 mb-0.5 font-bold">ブランド色</label>
                          <div className="flex gap-1.5 items-center">
                            <div className="w-5 h-5 rounded border border-zinc-300" style={{ backgroundColor: char.color }} />
                            <span className="font-mono text-[9px] uppercase">{char.color}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-500 mb-0.5 font-bold">立ち位置</label>
                          <input
                            title="Position"
                            value={char.position === 'left' ? '左 (Left)' : char.position === 'right' ? '右 (Right)' : '中央 (Center)'}
                            readOnly
                            className="w-full text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-100 text-zinc-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Image custom URL */}
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 mb-0.5">画像URL</label>
                        <input
                          type="text"
                          value={char.avatarUrl}
                          readOnly
                          className="w-full text-[10px] px-2 py-0.5 rounded border border-zinc-200 bg-zinc-100 text-zinc-400 font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items list config card boards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" />
                  アイテムの設定
                </h3>
              </div>

              {!activeScenario.items || Object.keys(activeScenario.items).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                  アイテムが登録されていません。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(activeScenario.items).map(([key, item]: [string, any]) => (
                    <div key={key} className="border border-zinc-200 rounded-xl p-4 flex flex-col gap-3 bg-zinc-50/50 transition-all relative">
                      
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden bg-white shrink-0 shadow">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain cursor-pointer hover:opacity-80 transition-opacity p-1"
                            onClick={() => setExpandedImage(item.imageUrl)}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-[10px] font-mono text-zinc-400">
                            ブログ紐付け名: <span className="text-zinc-700 font-bold font-sans bg-zinc-100 px-1 py-0.5 rounded">&#123;{item.key}&#125;</span>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-zinc-500">ゲーム内表示名</label>
                            <input
                              type="text"
                              value={item.name}
                              readOnly
                              className="w-full text-xs px-2 py-1 rounded border border-zinc-200 bg-zinc-100 text-zinc-500 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Image custom URL */}
                      <div className="pt-2 border-t border-zinc-200/50">
                        <label className="block text-[9px] font-bold text-zinc-500 mb-0.5">画像URL</label>
                        <input
                          type="text"
                          value={item.imageUrl}
                          readOnly
                          className="w-full text-[10px] px-2 py-0.5 rounded border border-zinc-200 bg-zinc-100 text-zinc-400 font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hint Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex gap-2 text-xs text-zinc-600 items-start">
              <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-zinc-800">ブログ内で作成キャラクターを呼び出す方法</span>
                <p className="leading-relaxed">
                  ブログ作成画面などで、シナリオブロック <code className="bg-zinc-100 font-mono text-[10px] px-1 py-0.5 rounded text-zinc-800">【{activeScenario.id}】</code> 内に、登場人物キーを書いてコロン (<code className="bg-zinc-100 font-mono text-[10px] px-0.5 py-0.5 rounded text-zinc-800">:</code>) で区切ります。
                </p>
                <div className="font-mono bg-white p-2 rounded-md border text-[10px] space-y-1">
                  <div>【{activeScenario.id}】</div>
                  {Object.keys(activeScenario.characters).slice(0, 2).map((key, i) => (
                    <div key={key}>{key}: {i === 0 ? "おや、今日もブログを編集しているね！" : "はい！リアルタイムにシミュレートを検証しています。"}</div>
                  ))}
                  <div>【終了】</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Sliders className="w-12 h-12 mb-3 stroke-1" />
            <p className="text-xs">表示できるシナリオ設定がありません。</p>
          </div>
        )}
      </div>
      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
              onClick={() => setExpandedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={expandedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-full object-contain drop-shadow-2xl rounded"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
