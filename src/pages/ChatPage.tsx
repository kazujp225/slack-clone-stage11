import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { Menu, Pencil, Trash2, Smile, Paperclip, X } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { VisuallyHidden } from 'radix-ui'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Sidebar, type SelectedItem } from '@/components/Sidebar'
import {
  messages as initialMessages,
  type Channel,
  type Message,
} from '@/data/messages'
import { dms } from '@/data/dms'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

type DBMessageRow = {
  id: string
  channel_id: string
  user_name: string | null
  content: string | null
  created_at: string
  image_url: string | null
  user_id: string | null
  reactions?: { emoji: string }[]
}

const aggregateReactions = (
  rows: { emoji: string }[] | undefined,
): { [emoji: string]: number } => {
  const counts: { [emoji: string]: number } = {}
  for (const r of rows ?? []) {
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1
  }
  return counts
}

const rowToMessage = (row: DBMessageRow): Message => ({
  id: row.id,
  type: 'channel',
  parentId: row.channel_id,
  userName: row.user_name ?? '',
  body: row.content ?? '',
  createdAt: row.created_at,
  reactions: aggregateReactions(row.reactions),
  imageUrl: row.image_url,
  userId: row.user_id,
})

export function ChatPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast(error.message)
      return
    }
    navigate('/login', { replace: true })
  }

  const [isOpen, setIsOpen] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([])
  const [joinedChannelIds, setJoinedChannelIds] = useState<Set<string>>(
    new Set(),
  )
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [channelsError, setChannelsError] = useState<string | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({
    type: 'channel',
    id: '',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const startEdit = (id: string, body: string) => {
    setEditingId(id)
    setEditBody(body)
  }

  const saveEdit = async (id: string) => {
    if (!editBody.trim()) return
    const newBody = editBody
    const original = messages.find((m) => m.id === id)?.body ?? ''
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, body: newBody } : m)),
    )
    setEditingId(null)
    setEditBody('')
    const { data, error } = await supabase
      .from('messages')
      .update({ content: newBody })
      .eq('id', id)
      .select()
    if (error || !data || data.length === 0) {
      toast(error?.message ?? '編集できませんでした')
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, body: original } : m)),
      )
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditBody('')
  }

  const deleteMessage = async (id: string) => {
    if (!window.confirm('削除しますか？')) return
    const snapshot = messages
    setMessages((prev) => prev.filter((m) => m.id !== id))
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .select()
    if (error || !data || data.length === 0) {
      toast(error?.message ?? '削除できませんでした')
      setMessages(snapshot)
    }
  }

  const addReaction = async (id: string, emoji: string) => {
    if (!session) return
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
    const { error } = await supabase.from('reactions').insert({
      message_id: id,
      user_id: session.user.id,
      emoji,
    })
    if (error) {
      toast(error.message)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                reactions: {
                  ...m.reactions,
                  [emoji]: Math.max((m.reactions[emoji] ?? 1) - 1, 0),
                },
              }
            : m,
        ),
      )
    }
  }

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮']

  const handleSelect = (item: SelectedItem) => {
    setSelectedItem(item)
    setIsOpen(false)
  }

  const refreshAll = async (channelId?: string) => {
    await Promise.all([fetchChannels(), fetchChannelMembers()])
    const targetId = channelId ?? (selectedItem.type === 'channel' ? selectedItem.id : null)
    if (targetId) await fetchMessages(targetId)
  }

  const handleJoin = async (channelId: string) => {
    if (!session) return
    const { error } = await supabase
      .from('channel_members')
      .insert({ channel_id: channelId, user_id: session.user.id })
      .select()
    if (error) {
      toast(error.message)
      return
    }
    await refreshAll(channelId)
  }

  const handleLeave = async (channelId: string) => {
    if (!session) return
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
    if (error) {
      toast(error.message)
      return
    }
    await refreshAll()
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

  const fetchChannels = useCallback(async () => {
    setChannelsLoading(true)
    setChannelsError(null)
    const { data, error } = await supabase.from('channels').select('*')
    setChannelsLoading(false)
    if (error) {
      console.error(error)
      setChannelsError('読み込みに失敗しました')
      return
    }
    if (data) {
      setChannels(data)
      setSelectedItem((prev) =>
        prev.type === 'channel' && prev.id === '' && data.length > 0
          ? { type: 'channel', id: data[0].id }
          : prev,
      )
    }
  }, [])

  const fetchChannelMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('channel_members')
      .select('channel_id')
    if (error) {
      console.error(error)
      return
    }
    if (data) {
      setJoinedChannelIds(new Set(data.map((r) => r.channel_id as string)))
    }
  }, [])

  const fetchMessages = useCallback(async (channelId: string) => {
    setMessagesLoading(true)
    setMessagesError(null)
    const { data, error } = await supabase
      .from('messages')
      .select('*, reactions(emoji)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
    setMessagesLoading(false)
    if (error) {
      console.error(error)
      setMessagesError('読み込みに失敗しました')
      return
    }
    if (data) {
      setMessages((data as DBMessageRow[]).map(rowToMessage))
    }
  }, [])

  const send = async () => {
    if (!input.trim() && !imageFile) return
    const text = input
    const file = imageFile
    setInput('')

    if (selectedItem.type === 'channel' && selectedItem.id) {
      let imageUrl: string | null = null
      if (file) {
        const ext = file.name.split('.').pop()
        const filePath = `${Date.now()}_${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(filePath, file, { contentType: file.type })
        if (uploadError) {
          console.error(uploadError)
          setInput(text)
          return
        }
        const { data: urlData } = supabase.storage
          .from('chat-images')
          .getPublicUrl(filePath)
        imageUrl = urlData.publicUrl
      }

      const { error } = await supabase.from('messages').insert({
        content: text,
        channel_id: selectedItem.id,
        user_name: session?.user.email ?? '自分',
        image_url: imageUrl,
        user_id: session?.user.id ?? null,
      })
      if (error) {
        console.error(error)
        setInput(text)
        return
      }
      clearImage()
      return
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: selectedItem.type,
      parentId: selectedItem.id,
      userName: '自分',
      body: text,
      createdAt: new Date().toISOString(),
      reactions: {},
    }
    setMessages((prev) => [...prev, newMessage])
    clearImage()
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

  useEffect(() => {
    if (!session) return
    fetchChannels()
    fetchChannelMembers()
  }, [session, fetchChannels, fetchChannelMembers])

  const selectedChannelId =
    selectedItem.type === 'channel' ? selectedItem.id : null

  useEffect(() => {
    if (!selectedChannelId) {
      if (selectedItem.type === 'dm') {
        setMessages(
          initialMessages.filter(
            (m) => m.type === 'dm' && m.parentId === selectedItem.id,
          ),
        )
      }
      return
    }
    fetchMessages(selectedChannelId)
  }, [selectedChannelId, selectedItem, fetchMessages])

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as DBMessageRow
          if (row.channel_id !== selectedChannelId) return
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [
              ...prev,
              rowToMessage(row),
            ]
          })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChannelId])

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-[260px] flex-shrink-0 bg-[#611f69] text-white flex-col">
        <Sidebar
          channels={channels}
          joinedChannelIds={joinedChannelIds}
          userId={session?.user.id ?? null}
          selectedItem={selectedItem}
          onSelect={handleSelect}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      </aside>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="w-[260px] bg-[#611f69] text-white p-0"
        >
          <VisuallyHidden.Root>
            <SheetTitle>サイドバー</SheetTitle>
          </VisuallyHidden.Root>
          <Sidebar
            channels={channels}
            joinedChannelIds={joinedChannelIds}
            userId={session?.user.id ?? null}
            loading={channelsLoading}
            error={channelsError}
            selectedItem={selectedItem}
            onSelect={handleSelect}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
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
          <div className="ml-auto">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
            >
              ログアウト
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          {messagesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : messagesError ? (
            <Alert variant="destructive">
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{messagesError}</AlertDescription>
            </Alert>
          ) : visibleMessages.length === 0 ? (
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
                      {m.body && (
                        <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                      )}
                      {m.imageUrl && (
                        <img
                          src={m.imageUrl}
                          alt=""
                          className="mt-1 max-w-xs rounded-lg"
                        />
                      )}
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
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img
                src={imagePreview}
                alt={imageFile?.name ?? 'プレビュー'}
                className="max-h-32 rounded border"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="画像を取り消し"
                className="absolute -top-2 -right-2 size-6 rounded-full bg-foreground text-background flex items-center justify-center shadow hover:opacity-90 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
          <form
            className="flex gap-2 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <label
              htmlFor="image-upload"
              aria-label="画像を添付"
              className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0"
            >
              <Paperclip className="size-5" />
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
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

