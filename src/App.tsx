import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { channels, messages } from '@/data/messages'

function App() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-[260px] flex-shrink-0 bg-[#611f69] text-white flex flex-col">
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
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="px-6 py-3 border-b">
          <h2 className="text-xl font-bold"># general</h2>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {m.user.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{m.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.time}
                  </span>
                </div>
                <p className="text-sm">{m.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-background border-t px-6 py-3">
          <form className="flex gap-2">
            <Input placeholder="# general へメッセージを送信" />
            <Button type="submit">送信</Button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
