import { channels } from '@/data/messages'

export function Sidebar() {
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
          {channels.map((name) => (
            <li key={name}>
              <a
                href="#"
                className="flex items-center h-8 px-3 rounded text-sm hover:bg-white/10"
              >
                <span className="mr-2">#</span>
                {name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
