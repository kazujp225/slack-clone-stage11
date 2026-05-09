import { channels } from '@/data/messages'
import { dms } from '@/data/dms'

export type SelectedItem =
  | { type: 'channel'; id: string }
  | { type: 'dm'; id: string }

type Props = {
  selectedItem: SelectedItem
  onSelect: (item: SelectedItem) => void
}

export function Sidebar({ selectedItem, onSelect }: Props) {
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
        <ul>
          {channels.map((c) => {
            const selected = isSelected('channel', c.id)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ type: 'channel', id: c.id })}
                  className={`w-full text-left flex items-center h-8 px-3 rounded text-sm cursor-pointer ${
                    selected
                      ? 'bg-[#1264A3] text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">#</span>
                  {c.name}
                </button>
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
