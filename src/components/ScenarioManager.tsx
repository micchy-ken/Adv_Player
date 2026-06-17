/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScenarioConfig, CharacterConfig } from '../types';
import { Sliders, User, Image, Palette, Download, Upload, Plus, Trash2, ArrowRightLeft, HelpCircle } from 'lucide-react';

interface ScenarioManagerProps {
  scenarios: Record<string, ScenarioConfig>;
  onUpdateScenario: (id: string, updated: ScenarioConfig) => void;
  onAddScenario: (newScenario: ScenarioConfig) => void;
  onDeleteScenario: (id: string) => void;
}

export default function ScenarioManager({
  scenarios,
  onUpdateScenario,
  onAddScenario,
  onDeleteScenario
}: ScenarioManagerProps) {
  const [selectedId, setSelectedId] = useState<string>(Object.keys(scenarios)[0] || '');
  const [newScenarioId, setNewScenarioId] = useState('');
  const [newScenarioName, setNewScenarioName] = useState('');

  const activeScenario = scenarios[selectedId];

  // Quick preset backgrounds and avatars
  const presetBackgrounds = [
    { name: "オフィス", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" },
    { name: "図書室", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80" },
    { name: "遺跡", url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80" },
    { name: "近未来都市", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80" },
    { name: "ファンタジーの森", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80" }
  ];

  const presetAvatars = [
    { role: "男性・部長役", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
    { role: "女性・キャリア役", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
    { role: "男性・若手社員役", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" },
    { role: "女性・若手社員役", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80" },
    { role: "男性・ダンディ役", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" },
    { role: "ファンタジーナイト役", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" },
    { role: "魔法使い・学者役", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" }
  ];

  const handleAddField = (fieldKey: string) => {
    if (!activeScenario) return;
    const charKey = prompt("登場人物のブログ内呼び出しキーを入力してください\n(例: 佐藤、勇者、ナレーターなど)", "");
    if (!charKey) return;

    const trimmedKey = charKey.trim();
    if (activeScenario.characters[trimmedKey]) {
      alert("そのキーは既に登録されています。");
      return;
    }

    const newChar: CharacterConfig = {
      key: trimmedKey,
      displayName: trimmedKey + " (名前表示)",
      avatarUrl: presetAvatars[0].url,
      color: "#2563eb",
      position: "left"
    };

    onUpdateScenario(selectedId, {
      ...activeScenario,
      characters: {
        ...activeScenario.characters,
        [trimmedKey]: newChar
      }
    });
  };

  const handleDeleteCharacter = (charKey: string) => {
    if (!activeScenario) return;
    const confirmed = confirm(`登場人物「${charKey}」を削除しますか？`);
    if (!confirmed) return;

    const updatedChars = { ...activeScenario.characters };
    delete updatedChars[charKey];

    onUpdateScenario(selectedId, {
      ...activeScenario,
      characters: updatedChars
    });
  };

  const handleUpdateCharacter = (charKey: string, updated: Partial<CharacterConfig>) => {
    if (!activeScenario) return;
    
    const updatedChar = {
      ...activeScenario.characters[charKey],
      ...updated
    };

    onUpdateScenario(selectedId, {
      ...activeScenario,
      characters: {
        ...activeScenario.characters,
        [charKey]: updatedChar
      }
    });
  };

  const handleCreateScenario = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newScenarioId.trim();
    const name = newScenarioName.trim();

    if (!id || !name) return;

    if (scenarios[id]) {
      alert("すでに同じIDのシナリオが存在します。別のIDを指定してください。");
      return;
    }

    const newScenario: ScenarioConfig = {
      id,
      name,
      backgroundUrl: presetBackgrounds[0].url,
      themeColor: "emerald",
      characters: {
        "主人公": {
          key: "主人公",
          displayName: "主人公",
          avatarUrl: presetAvatars[2].url,
          color: "#059669",
          position: "left"
        },
        "相手": {
          key: "相手",
          displayName: "相棒",
          avatarUrl: presetAvatars[3].url,
          color: "#db2777",
          position: "right"
        }
      }
    };

    onAddScenario(newScenario);
    setSelectedId(id);
    setNewScenarioId('');
    setNewScenarioName('');
  };

  const handleDeleteScenario = (id: string) => {
    const confirmed = confirm(`シナリオ設定「${id}」を削除しますか？この操作は取り消せません。`);
    if (!confirmed) return;

    onDeleteScenario(id);
    const remainingKeys = Object.keys(scenarios).filter(k => k !== id);
    if (remainingKeys.length > 0) {
      setSelectedId(remainingKeys[0]);
    } else {
      setSelectedId('');
    }
  };

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

  // Import JSON configuration file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          // Simple validation
          if (typeof parsed === 'object' && parsed !== null) {
            Object.keys(parsed).forEach(key => {
              if (parsed[key] && parsed[key].id && parsed[key].characters) {
                onAddScenario(parsed[key]);
              }
            });
            alert("シナリオ設定を正常にマージ・復元しました！");
            setSelectedId(Object.keys(parsed)[0]);
          } else {
            alert("無効なJSONフォーマットです。");
          }
        } catch (err) {
          alert("JSONファイルの解析に失敗しました。");
        }
      };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-6" id="scenario-manager-root">
      
      {/* Sidebar - Scenario select & Create */}
      <div className="lg:col-span-1 flex flex-col gap-4 bg-zinc-50 border border-zinc-200 rounded-xl p-4 shadow-sm" id="scenario-sidebar">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-purple-600" />
            シナリオ設定一覧
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
                  <div className="text-[10px] text-zinc-400 font-mono tracking-wide mb-0.5">ID: ***{id}***</div>
                  {scenarios[id].name}
                </button>
                <button
                  onClick={() => handleDeleteScenario(id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-100"
                  title="シナリオを削除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreateScenario} className="border-t border-zinc-200 pt-4 space-y-3">
          <h3 className="text-xs font-bold text-zinc-800 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-purple-600" />
            新規シナリオ空間を追加
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] uppercase tracking-wide font-semibold text-zinc-500 mb-1">
                タグID (ブログ本文内で指定、例: 上司と部下)
              </label>
              <input
                type="text"
                required
                value={newScenarioId}
                onChange={(e) => setNewScenarioId(e.target.value)}
                placeholder="タグID (英語も可)"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide font-semibold text-zinc-500 mb-1">
                設定名 (管理用)
              </label>
              <input
                type="text"
                required
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="例: 図書室での対話"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1 text-xs py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold cursor-pointer"
          >
            シナリオ設定を追加
          </button>
        </form>

        {/* JSON Backup tools (JSON推奨) */}
        <div className="border-t border-zinc-200 pt-4 space-y-2.5">
          <h4 className="text-[11px] font-bold text-zinc-700">プロファイル保存・復元</h4>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold tracking-wide py-1.5 px-2 bg-zinc-800 hover:bg-zinc-900 border border-zinc-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              JSONを書き出す
            </button>
            <label className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold tracking-wide py-1.5 px-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg transition-colors cursor-pointer text-center relative">
              <Upload className="w-3 h-3" />
              JSONを読込
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Editor Main Board */}
      <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl p-4 md:p-6 shadow-sm flex flex-col gap-6" id="scenario-manager-main">
        {activeScenario ? (
          <>
            {/* Top config */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-zinc-800">
                    現在のシナリオID: <span className="font-mono text-purple-600 font-black">***{activeScenario.id}***</span>
                  </h3>
                  <p className="text-[10.5px] text-zinc-400 mt-1">
                    ブログ内のタグとこのIDが一致すると、本設定の背景やキャラクタープロフィールが反映されます。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Background URL config */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-zinc-500" />
                    背景画像のURL
                  </label>
                  <input
                    type="text"
                    value={activeScenario.backgroundUrl}
                    onChange={(e) => onUpdateScenario(selectedId, { ...activeScenario, backgroundUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white"
                    placeholder="URLを入力..."
                  />

                  {/* Built-in backgrounds */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {presetBackgrounds.map((bg) => (
                      <button
                        key={bg.name}
                        onClick={() => onUpdateScenario(selectedId, { ...activeScenario, backgroundUrl: bg.url })}
                        className="text-[10px] px-2 py-0.5 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-all cursor-pointer"
                      >
                        {bg.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme highlight */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-zinc-500" />
                    テーマのアクセント
                  </label>
                  <input
                    type="text"
                    value={activeScenario.themeColor}
                    onChange={(e) => onUpdateScenario(selectedId, { ...activeScenario, themeColor: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white"
                    placeholder="例: amber, indigo, rose, emerald"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1.5">
                    アドベンチャー画面内の進捗インジケーター等のプライマリ色を変更します。
                  </p>
                </div>
              </div>
            </div>

            {/* Character list config card boards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  登場人物の設定 (キャラクタープロファイル)
                </h3>
                <button
                  onClick={() => handleAddField("characters")}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition-colors font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新キャストを追加
                </button>
              </div>

              {Object.keys(activeScenario.characters).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                  登場人物が未登録です。キャストを追加してください。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(activeScenario.characters).map(([key, char]) => (
                    <div key={key} className="border border-zinc-200 rounded-xl p-4 flex flex-col gap-3 bg-zinc-50/50 hover:bg-zinc-50/70 transition-all relative">
                      <button
                        onClick={() => handleDeleteCharacter(key)}
                        className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 rounded transition-all cursor-pointer"
                        title="キャストを削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Key badge / Avatar mini form */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden bg-white shrink-0 shadow">
                          <img
                            src={char.avatarUrl}
                            alt={char.displayName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
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
                              onChange={(e) => handleUpdateCharacter(key, { displayName: e.target.value })}
                              className="w-full text-xs px-2 py-1 rounded border border-zinc-200 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Detail configurations (avatar, color, position) */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200/50 text-[10px]">
                        <div>
                          <label className="block text-zinc-500 mb-0.5 font-bold">ブランド色</label>
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="color"
                              value={char.color}
                              onChange={(e) => handleUpdateCharacter(key, { color: e.target.value })}
                              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                            />
                            <span className="font-mono text-[9px] uppercase">{char.color}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-500 mb-0.5 font-bold">立ち位置</label>
                          <select
                            value={char.position}
                            onChange={(e) => handleUpdateCharacter(key, { position: e.target.value as 'left' | 'right' | 'center' })}
                            className="w-full text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-white cursor-pointer"
                          >
                            <option value="left">左 (Left)</option>
                            <option value="center">中央 (Center)</option>
                            <option value="right">右 (Right)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-zinc-500 mb-0.5 font-bold">顔差し替え</label>
                          <select
                            onChange={(e) => handleUpdateCharacter(key, { avatarUrl: e.target.value })}
                            className="w-full text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-white cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>プリセット選択</option>
                            {presetAvatars.map((av) => (
                              <option key={av.role} value={av.url}>{av.role}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Image custom URL */}
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 mb-0.5">カスタム画像URL</label>
                        <input
                          type="text"
                          value={char.avatarUrl}
                          onChange={(e) => handleUpdateCharacter(key, { avatarUrl: e.target.value })}
                          className="w-full text-[10px] px-2 py-0.5 rounded border border-zinc-200 bg-white font-mono"
                          placeholder="https://..."
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
                  ブログ作成画面などで、シナリオブロック <code className="bg-zinc-100 font-mono text-[10px] px-1 py-0.5 rounded text-zinc-800">***{activeScenario.id}***</code> 内に、登場人物キーを書いてコロン (<code className="bg-zinc-100 font-mono text-[10px] px-0.5 py-0.5 rounded text-zinc-800">:</code>) で区切ります。
                </p>
                <div className="font-mono bg-white p-2 rounded.md border text-[10px] space-y-1">
                  <div>***{activeScenario.id}***</div>
                  {Object.keys(activeScenario.characters).slice(0, 2).map((key, i) => (
                    <div key={key}>{key}: {i === 0 ? "おや、今日もブログを編集しているね！" : "はい！リアルタイムにシミュレートを検証しています。"}</div>
                  ))}
                  <div>***end***</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Sliders className="w-12 h-12 mb-3 stroke-1" />
            <p className="text-xs">編集するシナリオ設定を選択、もしくは作成してください。</p>
          </div>
        )}
      </div>
    </div>
  );
}
