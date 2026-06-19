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
    backgroundUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
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
    }
  },
  "ファンタジー": {
    id: "ファンタジー",
    name: "古の遺跡での対峙",
    backgroundUrl: FantasyBgUrl,
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
    }
  },
  "幼馴染の図書室": {
    id: "幼馴染の図書室",
    name: "放課後の図書室にて",
    backgroundUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
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
    }
  }
};

export const DEFAULT_BLOGS: BlogItem[] = [
  {
    id: "blog-1",
    title: "効率的な議事録作成と上司への報告のツボ（サンプル）",
    category: "",
    description: "",
    content: `皆さん、こんにちは！日々の仕事、お疲れ様です。
会議後の議事録作成、ついつい後回しにしていませんか？
上司は「早さ」と「要点の明確さ」を求めています。今回は、そんな議事録報告をテーマにした会話を見てみましょう。

【タイトル】
佐藤部長の抜き打ち議事録チェック！（サンプル）

【上司と部下】
上司: おはよう、部下くん。昨日の定例ミーティングの議事録はもうできているかね？

部下: おはようございます！はい、こちらになります。会議終了後、重要決定事項と次回アクションに絞って30分でまとめました。

上司: ほう……どれどれ。
上司: おお、素晴らしい！決定した事項が太字で強調されていて、誰がいつまでに何をするかが一目でわかる。

部下: ありがとうございます！先輩に「忙しい上司はスクロールせずに読める構成を好む」とアドバイスをいただきまして。

上司: 実に素晴らしいぞ。これなら私もすぐに役員会で報告できる。部下くん、よくやった！

部下: 光栄です！次回も素早いアウトプットを心がけます！
【おわり】

いかがでしたでしょうか？
このように、上司が忙しいことを想定し「結論ファースト」「アクションプランの可視化」を最速で共有することが、仕事で評価される大きな鍵になります。
ぜひ皆さんの現場でも取り入れてみてください。
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
勇者: ついにここまで来たぞ、魔王！世界を闇に沈めようとするお前の野望も、ここで終わりだ！

魔王: ほう、よくぞここまで辿り着いたな、勇者よ。だが「世界を闇に沈める」とはいささか語弊がある。

姫: 勇者様、お待ちください！お父様から魔王領の環境保全と経済連携について、まずは対話を試みるよう言付かっておりますわ。

騎士: 姫様、下がりなされ！相手は魔術の達人、いつ騙まし討ちに遭うとも限りません。私が盾となります！

魔王: 単に、現在の過剰な太陽光エネルギーによる土壌の乾燥化を懸念し、夜の時間を延長する「クールダウン計画」を推進しているに過ぎぬ。お前たちの作物、最近干からびていただろう？

勇者: え？……あ、確かに最近雨が降らずに農家のおじさんが泣いていたけど……。

騎士: 騙されてはいけません！天候を操ること自体が悪魔の所業！我が国の聖騎士団はそれを許しませぬ！

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
