/**
 * app.js — Helper global: toast, format, loading.
 */
const App = {
  // Format angka
  fmt(n, decimals = 1) {
    if (n === null || n === undefined || n === '') return '—';
    return Number(n).toFixed(decimals).replace(/\.0$/, '');
  },

  // Format tanggal ke "15 Nov 2026, 09:00"
  fmtDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (_) { return iso; }
  },

  // Format durasi ke "HH:MM:SS" atau "MM:SS"
  fmtDuration(seconds) {
    if (seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = n => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  },

  // Toast notification
  toast(message, type = 'info', duration = 3000) {
    let toast = document.getElementById('cbt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cbt-toast';
      toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        padding: 14px 20px; border-radius: 10px; font-family: system-ui, sans-serif;
        font-size: 14px; font-weight: 500; color: #fff;
        box-shadow: 0 8px 24px rgba(0,0,0,.3);
        transform: translateY(100px); opacity: 0;
        transition: all .3s ease;
        max-width: 360px;
      `;
      document.body.appendChild(toast);
    }

    const colors = {
      info:    '#3b82f6',
      success: '#10b981',
      error:   '#ef4444',
      warning: '#f59e0b'
    };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, duration);
  },

  // Loading overlay
  loading(show, text = 'Memuat...') {
    let el = document.getElementById('cbt-loading');
    if (show) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'cbt-loading';
        el.style.cssText = `
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(11,19,38,.85); backdrop-filter: blur(8px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          color: #adc6ff; font-family: system-ui; gap: 16px;
        `;
        el.innerHTML = `
          <div style="width:40px;height:40px;border:3px solid rgba(173,198,255,.2);
                     border-top-color:#adc6ff;border-radius:50%;
                     animation:cbt-spin .8s linear infinite"></div>
          <div style="font-size:14px;letter-spacing:.5px" id="cbt-loading-text">${text}</div>
          <style>@keyframes cbt-spin{to{transform:rotate(360deg)}}</style>
        `;
        document.body.appendChild(el);
      } else {
        el.style.display = 'flex';
        document.getElementById('cbt-loading-text').textContent = text;
      }
    } else if (el) {
      el.style.display = 'none';
    }
  },

  // Confirm dialog
  confirm(message) {
    return new Promise(resolve => {
      if (window.confirm(message)) resolve(true);
      else resolve(false);
    });
  },

  // Bind user info ke elemen HTML
  bindUserInfo(user) {
    if (!user) return;
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
    document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role);
    const av = document.querySelectorAll('[data-user-initial]');
    if (user.name) {
      const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      av.forEach(el => el.textContent = initials);
    }
  }
};