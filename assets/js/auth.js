/**
 * auth.js — Google Identity Services + session handling.
 * Load GIS dari CDN, render tombol, handle callback.
 */
const Auth = {
  _initialized: false,

  async init() {
    if (this._initialized) return;
    if (!document.getElementById('g_id_onload') && !document.getElementById('g_id_signin')) {
      // Halaman ini tidak punya tombol login, skip
      return;
    }

    await this._loadGIS();
    google.accounts.id.initialize({
      client_id: CBT.CLIENT_ID,
      callback: this._onCredential.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    const btn = document.getElementById('g_id_signin');
    if (btn) {
      google.accounts.id.renderButton(btn, {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: 'signin_with',
        width: 320
      });
    }
    this._initialized = true;
  },

  _loadGIS() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Gagal load Google Sign-In'));
      document.head.appendChild(s);
    });
  },

  async _onCredential(response) {
    const btn = document.getElementById('g_id_signin');
    const errEl = document.getElementById('error-msg');
    if (btn) btn.style.opacity = '0.5';

    try {
      const data = await API.call('login', { idToken: response.credential });
      API.setToken(data.sessionToken);
      API.setUser(data.user);

      // Redirect berdasarkan role
      const role = data.user.role;
      if (role === 'guru' || role === 'admin') {
        location.href = '/admin/dashboard.html';
      } else {
        location.href = '/dashboard.html';
      }
    } catch (e) {
      if (btn) btn.style.opacity = '1';
      if (errEl) {
        errEl.textContent = e.message || 'Login gagal. Coba lagi.';
        errEl.classList.remove('hidden');
        errEl.style.display = 'block';
      } else {
        alert(e.message);
      }
    }
  },

  async logout() {
    try { await API.call('logout'); } catch (_) {}
    API.clearToken();
    API.clearUser();
    location.href = '/index.html';
  }
};

// Auto-init saat DOM ready
document.addEventListener('DOMContentLoaded', () => Auth.init());