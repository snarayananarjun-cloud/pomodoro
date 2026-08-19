import { useState } from 'react';
import type { FormEvent } from 'react';
import { EnvelopeSimple } from '@phosphor-icons/react';

const DEFAULT_ACCENT = '#C97B63';

interface Props {
  onSignIn: (email: string) => Promise<string | undefined>;
}

export function SignInScreen({ onSignIn }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'sending') return;
    setStatus('sending');
    const err = await onSignIn(email.trim());
    if (err) {
      setError(err);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', boxSizing: 'border-box' }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: DEFAULT_ACCENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <EnvelopeSimple size={20} color="#FFFFFF" />
      </div>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#1A1A1A', marginBottom: 8, textAlign: 'center' }}>
        Push to Live Now
      </div>

      {status === 'sent' ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#8A7B70', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
            Check <strong style={{ color: '#1A1A1A' }}>{email}</strong> for a sign-in link. It'll bring you right back here.
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#8A7B70', textAlign: 'center', marginBottom: 28 }}>
            Sign in to keep your focus history everywhere.
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320 }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1.5px solid #E4D6C6',
                borderRadius: 12,
                padding: '13px 14px',
                fontSize: 14,
                fontFamily: "'Manrope', sans-serif",
                color: '#1A1A1A',
                background: '#FFFFFF',
                outline: 'none',
                marginBottom: 12,
              }}
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%',
                textAlign: 'center',
                padding: 13,
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                color: '#FFFFFF',
                background: DEFAULT_ACCENT,
                cursor: status === 'sending' ? 'default' : 'pointer',
                opacity: status === 'sending' ? 0.6 : 1,
                border: 'none',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
            </button>
            {status === 'error' && (
              <div style={{ fontSize: 12, fontWeight: 600, color: '#B0654A', marginTop: 10, textAlign: 'center' }}>{error}</div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
