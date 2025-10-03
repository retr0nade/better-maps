import React, { useEffect, useState } from 'react'

type FeedbackItem = {
  id?: string
  name?: string
  email?: string
  rating: number
  message: string
  created_at?: string
}

export default function FeedbackPage(): JSX.Element {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<FeedbackItem[]>([])

  useEffect(() => {
    // Try to load recent feedback; ignore errors if backend isn't ready
    const load = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/feedback')
        if (!res.ok) return
        const data = await res.json()
        const items: FeedbackItem[] = Array.isArray(data) ? data.slice(0, 8) : []
        setRecent(items)
      } catch {
        // ignore
      }
    }
    void load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const body = { name: name || undefined, email: email || undefined, rating, message }
      const res = await fetch('http://127.0.0.1:8000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to send feedback')
      setSuccessOpen(true)
      setName('')
      setEmail('')
      setRating(5)
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-10 md:py-16">
      <section className="max-w-2xl mx-auto overlay-panel">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-heading">We value your feedback</h1>
        <p className="text-body mb-6">Tell us what you think about BetterMaps. Your input helps us improve.</p>

        {error && <div className="status-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-heading mb-1">Name (optional)</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
            <label className="block text-sm font-medium text-heading mb-1">Email (optional)</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Rating</label>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating 1 to 5">
              {[1,2,3,4,5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(v)}
                  className={`p-2 rounded ${rating >= v ? 'text-yellow-500' : 'text-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  role="radio"
                  aria-checked={rating === v}
                  aria-label={`${v} star${v > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Message</label>
            <textarea className="input-field" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Share your thoughts..." required />
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-primary" type="submit" disabled={submitting} aria-label="Submit feedback">
              {submitting ? 'Sending...' : 'Send feedback'}
            </button>
          </div>
        </form>
      </section>

      {recent.length > 0 && (
        <section className="max-w-3xl mx-auto mt-10">
          <h2 className="text-xl font-semibold mb-3 text-heading">Recent feedback</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {recent.map((f, i) => (
              <div key={f.id ?? i} className="overlay-panel">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-heading">{f.name || 'Anonymous'}</span>
                  <span className="text-xs text-yellow-500">{'★'.repeat(Math.max(1, Math.min(5, f.rating || 0)))}</span>
                </div>
                <p className="text-sm text-body">{f.message}</p>
                {f.created_at && <div className="mt-2 text-xs text-muted">{new Date(f.created_at).toLocaleString()}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSuccessOpen(false)} />
          <div className="overlay-panel relative max-w-sm w-[92vw] text-center">
            <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
            <p className="text-sm text-gray-600 mb-4">Your feedback was submitted successfully.</p>
            <button className="btn-primary" onClick={() => setSuccessOpen(false)} aria-label="Close">Close</button>
          </div>
        </div>
      )}
    </main>
  )
}


