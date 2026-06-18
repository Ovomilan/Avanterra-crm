import { useState, useEffect, useCallback } from "react";

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "avanterra_crm_v1";

const initialData = {
  deals: [
    { id: 1, client: "Керимов Д.А.", title: "Kerimov Residence — кухня + гостиная", area: 74, address: "Есиль р-н, ЖК Grand Nur", stage: "work", amount: 4200000, phone: "+7 701 234 5678", createdAt: "2026-04-15", note: "VIP клиент, материалы согласованы, бригада Рустама" },
    { id: 2, client: "Ахметова С.Б.", title: "Нурлы Жол, кв. 214 — под ключ", area: 87, address: "Алматинский р-н, ЖК Нурлы Жол", stage: "measure", amount: 0, phone: "+7 702 345 6789", createdAt: "2026-06-10", note: "Первичный контакт через Instagram" },
    { id: 3, client: "Иванов А.Р.", title: "3-комн, 87 м² — полный ремонт", area: 87, address: "Байконур р-н, ул. Кенесары 40", stage: "estimate", amount: 2800000, phone: "+7 705 456 7890", createdAt: "2026-05-20", note: "Ждёт смету, готов подписать договор" },
    { id: 4, client: "Сейткали М.", title: "Санузел + прихожая", area: 18, address: "Сарыарка р-н, пр. Туран 12", stage: "done", amount: 980000, phone: "+7 771 567 8901", createdAt: "2026-03-01", note: "Объект сдан, акт подписан" },
    { id: 5, client: "ТОО BuildCom", title: "БЦ Omega — офис 3 этаж", area: 320, address: "Есиль р-н, пр. Достык 5", stage: "contract", amount: 11500000, phone: "+7 727 000 1111", createdAt: "2026-06-01", note: "Корпоративный клиент, тендер выигран" },
    { id: 6, client: "Нуртаев Б.К.", title: "Двухкомнатная квартира под ключ", area: 62, address: "Алматинский р-н, ЖК Highvill", stage: "work", amount: 3100000, phone: "+7 777 678 9012", createdAt: "2026-05-05", note: "В работе, завершение через 3 недели" },
  ],
  clients: [
    { id: 1, name: "Керимов Д.А.", phone: "+7 701 234 5678", email: "kerimov@mail.ru", type: "Физлицо", source: "Рекомендация", dealsCount: 1, totalAmount: 4200000 },
    { id: 2, name: "Ахметова С.Б.", phone: "+7 702 345 6789", email: "", type: "Физлицо", source: "Instagram", dealsCount: 1, totalAmount: 0 },
    { id: 3, name: "Иванов А.Р.", phone: "+7 705 456 7890", email: "ivanov@gmail.com", type: "Физлицо", source: "2ГИС", dealsCount: 1, totalAmount: 2800000 },
    { id: 4, name: "Сейткали М.", phone: "+7 771 567 8901", email: "", type: "Физлицо", source: "Рекомендация", dealsCount: 1, totalAmount: 980000 },
    { id: 5, name: "ТОО BuildCom", phone: "+7 727 000 1111", email: "info@buildcom.kz", type: "Юрлицо", source: "Тендер", dealsCount: 1, totalAmount: 11500000 },
    { id: 6, name: "Нуртаев Б.К.", phone: "+7 777 678 9012", email: "", type: "Физлицо", source: "Instagram", dealsCount: 1, totalAmount: 3100000 },
  ],
  tasks: [
    { id: 1, text: "Отправить смету — Иванов А.Р.", dealId: 3, dueDate: "2026-06-19", priority: "high", done: false },
    { id: 2, text: "Согласовать материалы по объекту №7 (Керимов)", dealId: 1, dueDate: "2026-06-18", priority: "high", done: false },
    { id: 3, text: "Замер — ЖК Нурлы Жол, кв. 214", dealId: 2, dueDate: "2026-06-19", priority: "normal", done: false },
    { id: 4, text: "Акт приёмки — объект Сейткали", dealId: 4, dueDate: "2026-06-20", priority: "normal", done: true },
    { id: 5, text: "Финальный расчёт с ТОО BuildCom", dealId: 5, dueDate: "2026-06-25", priority: "normal", done: false },
  ],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialData;
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STAGES = [
  { key: "measure", label: "Замер", color: "#378ADD", bg: "#E6F1FB", text: "#185FA5" },
  { key: "estimate", label: "Смета", color: "#EF9F27", bg: "#FAEEDA", text: "#854F0B" },
  { key: "contract", label: "Договор", color: "#C9956A", bg: "#FAF0E6", text: "#7A5230" },
  { key: "work", label: "В работе", color: "#7F77DD", bg: "#EEEDFE", text: "#3C3489" },
  { key: "done", label: "Сдача", color: "#639922", bg: "#EAF3DE", text: "#3B6D11" },
];

const stageMap = Object.fromEntries(STAGES.map(s => [s.key, s]));

const fmt = (n) => n > 0 ? new Intl.NumberFormat("ru-KZ").format(n) + " ₸" : "— ₸";
const fmtM = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + " млн" : new Intl.NumberFormat("ru-KZ").format(n);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  .a-wrap { display:flex; height:100vh; min-height:620px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#f5f4f1; overflow:hidden; }
  .a-side { width:210px; flex-shrink:0; background:#fff; border-right:1px solid #e8e6e1; display:flex; flex-direction:column; }
  .a-logo { padding:20px 20px 18px; border-bottom:1px solid #e8e6e1; }
  .a-logo-name { font-size:14px; font-weight:600; letter-spacing:0.06em; color:#1a1a1a; }
  .a-logo-sub { font-size:10px; color:#9b9690; margin-top:2px; letter-spacing:0.03em; }
  .a-nav-sec { font-size:9px; color:#bbb; text-transform:uppercase; letter-spacing:0.1em; padding:14px 20px 5px; }
  .a-nav-item { display:flex; align-items:center; gap:9px; padding:9px 20px; font-size:13px; color:#666; cursor:pointer; border-left:2px solid transparent; transition:all 0.12s; user-select:none; }
  .a-nav-item:hover { background:#faf9f7; color:#1a1a1a; }
  .a-nav-item.active { color:#C9956A; border-left-color:#C9956A; background:#fdf8f4; font-weight:500; }
  .a-nav-icon { font-size:15px; }
  .a-side-foot { margin-top:auto; padding:14px 20px; border-top:1px solid #e8e6e1; display:flex; align-items:center; gap:10px; }
  .a-av { width:28px; height:28px; border-radius:50%; background:#FAF0E6; color:#C9956A; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; flex-shrink:0; }
  .a-uname { font-size:12px; font-weight:500; color:#1a1a1a; }
  .a-urole { font-size:10px; color:#999; }
  .a-main { flex:1; overflow-y:auto; display:flex; flex-direction:column; }
  .a-topbar { padding:20px 24px 0; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .a-page-title { font-size:17px; font-weight:600; color:#1a1a1a; }
  .a-page-sub { font-size:12px; color:#999; margin-top:2px; }
  .a-content { padding:20px 24px 32px; flex:1; }
  .a-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#C9956A; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; transition:background 0.12s; }
  .a-btn:hover { background:#b8845a; }
  .a-btn-outline { background:transparent; color:#C9956A; border:1px solid #C9956A; }
  .a-btn-outline:hover { background:#fdf8f4; }
  .a-btn-sm { padding:5px 12px; font-size:12px; }
  .a-btn-danger { background:#E24B4A; }
  .a-btn-danger:hover { background:#c73534; }
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
  .kpi-card { background:#fff; border:1px solid #ede9e3; border-radius:12px; padding:16px; }
  .kpi-lbl { font-size:11px; color:#999; margin-bottom:8px; display:flex; align-items:center; gap:5px; }
  .kpi-val { font-size:22px; font-weight:600; color:#1a1a1a; line-height:1; }
  .kpi-sub { font-size:11px; color:#aaa; margin-top:5px; }
  .kpi-up { color:#3B6D11; }
  .kpi-down { color:#A32D2D; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .panel { background:#fff; border:1px solid #ede9e3; border-radius:12px; padding:18px; }
  .panel-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .panel-title { font-size:13px; font-weight:600; color:#1a1a1a; }
  .panel-link { font-size:12px; color:#C9956A; cursor:pointer; }
  .stage-rows { display:flex; flex-direction:column; gap:9px; }
  .stage-row-item { display:flex; align-items:center; gap:8px; }
  .s-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .s-name { font-size:12px; color:#666; flex:1; }
  .s-bar-wrap { flex:2; height:4px; background:#f0ece6; border-radius:2px; overflow:hidden; }
  .s-bar { height:4px; border-radius:2px; }
  .s-cnt { font-size:12px; font-weight:600; color:#1a1a1a; min-width:18px; text-align:right; }
  .task-list { display:flex; flex-direction:column; gap:7px; }
  .task-item { display:flex; align-items:flex-start; gap:9px; padding:9px 11px; background:#faf9f7; border-radius:8px; border-left:2px solid transparent; }
  .task-item.urgent { border-left-color:#C9956A; }
  .task-item.overdue { border-left-color:#E24B4A; }
  .task-cb { width:15px; height:15px; border:1px solid #ccc; border-radius:3px; flex-shrink:0; margin-top:1px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .task-cb.done { background:#C9956A; border-color:#C9956A; color:#fff; font-size:10px; }
  .task-txt { font-size:12px; color:#1a1a1a; line-height:1.4; }
  .task-meta { font-size:10px; color:#aaa; margin-top:2px; }
  .deal-table-wrap { overflow-x:auto; }
  .deal-table { width:100%; border-collapse:collapse; font-size:13px; }
  .deal-table th { text-align:left; font-size:11px; font-weight:500; color:#aaa; padding:8px 12px; border-bottom:1px solid #ede9e3; white-space:nowrap; }
  .deal-table td { padding:10px 12px; border-bottom:1px solid #f5f3ef; vertical-align:middle; }
  .deal-table tr:hover td { background:#faf9f7; }
  .deal-table tr:last-child td { border-bottom:none; }
  .init-badge { width:30px; height:30px; border-radius:8px; background:#f5f3ef; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#888; }
  .badge { display:inline-flex; align-items:center; font-size:10px; padding:3px 9px; border-radius:100px; font-weight:500; white-space:nowrap; }
  .deal-name-link { font-weight:500; color:#1a1a1a; cursor:pointer; }
  .deal-name-link:hover { color:#C9956A; }
  .deal-client-sub { font-size:11px; color:#999; }
  .modal-over { position:fixed; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px; }
  .modal { background:#fff; border-radius:14px; padding:28px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; }
  .modal-title { font-size:16px; font-weight:600; color:#1a1a1a; margin-bottom:20px; }
  .form-group { margin-bottom:14px; }
  .form-label { font-size:11px; color:#888; margin-bottom:5px; display:block; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; }
  .form-input { width:100%; padding:9px 12px; border:1px solid #e0ddd8; border-radius:8px; font-size:13px; font-family:inherit; color:#1a1a1a; background:#fff; outline:none; box-sizing:border-box; }
  .form-input:focus { border-color:#C9956A; }
  .form-select { width:100%; padding:9px 12px; border:1px solid #e0ddd8; border-radius:8px; font-size:13px; font-family:inherit; color:#1a1a1a; background:#fff; outline:none; box-sizing:border-box; }
  .form-select:focus { border-color:#C9956A; }
  .form-textarea { width:100%; padding:9px 12px; border:1px solid #e0ddd8; border-radius:8px; font-size:13px; font-family:inherit; color:#1a1a1a; background:#fff; outline:none; box-sizing:border-box; min-height:80px; resize:vertical; }
  .form-textarea:focus { border-color:#C9956A; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; padding-top:16px; border-top:1px solid #ede9e3; }
  .detail-panel { background:#fff; border:1px solid #ede9e3; border-radius:12px; overflow:hidden; }
  .detail-hd { padding:20px 24px; border-bottom:1px solid #ede9e3; display:flex; align-items:flex-start; justify-content:space-between; }
  .detail-body { padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .detail-field { }
  .detail-field-lbl { font-size:11px; color:#aaa; margin-bottom:4px; }
  .detail-field-val { font-size:14px; color:#1a1a1a; font-weight:500; }
  .detail-note { padding:16px 24px; border-top:1px solid #ede9e3; }
  .back-btn { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#888; cursor:pointer; margin-bottom:16px; }
  .back-btn:hover { color:#1a1a1a; }
  .empty-state { text-align:center; padding:40px 20px; color:#aaa; }
  .empty-icon { font-size:32px; margin-bottom:10px; }
  .empty-txt { font-size:14px; }
  .search-bar { position:relative; }
  .search-input { width:100%; padding:9px 12px 9px 36px; border:1px solid #e0ddd8; border-radius:8px; font-size:13px; font-family:inherit; color:#1a1a1a; outline:none; box-sizing:border-box; }
  .search-input:focus { border-color:#C9956A; }
  .search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#bbb; font-size:14px; pointer-events:none; }
  .filter-row { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
  .filter-chip { padding:5px 12px; border:1px solid #e0ddd8; border-radius:100px; font-size:12px; color:#666; cursor:pointer; background:#fff; transition:all 0.1s; white-space:nowrap; }
  .filter-chip.active { background:#C9956A; color:#fff; border-color:#C9956A; }
  .kanban-wrap { display:flex; gap:12px; overflow-x:auto; padding-bottom:8px; }
  .kanban-col { min-width:200px; max-width:220px; flex-shrink:0; }
  .kanban-col-hd { display:flex; align-items:center; gap:6px; margin-bottom:10px; padding:6px 10px; border-radius:8px; }
  .kanban-col-name { font-size:12px; font-weight:600; }
  .kanban-cnt { font-size:11px; opacity:0.7; }
  .kanban-card { background:#fff; border:1px solid #ede9e3; border-radius:10px; padding:12px; margin-bottom:8px; cursor:pointer; transition:box-shadow 0.1s; }
  .kanban-card:hover { box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .kanban-card-title { font-size:12px; font-weight:500; color:#1a1a1a; margin-bottom:6px; line-height:1.4; }
  .kanban-card-client { font-size:11px; color:#888; }
  .kanban-card-amount { font-size:12px; font-weight:600; color:#C9956A; margin-top:6px; }
  .toast { position:fixed; bottom:24px; right:24px; background:#1a1a1a; color:#fff; padding:12px 18px; border-radius:10px; font-size:13px; z-index:200; animation:slideUp 0.2s ease; }
  @keyframes slideUp { from { transform:translateY(10px); opacity:0; } to { transform:translateY(0); opacity:1; } }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">{msg}</div>;
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function StageBadge({ stageKey }) {
  const s = stageMap[stageKey] || stageMap.measure;
  return <span className="badge" style={{ background: s.bg, color: s.text }}>{s.label}</span>;
}

function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ data, setPage, setSelectedDeal }) {
  const active = data.deals.filter(d => d.stage !== "done");
  const totalWork = active.reduce((s, d) => s + d.amount, 0);
  const doneMonth = data.deals.filter(d => d.stage === "done").length;
  const pending = data.tasks.filter(t => !t.done).length;

  const today = "2026-06-19";

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-lbl">Активные сделки</div>
          <div className="kpi-val">{active.length}</div>
          <div className="kpi-sub kpi-up">↑ 3 с прошлого месяца</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-lbl">В работе, ₸</div>
          <div className="kpi-val">{fmtM(totalWork)}</div>
          <div className="kpi-sub kpi-up">↑ +2.1 млн</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-lbl">Сдано</div>
          <div className="kpi-val">{doneMonth}</div>
          <div className="kpi-sub" style={{ color: "#aaa" }}>объекта закрыто</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-lbl">Ожидают действия</div>
          <div className="kpi-val">{pending}</div>
          <div className="kpi-sub kpi-down">↓ требуют действия</div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">Воронка по стадиям</div>
            <div className="panel-link" onClick={() => setPage("deals")}>Все →</div>
          </div>
          <div className="stage-rows">
            {STAGES.map(s => {
              const cnt = data.deals.filter(d => d.stage === s.key).length;
              const pct = Math.round((cnt / (data.deals.length || 1)) * 100);
              return (
                <div className="stage-row-item" key={s.key}>
                  <div className="s-dot" style={{ background: s.color }} />
                  <div className="s-name">{s.label}</div>
                  <div className="s-bar-wrap"><div className="s-bar" style={{ width: pct + "%", background: s.color }} /></div>
                  <div className="s-cnt">{cnt}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">Задачи</div>
            <div className="panel-link" onClick={() => setPage("tasks")}>Все →</div>
          </div>
          <div className="task-list">
            {data.tasks.slice(0, 4).map(t => {
              const overdue = !t.done && t.dueDate < today;
              return (
                <div key={t.id} className={`task-item${t.priority === "high" ? " urgent" : ""}${overdue ? " overdue" : ""}`}>
                  <div className={`task-cb${t.done ? " done" : ""}`}>{t.done ? "✓" : ""}</div>
                  <div>
                    <div className="task-txt" style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "#aaa" : "#1a1a1a" }}>{t.text}</div>
                    <div className="task-meta">{t.dueDate}{overdue ? " · Просрочено" : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">Последние сделки</div>
          <div className="panel-link" onClick={() => setPage("deals")}>Все сделки →</div>
        </div>
        <div className="deal-table-wrap">
          <table className="deal-table">
            <thead>
              <tr>
                <th></th>
                <th>Сделка</th>
                <th>Стадия</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {data.deals.slice(0, 5).map(d => (
                <tr key={d.id}>
                  <td><div className="init-badge">{initials(d.client)}</div></td>
                  <td>
                    <div className="deal-name-link" onClick={() => { setSelectedDeal(d.id); setPage("deal-detail"); }}>{d.title}</div>
                    <div className="deal-client-sub">{d.client}</div>
                  </td>
                  <td><StageBadge stageKey={d.stage} /></td>
                  <td style={{ fontWeight: 600 }}>{fmt(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── DEALS LIST ───────────────────────────────────────────────────────────────
function DealsList({ data, setPage, setSelectedDeal, showToast }) {
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = data.deals.filter(d => {
    if (filter !== "all" && d.stage !== filter) return false;
    const q = search.toLowerCase();
    if (q && !d.title.toLowerCase().includes(q) && !d.client.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div>
      <div className="filter-row">
        <div style={{ flex: 1, maxWidth: 280 }} className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Поиск по сделке или клиенту..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-chip active" style={filter === "all" ? {} : { background: "#fff", color: "#666", borderColor: "#e0ddd8" }} onClick={() => setFilter("all")}>Все ({data.deals.length})</div>
        {STAGES.map(s => {
          const cnt = data.deals.filter(d => d.stage === s.key).length;
          return (
            <div key={s.key} className={`filter-chip${filter === s.key ? " active" : ""}`} onClick={() => setFilter(s.key === filter ? "all" : s.key)}>{s.label} {cnt}</div>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="a-btn a-btn-outline a-btn-sm" onClick={() => setView(view === "table" ? "kanban" : "table")}>{view === "table" ? "Канбан" : "Таблица"}</button>
          <button className="a-btn a-btn-sm" onClick={() => setShowAdd(true)}>+ Сделка</button>
        </div>
      </div>

      {view === "table" ? (
        <div className="panel">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-txt">Сделок не найдено</div></div>
          ) : (
            <div className="deal-table-wrap">
              <table className="deal-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Сделка / Клиент</th>
                    <th>Площадь</th>
                    <th>Стадия</th>
                    <th>Сумма</th>
                    <th>Создана</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td><div className="init-badge">{initials(d.client)}</div></td>
                      <td>
                        <div className="deal-name-link" onClick={() => { setSelectedDeal(d.id); setPage("deal-detail"); }}>{d.title}</div>
                        <div className="deal-client-sub">{d.client} · {d.address}</div>
                      </td>
                      <td style={{ color: "#666" }}>{d.area} м²</td>
                      <td><StageBadge stageKey={d.stage} /></td>
                      <td style={{ fontWeight: 600 }}>{fmt(d.amount)}</td>
                      <td style={{ color: "#aaa", fontSize: 12 }}>{d.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="kanban-wrap">
          {STAGES.map(s => {
            const cols = filtered.filter(d => d.stage === s.key);
            return (
              <div className="kanban-col" key={s.key}>
                <div className="kanban-col-hd" style={{ background: s.bg }}>
                  <div className="kanban-col-name" style={{ color: s.text }}>{s.label}</div>
                  <div className="kanban-cnt" style={{ color: s.text }}>{cols.length}</div>
                </div>
                {cols.map(d => (
                  <div key={d.id} className="kanban-card" onClick={() => { setSelectedDeal(d.id); setPage("deal-detail"); }}>
                    <div className="kanban-card-title">{d.title}</div>
                    <div className="kanban-card-client">{d.client}</div>
                    {d.amount > 0 && <div className="kanban-card-amount">{fmt(d.amount)}</div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddDealModal
          onSave={(deal) => { data.deals.push({ ...deal, id: Date.now() }); showToast("Сделка добавлена"); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

// ─── ADD DEAL MODAL ───────────────────────────────────────────────────────────
function AddDealModal({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial || { client: "", title: "", area: "", address: "", phone: "", stage: "measure", amount: "", note: "", createdAt: "2026-06-19" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-over" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{initial ? "Редактировать сделку" : "Новая сделка"}</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Клиент</label>
            <input className="form-input" value={form.client} onChange={e => set("client", e.target.value)} placeholder="Иванов А.Р." />
          </div>
          <div className="form-group">
            <label className="form-label">Телефон</label>
            <input className="form-input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+7 700 000 0000" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Название сделки</label>
          <input className="form-input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ремонт 2-комн квартиры под ключ" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Адрес объекта</label>
            <input className="form-input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="ЖК Нурлы Жол, кв. 45" />
          </div>
          <div className="form-group">
            <label className="form-label">Площадь, м²</label>
            <input className="form-input" type="number" value={form.area} onChange={e => set("area", e.target.value)} placeholder="75" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Стадия</label>
            <select className="form-select" value={form.stage} onChange={e => set("stage", e.target.value)}>
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Сумма, ₸</label>
            <input className="form-input" type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Заметки</label>
          <textarea className="form-textarea" value={form.note} onChange={e => set("note", e.target.value)} placeholder="Дополнительная информация..." />
        </div>
        <div className="modal-footer">
          <button className="a-btn a-btn-outline" onClick={onClose}>Отмена</button>
          <button className="a-btn" onClick={() => onSave({ ...form, area: Number(form.area) || 0, amount: Number(form.amount) || 0 })}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

// ─── DEAL DETAIL ──────────────────────────────────────────────────────────────
function DealDetail({ data, dealId, setPage, setData, showToast }) {
  const deal = data.deals.find(d => d.id === dealId);
  const [editing, setEditing] = useState(false);

  if (!deal) return <div style={{ padding: 24, color: "#999" }}>Сделка не найдена</div>;

  return (
    <div>
      <div className="back-btn" onClick={() => setPage("deals")}>← Назад к сделкам</div>
      <div className="detail-panel">
        <div className="detail-hd">
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>{deal.title}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <StageBadge stageKey={deal.stage} />
              <span style={{ fontSize: 12, color: "#aaa" }}>{deal.createdAt}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="a-btn a-btn-outline a-btn-sm" onClick={() => setEditing(true)}>Редактировать</button>
            <button className="a-btn a-btn-sm a-btn-danger" onClick={() => {
              setData(d => ({ ...d, deals: d.deals.filter(x => x.id !== dealId) }));
              showToast("Сделка удалена");
              setPage("deals");
            }}>Удалить</button>
          </div>
        </div>
        <div className="detail-body">
          <div className="detail-field"><div className="detail-field-lbl">Клиент</div><div className="detail-field-val">{deal.client}</div></div>
          <div className="detail-field"><div className="detail-field-lbl">Телефон</div><div className="detail-field-val">{deal.phone || "—"}</div></div>
          <div className="detail-field"><div className="detail-field-lbl">Адрес объекта</div><div className="detail-field-val">{deal.address}</div></div>
          <div className="detail-field"><div className="detail-field-lbl">Площадь</div><div className="detail-field-val">{deal.area} м²</div></div>
          <div className="detail-field"><div className="detail-field-lbl">Сумма</div><div className="detail-field-val" style={{ color: "#C9956A" }}>{fmt(deal.amount)}</div></div>
          <div className="detail-field"><div className="detail-field-lbl">Стадия</div><div className="detail-field-val"><StageBadge stageKey={deal.stage} /></div></div>
        </div>
        {deal.note && (
          <div className="detail-note">
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>ЗАМЕТКИ</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{deal.note}</div>
          </div>
        )}
      </div>

      {editing && (
        <AddDealModal
          initial={deal}
          onSave={(updated) => {
            setData(d => ({ ...d, deals: d.deals.map(x => x.id === dealId ? { ...x, ...updated, id: dealId } : x) }));
            showToast("Сделка обновлена");
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ data, showToast }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = data.clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div>
      <div className="filter-row">
        <div style={{ flex: 1, maxWidth: 320 }} className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Поиск клиента..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className="a-btn a-btn-sm" onClick={() => setShowAdd(true)}>+ Клиент</button>
        </div>
      </div>
      <div className="panel">
        <table className="deal-table">
          <thead>
            <tr>
              <th></th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Тип</th>
              <th>Источник</th>
              <th>Сделки</th>
              <th>Оборот</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td><div className="init-badge">{initials(c.name)}</div></td>
                <td>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{c.email || "—"}</div>
                </td>
                <td style={{ fontSize: 13, color: "#444" }}>{c.phone}</td>
                <td><span className="badge" style={{ background: c.type === "Юрлицо" ? "#EEEDFE" : "#f5f3ef", color: c.type === "Юрлицо" ? "#3C3489" : "#888" }}>{c.type}</span></td>
                <td style={{ fontSize: 12, color: "#888" }}>{c.source}</td>
                <td style={{ fontWeight: 600, textAlign: "center" }}>{c.dealsCount}</td>
                <td style={{ fontWeight: 600, color: c.totalAmount > 0 ? "#C9956A" : "#aaa" }}>{fmt(c.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="modal-over" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-title">Новый клиент</div>
            <AddClientForm
              onSave={(c) => { data.clients.push({ ...c, id: Date.now(), dealsCount: 0, totalAmount: 0 }); showToast("Клиент добавлен"); setShowAdd(false); }}
              onClose={() => setShowAdd(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddClientForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", type: "Физлицо", source: "Рекомендация" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Имя / Компания</label><input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Телефон</label><input className="form-input" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => set("email", e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Тип</label>
          <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
            <option>Физлицо</option><option>Юрлицо</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Источник</label>
          <select className="form-select" value={form.source} onChange={e => set("source", e.target.value)}>
            <option>Рекомендация</option><option>Instagram</option><option>2ГИС</option><option>Тендер</option><option>Сайт</option><option>Другое</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button className="a-btn a-btn-outline" onClick={onClose}>Отмена</button>
        <button className="a-btn" onClick={() => onSave(form)}>Сохранить</button>
      </div>
    </>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({ data, setData, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const today = "2026-06-19";

  const filtered = data.tasks.filter(t => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    if (filter === "overdue") return !t.done && t.dueDate < today;
    return true;
  });

  const toggle = (id) => {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  };

  return (
    <div>
      <div className="filter-row">
        {[["all", "Все"], ["active", "Активные"], ["overdue", "Просроченные"], ["done", "Выполненные"]].map(([k, l]) => (
          <div key={k} className={`filter-chip${filter === k ? " active" : ""}`} onClick={() => setFilter(k)}>{l}</div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button className="a-btn a-btn-sm" onClick={() => setShowAdd(true)}>+ Задача</button>
        </div>
      </div>
      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-txt">Задач нет</div></div>
        ) : (
          <div className="task-list">
            {filtered.map(t => {
              const overdue = !t.done && t.dueDate < today;
              return (
                <div key={t.id} className={`task-item${t.priority === "high" ? " urgent" : ""}${overdue ? " overdue" : ""}`} style={{ padding: "12px 14px" }}>
                  <div className={`task-cb${t.done ? " done" : ""}`} onClick={() => toggle(t.id)}>{t.done ? "✓" : ""}</div>
                  <div style={{ flex: 1 }}>
                    <div className="task-txt" style={{ fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#bbb" : "#1a1a1a" }}>{t.text}</div>
                    <div className="task-meta" style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <span>{t.dueDate}</span>
                      {overdue && <span style={{ color: "#E24B4A" }}>Просрочено</span>}
                      {t.priority === "high" && <span style={{ color: "#C9956A" }}>Высокий приоритет</span>}
                    </div>
                  </div>
                  <button className="a-btn a-btn-outline a-btn-sm" style={{ flexShrink: 0 }} onClick={() => {
                    setData(d => ({ ...d, tasks: d.tasks.filter(x => x.id !== t.id) }));
                    showToast("Задача удалена");
                  }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-over" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-title">Новая задача</div>
            <AddTaskForm
              onSave={(t) => { setData(d => ({ ...d, tasks: [...d.tasks, { ...t, id: Date.now(), done: false }] })); showToast("Задача добавлена"); setShowAdd(false); }}
              onClose={() => setShowAdd(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddTaskForm({ onSave, onClose }) {
  const [form, setForm] = useState({ text: "", dueDate: "2026-06-20", priority: "normal" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <>
      <div className="form-group"><label className="form-label">Задача</label><input className="form-input" value={form.text} onChange={e => set("text", e.target.value)} placeholder="Описание задачи..." /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Срок</label><input className="form-input" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} /></div>
        <div className="form-group">
          <label className="form-label">Приоритет</label>
          <select className="form-select" value={form.priority} onChange={e => set("priority", e.target.value)}>
            <option value="normal">Обычный</option><option value="high">Высокий</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button className="a-btn a-btn-outline" onClick={onClose}>Отмена</button>
        <button className="a-btn" onClick={() => onSave(form)}>Добавить</button>
      </div>
    </>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => loadData());
  const [page, setPage] = useState("dashboard");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { saveData(data); }, [data]);

  const showToast = useCallback((msg) => { setToast(msg); }, []);

  const NAV = [
    { key: "dashboard", label: "Дашборд", icon: "📊", section: "Главное" },
    { key: "deals", label: "Сделки", icon: "💼", section: "Главное" },
    { key: "clients", label: "Клиенты", icon: "👥", section: "Главное" },
    { key: "tasks", label: "Задачи", icon: "✅", section: "Операции" },
  ];

  const sections = [...new Set(NAV.map(n => n.section))];

  const PAGE_TITLES = { dashboard: "Дашборд", deals: "Сделки", clients: "Клиенты", tasks: "Задачи", "deal-detail": "Карточка сделки" };

  return (
    <>
      <style>{css}</style>
      <div className="a-wrap">
        <div className="a-side">
          <div className="a-logo">
            <div className="a-logo-name">AVANTERRA</div>
            <div className="a-logo-sub">CRM система</div>
          </div>
          {sections.map(sec => (
            <div key={sec}>
              <div className="a-nav-sec">{sec}</div>
              {NAV.filter(n => n.section === sec).map(n => (
                <div key={n.key} className={`a-nav-item${page === n.key || (page === "deal-detail" && n.key === "deals") ? " active" : ""}`} onClick={() => setPage(n.key)}>
                  <span className="a-nav-icon">{n.icon}</span> {n.label}
                </div>
              ))}
            </div>
          ))}
          <div className="a-side-foot">
            <div className="a-av">МГ</div>
            <div><div className="a-uname">Милан</div><div className="a-urole">Директор</div></div>
          </div>
        </div>

        <div className="a-main">
          <div className="a-topbar">
            <div>
              <div className="a-page-title">{PAGE_TITLES[page] || page}</div>
              <div className="a-page-sub">Avanterra · Астана</div>
            </div>
            {page === "dashboard" && (
              <button className="a-btn" onClick={() => setPage("deals")}>+ Новая сделка</button>
            )}
          </div>
          <div className="a-content">
            {page === "dashboard" && <Dashboard data={data} setPage={setPage} setSelectedDeal={setSelectedDeal} />}
            {page === "deals" && <DealsList data={data} setPage={setPage} setSelectedDeal={setSelectedDeal} showToast={showToast} />}
            {page === "deal-detail" && <DealDetail data={data} dealId={selectedDeal} setPage={setPage} setData={setData} showToast={showToast} />}
            {page === "clients" && <Clients data={data} showToast={showToast} />}
            {page === "tasks" && <Tasks data={data} setData={setData} showToast={showToast} />}
          </div>
        </div>
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
