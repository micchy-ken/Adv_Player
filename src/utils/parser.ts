/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedScenario, DialogueItem, DialogueType } from '../types';

const IGNORED_TAG_KEYWORDS = [
  "お知らせ", "注意", "更新", "pr", "日記", "まとめ", "悲報", "朗報", "詳細", "一覧", 
  "紹介", "報告", "連絡", "お願い", "はじめに", "解説", "追記", "メモ", "ルール", "目次",
  "info", "notice", "warning", "attention", "memo", "diary", "ブログ", "プロフィール",
  "アメンバー", "ameba", "アメブロ", "コメント", "リブログ", "いいね", "ナビゲーション"
];

/**
 * Parses blog body content, extracting scenario blocks and titles.
 * @param content The raw markdown or text of the blog.
 * @returns Array of parsed scenarios found in the blog.
 */
export function parseBlogContent(content: string): ParsedScenario[] {
  const lines = content.split(/\r?\n/);

  // First pass: Find title anywhere in the blog post
  // (We search for the "【タイトル】" or "***タイトル***" line and take the first subsequent non-empty line as the general title)
  let extractedTitle = "";
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].replace(/[\u200B-\u200D\uFEFF]/g, '');
    const line = rawLine.trim();
    if (line.match(/^\s*(?:\*\*\*|【|［|\[)\s*(?:タイトル|Title|title|TITLE)\s*(?:\*\*\*|】|］|\])/) && i + 1 < lines.length) {
      // Find next non-empty line
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) {
        j++;
      }
      if (j < lines.length) {
        extractedTitle = lines[j].trim();
      }
      break;
    }
  }

  // Define reusable logic to parse the text with a given initial state of titleSeen
  const runParse = (forceTitleSeen: boolean): ParsedScenario[] => {
    const result: ParsedScenario[] = [];
    let titleSeen = forceTitleSeen;
    let currentScenarioId: string | null = null;
    let currentTitle = "アドベンチャーパート";
    let currentItems: DialogueItem[] = [];
    let currentInitialCharacters: string[] = [];
    let itemIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      // Remove invisible characters that often get copied on mobile/Ameba
      const rawLine = lines[i].replace(/[\u200B-\u200D\uFEFF]/g, '');
      const trimmedLine = rawLine.trim();

      // Check if line is empty or whitespace-only (including full-width spaces and invisible padding)
      const isWhitespaceOnly = /^[ \t\s\u3000\u00A0\u200B-\u200D\uFEFF]*$/.test(trimmedLine);
      const trimmedLineClean = trimmedLine.replace(/[\s\u3000\u200B-\u200D\uFEFF]/g, '');

      const isTitleTag = trimmedLine.match(/^\s*(?:\*\*\*|【|［|\[)\s*(?:タイトル|Title|title|TITLE)\s*(?:\*\*\*|】|］|\])/);
      if (isTitleTag) {
        titleSeen = true;
        continue;
      }

      if (!titleSeen) {
        continue;
      }

      // Check if it's a tag starting a scenario block
      // Supports *** シーン ***, 【 シーン 】, [ シーン ], ［ シーン ］
      // Look for the bracket pattern at the start of the line
      const startTagMatch = trimmedLine.match(/^\s*(?:\*\*\*|【|［|\[)\s*([^\*\n【】［］\[\]]+?)\s*(?:\*\*\*|】|］|\])\s*(.*)$/);
      
      const tagContentClean = startTagMatch 
        ? startTagMatch[1].replace(/[\s\u3000\u200B-\u200D\uFEFF]/g, '').trim() 
        : '';
      const isCharactersStartTag = tagContentClean === '登場人物' || tagContentClean.startsWith('登場人物') || tagContentClean.endsWith('登場人物');
      const isSceneStartTag = tagContentClean === 'シーン' || tagContentClean.startsWith('シーン') || tagContentClean.endsWith('シーン');
      const isSpotlightStartTag = tagContentClean === 'スポット' || (tagContentClean.startsWith('スポット') && !tagContentClean.includes('終了'));
      const isSpotlightEndTagGlobal = tagContentClean === 'スポット終了' || tagContentClean.includes('スポット終了');

      if (startTagMatch && !isCharactersStartTag && !isSceneStartTag && !isSpotlightStartTag && !isSpotlightEndTagGlobal) {
        let tagContent = startTagMatch[1].trim();
        const extraContent = startTagMatch[2].trim();
        
        if (tagContent === "タイトル" || tagContent.toLowerCase() === "title") {
          // Skip title lines, already handled
          continue;
        }

        const lowerTag = tagContent.toLowerCase();

        // Skip common blog headers/elements that use bracket syntax but aren't scenario blocks
        if (IGNORED_TAG_KEYWORDS.some(k => lowerTag === k || lowerTag.startsWith(k) || k.startsWith(lowerTag))) {
          continue;
        }
        
        const isEndTag = lowerTag.startsWith("end") || 
                         tagContent === "おわり" || 
                         tagContent === "終了" || 
                         tagContent === "終了タグ" ||
                         (tagContent.includes("終了") && !tagContent.includes("スポット") && !tagContent.includes("spotlight"));
        
        if (isEndTag) {
          // Reached end tag, save current scenario if exists
          if (currentScenarioId) {
            result.push({
              id: currentScenarioId,
              title: extractedTitle || currentTitle,
              items: [...currentItems],
              initialCharacters: [...currentInitialCharacters]
            });
            currentScenarioId = null;
            currentItems = [];
            currentInitialCharacters = [];
          }
          continue;
        }

        // If already in a scenario block, close it before starting a new one
        if (currentScenarioId) {
          result.push({
            id: currentScenarioId,
            title: extractedTitle || currentTitle,
            items: [...currentItems],
            initialCharacters: [...currentInitialCharacters]
          });
          currentItems = [];
          currentInitialCharacters = [];
        }

        // Check for configId extraction (e.g. `上司と部下「もしも苗字が三井だったら」`)
        let configId = tagContent;
        let parsedTitle = tagContent;
        const bracketMatch = tagContent.match(/^(.+?)「(.*?)」$/);
        if (bracketMatch) {
          configId = bracketMatch[1].trim();
          parsedTitle = configId + "「" + bracketMatch[2].trim() + "」";
        } else if (extraContent) {
          parsedTitle = tagContent + " " + extraContent;
        }

        // Start new scenario block
        currentScenarioId = configId; // Map specifically to the config ID base
        currentTitle = extractedTitle || parsedTitle;
        currentInitialCharacters = [];
        itemIndex = 0;
        continue;
      }

      // Inside a scenario block
      if (currentScenarioId) {
        if (isWhitespaceOnly) {
          // We skip empty lines to rely on natural click-to-advance flow
          continue;
        }

        // Check for 【登場人物】
        const charMatch = trimmedLine.match(/^(?:【|\[|［)?登場人物(?:】|\]|］)?[：:\s]\s*(.*)$/);
        const isSpecialCharactersTag = trimmedLine.startsWith('【登場人物】') || trimmedLine.startsWith('[登場人物]') || trimmedLine.startsWith('［登場人物］');
        
        if (charMatch || isSpecialCharactersTag) {
          let charNamesText = "";
          if (isSpecialCharactersTag) {
            charNamesText = trimmedLine.replace(/^(?:【登場人物】|\[登場人物\]|［登場人物］)\s*/, '');
          } else if (charMatch) {
            charNamesText = charMatch[1];
          }
          
          const names = charNamesText
            .split(/[、,，・\.．\s\u3000]+/g)
            .map(n => n.trim())
            .filter(n => n.length > 0);
          
          if (itemIndex === 0 && currentInitialCharacters.length === 0) {
            currentInitialCharacters = names.slice(0, 4);
          } else {
            currentItems.push({
              id: `item-${currentScenarioId}-${itemIndex++}`,
              type: 'characters-change',
              characters: names.slice(0, 4),
              index: itemIndex
            });
          }
          continue;
        }

        // Check for 【シーン】
        const sceneMatch = trimmedLine.match(/^(?:【|\[|［)?シーン(?:】|\]|］)?[：:\s]\s*(.*)$/);
        const isSpecialSceneTag = trimmedLine.startsWith('【シーン】') || trimmedLine.startsWith('[シーン]') || trimmedLine.startsWith('［シーン］');
        
        if (sceneMatch || isSpecialSceneTag) {
          let sceneName = "";
          if (isSpecialSceneTag) {
            sceneName = trimmedLine.replace(/^(?:【シーン】|\[シーン\]|［シーン］)\s*/, '').trim();
          } else if (sceneMatch) {
            sceneName = sceneMatch[1].trim();
          }
          
          if (sceneName) {
            let sceneTitle = undefined;
            const titleMatch = sceneName.match(/^(.*?)「(.*?)」\s*$/);
            if (titleMatch) {
              sceneName = titleMatch[1].trim();
              sceneTitle = titleMatch[2].trim();
            }

            currentItems.push({
              id: `item-${currentScenarioId}-${itemIndex++}`,
              type: 'scene-change',
              sceneName,
              sceneTitle,
              index: itemIndex
            });
            continue;
          }
        }

        // Check for 【スポット】 and 【スポット終了】
        const spotlightMatch = trimmedLine.match(/^(?:【|\[|［)?\s*スポット\s*(?:】|\]|］)?[：:\s]\s*(.*)$/);
        const isSpecialSpotlightTag = trimmedLineClean.startsWith('【スポット】') || trimmedLineClean.startsWith('[スポット]') || trimmedLineClean.startsWith('［スポット］');
        
        const isSpotlightEndTag = trimmedLineClean.includes('スポット終了') || trimmedLineClean === '【スポット終了】' || trimmedLineClean === '[スポット終了]' || trimmedLineClean === '［スポット終了］';

        if (isSpotlightEndTag) {
          currentItems.push({
            id: `item-${currentScenarioId}-${itemIndex++}`,
            type: 'spotlight-end',
            index: itemIndex
          });
          continue;
        }

        if (spotlightMatch || isSpecialSpotlightTag) {
          let spotlightName = "";
          if (isSpecialSpotlightTag) {
            spotlightName = trimmedLine.replace(/^(?:【スポット】|\[スポット\]|［スポット］)\s*/, '').trim();
          } else if (spotlightMatch) {
            spotlightName = spotlightMatch[1].trim();
          }
          
          if (spotlightName) {
            currentItems.push({
              id: `item-${currentScenarioId}-${itemIndex++}`,
              type: 'spotlight',
              speaker: spotlightName,
              index: itemIndex
            });
            continue;
          }
        }

        // Check if there is a character speaking (colon check)
        // Match both halfwidth and fullwidth colons, e.g. "佐藤:" or "佐藤：" or "佐藤 : "
        const speakerMatch = rawLine.match(/^([^：:\s]{1,15})\s*[：:]\s*(.*)$/);

          if (speakerMatch) {
            const speaker = speakerMatch[1].trim();
            const text = speakerMatch[2].trim();
            currentItems.push({
              id: `item-${currentScenarioId}-${itemIndex++}`,
              type: 'dialogue',
              speaker,
              text,
              index: itemIndex
            });
          } else {
            // No speaker matched, treated as Narrator dialogue (no speaker key)
            currentItems.push({
              id: `item-${currentScenarioId}-${itemIndex++}`,
              type: 'dialogue',
              text: trimmedLine,
              index: itemIndex
            });
          } // speaker else block end
        }
      }

    // Handle unclosed block at end of file
    if (currentScenarioId && currentItems.length > 0) {
      result.push({
        id: currentScenarioId,
        title: extractedTitle || currentTitle,
        items: currentItems,
        initialCharacters: currentInitialCharacters
      });
    }

    return result;
  };

  // 1. Try with tight titleSeen checking if an extractedTitle exists
  const initialResult = runParse(extractedTitle === "");
  if (initialResult.length > 0) {
    return initialResult;
  }

  // 2. Fallback: If 0 scenarios found (e.g., if translation or format issues interfered with the title tags),
  // retry without title-seen gating to ensure we capture the scenarios!
  return runParse(true);
}

/**
 * Extracts links to individual blog entries from direct HTML content.
 * This handles ameblo and hatenablog top/list pages.
 */
export function extractEntryLinks(html: string, baseUrl: string): { url: string; title: string }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links: { url: string; title: string }[] = [];
  const seenUrls = new Set<string>();

  // Resolve base domain info for relative links
  let origin = "";
  try {
    const u = new URL(baseUrl);
    origin = u.origin;
  } catch (e) {
    return [];
  }

  const anchors = Array.from(doc.querySelectorAll('a[href]'));
  
  anchors.forEach(a => {
    let href = a.getAttribute('href') || '';
    if (!href) return;

    // Convert relative paths to fully qualified URLs
    if (href.startsWith('/')) {
      href = origin + href;
    } else if (!href.startsWith('http')) {
      return;
    }

    // Strip trailing query parameters
    try {
      const urlObj = new URL(href);
      const keysToRemove = ["frm_id", "device_id", "amba", "gamp", "amp", "page", "device"];
      keysToRemove.forEach(k => urlObj.searchParams.delete(k));
      href = urlObj.toString();
    } catch(e) {}

    // Major blog entry checks
    const isAmebloEntry = href.match(/https:\/\/ameblo\.jp\/[a-zA-Z0-9_-]+\/entry-\d+\.html/);
    const isHatenaEntry = href.match(/https:\/\/[a-zA-Z0-9_-]+\.hatenablog\.com\/entry\/\d{4}\/\d{2}\/\d{2}\/\d+/) ||
                          href.match(/https:\/\/[a-zA-Z0-9_-]+\.hatenablog\.com\/entry\/[a-zA-Z0-9_-]+/) ||
                          href.includes('.hatenablog.com/entry/');

    if ((isAmebloEntry || isHatenaEntry) && !seenUrls.has(href)) {
      seenUrls.add(href);
      const linkText = (a.textContent || '').replace(/\s+/g, ' ').trim();
      links.push({
        url: href,
        title: linkText || "記事へ"
      });
    }
  });

  return links.slice(0, 15); // limit output to top 15 entry links
}

