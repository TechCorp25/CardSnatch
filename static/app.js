// static/app.js
const $ = (sel, root = document) => root.querySelector(sel);
const show = (el) => el.classList.add('show');
const hide = (el) => el.classList.remove('show');

function updateHeader(state) {
  if (!state || !state.players) return;
  $('#p1-score').textContent = state.players[0].score;
  $('#p2-score').textContent = state.players[1].score;
  $('#deck-count').textContent = state.deck_count;
  $('#kept-count').textContent = state.kept_count;
  $('#used-count').textContent = state.used_count;

  const left = $('#player-left');
  const right = $('#player-right');
  left.classList.toggle('active', state.turn === 0);
  right.classList.toggle('active', state.turn === 1);
  const turnName = state.turn === 0 ? $('#p1-name').textContent : $('#p2-name').textContent;
  $('#turn-name').textContent = turnName;
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  return res.json();
}

window.addEventListener('DOMContentLoaded', () => {
  const registerModal = $('#register-modal');
  const cardModal = $('#card-modal');
  const cardTitle = $('#card-title');
  const cardText = $('#card-text');

  // Registration form
  const regForm = $('#register-form');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(regForm);
      const payload = { p1: formData.get('p1'), p2: formData.get('p2') };
      const res = await postJSON('/register', payload);
      if (res.ok) {
        hide(registerModal);
        window.location.href = res.redirect || '/';
      }
    });
  }

  // Draw from deck
  const deckBtn = $('#deck');
  if (deckBtn) {
    deckBtn.addEventListener('click', async () => {
      const res = await postJSON('/next_card');
      if (res.empty) {
        deckBtn.disabled = true;
        return;
      }
      cardTitle.textContent = res.card.title;
      cardText.textContent = res.card.text;
      show(cardModal);
    });
  }

  // Pass / Done buttons
  $('#btn-pass')?.addEventListener('click', async () => {
    const res = await postJSON('/action', { choice: 'pass' });
    hide(cardModal);
    updateHeader(res);
  });

  $('#btn-done')?.addEventListener('click', async () => {
    const res = await postJSON('/action', { choice: 'done' });
    hide(cardModal);
    updateHeader(res);
  });

  // Reset (New Game)
  $('#reset')?.addEventListener('click', async () => {
    const res = await postJSON('/reset');
    if (res.ok) {
      window.location.reload();
    }
  });
});
