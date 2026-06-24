/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CharacterConfig {
  key: string;
  displayName: string;
  avatarUrl: string; // URL or emoji-avatar or svg-avatar
  color: string; // hex or tailwind class for name tag, e.g. "bg-amber-600"
  position: 'left' | 'right' | 'center';
}

export interface ItemConfig {
  key: string;
  name: string;
  imageUrl: string;
}

export interface ScenarioConfig {
  id: string; // matches the ***tag***, e.g. "上司と部下"
  name: string; // human readable name
  themeColor: string; // e.g. "theme-blue"
  characters: Record<string, CharacterConfig>;
  scenes: Record<string, string>; // sceneName -> backgroundUrl mapper. Default is '標準'
  items?: Record<string, ItemConfig>; // itemKey -> ItemConfig
}

export type DialogueType = 'dialogue' | 'click-wait' | 'scene-change' | 'characters-change' | 'spotlight' | 'spotlight-end' | 'show-item';

export interface DialogueItem {
  id: string;
  type: DialogueType;
  speaker?: string; // character key
  text?: string;    // dialogue text
  sceneName?: string; // name of the scene (e.g., '山岳', '給湯室', '王宮', '白')
  assetId?: string; // which scenario asset to use
  sceneTitle?: string; // title to display in center (e.g., '冒頭')
  characters?: string[]; // list of active characters
  itemName?: string; // name of the item to display
  index: number;    // order in story
}

export interface ParsedScenario {
  id: string; // Matches scenario configuration ID
  title: string; // e.g. extracted via ***タイトル*** or default
  items: DialogueItem[];
  initialCharacters?: string[];
}

export interface BlogItem {
  id: string;
  title: string;
  content: string;
  description: string;
  category: string;
}
