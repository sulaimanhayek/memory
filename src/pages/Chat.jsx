import { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000'
const API_KEY = import.meta.env.VITE_CHAT_API_KEY || ''

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Ask me anything about the thesis.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Error ${res.status}`)
      }

      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: `Sorry, something went wrong: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-page">
      <h1 className="chat-page-title">Talk to Thesis</h1>

      <div className="chat-page-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg-bot chat-typing">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-page-input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the thesis..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  )
}
