/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * (Triggering sync for GitHub deployment)
 */

import { ScenarioConfig, BlogItem } from '../types';
import FemaleBossUrl from '../assets/images/anime_female_boss_1781746518604.jpg';
import MaleSubordinateUrl from '../assets/images/anime_male_subordinate_1781746532145.jpg';

import PrincessUrl from '../assets/images/anime_princess_character_1781857495287.jpg';
import KnightUrl from '../assets/images/anime_knight_character_1781857508769.jpg';
import HeroUrl from '../assets/images/anime_hero_character_1781857522707.jpg';
import DemonKingUrl from '../assets/images/anime_demon_king_character_1781857533496.jpg';
import FantasyBgUrl from '../assets/images/anime_fantasy_road_background_1781857544323.jpg';
import MedievalPalaceUrl from '../assets/images/medieval_palace_1782112684164.jpg';

import OlUrl from '../assets/images/anime_yukari_longhair_casual_1782096845522.jpg';
import SagariUrl from '../assets/images/anime_sagari_casual_restored_1782097004534.jpg';
import CafeBgUrl from '../assets/images/anime_cafe_interior_background_1782089353718.jpg';
import DvergUrl from '../assets/images/anime_warrior_dverg_1782089508987.jpg';
import AlUrl from '../assets/images/anime_cat_fairy_al_1782089520532.jpg';
import FantasyTavernCafeUrl from '../assets/images/fantasy_tavern_cafe_1782112654209.jpg';
import RuggedMountainPathUrl from '../assets/images/rugged_mountain_path_1782112671288.jpg';

import MysteriousWomanPortraitUrl from '../assets/images/mysterious_woman_portrait_1782171595337.jpg';
import MysteriousWomanLightUrl from '../assets/images/mysterious_woman_light_white_1782171906086.jpg';
import TavernCafeUpdatedUrl from '../assets/images/fantasy_tavern_cafe_1782171567215.jpg';
import MountainPathUpdatedUrl from '../assets/images/fantasy_mountain_path_1782171580450.jpg';
import OgreUrl from '../assets/images/fantasy_ogre_portrait_1782187122969.jpg';
import WeakOgreUrl from '../assets/images/weak_ogre_monster_1782197619974.jpg';
import FernandaUrl from '../assets/images/fernanda_revealed_warm_1782196252219.jpg';
import DianeUrl from '../assets/images/diane_younger_1782194161290.jpg';
import FantasyPlainsUrl from '../assets/images/fantasy_plains_background_1782199323597.jpg';

import AnimeMageUrl from '../assets/images/anime_mage_bust_up_1782273986131.jpg';
import AnimeMysteriousManUrl from '../assets/images/anime_mysterious_man_bust_up_1782273999879.jpg';
import AnimeLarsModernUrl from '../assets/images/anime_lars_modern.jpg';
import AnimeCityCrowdBgUrl from '../assets/images/anime_city_crowd_bg_1782274016880.jpg';
import AnimeMedievalForestBgUrl from '../assets/images/anime_medieval_forest_bg_1782274030440.jpg';
import AnimeCaveInteriorBgUrl from '../assets/images/anime_cave_interior_bg_1782274043186.jpg';

import AnimeHouseGardenBgUrl from '../assets/images/anime_house_garden_bg_1782275882765.jpg';
import PopAlienKamuUrl from '../assets/images/kimo_alien_kamu_1782367685256.jpg';
import PopAlienMuniUrl from '../assets/images/kimo_alien_muni_1782367700181.jpg';
import PopAliensTogetherUrl from '../assets/images/kimo_aliens_pair_1782367716150.jpg';

import CastleTownEmptyUrl from '../assets/images/castle_town_empty_1782344247711.jpg';
import FantasyGreatswordUrl from '../assets/images/fantasy_greatsword_1782344266255.jpg';
import AnimeHorizonBgUrl from '../assets/images/anime_horizon_background_1782368496132.jpg';
import HumanMaleSilhouetteUrl from '../assets/images/human_male_silhouette_1782368530945.jpg';
import HumanFemaleSilhouetteUrl from '../assets/images/human_female_silhouette_1782368561164.jpg';

import AnimeAkiUrl from '../assets/images/anime_aki_highschool_girl_1782456499877.jpg';
import AnimeAzarashiUrl from '../assets/images/anime_azarashi_otaku_boy_1782456515245.jpg';
import AnimeYokoUrl from '../assets/images/anime_yoko_bob_girl_1782456527259.jpg';
import AnimeDelinquentTrioUrl from '../assets/images/anime_delinquent_trio_1782456543516.jpg';

export const DEFAULT_SCENARIOS: Record<string, ScenarioConfig> = {
  "汎用": {
    id: "汎用",
    themeColor: "slate",
    characters: {
      "男性": {
        key: "男性",
        displayName: "男性",
        avatarUrl: HumanMaleSilhouetteUrl,
        color: "#475569", // slate-600
        position: "left"
      },
      "女性": {
        key: "女性",
        displayName: "女性",
        avatarUrl: HumanFemaleSilhouetteUrl,
        color: "#f43f5e", // rose-500
        position: "right"
      },
      "亜紀": {
        key: "亜紀",
        displayName: "亜紀",
        avatarUrl: AnimeAkiUrl,
        color: "#d97706",
        position: "left"
      },
      "アザラシ": {
        key: "アザラシ",
        displayName: "アザラシ",
        avatarUrl: AnimeAzarashiUrl,
        color: "#2563eb",
        position: "right"
      },
      "葉子": {
        key: "葉子",
        displayName: "葉子",
        avatarUrl: AnimeYokoUrl,
        color: "#475569",
        position: "left"
      },
      "不良ABC": {
        key: "不良ABC",
        displayName: "不良ABC",
        avatarUrl: AnimeDelinquentTrioUrl,
        color: "#dc2626",
        position: "center"
      }
    },
    scenes: {
      "標準": AnimeHorizonBgUrl,
      "地平線": AnimeHorizonBgUrl
    }
  },
  "上司と部下": {
    id: "上司と部下",
    themeColor: "amber",
    characters: {
      "上司": {
        key: "上司",
        displayName: "上司",
        avatarUrl: FemaleBossUrl,
        color: "#d97706", // amber-600
        position: "left"
      },
      "部下": {
        key: "部下",
        displayName: "部下",
        avatarUrl: MaleSubordinateUrl,
        color: "#2563eb", // blue-600
        position: "right"
      }
    },
    scenes: {
      "標準": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "オフィス": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "給湯室": "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1200&q=80"
    }
  },
  "ファンタジー": {
    id: "ファンタジー",
    themeColor: "indigo",
    characters: {
      "姫": {
        key: "姫",
        displayName: "姫",
        avatarUrl: PrincessUrl,
        color: "#f472b6", // pink-400
        position: "left"
      },
      "勇者": {
        key: "勇者",
        displayName: "勇者",
        avatarUrl: HeroUrl,
        color: "#ef4444", // red-500
        position: "left"
      },
      "騎士": {
        key: "騎士",
        displayName: "騎士",
        avatarUrl: KnightUrl,
        color: "#94a3b8", // slate-400
        position: "right"
      },
      "魔王": {
        key: "魔王",
        displayName: "魔王",
        avatarUrl: DemonKingUrl,
        color: "#a855f7", // purple-500
        position: "right"
      }
    },
    scenes: {
      "標準": FantasyBgUrl,
      "平原": FantasyBgUrl,
      "王宮": MedievalPalaceUrl
    }
  },
  "異世界オーガニックカレー": {
    id: "異世界オーガニックカレー",
    themeColor: "emerald",
    characters: {
      "由香里": {
        key: "由香里",
        displayName: "由香里",
        avatarUrl: OlUrl,
        color: "#10b981", // emerald-500
        position: "left"
      },
      "佐賀里": {
        key: "佐賀里",
        displayName: "佐賀里",
        avatarUrl: SagariUrl,
        color: "#f59e0b", // amber-500
        position: "right"
      },
      "ドヴェルグ": {
        key: "ドヴェルグ",
        displayName: "ドヴェルグ",
        avatarUrl: DvergUrl,
        color: "#6b7280", // gray-500
        position: "left"
      },
      "アル": {
        key: "アル",
        displayName: "アル",
        avatarUrl: AlUrl,
        color: "#ef4444", // red-500
        position: "right"
      },
      "魔法使い": {
        key: "魔法使い",
        displayName: "魔法使い",
        avatarUrl: AnimeMageUrl,
        color: "#c084fc", // purple-400
        position: "left"
      },
      "謎の女性": {
        key: "謎の女性",
        displayName: "謎の女性",
        avatarUrl: MysteriousWomanLightUrl,
        color: "#f8fafc", // slate-50
        position: "left"
      },
      "謎の男": {
        key: "謎の男",
        displayName: "謎の男",
        avatarUrl: AnimeMysteriousManUrl,
        color: "#475569", // slate-600
        position: "right"
      },
      "ラース": {
        key: "ラース",
        displayName: "ラース",
        avatarUrl: AnimeLarsModernUrl,
        color: "#3b82f6", // blue-500
        position: "left"
      },
      "オーガ": {
        key: "オーガ",
        displayName: "オーガ",
        avatarUrl: OgreUrl,
        color: "#166534", // green-800
        position: "right"
      },
      "雑魚オーガ": {
        key: "雑魚オーガ",
        displayName: "雑魚オーガ",
        avatarUrl: WeakOgreUrl,
        color: "#a3e635", // lime-400
        position: "right"
      },
      "マーリア": {
        key: "マーリア",
        displayName: "マーリア",
        avatarUrl: FernandaUrl,
        color: "#cbd5e1", // slate-300
        position: "left"
      },
      "フェルナンダ": {
        key: "フェルナンダ",
        displayName: "フェルナンダ",
        avatarUrl: DianeUrl,
        color: "#fecdd3", // rose-200
        position: "left"
      }
    },
    scenes: {
      "標準": TavernCafeUpdatedUrl,
      "カフェ": TavernCafeUpdatedUrl,
      "山岳": MountainPathUpdatedUrl,
      "平原": FantasyPlainsUrl,
      "城下町": CastleTownEmptyUrl,
      "都会の雑踏": AnimeCityCrowdBgUrl,
      "森の中": AnimeMedievalForestBgUrl,
      "洞窟": AnimeCaveInteriorBgUrl
    },
    items: {
      "大剣": {
        key: "大剣",
        name: "大剣",
        imageUrl: FantasyGreatswordUrl
      }
    }
  },
  "カムとムニのチキュウジン観察": {
    id: "カムとムニのチキュウジン観察",
    themeColor: "pink",
    characters: {
      "カム": {
        key: "カム",
        displayName: "カム",
        avatarUrl: PopAlienKamuUrl,
        color: "#ec4899", // pink-500
        position: "left"
      },
      "ムニ": {
        key: "ムニ",
        displayName: "ムニ",
        avatarUrl: PopAlienMuniUrl,
        color: "#f472b6", // pink-400
        position: "right"
      },
      "カムとムニ": {
        key: "カムとムニ",
        displayName: "カムとムニ",
        avatarUrl: PopAliensTogetherUrl,
        color: "#db2777", // pink-600
        position: "center"
      },
      "亜紀": {
        key: "亜紀",
        displayName: "亜紀",
        avatarUrl: AnimeAkiUrl,
        color: "#d97706",
        position: "left"
      },
      "アザラシ": {
        key: "アザラシ",
        displayName: "アザラシ",
        avatarUrl: AnimeAzarashiUrl,
        color: "#2563eb",
        position: "right"
      },
      "葉子": {
        key: "葉子",
        displayName: "葉子",
        avatarUrl: AnimeYokoUrl,
        color: "#475569",
        position: "left"
      },
      "不良ABC": {
        key: "不良ABC",
        displayName: "不良ABC",
        avatarUrl: AnimeDelinquentTrioUrl,
        color: "#dc2626",
        position: "center"
      }
    },
    scenes: {
      "標準": AnimeHouseGardenBgUrl,
      "庭": AnimeHouseGardenBgUrl
    }
  }
};

export const DEFAULT_BLOGS: BlogItem[] = [
  {
    id: "sample-1",
    title: "機能説明：オフィスでの会話劇（上司と部下）",
    category: "サンプル",
    description: "",
    content: `【タイトル】
会話ゲーム機能の紹介：オフィス編

【上司と部下】
【シーン】標準「ゲームスタート」
【登場人物】上司

上司: お疲れ様。ここでは、記事に書いたテキストから自動生成される会話ゲームの基本的な機能を説明するわ。
上司: 基本は「名前: セリフ」と書くこと。これだけで、自動的にキャラクターのアイコンや色が割り当てられるの。
上司: この画面のどこでもクリックすれば先に進むわ。試してみて。

【シーン】黒「背景とシーンの切り替え」
上司: 「【シーン】黒」と指定すれば、このように背景をカラーで塗りつぶすことができます。

【シーン】給湯室「画像の切り替えとテロップ」
上司: 「【シーン】給湯室」など、あらかじめ設定しておいたシーン名に変更すれば、背景画像をぱっと切り替えられるわ。
上司: このとき、「テロップ」のように括弧でくくった文字があれば、画面中央に演出付きで表示もできるのよ。

【登場人物】上司、部下
部下: お疲れ様です！……って、あれ？ いつもと背景が違いますね。それに僕も突然呼び出されて……。

上司: 「【登場人物】上司、部下」と指定することで、途中で新しいキャラクターを登場させることも可能というわけ。

部下: なるほど！最初は一人でしたが、複数人での会話も再現できるんですね！最大4人までなら、画面サイズに合わせて自動で重なりを抑えた配置に調整されるんでしたっけ。

上司: その通り。スマホの縦画面やPCの横画面に合わせて、最適なレイアウトで自動調整されるのよ。

部下: それは便利ですね！

上司: では、次のサンプルに行ってみましょうか。
【おわり】`
  },
  {
    id: "sample-2",
    title: "機能説明：大人数の会話劇（ファンタジー）",
    category: "サンプル",
    description: "",
    content: `【タイトル】
会話ゲーム機能の紹介：ファンタジー編

【ファンタジー】
【登場人物】姫
【シーン】標準

姫: こちらのファンタジー編では、さらに大人数での機能をお見せしますわ。
姫: では、さっそく皆さんに集まってもらいましょうか。

【登場人物】姫、勇者、騎士、魔王
【シーン】王宮「全員集合！」

勇者: うおっ！いきなり王宮に呼び出されたぞ！

騎士: 姫様、ご無事ですか！……って、なぜ魔王までここに！？

魔王: ふっ、我を呼び出すとは、なかなか豪胆なシステムだな。

姫: 「【登場人物】姫、勇者、騎士、魔王」と指定すると、このように4人が一堂に会することができますの。
姫: スマホのような縦幅の狭い画面では、自動的に2列で重なって表示され、横幅が広い画面なら横に広がって表示される仕様ですわ。

勇者: おお、なるほど！狭いスマホだと、自動的に縮小されて全員が表示されるのか！賢いな！

魔王: うむ。それに、現在誰が喋っているかに応じて顔がハイライトされるから、誰のセリフかひと目で分かるぞ。

騎士: 「設定 (JSON)」タブからは、これらキャラクター達のアイコン画像やイメージカラーの設定内容を確認できます。

姫: さあ、ぜひあなただけのオリジナル会話劇を作ってみてくださいな！
【おわり】`
  },
  {
    id: "sample-3",
    title: "機能説明：複数の名前解決（異世界オーガニックカレー）",
    category: "サンプル",
    description: "",
    content: `【タイトル】
会話機能の紹介：複数同時発話編

【異世界オーガニックカレー】
【シーン】標準「森の中のログカフェ」
【登場人物】由香里、佐賀里

由香里: ここでは応用編として、複数人が同時に喋る表現を紹介するわね。

佐賀里: あっ、それって名前のところに「由香里、佐賀里：」みたいに名前をカンマや中黒で並べるやつのこと？

由香里: そうよ。ちょっと異世界の2人を呼んでみましょうか。

【登場人物】由香里、佐賀里、ドヴェルグ、アル
【シーン】城下町「異世界のゲスト登場」

ドヴェルグ: ぬおっ！？……いきなり呼び出されたぞ！？

アル: にゃは！ここはどこにゃ？

由香里、佐賀里: ようこそ、オーガニックカフェへ！

アル: わぁっ！2人が同時に喋ったにゃ！

ドヴェルグ、アル: これなら、みんなの声が揃う場面も簡単に作れるというわけだな！

由香里: ええ、このように名前をまとめて書くことで、該当するキャラクター全員が同時にハイライトされるのよ。

佐賀里: ちなみに、プルダウンからこのサンプルを切り替えると、自動で本文が書き換わるから、何度もリセットして練習できるよ！

アル: それじゃあ、これで機能紹介は終わりだにゃ！みんな、ばいばーいにゃ！

由香里、佐賀里、ドヴェルグ、アル: レッツ、シナリオメイキング！
【おわり】`
  },
  {
    id: "sample-4",
    title: "機能説明：スポット機能（スポット）",
    category: "サンプル",
    description: "",
    content: `【タイトル】
会話機能の紹介：スポット機能編

【異世界オーガニックカレー】
【シーン】標準「スポット機能のテスト」
【登場人物】由香里、佐賀里

由香里: ここでは、新しい演出「スポット機能」について説明するわね。

佐賀里: スポット機能？どんなふうになるの？

由香里: 百聞は一見にしかずよ。さっそくやってみるわ。
由香里: 【スポット】由香里

【スポット】由香里
由香里: こんな風に、指定したキャラクターが画面の中央に移動して、スポットライトが当たるのよ。

【スポット終了】
由香里: 「【スポット終了】」というタグを使うか……。

【スポット】佐賀里
佐賀里: うおっ！なんか私にスポットが当たった！

由香里: そう、こんな風に、別のキャラクターが話し始めた場合でも、自動的にスポット演出は解除されて元に戻る仕様になっているわ。

佐賀里: なるほど！ここぞという決め台詞や、キャラクターの単独アピールにぴったりな演出だね！

由香里: そういうこと。色々な場面で活用してみてね。
【おわり】`
  },
  {
    id: "sample-5",
    title: "新キャラクター紹介（マーリア・フェルナンダ）",
    category: "サンプル",
    description: "",
    content: `【タイトル】
新キャラクター紹介

【異世界オーガニックカレー】
【シーン】カフェ
【登場人物】マーリア、フェルナンダ、オーガ
【スポット】マーリア

マーリア: ……ようこそ。私の名前はマーリア。フードの奥の素顔を、遂にお見せする時が来ました。

【スポット】フェルナンダ

フェルナンダ: はじめまして！わたし、フェルナンダ！可愛いって言ってもらえて嬉しいな！これからもよろしくね！

【スポット終了】

オーガ: オレサマ、オーガ！カワイイコ、オオイ！オレモ、ナカマニ、イレテクレ！

フェルナンダ: わあっ、大きなオーガさんだ！一緒に遊ぼうよ！

マーリア: ふふふ……賑やかになりそうですね。
【おわり】`
  },
  {
    id: "sample-6",
    title: "チキュウジン観察（カムとムニ）",
    category: "サンプル",
    description: "",
    content: `【タイトル】
チキュウジンの不思議な生態

【カムとムニのチキュウジン観察】
【シーン】庭
【登場人物】カム、ムニ

カム: ムニ、見て！チキュウジンが不思議な箱を見つめてニヤニヤしてる！

ムニ: ほんとだ！あれは「スマフォ」っていうらしいよ。

カムとムニ: チキュウジンって不思議だね〜！
【おわり】`
  },
  {
    id: "sample-7",
    title: "機能説明：アイテムの表示と汎用アセット",
    category: "サンプル",
    description: "",
    content: `【タイトル】
アイテム表示機能の紹介

【異世界オーガニックカレー】
【シーン】カフェ
【登場人物】由香里、佐賀里

由香里: さて、新しい機能「アイテム」について説明するわ。

【アイテム】大剣

この「【アイテム】アイテム名」タグを使うと、画面の中央にアイテムを表示することができるの。
このように、説明文（話し手がいないテキスト）が続いている間は、アイテムは表示され続けるわ。

佐賀里: うおっ！いきなり凄い剣が出てきた！

由香里: そう、誰かが話し始めると、このようにアイテムは自動的に消える仕様になっているの。

佐賀里: なるほど、アイテムを見せながらの解説にぴったりだね。

【汎用】
【シーン】地平線
【登場人物】男性、女性

次に、汎用アセットについて。
シナリオ「汎用」を指定すると、このように汎用的な背景やキャラクターを使えるわ。
細かい指定なしで、単純なシルエットを使いたいときに便利ね。

【おわり】`
  }
];
