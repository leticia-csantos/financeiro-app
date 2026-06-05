@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0d0f12;
  --bg-card: #13161b;
  --bg-hover: #1a1e25;
  --border: #222830;
  --border-focus: #3d8c6e;
  --text: #e8eaed;
  --text-muted: #6b7280;
  --text-dim: #9ca3af;
  --green: #3ecf8e;
  --green-dim: #1a5c3f;
  --green-glow: rgba(62, 207, 142, 0.15);
  --red: #f87171;
  --red-dim: #7f1d1d;
  --yellow: #fbbf24;
  --blue: #60a5fa;
  --font-display: 'DM Serif Display', serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 var(--green-glow); }
  50% { box-shadow: 0 0 0 8px transparent; }
}

.animate-fade { animation: fadeIn 0.4s ease forwards; }
.animate-slide { animation: slideIn 0.3s ease forwards; }

/* glass card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

/* input base */
.input-base {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 14px;
  width: 100%;
  transition: border-color 0.15s;
  outline: none;
}
.input-base:focus { border-color: var(--border-focus); }
.input-base::placeholder { color: var(--text-muted); }

/* tag badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: 0.03em;
}
.badge-green { background: var(--green-dim); color: var(--green); }
.badge-red { background: var(--red-dim); color: var(--red); }
.badge-yellow { background: rgba(251,191,36,0.15); color: var(--yellow); }
.badge-blue { background: rgba(96,165,250,0.12); color: var(--blue); }

/* btn */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.btn-primary {
  background: var(--green);
  color: #0d0f12;
}
.btn-primary:hover { background: #5dd8a2; }
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
}
.btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
.btn-danger {
  background: transparent;
  color: var(--red);
  border: 1px solid var(--red-dim);
}
.btn-danger:hover { background: var(--red-dim); }
