import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { dms } from '@/data/dms'
import type { Channel } from '@/data/messages'

export type SelectedItem =
  | { type: 'channel'; id: string }
  | { type: 'dm'; id: string }

type Props = {
  channels: Channel[]
  joinedChannelIds: Set<string>
  userId: string | null
  loading?: boolean
  error?: string | null
  selectedItem: SelectedItem
  onSelect: (item: SelectedItem) => void
  onJoin: (channelId: string) => void
  onLeave: (channelId: string) => void
}

export function Sidebar({
  channels,
  joinedChannelIds,
  userId,
  loading,
  error,
  selectedItem,
  onSelect,
  onJoin,
  onLeave,
}: Props) {
  const isSelected = (type: SelectedItem['type'], id: string) =>
    selectedItem.type === type && selectedItem.id === id

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-white/10">
        <h1 className="font-bold text-lg">My Workspace</h1>
      </div>
      <nav className="px-2 py-4">
        <h2 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">
          チャンネル
        </h2>
        {loading && (
          <ul className="space-y-2 px-2">
            <li><Skeleton className="h-6 w-full bg-white/20" /></li>
            <li><Skeleton className="h-6 w-3/4 bg-white/20" /></li>
            <li><Skeleton className="h-6 w-2/3 bg-white/20" /></li>
          </ul>
        )}
        {!loading && error && (
          <p className="px-3 text-xs text-red-200">{error}</p>
        )}
        {!loading && !error && channels.length === 0 && (
          <p className="px-3 text-xs text-white/70">チャンネルがありません</p>
        )}
        <ul>
          {channels.map((c) => {
            const selected = isSelected('channel', c.id)
            const joined = joinedChannelIds.has(c.id)
            return (
              <li key={c.id} className="flex items-center gap-1 px-1">
                <button
                  type="button"
                  onClick={() => onSelect({ type: 'channel', id: c.id })}
                  className={`flex-1 min-w-0 text-left flex items-center h-8 px-2 rounded text-sm cursor-pointer ${
                    selected
                      ? 'bg-[#1264A3] text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">#</span>
                  <span className="truncate">{c.name}</span>
                </button>
                {userId && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (joined) onLeave(c.id)
                      else onJoin(c.id)
                    }}
                  >
                    {joined ? '退出する' : '参加する'}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>

        <h2 className="text-xs uppercase tracking-wide opacity-70 px-3 py-2 mt-2">
          ダイレクトメッセージ
        </h2>
        <ul>
          {dms.map((dm) => {
            const selected = isSelected('dm', dm.id)
            return (
              <li key={dm.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ type: 'dm', id: dm.id })}
                  className={`w-full text-left h-8 px-3 rounded text-sm flex items-center gap-2 cursor-pointer ${
                    selected
                      ? 'bg-[#1264A3] text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dm.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  {dm.name}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
