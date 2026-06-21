/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScenarioConfig, BlogItem } from '../types';
import FemaleBossUrl from '../assets/images/anime_female_boss_1781746518604.jpg';
import MaleSubordinateUrl from '../assets/images/anime_male_subordinate_1781746532145.jpg';

import PrincessUrl from '../assets/images/anime_princess_character_1781857495287.jpg';
import KnightUrl from '../assets/images/anime_knight_character_1781857508769.jpg';
import HeroUrl from '../assets/images/anime_hero_character_1781857522707.jpg';
import DemonKingUrl from '../assets/images/anime_demon_king_character_1781857533496.jpg';
import FantasyBgUrl from '../assets/images/anime_fantasy_road_background_1781857544323.jpg';

export const DEFAULT_SCENARIOS: Record<string, ScenarioConfig> = {
  "上司と部下": {
    id: "上司と部下",
    name: "オフィスでの業務報告",
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
      "給湯室": "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1200&q=80"
    }
  },
  "ファンタジー": {
    id: "ファンタジー",
    name: "古の遺跡での対峙",
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
      "標準": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      "山岳": FantasyBgUrl,
      "王宮": "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80"
    }
  },
  "幼馴染の図書室": {
    id: "幼馴染の図書室",
    name: "放課後の図書室にて",
    themeColor: "emerald",
    characters: {
      "葵": {
        key: "葵",
        displayName: "葵 (あおい)",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        color: "#10b981", // emerald-500
        position: "left"
      },
      "颯太": {
        key: "颯太",
        displayName: "颯太 (そうた)",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
        color: "#3b82f6", // blue-500
        position: "right"
      }
    },
    scenes: {
      "標準": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
    }
  }
};

export const DEFAULT_BLOGS: BlogItem[] = [
  {
    id: "blog-1",
    title: "機能説明：全機能の紹介（サンプル）",
    category: "",
    description: "",
    content: `皆さん、こんにちは！
こちらのサンプルでは、Adv_Player の全機能をご紹介します。

【タイトル】
会話ゲームの全機能紹介

【上司と部下】
【シーン】標準「ゲームスタート」
【登場人物】上司

上司: ようこそ！ここでは、記事のテキストから自動生成される会話ゲームの機能を紹介するぞ。
上司: まず、このように「名前: セリフ」と書くだけで、自動的にキャラクターのアイコンや色が割り当てられる仕組みだ。
上司: クリックすればどんどん進むから、試してみてくれ。

【シーン】黒「背景とシーンの切り替え」
上司: 「【シーン】黒」と指定すれば、このように背景をカラーで塗りつぶすことができる。「白」も可能だ。

【シーン】給湯室「画像の切り替え」
上司: 「【シーン】給湯室」など、設定しておいたシーン名に変更すれば、背景画像をぱっと切り替えられる。
上司: このとき、「シーン移動」のように括弧でくくった文字があれば、画面中央に演出付きで表示もできるぞ。

【登場人物】上司、部下
部下: お疲れ様です！お呼びでしょうか？

上司: おお、部下くん。「【登場人物】上司、部下」と指定することで、途中で新しいキャラクターを登場させることも可能だ。

部下: なるほど！最初は上司だけでしたが、後から私が登場したのですね。
部下: それに、この画面のどこをクリックしてもセリフが次に進むので、とても読みやすいです！

上司: うむ。その他にも「設定 (JSON)」タブから、キャラクターや背景のURL、テーマカラーなどを詳細にカスタマイズできる。
上司: ぜひブログと連携させて、君だけのオリジナル会話劇を作ってみてくれたまえ！
【おわり】

いかがでしたでしょうか？
このように、簡単なタグを使うだけで高度な演出が可能となります。
ぜひ皆さんのブログでも取り入れてみてください。
`
  },
  {
    id: "blog-2",
    title: "対立から生まれる最高のチームビルディング：物語から学ぶ信頼関係（サンプル）",
    category: "",
    description: "",
    content: `私たちはよく、自分とは全く異なる価値観を持つ人と対峙することがあります。
それはビジネスにおける他部署との利害調整だったり、競合他社との競り合いだったりします。
しかし、お互いに「何を目的にしているのか」というコアルールを共有すると、対立が対話に変わり、新しい物語がスタートすることがあります。
今回は、ファンタジーの古典「勇者と魔王」がもし会議室で出会ったら、というパロディ対峙を再現してみました。

【タイトル】
世界平和のための四者会談：それぞれの思惑と落とし所（サンプル）

【ファンタジー】
【登場人物】姫、勇者、騎士、魔王
【シーン】山岳

勇者: ついにここまで来たぞ、魔王！世界を闇に沈めようとするお前の野望も、ここで終わりだ！

魔王: ほう、よくぞここまで辿り着いたな、勇者よ。だが「世界を闇に沈める」とはいささか語弊がある。

姫: 勇者様、お待ちください！お父様から魔王領の環境保全と経済連携について、まずは対話を試みるよう言付かっておりますわ。

騎士: 姫様、下がりなされ！相手は魔術の達人、いつ騙まし討ちに遭うとも限りません。私が盾となります！

魔王: 単に、現在の過剰な太陽光エネルギーによる土壌の乾燥化を懸念し、夜の時間を延長する「クールダウン計画」を推進しているに過ぎぬ。お前たちの作物、最近干からびていただろう？

勇者: え？……あ、確かに最近雨が降らずに農家のおじさんが泣いていたけど……。

騎士: 騙されてはいけません！天候を操ること自体が悪魔の所業！我が国の聖騎士団はそれを許しませぬ！

【シーン】王宮
姫: 騎士よ、剣を収めなさい。魔王様、もし我が国の農業技術を提供し、太陽光でも育つ魔界の作物を共同開発すれば、無理な気象操作は不要になりますわね？

魔王: ほう……姫君は聡明だな。我が国の農業基盤が安定するなら、夜の延長は直ちに不要となる。

騎士: な、何と……！

勇者: ま、まさか、悪気はなかったっていうのか！？
 
魔王: ああ、我らは極めてロジカルに対処している。どうだ、無駄な戦いはやめ、共同で気候変動対策アライアンスを結ばないか？

姫: 提案に賛同いたしますわ。

騎士: 姫様がそう仰るなら……！

勇者: 悔しいけど、筋が通っている……。わかった、私も剣を収めよう。交渉開始だ！
【おわり】

物事を多角的な視点から捉えることで、見えてくる世界は全く異なったものになります。
目の前の敵や問題（乾燥）の根本原因は何か？を分析し、共通の敵（気候変動）に対して手を取り合うことの大切さを、このやり取りは示しています。
`
  },
  {
    id: "blog-3",
    title: "図書室の片隅で、伝える言葉の選び方について考える（サンプル）",
    category: "",
    description: "",
    content: `放課後の図書室。静かな空間に、ページをめくる音だけが響いています。
私たちは毎日、言葉を使ってコミュニケーションを取っていますが、その言葉には「額面通りの意味」と「裏に隠された気持ち」があります。
特に親しい間柄や、ちょっと照れくさいとき、私たちは意図せず遠回りをしがちです。
甘酸っぱい放課後のワンシーンを、会話ゲームのようにお届けします。

【タイトル】
放課後、小説の貸し借りとツンデレな夕暮れ（サンプル）

【幼馴染の図書室】
葵: あら、颯太。こんなところで本を読んでいるなんて珍しいじゃない。

颯太: あ、葵……。いや、お前に「語彙力が足りないから本でも読みなよ」って言われたから、渋々選んでたんだよ。

葵: ふーん、本当に私の言った通りにしたんだ。律儀ね。
葵: ……で、どんなの読んでるわけ？

颯太: え、あ、これは……葵が前に好きだって言ってた、ちょっとファンタジー寄りの小説なんだけど……。
 
葵: っ！？……それ、私が一番オススメした「夕暮れの旅人」じゃない！

颯太: うん。お前が熱弁してたから、気になっちゃって……。つまらなかったら文句言おうと思ってたけど、わりと面白いかも。

葵: ……バカ。文句なんて言わせないわよ、最高なんだから。
葵: でも……ありがと。読んでくれて、ちょっと嬉しいかも。

颯太: ああ……。こちらこそ、いい本を教えてくれてありがとうな、葵。
【おわり】

素直になれない「葵」ですが、颯太が自分のアドバイス（お勧め）を覚えていて、実際に読んでくれたことに対して、最後は少しだけ素直な言葉を伝えることができました。
「言われたから仕方なく読んだ」
「紹介してくれたから読んでみた」
言葉の奥にある好意のキャッチボール。皆さんも大切な人と、こんな温かい対話を楽しんでみてください。
`
  }
];
