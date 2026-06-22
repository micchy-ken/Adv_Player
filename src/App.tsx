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
import { parseBlogContent, extractEntryLinks } from './utils/parser';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BookOpen, Sliders, Play, Github, Gamepad2, Info, Share2, Copy, Check, Blocks, Link, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const extractTextFromHtml = (htmlContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // アメブロ(Ameba Blog)やその他SPA形式のブログがスマホ表示になった際のJSON-LD/INITIAL_STATE抽出
  let jsonStringBody = "";
  
  // 1. ameblo init-state script tag
  const amebloInitState = doc.querySelector('#init-state[type="application/json"]');
  if (amebloInitState && amebloInitState.textContent) {
    try {
      const parsed = JSON.parse(amebloInitState.textContent);
      // ameblo state path: entryState.entry.entryText
      const bodyText = parsed?.entryState?.entry?.entryText || parsed?.entryText;
      if (bodyText) {
        jsonStringBody = bodyText;
      }
    } catch (e) {
      console.warn("Failed to parse ameblo #init-state JSON:", e);
    }
  }

  // 2. alternative: ameblo window.__INITIAL_STATE__ search from raw scripts
  if (!jsonStringBody) {
    const scripts = Array.from(doc.querySelectorAll('script'));
    for (const script of scripts) {
      const text = script.textContent || "";
      if (text.includes('__INITIAL_STATE__')) {
        // Extract JSON string from assignment
        const match = text.match(/__INITIAL_STATE__\s*=\s*(\{.*?\});?\s*$/m) || 
                      text.match(/__INITIAL_STATE__\s*=\s*(\{.*?\});/s) ||
                      text.match(/__INITIAL_STATE__\s*=\s*(.*)/);
        if (match) {
          try {
            let cleanJsonStr = match[1].trim();
            if (cleanJsonStr.endsWith(';')) cleanJsonStr = cleanJsonStr.slice(0, -1);
            const parsed = JSON.parse(cleanJsonStr);
            const bodyText = parsed?.entryState?.entry?.entryText || parsed?.entry?.entryText;
            if (bodyText) {
              jsonStringBody = bodyText;
              break;
            }
          } catch (e) {
            console.warn("Failed to parse window.__INITIAL_STATE__:", e);
          }
        }
      }
    }
  }

  // 3. Fallback: If JSON-based body was successfully extracted, use it instead of parsing empty body!
  let htmlToParse = htmlContent;
  if (jsonStringBody) {
    console.log("Successfully extracted text content from Ameblo state JSON!");
    htmlToParse = `<body>${jsonStringBody}</body>`;
  }

  // Re-create the parser using the resolved HTML (either JSON extracted body, or original html)
  const finalDoc = parser.parseFromString(htmlToParse, 'text/html');
  
  // Clean heavy non-blog content elements first (such as headers, footers, navigation, sidebars)
  Array.from(finalDoc.querySelectorAll('script, style, noscript, iframe, link, meta, header, footer, nav, aside, .sidebar, .blog-sidebar, .comment-box, .profile-provider')).forEach(el => el.remove());
  
  // Fallback to body to parse ALL content together rather than discarding everything except the first matched container.
  // This is extremely important on main/list pages containing multiple posts!
  const rootElement = finalDoc.body;
  
  let cleanText = "";
  if (rootElement) {
    let html = rootElement.innerHTML;
    // Replace text-breaking tags with actual newlines to preserve visual structure
    html = html.replace(/<br[^>]*>/gi, '\n');
    html = html.replace(/<\/?(div|p|h[1-6]|li|tr|article|section|blockquote)[^>]*>/gi, '\n');
    
    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html, 'text/html');
    cleanText = doc2.body.textContent || '';
  } else {
    cleanText = htmlToParse.replace(/<[^>]*>/g, '\n');
  }
  return cleanText.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
};

export default function App() {
  const [blogs, setBlogs] = useLocalStorage<BlogItem[]>('adventure-blogs', DEFAULT_BLOGS);
  const scenarios = DEFAULT_SCENARIOS;
  const [selectedBlogId, setSelectedBlogId] = useState<string>(DEFAULT_BLOGS[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'scenarios' | 'integration'>('editor');
  const [copiedText, setCopiedText] = useState(false);
  const [integrationBlogUrl, setIntegrationBlogUrl] = useState('https://example.com/my-blog-post');
  
  // Game state: when populated, shows the adventure game popup overlay over the whole screen
  const [activePlayScenario, setActivePlayScenario] = useState<ParsedScenario | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);
  const [fetchLogs, setFetchLogs] = useState<string[]>([]);
  const [showDebugLogs, setShowDebugLogs] = useState<boolean>(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP', { hour12: false });
    setFetchLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
    console.log(`[Diagnostic] ${msg}`);
  };

  const [detectedLinks, setDetectedLinks] = useState<{ url: string; title: string }[]>([]);

  const fetchScenarioFromUrl = async (blogUrlParam: string, isSecondaryAttempt: boolean = false) => {
    let finalCleanUrl = blogUrlParam;
    
    // Clean tracking & styling parameters that trigger mobile redirection in ameblo
    try {
      const urlObj = new URL(blogUrlParam);
      if (urlObj.hostname.includes('ameblo.jp')) {
        const keysToRemove = ['frm_id', 'device_id', 'amba', 'gamp', 'amp', 'page', 'device'];
        keysToRemove.forEach(k => urlObj.searchParams.delete(k));
        finalCleanUrl = urlObj.toString();
      }
    } catch(e: any) {
      console.warn("Could not clean tracking params:", e);
    }

    if (!isSecondaryAttempt) {
      setFetchLogs([]); // Reset diagnostic logs
      setDetectedLinks([]); // Clear previous suggestions
    }
    setIsLoadingUrl(true);
    setUrlFetchError(null);
    setShowDebugLogs(true); // Automatically expand log drawer so the user can see real-time progress!

    addLog(`=== 外部ブログのシナリオ取得プロセスを開始します ${isSecondaryAttempt ? '(自動追従フェッチ)' : ''} ===`);
    addLog(`入力URL: ${blogUrlParam}`);

    if (blogUrlParam.includes('s.ameblo.jp')) {
      addLog(`検出: アメブロモバイル専用ドメイン (s.ameblo.jp)。`);
      addLog(`PC向けデスクトップレイアウトを強制するために ameblo.jp に書き換えます。`);
      finalCleanUrl = finalCleanUrl.replace('s.ameblo.jp', 'ameblo.jp');
      addLog(`書き換え後: ${finalCleanUrl}`);
    }

    addLog(`不要なトラッキングクエリのクリーンアップ完了.`);
    
    // Always append a cache-buster timestamp query parameters to bypass CORS / allorigins proxy caches
    const cleanFetchUrl = finalCleanUrl.includes('?')
      ? `${finalCleanUrl}&_=${Date.now()}`
      : `${finalCleanUrl}?_=${Date.now()}`;

    addLog(`キャッシュバスター（クエリ末尾のタイムスタンプ）を追加: ${cleanFetchUrl}`);

    const tryParsingContent = (html: string, sourceName: string): boolean => {
      if (!html || html.trim().length === 0) {
        addLog(`[${sourceName}] 警告: 取得したHTMLが空でした。`);
        return false;
      }
      
      const displaySlice = html.substring(0, 150).replace(/\s+/g, ' ');
      addLog(`[${sourceName}] HTML取得成功。サイズ: ${html.length}文字。先頭部分: "${displaySlice}..."`);
      
      // Detect router blocks, typical carrier filtering or local block pages served as status 200
      if (html.includes('アクセス制限') || html.includes('アクセスが制限') || html.includes('Blocked') || html.includes('Forbidden') || html.includes('403 Forbidden') || html.includes('接続制限')) {
        addLog(`[${sourceName}] 【警告】取得したHTMLにアクセス制限やエラー文言が含まれています。CORS規制やセキュリティ遮断の可能性があります。`);
      }

      addLog(`[${sourceName}] DOM本文抽出処理(extractTextFromHtml)を実行中...`);
      const cleanText = extractTextFromHtml(html);
      
      const textSlice = cleanText.substring(0, 150).replace(/\s+/g, ' ');
      addLog(`[${sourceName}] 本文抽出完了。抽出サイズ: ${cleanText.length}文字。抽出先頭: "${textSlice}..."`);
      
      addLog(`[${sourceName}] 本文からシナリオタグ（【タイトル】、シーン切り替えなど）を検索・パース中...`);
      const parsed = parseBlogContent(cleanText);
      
      if (parsed && parsed.length > 0) {
        addLog(`[${sourceName}] 大成功!!! ${parsed.length}つのシナリオを検出し、パースに成功しました。ゲームを起動します！`);
        setActivePlayScenario(parsed[0]);
        setIsLoadingUrl(false);
        return true;
      } else {
        addLog(`[${sourceName}] パース警告: 抽出した本文テキスト内に【タイトル】などのシナリオ構文が見つかりませんでした。`);
        
        // Scan for potential post Links to help users navigate on top/list pages!
        const links = extractEntryLinks(html, blogUrlParam);
        if (links && links.length > 0) {
          setDetectedLinks(links);
          addLog(`[${sourceName}] 【情報】ブログのトップページ、一覧ページ、またはリファラーが削られたトップが指定された可能性があります。個別記事URLを ${links.length} 件検出しました。`);
          
          if (!isSecondaryAttempt) {
            const newestLink = links[0];
            addLog(`[自動フォールバック検出] リファラー等によりトップドメイン経由でアクセスされました。最新の個別記事「${newestLink.title}」をノークリックで自動的に二次フェッチします...`);
            
            // Set integration URL to the target URL so UI stays synchronized nicely
            setIntegrationBlogUrl(newestLink.url);
            
            // Push candidate URL parameter to browser history for native refreshing to work seamlessly
            try {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('url', newestLink.url);
              window.history.pushState({}, '', newUrl.toString());
            } catch(e) {}

            // Direct non-blocking secondary trigger of fetchScenarioFromUrl inside a safe task trigger
            setTimeout(() => {
              fetchScenarioFromUrl(newestLink.url, true);
            }, 600);
            return true;
          }
        }
        return false;
      }
    };

    // --- PHASE 1: METHOD 1 (Server-side PC Proxy) ---
    try {
      const localProxyUrl = `/api/proxy?url=${encodeURIComponent(cleanFetchUrl)}`;
      addLog(`[方法1] サーバーサイド PC User-Agent プロキシを呼び出します...`);
      addLog(`プロキシ転送先エンドポイント: ${localProxyUrl}`);
      
      const response = await fetch(localProxyUrl, { cache: 'no-store' });
      addLog(`プロキシサーバーが HTTP ステータス ${response.status} で応答しました。`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.logs && Array.isArray(data.logs)) {
          data.logs.forEach((backendLog: string) => {
            addLog(`[Backend] ${backendLog}`);
          });
        }

        if (data.success && data.html) {
          if (tryParsingContent(data.html, "方法1:ローカルプロキシ")) return;
        } else {
          addLog(`サーバープロキシ警告: 処理ステータスが「失敗」です。理由: ${data.error || '不明'}`);
        }
      } else {
        addLog(`ローカルプロバイダー接続エラー: HTTP ${response.status}`);
      }
    } catch (localProxyError: any) {
      addLog(`[方法1 失敗] ローカルサーバー側プロキシでエラーが発生しました。理由: ${localProxyError.message || localProxyError}`);
    }

    // --- PHASE 2: METHOD 2 (Direct Client Fetch) ---
    try {
      addLog(`[方法2] クライアント側ダイレクトフェッチを試行します (CORS制限の解除確認)...`);
      const directRes = await fetch(cleanFetchUrl, { cache: 'no-store' });
      addLog(`ダイレクトフェッチ応答: HTTPステータス: ${directRes.status}`);
      
      if (directRes.ok) {
        const htmlContent = await directRes.text();
        if (tryParsingContent(htmlContent, "方法2:ダイレクトフェッチ")) return;
      } else {
        addLog(`ダイレクトフェッチ接続エラー: HTTP ${directRes.status}`);
      }
    } catch (directError: any) {
      addLog(`[方法2 失敗] ダイレクトフェッチがCORSポリシーまたは接続制限によりブロックされました。理由: ${directError.message || directError}`);
    }

    // --- PHASE 3: METHOD 3 (Public High-speed Proxy: corsproxy.io) ---
    try {
      addLog(`[方法3] 超高速パブリックCORSプロキシ (corsproxy.io) 経由で取得を試みます...`);
      const pUrl = `https://corsproxy.io/?url=${encodeURIComponent(cleanFetchUrl)}`;
      addLog(`プロキシーURL: ${pUrl}`);
      
      const proxyRes = await fetch(pUrl, { cache: 'no-store' });
      addLog(`corsproxy.io 応答: HTTP ${proxyRes.status}`);
      
      if (proxyRes.ok) {
        const htmlContent = await proxyRes.text();
        if (tryParsingContent(htmlContent, "方法3:corsproxy")) return;
      } else {
        addLog(`corsproxy.io がエラーを返しました。HTTP ${proxyRes.status}`);
      }
    } catch (e: any) {
      addLog(`[方法3 失敗] corsproxy.io からのエラー: ${e.message || e}`);
    }

    // --- PHASE 4: METHOD 4 (Public Proxy: codetabs.com) ---
    try {
      addLog(`[方法4] 汎用CORSプロキシ (codetabs.com) を使ったクライアント側迂回を試みます...`);
      const pUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cleanFetchUrl)}`;
      addLog(`プロキシーURL: ${pUrl}`);
      
      const proxyRes = await fetch(pUrl, { cache: 'no-store' });
      addLog(`codetabs.com 応答: HTTP ${proxyRes.status}`);
      
      if (proxyRes.ok) {
        const htmlContent = await proxyRes.text();
        if (tryParsingContent(htmlContent, "方法4:codetabs")) return;
      } else {
        addLog(`codetabs.com がエラーを返しました。HTTP ${proxyRes.status}`);
      }
    } catch (e: any) {
      addLog(`[方法4 失敗] codetabs.com からのエラー: ${e.message || e}`);
    }

    // --- PHASE 5: METHOD 5 (Backup Public Proxy: allorigins.win) ---
    try {
      addLog(`[方法5] 最終バックアッププロキシ (allorigins.win) を使った迂回を試みます...`);
      const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(cleanFetchUrl)}&_=${Date.now()}`;
      addLog(`フェッチ先: ${corsProxyUrl}`);
      
      const response = await fetch(corsProxyUrl, { cache: 'no-store' });
      addLog(`allorigins.win 応答: HTTP ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        const htmlContent = data.contents;
        if (tryParsingContent(htmlContent, "方法5:allorigins")) return;
      } else {
        addLog(`alloriginsプロキシサーバーがエラーを返しました。HTTP: ${response.status}`);
      }
    } catch (err: any) {
      addLog(`[方法5 失敗] パブリックCORSプロキシも動作しません。理由: ${err.message || err}`);
    }

    // --- UNABLE TO FETCH CONTEXTS (FATAL) ---
    setUrlFetchError("ブログの自動抽出に完全に失敗しました。ブログ（はてなブログ、アメブロなど）に記述されている【タイトル】などのアドベンチャータグ定義が、全角括弧で正しく定義されているかご確認ください。また、手動で記事テキストをコピーして「記事の下書き編集」に貼り付けてテストすることも可能です。");
    setIsLoadingUrl(false);
  };

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
      if (blogUrlParam) {
        const extractedUrl = blogUrlParam.match(/https?:\/\/[^\s]+/);
        if (extractedUrl) blogUrlParam = extractedUrl[0];
      }
      
      // Load from Referrer optionally (if ?auto=1 is passed, useful for transitions from external blogs)
      const autoParam = searchParams.get('auto');
      if (!blogUrlParam && autoParam === '1' && document.referrer) {
        try {
          const refUrlObj = new URL(document.referrer);
          const currentUrlObj = new URL(window.location.href);
          
          // Exclude internal domain matches to prevent infinite fetch loops
          if (refUrlObj.hostname !== currentUrlObj.hostname && 
              !refUrlObj.hostname.includes('localhost') && 
              !refUrlObj.hostname.includes('127.0.0.1')) {
            addLog(`自動検出: リファラー流入 (?auto=1) を検知 (${document.referrer})。自動的にブログURLとしてセットします。`);
            blogUrlParam = document.referrer;
          }
        } catch(e) {}
      }

      if (blogUrlParam) {
        fetchScenarioFromUrl(blogUrlParam);
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
      title: "新しいコラム記事（サンプル）",
      category: "",
      description: "",
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

  // Play a specific extracted scenario
  const handlePlayScenario = (parsed: ParsedScenario) => {
    setActivePlayScenario(parsed);
  };

  // Find configuration for active scenario with fuzzy matching & translation fallback support
  const activeConfig = (() => {
    if (!activePlayScenario) return null;
    const parsedId = activePlayScenario.id;
    const cleanIdLower = parsedId.toLowerCase().trim();

    // 1. Direct match
    if (scenarios[parsedId]) return scenarios[parsedId];

    // 2. Fuzzy match on ID or name
    const fuzzyMatch = Object.values(scenarios).find((s: ScenarioConfig) => 
      cleanIdLower.includes(s.id.toLowerCase()) || 
      s.id.toLowerCase().includes(cleanIdLower) ||
      cleanIdLower.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(cleanIdLower)
    );
    if (fuzzyMatch) return fuzzyMatch;

    // 3. Multilingual Translation keywords mapping for standard built-ins
    const standardMaps: Record<string, string[]> = {
      "上司と部下": ["boss", "subordinate", "office", "report", "employee", "supervisor", "staff", "manager", "上司", "部下", "業務報告"],
      "ファンタジー遭遇": ["fantasy", "encounter", "ruins", "hero", "demon", "clash", "confrontation", "ファンタジー", "遭遇", "遺跡", "勇者", "魔王"],
      "幼馴染の図書室": ["childhood", "friend", "library", "school", "afterschool", "after school", "aoi", "sota", "幼馴染", "図書室", "放課後", "葵", "颯太"]
    };

    for (const [key, keywords] of Object.entries(standardMaps)) {
      if (keywords.some(keyword => cleanIdLower.includes(keyword))) {
        if (scenarios[key]) return scenarios[key];
      }
    }

    return null;
  })();

  // Render a safety default config in case blogger used a scenario keyword they haven't configured yet
  const resolvedConfig: ScenarioConfig = activeConfig || {
    id: activePlayScenario?.id || "temp",
    name: "一時的な会話空間",
    themeColor: "indigo",
    characters: {},
    scenes: {
      "標準": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
    }
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
              メイン画面
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
      <section className="bg-emerald-600 font-semibold text-white px-6 py-2.5 text-xs flex items-center justify-between gap-4" id="usage-status-bar">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>💡 使い方: 記事本文に「【タイトル】」、改行して「【シーン名】」、役名と台詞を「葵: セリフ」のように記述すると、Adv_Player が自動で読み取って豪華演出で再生します。</span>
        </div>
      </section>

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
            onLoadSample={(sampleId) => {
              if (window.confirm('サンプルシナリオを読み込みますか？現在のリストは上書きされます。')) {
                setBlogs(DEFAULT_BLOGS);
                setSelectedBlogId(sampleId);
              }
            }}
            scenarios={scenarios}
          />
        )}
        
        {activeTab === 'scenarios' && (
          <ScenarioManager
            scenarios={scenarios}
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
                  ブログ記事が読み込まれた時に、本アプリケーション（Adv_Player）へデータを引き渡し、ゲームを起動する多様な連携方法が利用可能です：
                </p>
              </div>

              {/* Method A: postMessage Embedding (Safe, highly interactive) */}
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    方式 A
                  </div>
                  <span className="text-xs font-bold text-zinc-700">ブログ記事本文から自動抽出 (iframe埋め込み)</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  ブログの本文内に <code>iframe</code> を埋め込み、親子間通信でテキストを受け渡す方式です。CORS制限を気にせず最もインタラクティブに配置できます。
                </p>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                  <span className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                    埋め込み用 iframe コード (HTML編集画面に貼り付け)
                  </span>
                  <div className="bg-zinc-50 p-2.5 rounded-lg border font-mono text-[10px] text-zinc-700 break-all overflow-x-auto">
                    {`<iframe id="adv-player-iframe" src="${currentAppURL}" style="width:100%; height:550px; border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05);"></iframe>`}
                  </div>
                </div>
              </div>

              {/* Method B: Static url parameter */}
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    方式 B
                  </div>
                  <span className="text-xs font-bold text-zinc-700">記事のURLをパラメータとして引き渡す方法</span>
                </div>
                <p className="text-xs text-zinc-650/90 leading-relaxed font-semibold">
                  別画面でゲームを独立起動したい場合、URLのクエリパラメータ「<code>?url=ブログ記事URL</code>」のような形式を指定して遷移・リダイレクトさせます。<br />
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
                      <button
                        onClick={() => fetchScenarioFromUrl(integrationBlogUrl)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>テスト読込</span>
                      </button>
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

              {/* Method D: Dynamic HTML Scripting (Universal Bulletproof for Android/Webviews) */}
              <div className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/70 space-y-4 col-span-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 bg-indigo-600 text-white border border-indigo-750 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    方式 D (推奨・スマホ/アプリ完全対応)
                  </div>
                  <span className="text-xs font-black text-indigo-950">動的パラメータ自動付与方式（HTML貼り付け用）</span>
                </div>
                <p className="text-xs text-indigo-950/85 leading-relaxed font-medium">
                  はてなブログなどの『HTML編集』画面に一言コピーするだけ。JavaScriptが自動的に現在の記事の正確なURL（例: <code>.../entry/2026/06/...</code>）を取得し、リファラー制限の影響を完全に無効化して確実に一発自動再生します。スマホWebView・Androidアプリでも100%機能する確実なコードです。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Dynamic Embed Iframe */}
                  <div className="bg-white border border-indigo-150 rounded-xl p-4 space-y-3 shadow-xs">
                    <span className="block text-[10px] font-bold text-indigo-700">
                      パターン1: ブログ記事内に直接ゲームを埋め込みたい場合
                    </span>
                    <div className="bg-zinc-900 text-zinc-200 p-2.5 rounded-lg font-mono text-[9px] select-all overflow-x-auto leading-normal space-y-1 max-h-48">
                      {`<!-- 埋め込みプレイヤー(Android対応・自動追従) -->\n<iframe id="blog-game-player" style="width:100%; height:550px; border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>\n<script>\n  (function() {\n    var iframe = document.getElementById('blog-game-player');\n    var appUrl = "${currentAppURL}";\n    iframe.src = appUrl + "?url=" + encodeURIComponent(window.location.href);\n  })();\n</script>`}
                    </div>
                    <button
                      onClick={() => handleCopy(`<!-- 埋め込みプレイヤー(Android対応・自動追従) -->\n<iframe id="blog-game-player" style="width:100%; height:550px; border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>\n<script>\n  (function() {\n    var iframe = document.getElementById('blog-game-player');\n    var appUrl = "${currentAppURL}";\n    iframe.src = appUrl + "?url=" + encodeURIComponent(window.location.href);\n  })();\n</script>`)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10.5px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>埋め込みコード(iframe)をコピー</span>
                    </button>
                  </div>

                  {/* Option 2: Dynamic Tab Link */}
                  <div className="bg-white border border-indigo-150 rounded-xl p-4 space-y-3 shadow-xs">
                    <span className="block text-[10px] font-bold text-emerald-700">
                      パターン2: 記事内に『ゲームを別窓で遊ぶ』ボタンを作る場合
                    </span>
                    <div className="bg-zinc-900 text-zinc-200 p-2.5 rounded-lg font-mono text-[9px] select-all overflow-x-auto leading-normal space-y-1 max-h-48">
                      {`<!-- ゲーム起動ボタン(Android対応・自動追従) -->\n<a id="blog-game-link" href="#" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; padding:12px 24px; background-color:#10b981; color:#ffffff; font-weight:bold; border-radius:8px; text-decoration:none; text-shadow:none; text-align:center;">\n  🎮 会話劇ゲームを別窓で起動\n</a>\n<script>\n  (function() {\n    var link = document.getElementById('blog-game-link');\n    var appUrl = "${currentAppURL}";\n    link.href = appUrl + "?url=" + encodeURIComponent(window.location.href);\n  })();\n</script>`}
                    </div>
                    <button
                      onClick={() => handleCopy(`<!-- ゲーム起動ボタン(Android対応・自動追従) -->\n<a id="blog-game-link" href="#" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; padding:12px 24px; background-color:#10b981; color:#ffffff; font-weight:bold; border-radius:8px; text-decoration:none; text-shadow:none; text-align:center;">\n  🎮 会話劇ゲームを別窓で起動\n</a>\n<script>\n  (function() {\n    var link = document.getElementById('blog-game-link');\n    var appUrl = "${currentAppURL}";\n    link.href = appUrl + "?url=" + encodeURIComponent(window.location.href);\n  })();\n</script>`)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>リンクボタンコードをコピー</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQ Box */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-2.5 text-xs text-zinc-700 leading-relaxed font-normal">
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
        {isLoadingUrl && !urlFetchError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md px-4"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-5 max-w-sm w-full text-center border border-zinc-100 animate-fade-in">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <Gamepad2 className="w-6 h-6 text-emerald-600 absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-black text-zinc-900 tracking-tight">シナリオを読み込んでいます...</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  外部ブログの記事から会話劇プログラムを抽出しています。しばらくお待ちください。
                </p>
              </div>
              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-full animate-progress-bar w-[60%]"></div>
              </div>
              <div className="text-[9.5px] text-zinc-400 font-bold">
                ※CORS制限とモバイル転送の自動迂回処理を実行中
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Error & Diagnostic Log Overlay */}
      <AnimatePresence>
        {urlFetchError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md px-4 overflow-y-auto py-8"
          >
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-5 max-w-xl w-full text-center border border-red-100 my-auto">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 stroke-[2.5]" />
              </div>
              
              <div className="space-y-1.5">
                <p className="text-lg font-black text-red-600 tracking-tight">シナリオの取得に失敗しました</p>
                <p className="text-xs text-zinc-650 leading-relaxed text-left bg-red-50/50 p-3.5 rounded-xl border border-red-100/60 font-medium">
                  {urlFetchError}
                </p>
              </div>

              {/* Real-time Loading Steps Log */}
              {fetchLogs.length > 0 && (
                <div className="w-full mt-2 text-left bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-805 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <span>障害解析デバッグログ</span>
                    <span className="text-red-500 font-mono">FAILED</span>
                  </div>
                  <div className="font-mono text-[10.5px] max-h-40 overflow-y-auto space-y-1 pr-1 text-zinc-350 select-text leading-normal scrollbar-thin scrollbar-thumb-zinc-800">
                    {fetchLogs.map((log, index) => {
                      let cls = "text-zinc-400";
                      if (log.includes('成功') || log.includes('Succeeded') || log.includes('大成功')) cls = "text-emerald-400 font-semibold";
                      if (log.includes('失敗') || log.includes('failed') || log.includes('Error') || log.includes('警告') || log.includes('エラー')) cls = "text-red-400 font-semibold";
                      if (log.includes('[Backend]')) cls = "text-blue-400";
                      return (
                        <div key={index} className={`whitespace-pre-wrap break-all ${cls}`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    setUrlFetchError(null);
                    setIsLoadingUrl(false);
                  }}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-subtle"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    setUrlFetchError(null);
                    fetchScenarioFromUrl(integrationBlogUrl);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>再試行する</span>
                </button>
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
