import './App.css';
import { useRef, useState } from 'react';
import {
  FiMail, FiLock, FiSend, FiUsers, FiTag, FiLogOut, FiCheck,
  FiAlertCircle, FiShield, FiZap, FiUnlock, FiArrowRight,
} from 'react-icons/fi';

const API = 'https://h3scynmcn9.execute-api.us-west-1.amazonaws.com';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const notify = (type, text) => {
    setToast({ type, text });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="app">
      <div className="bg-glow" />
      {authenticated ? (
        <Dashboard notify={notify} onLogout={() => setAuthenticated(false)} />
      ) : (
        <Login notify={notify} onSuccess={() => setAuthenticated(true)} />
      )}
      {toast && <Toast {...toast} />}
    </div>
  );
}

/* ---------- Brand ---------- */
function Brand({ small }) {
  return (
    <div className={`brand ${small ? 'brand-sm' : ''}`}>
      <span className="brand-mark"><FiTag /></span>
      <span className="brand-name">Couponz</span>
    </div>
  );
}

/* ---------- Login ---------- */
function Login({ onSuccess, notify }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
      } else {
        notify('error', data.message || 'Wrong password');
      }
    } catch (err) {
      console.error('Login error:', err);
      notify('error', 'Could not reach the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <section className="hero">
        <Brand />
        <h1>Exclusive deals,<br /><span className="accent">straight to the inbox.</span></h1>
        <p className="muted">
          Couponz lets people subscribe to exclusive coupons and marketing emails.
          Admins sign in to manage the list and send custom announcements.
        </p>
        <ul className="features">
          <li><span className="feature-icon"><FiMail /></span>Collect opted-in subscribers</li>
          <li><span className="feature-icon"><FiSend /></span>Broadcast custom messages</li>
          <li><span className="feature-icon"><FiUsers /></span>Grow your audience</li>
        </ul>
      </section>

      <form className="card login-card" onSubmit={handleLogin}>
        <div className="card-icon"><FiShield /></div>
        <h2>Admin sign in</h2>
        <p className="muted small">Enter the access password to continue.</p>

        <label className="field">
          <FiLock className="field-icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading || !password}>
          {loading ? <span className="spinner" /> : <>Sign in <FiArrowRight /></>}
        </button>
      </form>
    </main>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ onLogout, notify }) {
  return (
    <main className="dashboard">
      <header className="topbar">
        <Brand small />
        <button className="btn btn-ghost" onClick={onLogout}>
          <FiLogOut /> Log out
        </button>
      </header>

      <div className="dash-heading">
        <h1>Dashboard</h1>
        <p className="muted">Add subscribers and send announcements to your list.</p>
      </div>

      <div className="grid">
        <Subscribe notify={notify} />
        <Broadcast notify={notify} />
      </div>
    </main>
  );
}

/* ---------- Subscribe ---------- */
function Subscribe({ notify }) {
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return notify('error', 'Enter a valid email address');
    if (!optIn) return notify('error', 'The subscriber must agree to receive marketing emails');
    setLoading(true);
    try {
      const res = await fetch(`${API}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      console.log('Server response:', data);
      if (!res.ok) throw new Error(data.message || 'Request failed');
      notify('success', 'Email saved!');
      setEmail('');
      setOptIn(false);
    } catch (err) {
      console.error(err);
      notify('error', err.message || 'Could not save email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-head">
        <div className="card-icon"><FiUsers /></div>
        <div>
          <h2>Add subscriber</h2>
          <p className="muted small">Add an email to the coupon list.</p>
        </div>
      </div>

      <label className="field">
        <FiMail className="field-icon" />
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="checkbox">
        <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
        <span className="checkmark"><FiCheck /></span>
        <span>I agree to receive marketing emails from Couponz</span>
      </label>

      <button className="btn btn-primary btn-block" type="submit" disabled={loading || !valid || !optIn}>
        {loading ? <span className="spinner" /> : <>Subscribe <FiArrowRight /></>}
      </button>
    </form>
  );
}

/* ---------- Broadcast ---------- */
function Broadcast({ notify }) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return notify('error', 'Write a message first');
    if (!window.confirm('Send this message to every subscriber?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/send-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      notify(res.ok ? 'success' : 'error', data.message || (res.ok ? 'Sent!' : 'Send failed'));
      if (res.ok) setMessage('');
    } catch (err) {
      console.error(err);
      notify('error', 'Could not reach the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card ${enabled ? '' : 'card-locked'}`}>
      <div className="card-head">
        <div className="card-icon"><FiZap /></div>
        <div>
          <h2>Broadcast</h2>
          <p className="muted small">Send a custom message to all subscribers.</p>
        </div>
        <span className={`badge ${enabled ? 'badge-live' : ''}`}>
          {enabled ? <><FiUnlock /> Armed</> : <><FiLock /> Locked</>}
        </span>
      </div>

      {!enabled ? (
        <div className="locked">
          <p className="muted small">
            Sending is locked to prevent accidental blasts. Unlock it when you're ready.
          </p>
          <button className="btn btn-outline btn-block" onClick={() => setEnabled(true)}>
            <FiUnlock /> Enable send all
          </button>
        </div>
      ) : (
        <>
          <textarea
            placeholder="Type your announcement here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
          />
          <div className="row-between">
            <span className="muted small">{message.length}/2000</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setEnabled(false)}>
              <FiLock /> Lock
            </button>
          </div>
          <button className="btn btn-primary btn-block" onClick={handleSend} disabled={loading || !message.trim()}>
            {loading ? <span className="spinner" /> : <><FiSend /> Send to all subscribers</>}
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- Toast ---------- */
function Toast({ type, text }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      {type === 'success' ? <FiCheck /> : <FiAlertCircle />}
      <span>{text}</span>
    </div>
  );
}

export default App;
