import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "avanterra_crm_v1";
const AUTH_KEY = "avanterra_auth";

const PINS = {
  "5555": { role: "director", name: "Милан", label: "Директор" },
  "1234": { role: "staff", name: "Сотрудник", label: "Сотрудник" },
};

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
    { id: 2, text: "Согласовать материалы (Керимов)", dealId: 1, dueDate: "2026-06-18", priority: "high", done: false },
    { id: 3, text: "Замер — ЖК Нурлы Жол, кв. 214", dealId: 2, dueDate: "2026-06-19", priority: "normal", done: false },
    { id: 4, text: "Акт приёмки — объект Сейткали", dealId: 4, dueDate: "2026-06-20", priority: "normal", done: true },
    { id: 5, text: "Финальный расчёт с ТОО BuildCom", dealId: 5, dueDate: "2026-06-25", priority: "normal", done: false },
  ],
};

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return initialData;
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }
function loadAuth() {
  try { const r = sessionStorage.getItem(AUTH_KEY); if (r) return JSON.parse(r); } catch {}
  return null;
}
function saveAuth(a) { try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(a)); } catch {} }
function clearAuth() { try { sessionStorage.removeItem(AUTH_KEY); } catch {} }

const STAGES = [
  { key: "measure", label: "Замер", color: "#378ADD", bg: "#E6F1FB", text: "#185FA5" },
  { key: "estimate", label: "Смета", color: "#EF9F27", bg: "#FAEEDA", text: "#854F0B" },
  { key: "contract", label: "Договор", color: "#C9956A", bg: "#FAF0E6", text: "#7A5230" },
  { key: "work", label: "В работе", color: "#7F77DD", bg: "#EEEDFE", text: "#3C3489" },
  { key: "done", label: "Сдача", color: "#639922", bg: "#EAF3DE", text: "#3B6D11" },
];
const stageMap = Object.fromEntries(STAGES.map(s => [s.key, s]));
const fmt = n => n > 0 ? new Intl.NumberFormat("ru-KZ").format(n) + " ₸" : "— ₸";
const fmtM = n => n >= 1000000 ? (n / 1000000).toFixed(1) + " млн ₸" : fmt(n);
const initials = name => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const TODAY = "2026-06-19";

function Badge({ stageKey }) {
  const s = stageMap[stageKey] || stageMap.measure;
  return <span style={{ display:"inline-flex", alignItems:"center", fontSize:11, padding:"3px 9px", borderRadius:100, fontWeight:600, background:s.bg, color:s.text, whiteSpace:"nowrap" }}>{s.label}</span>;
}
function Avatar({ name, size=36 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:"#FAF0E6", color:"#C9956A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.33, fontWeight:700, flexShrink:0 }}>{initials(name)}</div>;
}
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2200); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"#1a1a1a", color:"#fff", padding:"11px 20px", borderRadius:12, fontSize:13, zIndex:999, whiteSpace:"nowrap" }}>{msg}</div>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"90vh", overflowY:"auto", padding:"24px 20px 40px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#1a1a1a" }}>{title}</div>
          <button onClick={onClose} style={{ background:"#f0ece6", border:"none", borderRadius:"50%", width:30, height:30, fontSize:16, cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return <div style={{ marginBottom:14 }}><div style={{ fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>{label}</div>{children}</div>;
}
function Input({ value, onChange, placeholder, type="text" }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"11px 14px", border:"1px solid #e0ddd8", borderRadius:10, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", background:"#fff", color:"#1a1a1a" }} />;
}
function Select({ value, onChange, options }) {
  return <select value={value} onChange={onChange} style={{ width:"100%", padding:"11px 14px", border:"1px solid #e0ddd8", borderRadius:10, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", background:"#fff", color:"#1a1a1a" }}>{options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>;
}
function Btn({ children, onClick, variant="primary", style={} }) {
  const variants = { primary:{ background:"#C9956A", color:"#fff" }, outline:{ background:"transparent", color:"#C9956A", border:"1px solid #C9956A" }, ghost:{ background:"#f5f3ef", color:"#666" }, danger:{ background:"#ffeaea", color:"#c73534" } };
  return <button onClick={onClick} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"13px 20px", borderRadius:12, fontSize:15, fontWeight:600, cursor:"pointer", border:"none", fontFamily:"inherit", ...variants[variant], ...style }}>{children}</button>;
}

// ── PIN SCREEN ───────────────────────────────────────────────────────────────
function PinScreen({ onAuth }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (PINS[next]) {
          onAuth(PINS[next]);
        } else {
          setShake(true);
          setError(true);
          setTimeout(() => { setPin(""); setShake(false); }, 600);
        }
      }, 100);
    }
  };

  const handleDel = () => { setPin(p => p.slice(0, -1)); setError(false); };

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div style={{ minHeight:"100dvh", background:"#f5f4f1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {/* Logo */}
      <div style={{ marginBottom:40, textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:18, background:"#C9956A", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:28 }}>🏠</div>
        <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a", letterSpacing:"0.05em" }}>AVANTERRA</div>
        <div style={{ fontSize:13, color:"#aaa", marginTop:4 }}>Введите PIN-код</div>
      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:16, marginBottom:40, animation: shake ? "shake 0.4s ease" : "none" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:14, height:14, borderRadius:"50%", background: i < pin.length ? (error ? "#E24B4A" : "#C9956A") : "#ddd", transition:"background 0.15s" }} />
        ))}
      </div>

      {/* Numpad */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 72px)", gap:12 }}>
        {digits.map((d, i) => (
          <button key={i} onClick={() => d === "⌫" ? handleDel() : d ? handleDigit(d) : null}
            style={{ width:72, height:72, borderRadius:"50%", border:"none", background: d ? "#fff" : "transparent", fontSize: d==="⌫" ? 22 : 24, fontWeight:600, color:"#1a1a1a", cursor: d ? "pointer" : "default", boxShadow: d ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {d}
          </button>
        ))}
      </div>

      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`}</style>
    </div>
  );
}

// ── DEAL FORM ────────────────────────────────────────────────────────────────
function DealForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { client:"", title:"", area:"", address:"", phone:"", stage:"measure", amount:"", note:"", createdAt:TODAY });
  const s = (k,v) => setF(p=>({ ...p, [k]:v }));
  return (
    <>
      <Field label="Клиент"><Input value={f.client} onChange={e=>s("client",e.target.value)} placeholder="Иванов А.Р." /></Field>
      <Field label="Телефон"><Input value={f.phone} onChange={e=>s("phone",e.target.value)} placeholder="+7 700 000 0000" /></Field>
      <Field label="Название сделки"><Input value={f.title} onChange={e=>s("title",e.target.value)} placeholder="Ремонт 2-комн под ключ" /></Field>
      <Field label="Адрес"><Input value={f.address} onChange={e=>s("address",e.target.value)} placeholder="ЖК Нурлы Жол, кв. 45" /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Площадь, м²"><Input type="number" value={f.area} onChange={e=>s("area",e.target.value)} placeholder="75" /></Field>
        <Field label="Сумма, ₸"><Input type="number" value={f.amount} onChange={e=>s("amount",e.target.value)} placeholder="0" /></Field>
      </div>
      <Field label="Стадия"><Select value={f.stage} onChange={e=>s("stage",e.target.value)} options={STAGES.map(st=>({ value:st.key, label:st.label }))} /></Field>
      <Field label="Заметки"><textarea value={f.note} onChange={e=>s("note",e.target.value)} placeholder="Доп. информация..." style={{ width:"100%", padding:"11px 14px", border:"1px solid #e0ddd8", borderRadius:10, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", minHeight:80, resize:"vertical" }} /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn onClick={()=>onSave({ ...f, area:Number(f.area)||0, amount:Number(f.amount)||0 })}>Сохранить</Btn>
      </div>
    </>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ data, setPage, setSelectedDeal, user }) {
  const active = data.deals.filter(d=>d.stage!=="done");
  const totalWork = active.reduce((s,d)=>s+d.amount,0);
  const pending = data.tasks.filter(t=>!t.done).length;
  const isDirector = user.role==="director";

  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          { label:"Активные сделки", value:active.length, sub:"объектов" },
          ...(isDirector ? [{ label:"Объём, ₸", value:fmtM(totalWork), sub:"суммарно" }] : [{ label:"Задач", value:pending, sub:"ожидают", warn:pending>0 }]),
          { label:"Сдано", value:data.deals.filter(d=>d.stage==="done").length, sub:"закрыто" },
          ...(isDirector ? [{ label:"Задач", value:pending, sub:"ожидают", warn:pending>0 }] : [{ label:"В работе", value:data.deals.filter(d=>d.stage==="work").length, sub:"объектов" }]),
        ].map((k,i)=>(
          <div key={i} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", border:"1px solid #ede9e3" }}>
            <div style={{ fontSize:11, color:"#aaa", marginBottom:6 }}>{k.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:k.warn?"#C9956A":"#1a1a1a" }}>{k.value}</div>
            <div style={{ fontSize:11, color:"#bbb", marginTop:3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:14, padding:16, border:"1px solid #ede9e3", marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", marginBottom:12 }}>Воронка</div>
        {STAGES.map(s=>{
          const cnt=data.deals.filter(d=>d.stage===s.key).length;
          const pct=Math.round((cnt/(data.deals.length||1))*100);
          return (
            <div key={s.key} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
              <div style={{ fontSize:12, color:"#666", width:70, flexShrink:0 }}>{s.label}</div>
              <div style={{ flex:1, height:5, background:"#f0ece6", borderRadius:3, overflow:"hidden" }}><div style={{ width:pct+"%", height:"100%", background:s.color, borderRadius:3 }}/></div>
              <div style={{ fontSize:12, fontWeight:700, color:"#1a1a1a", width:18, textAlign:"right" }}>{cnt}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", overflow:"hidden", marginBottom:16 }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #f0ece6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:13, fontWeight:700 }}>Последние сделки</div>
          <div style={{ fontSize:12, color:"#C9956A", cursor:"pointer" }} onClick={()=>setPage("deals")}>Все →</div>
        </div>
        {data.deals.slice(0,4).map(d=>(
          <div key={d.id} onClick={()=>{ setSelectedDeal(d.id); setPage("deal-detail"); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:"1px solid #f9f7f4", cursor:"pointer" }}>
            <Avatar name={d.client} size={36}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.title}</div>
              <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{d.client}</div>
            </div>
            <Badge stageKey={d.stage}/>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #f0ece6", display:"flex", justifyContent:"space-between" }}>
          <div style={{ fontSize:13, fontWeight:700 }}>Задачи</div>
          <div style={{ fontSize:12, color:"#C9956A", cursor:"pointer" }} onClick={()=>setPage("tasks")}>Все →</div>
        </div>
        {data.tasks.filter(t=>!t.done).slice(0,3).map(t=>{
          const overdue=t.dueDate<TODAY;
          return (
            <div key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 16px", borderBottom:"1px solid #f9f7f4", borderLeft:`3px solid ${t.priority==="high"?"#C9956A":overdue?"#E24B4A":"transparent"}` }}>
              <div style={{ width:18, height:18, border:"1px solid #ddd", borderRadius:4, flexShrink:0, marginTop:1 }}/>
              <div>
                <div style={{ fontSize:13, color:"#1a1a1a" }}>{t.text}</div>
                <div style={{ fontSize:11, color:overdue?"#E24B4A":"#aaa", marginTop:2 }}>{t.dueDate}{overdue?" · Просрочено":""}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DEALS LIST ───────────────────────────────────────────────────────────────
function DealsList({ data, setPage, setSelectedDeal, setData, showToast, user }) {
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const isDirector = user.role==="director";
  const filtered = data.deals.filter(d=>filter==="all"||d.stage===filter);

  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
        {[{ key:"all", label:`Все (${data.deals.length})` }, ...STAGES.map(s=>({ key:s.key, label:`${s.label} ${data.deals.filter(d=>d.stage===s.key).length}` }))].map(f=>(
          <div key={f.key} onClick={()=>setFilter(f.key)} style={{ flexShrink:0, padding:"6px 14px", borderRadius:100, fontSize:12, fontWeight:600, cursor:"pointer", background:filter===f.key?"#C9956A":"#f0ece6", color:filter===f.key?"#fff":"#666" }}>{f.label}</div>
        ))}
      </div>
      {filtered.map(d=>(
        <div key={d.id} onClick={()=>{ setSelectedDeal(d.id); setPage("deal-detail"); }} style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:"14px 16px", marginBottom:10, cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:8 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#1a1a1a", lineHeight:1.4, flex:1 }}>{d.title}</div>
            <Badge stageKey={d.stage}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Avatar name={d.client} size={24}/>
              <span style={{ fontSize:12, color:"#888" }}>{d.client}</span>
            </div>
            {isDirector && <div style={{ fontSize:13, fontWeight:700, color:d.amount>0?"#C9956A":"#bbb" }}>{fmt(d.amount)}</div>}
          </div>
        </div>
      ))}
      {isDirector && <Btn onClick={()=>setShowAdd(true)} style={{ width:"100%", marginTop:6 }}>+ Новая сделка</Btn>}
      {showAdd && (
        <Modal title="Новая сделка" onClose={()=>setShowAdd(false)}>
          <DealForm onSave={deal=>{ setData(d=>({ ...d, deals:[...d.deals,{ ...deal, id:Date.now() }] })); showToast("Сделка добавлена"); setShowAdd(false); }} onClose={()=>setShowAdd(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ── DEAL DETAIL ──────────────────────────────────────────────────────────────
function DealDetail({ data, dealId, setPage, setData, showToast, user }) {
  const deal = data.deals.find(d=>d.id===dealId);
  const [editing, setEditing] = useState(false);
  const isDirector = user.role==="director";

  if (!deal) return <div style={{ padding:24, color:"#aaa", textAlign:"center" }}>Сделка не найдена</div>;

  return (
    <div style={{ padding:"0 16px 24px" }}>
      <div style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:"18px 16px", marginBottom:12 }}>
        <div style={{ marginBottom:10 }}><Badge stageKey={deal.stage}/></div>
        <div style={{ fontSize:16, fontWeight:700, color:"#1a1a1a", lineHeight:1.4, marginBottom:6 }}>{deal.title}</div>
        {isDirector && <div style={{ fontSize:22, fontWeight:700, color:"#C9956A" }}>{fmt(deal.amount)}</div>}
      </div>

      <div style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:16, marginBottom:12 }}>
        {[
          { label:"Клиент", value:deal.client },
          { label:"Телефон", value:deal.phone||"—" },
          { label:"Адрес", value:deal.address },
          { label:"Площадь", value:deal.area+" м²" },
          ...(isDirector ? [{ label:"Создана", value:deal.createdAt }] : []),
        ].map(row=>(
          <div key={row.label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f5f3ef" }}>
            <div style={{ fontSize:13, color:"#aaa" }}>{row.label}</div>
            <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", textAlign:"right", maxWidth:"60%" }}>{row.value}</div>
          </div>
        ))}
      </div>

      {deal.note && (
        <div style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:16, marginBottom:12 }}>
          <div style={{ fontSize:11, color:"#aaa", marginBottom:6, textTransform:"uppercase", fontWeight:600, letterSpacing:"0.05em" }}>Заметки</div>
          <div style={{ fontSize:14, color:"#444", lineHeight:1.6 }}>{deal.note}</div>
        </div>
      )}

      {isDirector && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <Btn variant="outline" onClick={()=>setEditing(true)}>Редактировать</Btn>
            <Btn variant="danger" onClick={()=>{ setData(d=>({ ...d, deals:d.deals.filter(x=>x.id!==dealId) })); showToast("Сделка удалена"); setPage("deals"); }}>Удалить</Btn>
          </div>
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:16 }}>
            <div style={{ fontSize:12, color:"#aaa", marginBottom:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Изменить стадию</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {STAGES.map(st=>(
                <div key={st.key} onClick={()=>{ setData(d=>({ ...d, deals:d.deals.map(x=>x.id===dealId?{ ...x, stage:st.key }:x) })); showToast("Стадия обновлена"); }} style={{ padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:600, cursor:"pointer", background:deal.stage===st.key?st.bg:"#f5f3ef", color:deal.stage===st.key?st.text:"#888", border:deal.stage===st.key?`1.5px solid ${st.color}`:"1.5px solid transparent" }}>{st.label}</div>
              ))}
            </div>
          </div>
        </>
      )}

      {!isDirector && (
        <div style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:16 }}>
          <div style={{ fontSize:12, color:"#aaa", marginBottom:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Стадия</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {STAGES.map(st=>(
              <div key={st.key} style={{ padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:600, background:deal.stage===st.key?st.bg:"#f5f3ef", color:deal.stage===st.key?st.text:"#ccc", border:deal.stage===st.key?`1.5px solid ${st.color}`:"1.5px solid transparent" }}>{st.label}</div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <Modal title="Редактировать" onClose={()=>setEditing(false)}>
          <DealForm initial={deal} onSave={updated=>{ setData(d=>({ ...d, deals:d.deals.map(x=>x.id===dealId?{ ...x,...updated,id:dealId }:x) })); showToast("Сохранено"); setEditing(false); }} onClose={()=>setEditing(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ data, setData, showToast, user }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", email:"", type:"Физлицо", source:"Рекомендация" });
  const sf = (k,v) => setForm(p=>({ ...p, [k]:v }));
  const isDirector = user.role==="director";

  return (
    <div style={{ padding:"0 16px 16px" }}>
      {data.clients.map(c=>(
        <div key={c.id} style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <Avatar name={c.name} size={40}/>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a" }}>{c.name}</div>
              <div style={{ fontSize:12, color:"#aaa" }}>{c.source} · {c.type}</div>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
            <a href={`tel:${c.phone}`} style={{ color:"#C9956A", textDecoration:"none", fontWeight:600 }}>{c.phone}</a>
            {isDirector && <div style={{ color:c.totalAmount>0?"#C9956A":"#bbb", fontWeight:700 }}>{fmt(c.totalAmount)}</div>}
          </div>
        </div>
      ))}
      {isDirector && <Btn onClick={()=>setShowAdd(true)} style={{ width:"100%", marginTop:6 }}>+ Новый клиент</Btn>}
      {showAdd && (
        <Modal title="Новый клиент" onClose={()=>setShowAdd(false)}>
          <Field label="Имя / Компания"><Input value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="Иванов А.Р."/></Field>
          <Field label="Телефон"><Input value={form.phone} onChange={e=>sf("phone",e.target.value)} placeholder="+7 700 000 0000"/></Field>
          <Field label="Email"><Input value={form.email} onChange={e=>sf("email",e.target.value)} placeholder="email@mail.ru"/></Field>
          <Field label="Тип"><Select value={form.type} onChange={e=>sf("type",e.target.value)} options={["Физлицо","Юрлицо"]}/></Field>
          <Field label="Источник"><Select value={form.source} onChange={e=>sf("source",e.target.value)} options={["Рекомендация","Instagram","2ГИС","Тендер","Сайт","Другое"]}/></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Отмена</Btn>
            <Btn onClick={()=>{ setData(d=>({ ...d, clients:[...d.clients,{ ...form, id:Date.now(), dealsCount:0, totalAmount:0 }] })); showToast("Клиент добавлен"); setShowAdd(false); }}>Сохранить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({ data, setData, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ text:"", dueDate:TODAY, priority:"normal" });
  const sf = (k,v) => setForm(p=>({ ...p, [k]:v }));
  const [filter, setFilter] = useState("active");
  const filtered = data.tasks.filter(t=>filter==="active"?!t.done:filter==="done"?t.done:true);
  const toggle = id => setData(d=>({ ...d, tasks:d.tasks.map(t=>t.id===id?{ ...t, done:!t.done }:t) }));
  const remove = id => { setData(d=>({ ...d, tasks:d.tasks.filter(t=>t.id!==id) })); showToast("Удалено"); };

  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[["active","Активные"],["done","Выполненные"],["all","Все"]].map(([k,l])=>(
          <div key={k} onClick={()=>setFilter(k)} style={{ padding:"6px 16px", borderRadius:100, fontSize:12, fontWeight:600, cursor:"pointer", background:filter===k?"#C9956A":"#f0ece6", color:filter===k?"#fff":"#666" }}>{l}</div>
        ))}
      </div>
      {filtered.length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#bbb", fontSize:14 }}>Задач нет ✓</div>}
      {filtered.map(t=>{
        const overdue=!t.done&&t.dueDate<TODAY;
        return (
          <div key={t.id} style={{ background:"#fff", borderRadius:14, border:"1px solid #ede9e3", padding:"14px 16px", marginBottom:10, borderLeft:`4px solid ${t.done?"#639922":t.priority==="high"?"#C9956A":overdue?"#E24B4A":"#ede9e3"}` }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <div onClick={()=>toggle(t.id)} style={{ width:22, height:22, borderRadius:6, border:`2px solid ${t.done?"#639922":"#ddd"}`, background:t.done?"#639922":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, cursor:"pointer" }}>
                {t.done&&<span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:t.done?"#bbb":"#1a1a1a", textDecoration:t.done?"line-through":"none", lineHeight:1.4 }}>{t.text}</div>
                <div style={{ fontSize:11, color:overdue?"#E24B4A":"#aaa", marginTop:4 }}>{t.dueDate}{overdue?" · Просрочено":""}{t.priority==="high"&&!t.done?" · Срочно":""}</div>
              </div>
              <div onClick={()=>remove(t.id)} style={{ color:"#ddd", fontSize:18, cursor:"pointer", paddingLeft:4 }}>×</div>
            </div>
          </div>
        );
      })}
      <Btn onClick={()=>setShowAdd(true)} style={{ width:"100%", marginTop:6 }}>+ Задача</Btn>
      {showAdd && (
        <Modal title="Новая задача" onClose={()=>setShowAdd(false)}>
          <Field label="Задача"><textarea value={form.text} onChange={e=>sf("text",e.target.value)} placeholder="Описание задачи..." style={{ width:"100%", padding:"11px 14px", border:"1px solid #e0ddd8", borderRadius:10, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", minHeight:80, resize:"vertical" }}/></Field>
          <Field label="Срок"><Input type="date" value={form.dueDate} onChange={e=>sf("dueDate",e.target.value)}/></Field>
          <Field label="Приоритет"><Select value={form.priority} onChange={e=>sf("priority",e.target.value)} options={[{ value:"normal", label:"Обычный" },{ value:"high", label:"Высокий" }]}/></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Отмена</Btn>
            <Btn onClick={()=>{ setData(d=>({ ...d, tasks:[...d.tasks,{ ...form, id:Date.now(), done:false }] })); showToast("Задача добавлена"); setShowAdd(false); }}>Добавить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────
const NAV = [
  { key:"dashboard", label:"Главная", icon:"⊞" },
  { key:"deals", label:"Сделки", icon:"💼" },
  { key:"clients", label:"Клиенты", icon:"👥" },
  { key:"tasks", label:"Задачи", icon:"✅" },
];
const PAGE_TITLES = { dashboard:"Дашборд", deals:"Сделки", clients:"Клиенты", tasks:"Задачи", "deal-detail":"Сделка" };

export default function App() {
  const [user, setUser] = useState(()=>loadAuth());
  const [data, setData] = useState(()=>loadData());
  const [page, setPage] = useState("dashboard");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(()=>{ saveData(data); },[data]);
  const showToast = useCallback(msg=>setToast(msg),[]);

  const handleAuth = (u) => { saveAuth(u); setUser(u); };
  const handleLogout = () => { clearAuth(); setUser(null); setPage("dashboard"); };

  if (!user) return <PinScreen onAuth={handleAuth}/>;

  const isDetail = page==="deal-detail";
  const navPage = isDetail?"deals":page;

  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100dvh", background:"#f5f4f1", display:"flex", flexDirection:"column", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {/* Top bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ede9e3", padding:"12px 16px 10px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 }}>
        {isDetail && <div onClick={()=>setPage("deals")} style={{ fontSize:20, cursor:"pointer", color:"#C9956A" }}>←</div>}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:17, fontWeight:700, color:"#1a1a1a" }}>{PAGE_TITLES[page]}</div>
          <div style={{ fontSize:11, color:"#bbb" }}>Avanterra · {user.label}</div>
        </div>
        <div onClick={handleLogout} style={{ width:32, height:32, borderRadius:"50%", background: user.role==="director"?"#C9956A":"#7F77DD", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0 }} title="Выйти">
          {user.name.slice(0,2).toUpperCase()}
        </div>
      </div>

      {/* Role banner for staff */}
      {user.role==="staff" && (
        <div style={{ background:"#EEEDFE", padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#534AB7", fontWeight:500 }}>👷 Режим сотрудника — просмотр и задачи</span>
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", paddingTop:16, paddingBottom:80 }}>
        {page==="dashboard" && <Dashboard data={data} setPage={setPage} setSelectedDeal={setSelectedDeal} user={user}/>}
        {page==="deals" && <DealsList data={data} setPage={setPage} setSelectedDeal={setSelectedDeal} setData={setData} showToast={showToast} user={user}/>}
        {page==="deal-detail" && <DealDetail data={data} dealId={selectedDeal} setPage={setPage} setData={setData} showToast={showToast} user={user}/>}
        {page==="clients" && <Clients data={data} setData={setData} showToast={showToast} user={user}/>}
        {page==="tasks" && <Tasks data={data} setData={setData} showToast={showToast}/>}
      </div>

      {!isDetail && (
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#fff", borderTop:"1px solid #ede9e3", display:"flex", zIndex:10 }}>
          {NAV.map(n=>(
            <div key={n.key} onClick={()=>setPage(n.key)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 0 14px", cursor:"pointer", borderTop:`2px solid ${navPage===n.key?"#C9956A":"transparent"}` }}>
              <div style={{ fontSize:20, lineHeight:1, marginBottom:3 }}>{n.icon}</div>
              <div style={{ fontSize:10, fontWeight:600, color:navPage===n.key?"#C9956A":"#aaa" }}>{n.label}</div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
