export type Message = {
  id: string
  user: string
  time: string
  body: string
}

export const messages: Message[] = [
  {
    id: '1',
    user: 'Alice',
    time: '09:12',
    body: 'おはようございます！今日もよろしくお願いします。',
  },
  {
    id: '2',
    user: 'Bob',
    time: '09:15',
    body: 'おはよう！朝会は10時からでしたよね？',
  },
  {
    id: '3',
    user: 'Carol',
    time: '09:18',
    body: 'はい、10時からSprintレビューです。',
  },
  {
    id: '4',
    user: 'Dave',
    time: '09:32',
    body: '昨日の障害対応のpostmortemをまとめました。あとで共有します。',
  },
  {
    id: '5',
    user: 'Alice',
    time: '09:45',
    body: 'ありがとう！読んだらコメント入れます。',
  },
  {
    id: '6',
    user: 'Eve',
    time: '10:02',
    body: 'デザイン案v3をFigmaにアップしました。レビューお願いします🙏',
  },
  {
    id: '7',
    user: 'Bob',
    time: '10:05',
    body: 'チェックします。今日中にフィードバック返します。',
  },
  {
    id: '8',
    user: 'Carol',
    time: '10:21',
    body: 'PR #142 マージしました。',
  },
  {
    id: '9',
    user: 'Frank',
    time: '10:34',
    body: 'デプロイ完了しました。ステージング環境で動作確認お願いします。',
  },
  {
    id: '10',
    user: 'Alice',
    time: '10:40',
    body: '確認しました、問題なさそうです 👍',
  },
]

export const channels = [
  'general',
  'random',
  'project-a',
  'design',
  'announcements',
] as const
