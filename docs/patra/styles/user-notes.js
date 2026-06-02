/*
 * user-notes.js — 文档族右栏「我的备注」(localStorage-only)
 *
 * 存储：localStorage[`spec-user-notes:` + location.pathname]
 * 范围：仅本机本浏览器；清浏览器数据 / 换机器 / 换浏览器 都会丢；不进 git。
 * 操作：添加 / 内联编辑（contenteditable，失焦保存）/ 删除单条 / 清空全部
 *      快捷键 Ctrl+Enter / Cmd+Enter 提交
 */
(function () {
  'use strict';

  const KEY = 'spec-user-notes:' + location.pathname;

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function save() { localStorage.setItem(KEY, JSON.stringify(notes)); }

  let notes = load();

  function fmtTs(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function render() {
    const list    = document.getElementById('user-notes-list');
    const empty   = document.getElementById('user-notes-empty');
    const counter = document.getElementById('user-notes-count');
    if (!list) return;

    list.innerHTML = '';
    if (notes.length === 0) {
      if (empty) empty.style.display = '';
    } else {
      if (empty) empty.style.display = 'none';
      notes.forEach((n, i) => {
        const li = document.createElement('li');
        li.className = 'note';
        li.dataset.type = 'user';
        li.innerHTML = `
          <header>
            <time datetime="${new Date(n.ts).toISOString()}">${fmtTs(n.ts)}</time>
            <button type="button" class="note-delete" data-action="delete" data-index="${i}" title="删除">✕</button>
          </header>
          <p contenteditable="plaintext-only" data-index="${i}">${escapeHtml(n.text)}</p>
        `;
        list.appendChild(li);
      });
    }
    if (counter) counter.textContent = notes.length;
  }

  function add(text) {
    text = (text || '').trim();
    if (!text) return;
    notes.push({ ts: Date.now(), text });
    save();
    render();
  }

  function deleteAt(i) {
    notes.splice(i, 1);
    save();
    render();
  }

  function updateAt(i, text) {
    text = (text || '').trim();
    if (!text) { deleteAt(i); return; }
    if (notes[i] && notes[i].text === text) return;
    notes[i].text = text;
    save();
    render();
  }

  function clearAll() {
    if (notes.length === 0) return;
    if (!window.confirm('清空本页全部备注？（仅本浏览器，无法恢复）')) return;
    notes = [];
    save();
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();

    const form = document.getElementById('user-note-form');
    if (form) {
      const input = document.getElementById('user-note-input');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        add(input.value);
        input.value = '';
        input.focus();
      });
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (typeof form.requestSubmit === 'function') form.requestSubmit();
            else form.dispatchEvent(new Event('submit', { cancelable: true }));
          }
        });
      }
    }

    const list = document.getElementById('user-notes-list');
    if (list) {
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="delete"]');
        if (btn) deleteAt(parseInt(btn.dataset.index, 10));
      });
      list.addEventListener('blur', (e) => {
        const p = e.target.closest('p[contenteditable]');
        if (p) updateAt(parseInt(p.dataset.index, 10), p.textContent);
      }, true);
    }

    const clearBtn = document.getElementById('user-notes-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
  });
})();
