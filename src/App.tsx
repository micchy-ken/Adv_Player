/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { BlogItem, ScenarioConfig, ParsedScenario } from './types';
import { DEFAULT_BLOGS, DEFAULT_SCENARIOS } from './data/scenarios';
import BlogEditor from './components/BlogEditor';
import ScenarioManager from './components/ScenarioManager';
import AdventureGameView from './components/AdventureGameView';
import { parseBlogContent } from './utils/parser';
import { BookOpen, Sliders, Play, Github, Gamepad2, Info, Share2, Copy, Check, Blocks, Link } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [blogs, setBlogs] = useState<BlogItem[]>(DEFAULT_BLOGS);
  const [scenarios, setScenarios] = useState<Record<string, ScenarioConfig>>(DEFAULT_SCENARIOS);
  const [selectedBlogId, setSelectedBlogId] = useState<string>(DEFAULT_BLOGS[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'scenarios' | 'integration'>('editor');
  const [copiedText, setCopiedText] = useState(false);
  const [integrationBlogUrl, setIntegrationBlogUrl] = useState('https://example.com/my-blog-post');
  
  // Game state: when populated, shows the adventure game popup overlay over the whole screen
  const [activePlayScenario, setActivePlayScenario] = useState<ParsedScenario | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);

  // 1. URL Query parameters initialization & 2. Window PostMessage receivers
  useEffect(() => {
    const handleUrlAndMessageInit = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      
      // A. Load from direct RAW content parameter (url-encoded or base64)
      const rawContentParam = searchParams.get('content') || searchParams.get('blog_content');
      if (rawContentParam) {
        setIsLoadingUrl(true);
        try {
          let decodedContent = '';
          if (rawContentParam.startsWith('b64:')) {
            // Safe helper for base64
            decodedContent = decodeURIComponent(escape(atob(rawContentParam.slice(4))));
          } else {
            decodedContent = decodeURIComponent(rawContentParam);
          }
          
          if (decodedContent) {
            const parsed = parseBlogContent(decodedContent);
            if (parsed && parsed.length > 0) {
              setActivePlayScenario(parsed[0]);
              setIsLoadingUrl(false);
              return;
            } else {
              setUrlFetchError("渡されたテキスト内にシナリオデータ(【タイトル】 など)が見つかりませんでした。");
            }
          }
        } catch (e) {
          console.error("Failed to decode inline content query parameter:", e);
          setUrlFetchError("URLパラメータのテキスト解読に失敗しました。");
        }
        setIsLoadingUrl(false);
      }

      // B. Load from external Blog URL (if CORS permits or utilizing free proxy fallback)
      let blogUrlParam = searchParams.get('url') || searchParams.get('blog_url');
      
      // (NEW) C. Load from Referrer if requested (e.g. ?auto=1)
      const autoRefParam = searchParams.get('auto') || searchParams.get('auto_ref');
      if (!blogUrlParam && autoRefParam && document.referrer) {
        blogUrlParam = document.referrer;
      }

      if (blogUrlParam) {
        setIsLoadingUrl(true);
        setUrlFetchError(null);
        try {
          // First, try direct fetch. This works if they are on same origin or CORS is allowed.
          const directRes = await fetch(blogUrlParam);
          if (directRes.ok) {
            const htmlContent = await directRes.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            Array.from(doc.querySelectorAll('script, style, noscript, iframe, link, meta')).forEach(el => el.remove());
            let cleanText = "";
            if (doc.body) {
              let html = doc.body.innerHTML;
              html = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h[1-6]|li)>/gi, '\n').replace(/<[^>]+>/g, '');
              const temp = document.createElement('textarea');
              temp.innerHTML = html;
              cleanText = temp.value;
            } else {
              cleanText = htmlContent.replace(/<[^>]*>/g, '\n');
            }
            cleanText = cleanText.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');

            const parsed = parseBlogContent(cleanText);
            if (parsed && parsed.length > 0) {
              setActivePlayScenario(parsed[0]);
              setIsLoadingUrl(false);
              return;
            } else {
              console.warn("Direct fetch found no scenarios.");
              setUrlFetchError("直接読み込んだ記事内にシナリオタグが見つかりませんでした。");
            }
          } else {
             throw new Error("Direct fetch failed: " + directRes.status);
          }
        } catch (e) {
          console.warn("Direct fetch failed, attempting proxy fallback:", e);
          try {
            // Use a public CORS proxy helper for user simplicity. 
            // Removed the timestamp cache buster to significantly speed up allorigins.
            const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(blogUrlParam)}`;
            const response = await fetch(corsProxyUrl);
            if (response.ok) {
              const data = await response.json();
              const htmlContent = data.contents;
              if (htmlContent) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                Array.from(doc.querySelectorAll('script, style, noscript, iframe, link, meta')).forEach(el => el.remove());
                
                let cleanText = "";
                if (doc.body) {
                  let html = doc.body.innerHTML;
                  html = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h[1-6]|li)>/gi, '\n').replace(/<[^>]+>/g, '');
                  const temp = document.createElement('textarea');
                  temp.innerHTML = html;
                  cleanText = temp.value;
                } else {
                  cleanText = htmlContent.replace(/<[^>]*>/g, '\n');
                }
                cleanText = cleanText.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
                
                const parsed = parseBlogContent(cleanText);
                if (parsed && parsed.length > 0) {
                  setActivePlayScenario(parsed[0]);
                  setIsLoadingUrl(false);
                  return;
                } else {
                  setUrlFetchError("ブログの読み込みに成功しましたが、記事内にシナリオタグ (【タイトル】 など) が見つかりませんでした。");
                }
              } else {
                 setUrlFetchError("ブログのコンテンツが空でした。URLを確認してください。");
              }
            } else {
               setUrlFetchError(`プロキシサーバーエラー (${response.status})。ブログの読み込みに失敗しました。`);
            }
          } catch (err) {
            console.error("Proxy fetch also failed:", err);
            setUrlFetchError("ブログの読み込みに完全に失敗しました。CORS制限またはURLが無効な可能性があります。");
          }
        }
        setIsLoadingUrl(false);
      }
    };

    handleUrlAndMessageInit();

    // C. postMessage communication logic (Great for embed iframe scenario inside blogs)
    const handlePostMessage = (event: MessageEvent) => {
      // Validate incoming data schema
      if (event.data && typeof event.data === 'object') {
        const { action, content, blogText, payload } = event.data;
        const targetContent = content || blogText || payload;

        if ((action === 'play-scenario' || action === 'load-blog') && typeof targetContent === 'string') {
          const parsed = parseBlogContent(targetContent);
          if (parsed && parsed.length > 0) {
            setActivePlayScenario(parsed[0]);
          }
        }
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

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

【タイトル】
放課後の小さな相談会

【幼馴染の図書室】
葵: ねえ、ちょっと時間ある？

颯太: どうしたんだ、そんな真剣な顔して。

葵: ……別に。ただ、ちょっと相談したいことがあっただけよ。
 
颯太: そうか、なんでも聞くよ。

葵: ……やっぱりなんでもない！バカ！
【end】

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

  // Find configuration for active scenario with fuzzy matching fallback
  const activeConfig = activePlayScenario 
    ? (scenarios[activePlayScenario.id] || 
       Object.values(scenarios).find((s: ScenarioConfig) => 
         activePlayScenario.id.toLowerCase().includes(s.id.toLowerCase()) || 
         s.id.toLowerCase().includes(activePlayScenario.id.toLowerCase())
       )
      ) 
    : null;

  // Render a safety default config in case blogger used a scenario keyword they haven't configured yet
  const resolvedConfig: ScenarioConfig = activeConfig || {
    id: activePlayScenario?.id || "temp",
    name: "一時的な会話空間",
    backgroundUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    themeColor: "indigo",
    characters: {}
  };

  // Generate dynamic embeddable script for foreign blog owners
  const currentAppURL = "https://micchy-ken.github.io/Adv_Player/";
  
  const iframeIntegrationCode = `<iframe 
  src="${currentAppURL}" 
  id="adv-player-iframe"
  style="width: 100%; height: 600px; border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
  allow="autoplay; microphone;"
></iframe>

<script>
  // ブログ記事本文を取得して iframe に送信するスクリプト例
  window.addEventListener('load', function() {
    // 💡 あなたのブログの記事全体を囲うディブタグ等のIDか、または直書きテキストを指定
    const blogText = document.body.innerText || ""; 
    const iframe = document.getElementById('adv-player-iframe');
    
    if (iframe && iframe.contentWindow) {
      // ロード後にiframeにデータをプッシュ送信
      iframe.addEventListener('load', function() {
        iframe.contentWindow.postMessage({
          action: 'play-scenario',
          content: blogText
        }, '*');
      });
    }
  });
</script>`;

  const directLinkUrl = `${currentAppURL}?url=${encodeURIComponent(integrationBlogUrl)}`;

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'scenarios'
                  ? 'bg-white text-purple-950 shadow-xs'
                  : 'text-zinc-500 hover:text-purple-950'
              }`}
              id="tab-scenarios"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              設定 (JSON)
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'integration'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-zinc-500 hover:text-blue-950'
              }`}
              id="tab-integration"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
              🤝 ブログ連動
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

      {/* URL Proxy Loader Error Status */}
      {urlFetchError && (
        <section className="px-6 py-3 text-xs flex items-center justify-between gap-4 border-b bg-red-50 text-red-700 border-red-200">
          <div className="flex items-center gap-2 font-bold font-sans">
            <Info className="w-4 h-4 shrink-0" />
            {urlFetchError}
            <button onClick={() => setUrlFetchError(null)} className="ml-4 underline hover:text-red-900 cursor-pointer">閉じる</button>
          </div>
        </section>
      )}

      {/* Main Container Content */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto" id="app-body-container">
        {activeTab === 'editor' && (
          <BlogEditor
            blogs={blogs}
            selectedBlogId={selectedBlogId}
            onSelectBlog={setSelectedBlogId}
            onUpdateBlog={handleUpdateBlog}
            onCreateBlog={handleCreateBlog}
            onPlayScenario={handlePlayScenario}
            scenarios={scenarios}
          />
        )}
        
        {activeTab === 'scenarios' && (
          <ScenarioManager
            scenarios={scenarios}
            onUpdateScenario={handleUpdateScenario}
            onAddScenario={handleAddScenario}
            onDeleteScenario={handleDeleteScenario}
          />
        )}

        {activeTab === 'integration' && (
          <div className="p-4 md:p-6" id="integration-tab-panel">
            <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
              <div>
                <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  外部の個人ブログから自動再生させる仕組み
                </h2>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  作成した Adv_Player は別サーバー（あなたのブログなど）から直接シナリオを読み取って自動起動する機能をあらかじめ備えています。<br />
                  ブログ記事が読み込まれた時に、本アプリケーション（Adv_Player）へデータを引き渡し、ゲームを起動する2通りの優れた連携方法が利用可能です：
                </p>
              </div>

              {/* Method A: postMessage Embedding (Safe, highly interactive) */}
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    方式 A (推奨)
                  </div>
                  <span className="text-xs font-bold text-zinc-700">ブログ記事本文から自動抽出 (iframe埋め込み)</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  あなたのブログの本文内に以下のような <code>iframe</code> コード と 簡単な JavaScript を並べて貼るだけです。<br />
                  ブログが表示されると自動で記事テキストをAdv_Playerがキャッチし、<strong>CORS制限をバイパスして、会話劇を画面上にそのまま開始できます。</strong>
                </p>

                {/* Integration Code Box */}
                <div className="relative">
                  <button
                    onClick={() => handleCopy(iframeIntegrationCode)}
                    className="absolute top-3 right-3 flex items-center gap-1.5 text-xs bg-white hover:bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 shadow-xs cursor-pointer transition-all font-semibold"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                        <span>コピー完了!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        <span>コードをコピー</span>
                      </>
                    )}
                  </button>
                  <pre className="bg-zinc-900 text-zinc-300 font-mono text-[10.5px] p-4 rounded-xl overflow-x-auto leading-relaxed border border-zinc-805 select-all max-h-[350px]">
                    {iframeIntegrationCode}
                  </pre>
                </div>
              </div>

              {/* Method B: URL Referral Redirect query */}
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-950 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    方式 B
                  </div>
                  <span className="text-xs font-bold text-zinc-700">記事のURLをパラメータとして引き渡す方法</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  ブログ上の「ゲームを開始する」といったボタンのリンク先に、以下のようなクエリURLを指定して遷移・リダイレクトさせます。<br />
                  Adv_Player が自動でターゲットリンク先のテキストを解析し、CORSを自動回避(AllOriginsプロキシなど)しながら会話劇を構築します。
                </p>

                {/* Live Link generator */}
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      連携させたい実際のブログ記事 URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={integrationBlogUrl}
                        onChange={(e) => setIntegrationBlogUrl(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 bg-zinc-50 focus:bg-white"
                        placeholder="https://myblogsite.com/life-strategy"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      生成されたリダイレクト用リンク (クリックでコピー)
                    </span>
                    <div className="bg-zinc-50 p-2.5 rounded-lg border font-mono text-[11px] text-zinc-700 break-all flex items-center justify-between gap-4">
                      <span className="select-all flex-1 line-clamp-1">{directLinkUrl}</span>
                      <button
                        onClick={() => handleCopy(directLinkUrl)}
                        className="p-1.5 hover:bg-zinc-200 rounded text-zinc-500 transition-all shrink-0 cursor-pointer"
                        title="URLをコピー"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Method C: Referrer auto-read */}
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 bg-purple-100 text-purple-950 border border-purple-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    方式 C (魔法のリンク)
                  </div>
                  <span className="text-xs font-bold text-zinc-700">自動リファラー読み込み方式</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  ブログ上のリンクに少し魔法をかけるだけです。
                  <code>?auto=1</code> という短いパラメータをつけるだけで、Adv_Player は「どのブログから飛んできたのか？(Referrer)」を自動で検知し、その元のブログのURLから本文を取得してシナリオを再生します。
                </p>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                  <span className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                    魔法のリンク (自分のブログからこのリンク先に飛ぶだけ)
                  </span>
                  <div className="bg-zinc-50 p-2.5 rounded-lg border font-mono text-[11px] text-zinc-700 break-all flex items-center justify-between gap-4">
                    <span className="select-all flex-1 line-clamp-1">{currentAppURL}?auto=1</span>
                    <button
                      onClick={() => handleCopy(`${currentAppURL}?auto=1`)}
                      className="p-1.5 hover:bg-zinc-200 rounded text-zinc-500 transition-all shrink-0 cursor-pointer"
                      title="URLをコピー"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQ Box */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-2.5 text-xs text-zinc-700 leading-relaxed">
                <Blocks className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-blue-900">シナリオ・キャラクター設定の連動について</span>
                  <p>
                    ブログ側から送られた会話ID (<code>***上司と部下***</code>など) に対して、Adv_Player であらかじめ設定しておいた表情や背景画像が自動的に一致・適用されます。<br />
                    「設定 (JSON)」タブから設定をお手元の <code>adventure_scenarios.json</code> に書き出しておき、ブログ用の iframe パラメータなどで同時に受け渡しや、あらかじめ本アプリで登録しておくことで最高品質の演出ゲームを再生できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
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

      {/* Full-screen Loading Overlay for URL Proxy fetching */}
      <AnimatePresence>
        {isLoadingUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-5 max-w-sm w-full text-center">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="space-y-1">
                <p className="text-xl font-black text-zinc-900 tracking-tight">シナリオを読み込み中</p>
                <p className="text-xs text-zinc-500 font-medium">外部ブログからデータを抽出しています...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 mt-auto">
        <p>© 2026 Blog Adventure Game Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}
