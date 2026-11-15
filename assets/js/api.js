/**
 * api.js — Wrapper fetch ke GAS API.
 * Wajib: Content-Type text/plain (CORS-safe untuk GAS).
 */
const API = {
  _inflight: new Map(),

  getToken()        { return sessionStorage.getItem('cbt_token'); },
  setToken(t)       { sessionStorage.setItem('cbt_token', t); },
  clearToken()      { sessionStorage.removeItem('cbt_token'); },
  getUser()         {
    const u = sessionStorage.getItem('cbt_user');
    return u ? JSON.parse(u) : null;
  },
  setUser(u)        { sessionStorage.setItem('cbt_user', JSON.stringify(u)); },
  clearUser()       { sessionStorage.removeItem('cbt_user'); },

  async call(action, data = {}) {
    const token = this.getToken();
    const payload = JSON.stringify({ action, token, data });

    // Dedupe request paralel (mis. double-click)
    const key = action + ':' + payload;
    if (this._inflight.has(key)) return this._inflight.get(key);

    const promise = (async () => {
      const res = await fetch(CBT.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // ⚠️ WAJIB
        body: payload,
        redirect: 'follow'
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const json = await res.json();
      if (!json.ok) {
        const e = new Error(json.error?.message || 'Request failed');
        e.code = json.error?.code;

        // Session habis → redirect login
        if (e.code === 'SESSION_EXPIRED' || e.code === 'UNAUTHORIZED') {
          this.clearToken();
          this.clearUser();
          if (!location.pathname.endsWith('index.html') && location.pathname !== '/') {
            setTimeout(() => location.href = '/index.html', 100);
          }
        }
        throw e;
      }
      return json.data;
    })().finally(() => this._inflight.delete(key));

    this._inflight.set(key, promise);
    return promise;
  },

  // Shortcut: cek login, redirect jika belum
  async requireAuth() {
    if (!this.getToken()) {
      location.href = '/index.html';
      throw new Error('No session');
    }
    return this.getUser();
  }
};