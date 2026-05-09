export type DmStatus = 'online' | 'offline'

export type Dm = {
  id: string
  name: string
  status: DmStatus
}

export const dms: Dm[] = [
  { id: 'tanaka', name: '田中', status: 'online' },
  { id: 'suzuki', name: '鈴木', status: 'offline' },
  { id: 'sato', name: '佐藤', status: 'online' },
]
