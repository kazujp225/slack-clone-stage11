export type Channel = {
  id: string
  name: string
}

export const channels: Channel[] = [
  { id: 'general', name: 'general' },
  { id: 'random', name: 'random' },
  { id: 'project-a', name: 'project-a' },
  { id: 'design', name: 'design' },
  { id: 'announcements', name: 'announcements' },
]

export type Message = {
  id: string
  type: 'channel' | 'dm'
  parentId: string
  userName: string
  body: string
  createdAt: string
  reactions: { [emoji: string]: number }
}

export const messages: Message[] = [
  // # general
  { id: 'm-g-1', type: 'channel', parentId: 'general', userName: 'Alice', body: 'おはようございます！今日もよろしくお願いします。', createdAt: '09:12', reactions: {} },
  { id: 'm-g-2', type: 'channel', parentId: 'general', userName: 'Bob', body: 'おはよう！朝会は10時からでしたよね？', createdAt: '09:15', reactions: {} },
  { id: 'm-g-3', type: 'channel', parentId: 'general', userName: 'Carol', body: 'はい、10時からSprintレビューです。', createdAt: '09:18', reactions: {} },
  { id: 'm-g-4', type: 'channel', parentId: 'general', userName: 'Dave', body: '昨日の障害対応のpostmortemまとめました、あとで共有します。', createdAt: '09:32', reactions: {} },
  { id: 'm-g-5', type: 'channel', parentId: 'general', userName: 'Alice', body: 'ありがとう！読んだらコメント入れます。', createdAt: '09:45', reactions: {} },

  // # random
  { id: 'm-r-1', type: 'channel', parentId: 'random', userName: 'Eve', body: '近所のラーメン屋オープンしたらしい🍜', createdAt: '12:01', reactions: {} },
  { id: 'm-r-2', type: 'channel', parentId: 'random', userName: 'Frank', body: 'お、行きたい。今週末どう？', createdAt: '12:03', reactions: {} },
  { id: 'm-r-3', type: 'channel', parentId: 'random', userName: 'Eve', body: '土曜の昼ならOK！', createdAt: '12:05', reactions: {} },
  { id: 'm-r-4', type: 'channel', parentId: 'random', userName: 'Bob', body: '便乗していいですか？', createdAt: '12:10', reactions: {} },

  // # project-a
  { id: 'm-pa-1', type: 'channel', parentId: 'project-a', userName: 'Carol', body: '要件定義のドラフトv2をNotionに上げました。', createdAt: '14:20', reactions: {} },
  { id: 'm-pa-2', type: 'channel', parentId: 'project-a', userName: 'Dave', body: '確認します。今週金曜までにレビュー戻します。', createdAt: '14:25', reactions: {} },
  { id: 'm-pa-3', type: 'channel', parentId: 'project-a', userName: 'Alice', body: '私もレビュー入ります。', createdAt: '14:28', reactions: {} },
  { id: 'm-pa-4', type: 'channel', parentId: 'project-a', userName: 'Carol', body: '助かります🙏', createdAt: '14:30', reactions: {} },

  // # design
  { id: 'm-d-1', type: 'channel', parentId: 'design', userName: 'Eve', body: 'デザイン案v3をFigmaにアップしました。レビューお願いします🙏', createdAt: '10:02', reactions: {} },
  { id: 'm-d-2', type: 'channel', parentId: 'design', userName: 'Bob', body: 'チェックします。今日中にフィードバック返します。', createdAt: '10:05', reactions: {} },
  { id: 'm-d-3', type: 'channel', parentId: 'design', userName: 'Frank', body: 'ヘッダーの余白もう少し詰めても良さそう。', createdAt: '10:40', reactions: {} },

  // # announcements
  { id: 'm-a-1', type: 'channel', parentId: 'announcements', userName: 'Admin', body: '【お知らせ】来週月曜10:00-11:00にメンテナンスを実施します。', createdAt: '08:00', reactions: {} },
  { id: 'm-a-2', type: 'channel', parentId: 'announcements', userName: 'Admin', body: '社内勉強会の発表者を募集中です！', createdAt: '08:15', reactions: {} },
  { id: 'm-a-3', type: 'channel', parentId: 'announcements', userName: 'Carol', body: '勉強会、参加します！', createdAt: '08:30', reactions: {} },

  // DM 田中
  { id: 'm-dm-tanaka-1', type: 'dm', parentId: 'tanaka', userName: '田中', body: 'お疲れ様です！例の資料、送っておきました📎', createdAt: '11:00', reactions: {} },
  { id: 'm-dm-tanaka-2', type: 'dm', parentId: 'tanaka', userName: 'You', body: 'ありがとうございます、確認します！', createdAt: '11:02', reactions: {} },
  { id: 'm-dm-tanaka-3', type: 'dm', parentId: 'tanaka', userName: '田中', body: '不明点あれば気軽に聞いてください。', createdAt: '11:03', reactions: {} },

  // DM 鈴木
  { id: 'm-dm-suzuki-1', type: 'dm', parentId: 'suzuki', userName: '鈴木', body: '昨日の打ち合わせ議事録、共有しました', createdAt: '昨日 18:42', reactions: {} },
  { id: 'm-dm-suzuki-2', type: 'dm', parentId: 'suzuki', userName: 'You', body: 'ありがとうございます。明日コメント入れます。', createdAt: '昨日 19:10', reactions: {} },
  { id: 'm-dm-suzuki-3', type: 'dm', parentId: 'suzuki', userName: '鈴木', body: 'よろしくお願いします🙇', createdAt: '昨日 19:12', reactions: {} },
  { id: 'm-dm-suzuki-4', type: 'dm', parentId: 'suzuki', userName: '鈴木', body: '本日はオフラインです、対応は明日になります。', createdAt: '昨日 20:00', reactions: {} },

  // DM 佐藤
  { id: 'm-dm-sato-1', type: 'dm', parentId: 'sato', userName: '佐藤', body: 'ランチ行きません？🍱', createdAt: '11:45', reactions: {} },
  { id: 'm-dm-sato-2', type: 'dm', parentId: 'sato', userName: 'You', body: 'いいですね、12:30にロビーで！', createdAt: '11:47', reactions: {} },
  { id: 'm-dm-sato-3', type: 'dm', parentId: 'sato', userName: '佐藤', body: '了解です👍', createdAt: '11:48', reactions: {} },
]
