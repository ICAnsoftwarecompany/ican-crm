import { useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'

export function AgentChat({ onAsk }) {
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message.trim() }
    setHistory((current) => [...current, userMessage])
    setMessage('')

    const response = await onAsk?.(userMessage)
    if (response) {
      setHistory((current) => [...current, { role: 'assistant', content: response }])
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center gap-2 font-bold">
        <Bot size={18} className="text-[#00C2CB]" />
        مساعد ICAN
      </div>
      <div className="mb-3 grid max-h-72 gap-2 overflow-y-auto">
        {history.length === 0 && <p className="text-sm text-[var(--text-muted)]">اسأل المساعد عن العملاء أو الحملات أو المحادثات.</p>}
        {history.map((item, index) => (
          <div key={index} className={`rounded-lg p-3 text-sm ${item.role === 'user' ? 'bg-[#162847] text-white' : 'bg-[#E8F9FA] text-[#007A80]'}`}>
            {item.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتب سؤالك..." />
        <Button type="submit" size="icon" aria-label="إرسال">
          <Send size={16} />
        </Button>
      </form>
    </section>
  )
}
