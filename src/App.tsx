import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from 'radix-ui'
import { Sidebar, type SelectedItem } from '@/components/Sidebar'
import { channels, messages } from '@/data/messages'
import { dms } from '@/data/dms'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({
    type: 'channel',
    id: channels[0].id,
  })

  const handleSelect = (item: SelectedItem) => {
    setSelectedItem(item)
    setIsOpen(false)
  }

  const headerLabel = (() => {
    if (selectedItem.type === 'channel') {
      const ch = channels.find((c) => c.id === selectedItem.id)
      return `# ${ch?.name ?? selectedItem.id}`
    }
    const dm = dms.find((d) => d.id === selectedItem.id)
    return `@ ${dm?.name ?? selectedItem.id}`
  })()

  const visibleMessages = messages.filter(
    (m) => m.type === selectedItem.type && m.parentId === selectedItem.id,
  )

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-[260px] flex-shrink-0 bg-[#611f69] text-white flex-col">
        <Sidebar selectedItem={selectedItem} onSelect={handleSelect} />
      </aside>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="w-[260px] bg-[#611f69] text-white p-0"
        >
          <VisuallyHidden.Root>
            <SheetTitle>サイドバー</SheetTitle>
          </VisuallyHidden.Root>
          <Sidebar selectedItem={selectedItem} onSelect={handleSelect} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col">
        <header className="px-4 md:px-6 py-3 border-b flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="size-5" />
          </Button>
          <h2 className="text-xl font-bold">{headerLabel}</h2>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          {visibleMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだメッセージがありません。
            </p>
          ) : (
            visibleMessages.map((m) => (
              <div key={m.id} className="flex gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {m.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{m.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.createdAt}
                    </span>
                  </div>
                  <p className="text-sm">{m.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t px-4 md:px-6 py-3">
          <form className="flex gap-2">
            <Input placeholder={`${headerLabel} へメッセージを送信`} />
            <Button type="submit">送信</Button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
