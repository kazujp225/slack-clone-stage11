import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Menu, Pencil, Trash2, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from 'radix-ui'
import { Sidebar, type SelectedItem } from '@/components/Sidebar'
import {
  channels,
  messages as initialMessages,
  type Message,
} from '@/data/messages'
import { dms } from '@/data/dms'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({
    type: 'channel',
    id: channels[0].id,
  })
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const startEdit = (id: string, body: string) => {
    setEditingId(id)
    setEditBody(body)
  }

  const saveEdit = (id: string) => {
    if (!editBody.trim()) return
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, body: editBody } : m)),
    )
    setEditingId(null)
    setEditBody('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditBody('')
  }

  const deleteMessage = (id: string) => {
    if (!window.confirm('削除しますか？')) return
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const addReaction = (id: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              reactions: {
                ...m.reactions,
                [emoji]: (m.reactions[emoji] ?? 0) + 1,
              },
            }
          : m,
      ),
    )
  }

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮']

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

  const send = () => {
    if (!input.trim()) return
    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: selectedItem.type,
      parentId: selectedItem.id,
      userName: '自分',
      body: input,
      createdAt: new Date().toISOString(),
      reactions: {},
    }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
              <div
                key={m.id}
                className="group relative flex gap-3 rounded px-2 -mx-2 hover:bg-muted/50"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {m.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{m.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.createdAt}
                    </span>
                  </div>
                  {editingId === m.id ? (
                    <div className="mt-1 space-y-2">
                      <Textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={2}
                        className="min-h-[60px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(m.id)}>
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                      {Object.entries(m.reactions).filter(
                        ([, count]) => count > 0,
                      ).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(m.reactions)
                            .filter(([, count]) => count > 0)
                            .map(([emoji, count]) => (
                              <Badge
                                key={emoji}
                                variant="secondary"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => addReaction(m.id, emoji)}
                              >
                                {emoji} {count}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {editingId !== m.id && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-7"
                          aria-label="リアクションを追加"
                        >
                          <Smile className="size-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="flex gap-1">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => addReaction(m.id, emoji)}
                              className="text-xl px-2 py-1 rounded hover:bg-muted cursor-pointer"
                              aria-label={`${emoji} を追加`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => startEdit(m.id, m.body)}
                      aria-label="編集"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => deleteMessage(m.id)}
                      aria-label="削除"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <div className="sticky bottom-0 bg-background border-t px-4 md:px-6 py-3">
          <form
            className="flex gap-2 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${headerLabel} へメッセージを送信（Enterで送信 / Shift+Enterで改行）`}
              rows={1}
              className="min-h-[40px] max-h-40 resize-none"
            />
            <Button type="submit">送信</Button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
