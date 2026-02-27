class ServiceRow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const idx = parseInt(this.getAttribute('index') || 1);
    this._render(idx);
    this._attachEvents();
  }

  _render(idx) {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');

        :host {
          display: grid;
          grid-template-columns: 1.6fr 0.55fr 0.85fr auto;
          gap: 0.5rem;
          align-items: end;
          margin-bottom: 0.65rem;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .field { display: flex; flex-direction: column; gap: 0.28rem; }

        label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.58rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #7a7268;
        }

        input, select {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.84rem;
          padding: 0.55rem 0.7rem;
          background: #ede8dc;
          border: 1px solid #c8bfae;
          border-bottom: 2px solid #3d3830;
          color: #1a1611;
          outline: none;
          width: 100%;
          appearance: none;
          transition: border-color 0.2s, background 0.2s;
        }

        input:focus, select:focus {
          background: #fff;
          border-bottom-color: #c4502a;
          border-color: #c4502a;
        }

        input.error { border-color: #c4502a !important; background: #fdf4f1; }

        .row-num {
          font-size: 0.58rem;
          color: #c4502a;
          letter-spacing: 1px;
          margin-bottom: 0.1rem;
        }

        .remove-btn {
          background: transparent;
          border: 1px solid #c8bfae;
          color: #7a7268;
          cursor: pointer;
          padding: 0.55rem 0.7rem;
          font-size: 0.9rem;
          line-height: 1;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          font-family: monospace;
          align-self: end;
        }

        .remove-btn:hover {
          color: #c4502a;
          border-color: #c4502a;
          background: #fdf4f1;
        }
      </style>

      <div class="field">
        <div class="row-num">Servicio ${idx}</div>
        <label>Descripción</label>
        <input type="text" class="svc-desc" placeholder="Ej: Diseño web"/>
      </div>

      <div class="field">
        <label>Cant.</label>
        <input type="number" class="svc-qty" min="1" value="1" placeholder="1"/>
      </div>

      <div class="field">
        <label>Precio Unit.</label>
        <input type="number" class="svc-price" min="0" step="0.01" placeholder="0.00"/>
      </div>

      <button class="remove-btn" title="Eliminar fila">×</button>
    `;
  }

  _attachEvents() {
    this.shadowRoot.querySelector('.remove-btn')
      .addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('remove-service', {
          bubbles: true,
          composed: true
        }));
        this.remove();
        document.dispatchEvent(new CustomEvent('reindex-rows'));
      });

    // Limpiar error al escribir
    ['svc-desc', 'svc-price'].forEach(cls => {
      const el = this.shadowRoot.querySelector(`.${cls}`);
      el.addEventListener('input', () => el.classList.remove('error'));
    });
  }

  /**
   * getData() → { desc, qty, price, subtotal }
   * Devuelve los valores actuales de la fila.
   */
  getData() {
    const desc  = this.shadowRoot.querySelector('.svc-desc').value.trim();
    const qty   = parseFloat(this.shadowRoot.querySelector('.svc-qty').value) || 1;
    const price = parseFloat(this.shadowRoot.querySelector('.svc-price').value) || 0;
    return { desc, qty, price, subtotal: qty * price };
  }

  /**
   * validate() → boolean
   * Valida los campos requeridos de la fila.
   */
  validate() {
    const descEl  = this.shadowRoot.querySelector('.svc-desc');
    const priceEl = this.shadowRoot.querySelector('.svc-price');
    let valid = true;

    if (!descEl.value.trim()) {
      descEl.classList.add('error');
      valid = false;
    } else {
      descEl.classList.remove('error');
    }

    if (!priceEl.value || isNaN(parseFloat(priceEl.value)) || parseFloat(priceEl.value) < 0) {
      priceEl.classList.add('error');
      valid = false;
    } else {
      priceEl.classList.remove('error');
    }

    return valid;
  }

  /**
   * updateIndex(n) — actualiza el número de fila visible
   */
  updateIndex(n) {
    const num = this.shadowRoot.querySelector('.row-num');
    if (num) num.textContent = `Servicio ${n}`;
  }
}

customElements.define('service-row', ServiceRow);



class QuoteCard extends HTMLElement {
  static get observedAttributes() {
    return ['client', 'sector', 'currency', 'notes', 'quote-number'];
  }

  connectedCallback()            { this._render(); }
  attributeChangedCallback()     { this._render(); }

  setServices(services) {
    this._services = services;
    this._render();
  }

  _fmt(n) {
    return new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n);
  }

  _render() {
    const client   = this.getAttribute('client')       || '—';
    const sector   = this.getAttribute('sector')       || '—';
    const currency = this.getAttribute('currency')     || 'USD';
    const notes    = this.getAttribute('notes')        || '';
    const qNum     = this.getAttribute('quote-number') || '001';
    const services = this._services || [];
    const total    = services.reduce((s, sv) => s + sv.subtotal, 0);

    const today = new Date().toLocaleDateString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const rows = services.map(sv => `
      <tr>
        <td>${sv.desc}</td>
        <td>${sv.qty}</td>
        <td>${this._fmt(sv.price)}</td>
        <td>${currency} ${this._fmt(sv.subtotal)}</td>
      </tr>
    `).join('');

    this.innerHTML = `
      <div class="qc-wrapper">

        <div class="qc-top-bar">
          <span>Sistema de Cotizaciones</span>
          <span class="qc-num">No. ${qNum}</span>
        </div>

        <div class="qc-body">

          <div class="qc-client-row">
            <div>
              <div class="qc-client-name">${client}</div>
              <div class="qc-client-sub">Cliente — ${today}</div>
            </div>
            <div class="qc-sector-badge">${sector}</div>
          </div>

          <table class="qc-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:center;">P. Unit.</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="qc-total-wrap">
            <span class="qc-total-label">Total Estimado</span>
            <span class="qc-total-amount">
              <span>${currency}</span>${this._fmt(total)}
            </span>
          </div>

          ${notes
            ? `<div class="qc-notes">"${notes}"</div>`
            : ''
          }

        </div>

        <div class="qc-footer">
          <span>CotiZen — Cotizador de Servicios</span>
          <span>Válido por 30 días · ${today}</span>
        </div>

      </div>
    `;
  }
}

customElements.define('quote-card', QuoteCard);


const App = (() => {
  let quoteCounter = 0;
  const history    = [];

  // Referencias al DOM
  const form           = document.getElementById('quoteForm');
  const servicesWrap   = document.getElementById('servicesContainer');
  const addBtn         = document.getElementById('addServiceBtn');
  const emptyState     = document.getElementById('emptyState');
  const quoteOutput    = document.getElementById('quoteOutput');
  const historyOutput  = document.getElementById('historyOutput');

  function addServiceRow() {
    const currentRows = servicesWrap.querySelectorAll('service-row').length;
    const row = document.createElement('service-row');
    row.setAttribute('index', currentRows + 1);
    servicesWrap.appendChild(row);
  }

  function reindexRows() {
    const rows = servicesWrap.querySelectorAll('service-row');
    rows.forEach((row, i) => row.updateIndex(i + 1));
  }

  function validateField(inputId, errorId, conditionFn) {
    const el  = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (conditionFn(el.value)) {
      el.classList.add('error');
      err.classList.add('show');
      return false;
    }
    el.classList.remove('error');
    err.classList.remove('show');
    return true;
  }

  function attachLiveValidation() {
    [['clientName','err-clientName'], ['sector','err-sector']].forEach(([id, eid]) => {
      document.getElementById(id).addEventListener('input', () => {
        document.getElementById(id).classList.remove('error');
        document.getElementById(eid).classList.remove('show');
      });
      document.getElementById(id).addEventListener('change', () => {
        document.getElementById(id).classList.remove('error');
        document.getElementById(eid).classList.remove('show');
      });
    });
  }

  // ── Renderizar historial 
  function renderHistory() {
    if (history.length <= 1) return;

    const fmt = (n) => new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n);

    historyOutput.innerHTML = `
      <div class="history-wrap">
        <div class="history-title">Cotizaciones anteriores</div>
        ${history.slice(1).map(h => `
          <div class="history-item">
            <div class="hist-left">
              <div class="hist-name">${h.client}</div>
              <div class="hist-sector">${h.sector} — #${h.qNum}</div>
            </div>
            <div class="hist-amount">${h.currency} ${fmt(h.total)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function handleSubmit(e) {
    e.preventDefault(); 

    // 1. Validar campos principales
    const ok1 = validateField('clientName', 'err-clientName', v => !v.trim());
    const ok2 = validateField('sector',     'err-sector',     v => !v);

    // 2. Verificar que haya al menos una fila
    const rows = Array.from(servicesWrap.querySelectorAll('service-row'));
    if (rows.length === 0) {
      addServiceRow();
      return;
    }

    // 3. Validar cada fila de servicio
    let allRowsValid = true;
    const services = [];

    rows.forEach(row => {
      if (!row.validate()) {
        allRowsValid = false;
      } else {
        const data = row.getData();
        if (data.desc) services.push(data);
      }
    });

    if (!ok1 || !ok2 || !allRowsValid || services.length === 0) return;

    const client   = document.getElementById('clientName').value.trim();
    const sector   = document.getElementById('sector').value;
    const currency = document.getElementById('currency').value;
    const notes    = document.getElementById('notes').value.trim();

    quoteCounter++;
    const qNum = String(quoteCounter).padStart(3, '0');

    const total = services.reduce((s, sv) => s + sv.subtotal, 0);
    history.unshift({ client, sector, currency, total, qNum });

    emptyState.style.display = 'none';
    quoteOutput.style.display  = 'block';
    quoteOutput.innerHTML = '';

    const card = document.createElement('quote-card');
    card.setAttribute('client',       client);
    card.setAttribute('sector',       sector);
    card.setAttribute('currency',     currency);
    card.setAttribute('quote-number', qNum);
    card.setAttribute('notes',        notes);
    quoteOutput.appendChild(card);
    card.setServices(services);

    renderHistory();

    form.reset();
    servicesWrap.innerHTML = '';
    addServiceRow();
    addServiceRow();

    if (window.innerWidth < 800) {
      quoteOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function init() {
    addServiceRow();
    addServiceRow();

    addBtn.addEventListener('click', addServiceRow);
    form.addEventListener('submit', handleSubmit);
    document.addEventListener('reindex-rows', reindexRows);
    attachLiveValidation();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);