'use client';

import { useState } from 'react';

/** Newsletter sign-up form for the English pages. */
export function NewsletterEn() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState<{ t: string; ok: boolean } | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        setNote({ t: 'Thank you! You are subscribed.', ok: true });
        setEmail('');
      } else if (j.repli) {
        window.location.href = `mailto:philoafricaine@gmail.com?subject=${encodeURIComponent('Newsletter subscription')}&body=${encodeURIComponent(`Please subscribe me to the Groupe JOGOO newsletter: ${email}`)}`;
        setNote({ t: 'Your e-mail app opens to confirm the subscription with the editorial team.', ok: true });
      } else setNote({ t: 'Subscription is not possible right now. Please write to philoafricaine@gmail.com.', ok: false });
    } catch {
      setNote({ t: 'Subscription is not possible right now.', ok: false });
    }
    setEnvoi(false);
  };
  return (
    <form onSubmit={envoyer} className="mx-auto mt-6 max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.org"
          aria-label="Your e-mail address"
          className="h-12 flex-1 border border-ink/20 bg-white px-4 text-sm outline-none focus:border-terra"
        />
        <button type="submit" disabled={envoi} className="h-12 bg-terra px-6 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-terra-deep disabled:opacity-50">
          {envoi ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      <p aria-live="polite" className={`mt-3 text-sm ${note?.ok ? 'font-semibold text-terra-deep' : 'text-terra'}`}>
        {note?.t}
      </p>
    </form>
  );
}
