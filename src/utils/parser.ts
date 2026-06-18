/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedScenario, DialogueItem, DialogueType } from '../types';

/**
 * Parses blog body content, extracting scenario blocks and titles.
 * @param content The raw markdown or text of the blog.
 * @returns Array of parsed scenarios found in the blog.
 */
export function parseBlogContent(content: string): ParsedScenario[] {
  const lines = content.split(/\r?\n/);
  const scenarios: ParsedScenario[] = [];

  let currentScenarioId: string | null = null;
  let currentTitle = "アドベンチャーパート";
  let currentItems: DialogueItem[] = [];
  let itemIndex = 0;

  // First pass: Find title anywhere in the blog post
  // (We search for the "【タイトル】" or "***タイトル***" line and take the first subsequent non-empty line as the general title)
  let extractedTitle = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
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

  let titleSeen = extractedTitle === "" ? true : false;

  // Second pass: Parse scenarios blocks
  for (let i = 0; i < lines.length; i++) {
    // Remove invisible characters that often get copied on mobile/Ameba
    const rawLine = lines[i].replace(/[\u200B-\u200D\uFEFF]/g, '');
    const trimmedLine = rawLine.trim();

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
    
    if (startTagMatch) {
      let tagContent = startTagMatch[1].trim();
      const extraContent = startTagMatch[2].trim();
      
      if (tagContent === "タイトル" || tagContent.toLowerCase() === "title") {
        // Skip title lines, already handled
        continue;
      }
      
      const lowerTag = tagContent.toLowerCase();
      const isEndTag = lowerTag.startsWith("end") || tagContent === "おわり" || tagContent === "終了" || tagContent === "終了タグ";
      
      if (isEndTag) {
        // Reached end tag, save current scenario if exists
        if (currentScenarioId) {
          scenarios.push({
            id: currentScenarioId,
            title: extractedTitle || currentTitle,
            items: [...currentItems]
          });
          currentScenarioId = null;
          currentItems = [];
        }
        continue;
      }

      // If already in a scenario block, close it before starting a new one
      if (currentScenarioId) {
        scenarios.push({
          id: currentScenarioId,
          title: extractedTitle || currentTitle,
          items: [...currentItems]
        });
        currentItems = [];
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
      itemIndex = 0;
      continue;
    }

    // Inside a scenario block
    if (currentScenarioId) {
      if (trimmedLine === "") {
        // We skip empty lines to rely on natural click-to-advance flow
        continue;
      } else {
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
        }
      }
    }
  }

  // Handle unclosed block at end of file
  if (currentScenarioId && currentItems.length > 0) {
    scenarios.push({
      id: currentScenarioId,
      title: extractedTitle || currentTitle,
      items: currentItems
    });
  }

  return scenarios;
}
