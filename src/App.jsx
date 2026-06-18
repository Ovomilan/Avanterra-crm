import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "avanterra_crm_v2";
const AUTH_KEY = "avanterra_auth_v2";

const PINS = {
  "196547": { role: "director", name: "Милан", label: "Директор" },
  "172548": { role: "staff", name: "Сотрудник", label: "Сотрудник" },
};

// task.status: "active" | "pending" | "done"
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
    { id: 1, text: "Отправить смету — Иванов А.Р.", dueDate: "2026-06-19", priority: "high", status: "active" },
    { id: 2, text: "Согласовать материалы (Керимов)", dueDate: "2026-06-18", priority: "high", status: "active" },
    { id: 3, text: "Замер — ЖК Нурлы Жол, кв. 214", dueDate: "2026-06-19", priority: "normal", status: "active" },
    { id: 4, text: "Акт приёмки — объект Сейткали", dueDate: "2026-06-20", priority: "normal", status: "done" },
    { id: 5, text: "Финальный расчёт с ТОО BuildCom", dueDate: "2026-06-25", priority: "normal", status: "active" },
  ],
};

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return initialData;
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }
function loadAuth() { try { const r = sessionStorage.getItem(AUTH_KEY); if (r) return JSON.parse(r); } catch {} return null; }
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
const ini = name => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const TODAY = "2026-06-19";

// ── UI ATOMS ─────────────────────────────────────────────────────────────────
function Badge({ stageKey }) {
  const s = stageMap[stageKey] || stageMap.measure;
  return <span style={{ display:"inline-flex", fontSize:11, padding:"3px 9px", borderRadius:100, fontWeight:600, background:s.bg, color:s.text, whiteSpace:"nowrap" }}>{s.label}</span>;
}
function Avatar({ name, size=36, color="#C9956A" }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:color+"22", color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.33, fontWeight:700, flexShrink:0 }}>{ini(name)}</div>;
}
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2200); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"#1a1a1a", color:"#fff", padding:"11px 20px", borderRadius:12, fontSize:13, zIndex:999, whiteSpace:"nowrap" }}>{msg}</div>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"90vh", overflowY:"auto", padding:"24px 20px 44px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#1a1a1a" }}>{title}</div>
          <button onClick={onClose} style={{ background:"#f0ece6", border:"none", borderRadius:"50%", width:30, height:30, fontSize:18, cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return <div style={{ marginBottom:14 }}><div style={{ fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>{label}</div>{children}</div>;
}
function FInput({ value, onChange, placeholder, type="text" }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"11px 14px", border:"1px solid #e0ddd8", borderRadius:10, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />;
}
function FSelect({ value, onChange, options }) {
  return <select value={value} onChange={onChange} style={{ width:"100%", padding:"11px 14px", border:"1px solid #e0ddd8", borderRadius:10, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", background:"#fff" }}>{options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>;
}
function Btn({ children, onClick, variant="primary", style={} }) {
  const v = { primary:{background:"#C9956A",color:"#fff"}, outline:{background:"transparent",color:"#C9956A",border:"1px solid #C9956A"}, ghost:{background:"#f5f3ef",color:"#666"}, danger:{background:"#ffeaea",color:"#c73534"}, success:{background:"#eaf3de",color:"#3B6D11"} };
  return <button onClick={onClick} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"13px 20px",borderRadius:12,fontSize:15,fontWeight:600,cursor:"pointer",border:"none",fontFamily:"inherit",...v[variant],...style }}>{children}</button>;
}

// ── PIN SCREEN ───────────────────────────────────────────────────────────────
function PinScreen({ onAuth }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = d => {
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 6) {
      setTimeout(() => {
        if (PINS[next]) { onAuth(PINS[next]); }
        else { setShake(true); setError(true); setTimeout(()=>{ setPin(""); setShake(false); }, 600); }
      }, 100);
    }
  };
  const handleDel = () => { setPin(p=>p.slice(0,-1)); setError(false); };
  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div style={{ minHeight:"100dvh", background:"#f5f4f1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ marginBottom:40, textAlign:"center" }}>
        <div style={{ width:68, height:68, borderRadius:20, background:"#C9956A", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:32 }}>🏠</div>
        <div style={{ fontSize:22, fontWeight:700, color:"#1a1a1a", letterSpacing:"0.06em" }}>AVANTERRA</div>
        <div style={{ fontSize:13, color:"#aaa", marginTop:5 }}>Введите PIN-код для входа</div>
      </div>
      <div style={{ display:"flex", gap:16, marginBottom:44, animation:shake?"shake 0.4s ease":"none" }}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{ width:14, height:14, borderRadius:"50%", background:i<pin.length?(error?"#E24B4A":"#C9956A"):"#ddd", transition:"background 0.15s" }}/>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 72px)", gap:14 }}>
        {digits.map((d,i)=>(
          <button key={i} onClick={()=>d==="⌫"?handleDel():d?handleDigit(d):null}
            style={{ width:72, height:72, borderRadius:"50%", border:"none", background:d?"#fff":"transparent", fontSize:d==="⌫"?22:26, fontWeight:600, color:"#1a1a1a", cursor:d?"pointer":"default", boxShadow:d?"0 1px 4px rgba(0,0,0,0.09)":"none", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {d}
          </button>
        ))}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

// ── DEAL FORM ────────────────────────────────────────────────────────────────
function DealForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial||{client:"",title:"",area:"",address:"",phone:"",stage:"measure",amount:"",note:"",createdAt:TODAY});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return (
    <>
      <Field label="Клиент"><FInput value={f.client} onChange={e=>s("client",e.target.value)} placeholder="Иванов А.Р."/></Field>
      <Field label="Телефон"><FInput value={f.phone} onChange={e=>s("phone",e.target.value)} placeholder="+7 700 000 0000"/></Field>
      <Field label="Название сделки"><FInput value={f.title} onChange={e=>s("title",e.target.value)} placeholder="Ремонт 2-комн под ключ"/></Field>
      <Field label="Адрес"><FInput value={f.address} onChange={e=>s("address",e.target.value)} placeholder="ЖК Нурлы Жол, кв. 45"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Площадь, м²"><FInput type="number" value={f.area} onChange={e=>s("area",e.target.value)} placeholder="75"/></Field>
        <Field label="Сумма, ₸"><FInput type="number" value={f.amount} onChange={e=>s("amount",e.target.value)} placeholder="0"/></Field>
      </div>
      <Field label="Стадия"><FSelect value={f.stage} onChange={e=>s("stage",e.target.value)} options={STAGES.map(st=>({value:st.key,label:st.label}))}/></Field>
      <Field label="Заметки"><textarea value={f.note} onChange={e=>s("note",e.target.value)} placeholder="Доп. информация..." style={{width:"100%",padding:"11px 14px",border:"1px solid #e0ddd8",borderRadius:10,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",minHeight:80,resize:"vertical"}}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn onClick={()=>onSave({...f,area:Number(f.area)||0,amount:Number(f.amount)||0})}>Сохранить</Btn>
      </div>
    </>
  );
}

// ── TASK FORM ────────────────────────────────────────────────────────────────
function TaskForm({ onSave, onClose }) {
  const [f, setF] = useState({text:"",dueDate:TODAY,priority:"normal"});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return (
    <>
      <Field label="Задача"><textarea value={f.text} onChange={e=>s("text",e.target.value)} placeholder="Описание задачи..." style={{width:"100%",padding:"11px 14px",border:"1px solid #e0ddd8",borderRadius:10,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",minHeight:80,resize:"vertical"}}/></Field>
      <Field label="Срок"><FInput type="date" value={f.dueDate} onChange={e=>s("dueDate",e.target.value)}/></Field>
      <Field label="Приоритет"><FSelect value={f.priority} onChange={e=>s("priority",e.target.value)} options={[{value:"normal",label:"Обычный"},{value:"high",label:"Высокий"}]}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn onClick={()=>onSave({...f,id:Date.now(),status:"active"})}>Добавить</Btn>
      </div>
    </>
  );
}

// ── KPI GRID ──────────────────────────────────────────────────────────────────
function KpiGrid({ isDir, data, active, pending, activeTasks }) {
  const kpis = isDir ? [
    {label:"Активные сделки", value:active.length, sub:"объектов"},
    {label:"Объём в работе", value:fmtM(active.reduce((s,d)=>s+d.amount,0)), sub:"суммарно"},
    {label:"Сдано", value:data.deals.filter(d=>d.stage==="done").length, sub:"закрыто"},
    {label:"Ждут подтверждения", value:pending, sub:"задач", warn:pending>0},
  ] : [
    {label:"Активные сделки", value:active.length, sub:"объектов"},
    {label:"Моих задач", value:activeTasks, sub:"активных"},
    {label:"Выполнено", value:data.tasks.filter(t=>t.status==="done").length, sub:"задач"},
    {label:"На проверке", value:pending, sub:"задач", info:true},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
      {kpis.map((k,i)=>(
        <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px 16px",border:`1px solid ${k.warn?"#FFB74D":"#ede9e3"}`}}>
          <div style={{fontSize:11,color:"#aaa",marginBottom:6}}>{k.label}</div>
          <div style={{fontSize:20,fontWeight:700,color:k.warn?"#E65100":k.info?"#7F77DD":"#1a1a1a"}}>{k.value}</div>
          <div style={{fontSize:11,color:"#bbb",marginTop:3}}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ data, setPage, setSelectedDeal, user }) {
  const isDir = user.role==="director";
  const active = data.deals.filter(d=>d.stage!=="done");
  const pending = data.tasks.filter(t=>t.status==="pending").length;
  const activeTasks = data.tasks.filter(t=>t.status==="active").length;

  return (
    <div style={{padding:"0 16px 16px"}}>
      {/* Pending alert for director */}
      {isDir && pending>0 && (
        <div onClick={()=>setPage("tasks")} style={{background:"#FFF3E0",border:"1px solid #FFB74D",borderRadius:14,padding:"14px 16px",marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:24}}>🔔</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#E65100"}}>{pending} {pending===1?"задача требует":"задач требуют"} подтверждения</div>
            <div style={{fontSize:12,color:"#F57C00",marginTop:2}}>Сотрудник отметил выполнение → нажми для проверки</div>
          </div>
        </div>
      )}

      <KpiGrid isDir={isDir} data={data} active={active} pending={pending} activeTasks={activeTasks}/>

      {isDir && (
        <div style={{background:"#fff",borderRadius:14,padding:16,border:"1px solid #ede9e3",marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a",marginBottom:12}}>Воронка</div>
          {STAGES.map(s=>{
            const cnt=data.deals.filter(d=>d.stage===s.key).length;
            const pct=Math.round((cnt/(data.deals.length||1))*100);
            return (
              <div key={s.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                <div style={{fontSize:12,color:"#666",width:70,flexShrink:0}}>{s.label}</div>
                <div style={{flex:1,height:5,background:"#f0ece6",borderRadius:3,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:s.color,borderRadius:3}}/></div>
                <div style={{fontSize:12,fontWeight:700,color:"#1a1a1a",width:18,textAlign:"right"}}>{cnt}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"14px 16px",borderBottom:"1px solid #f0ece6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,fontWeight:700}}>Сделки</div>
          <div style={{fontSize:12,color:"#C9956A",cursor:"pointer"}} onClick={()=>setPage("deals")}>Все →</div>
        </div>
        {data.deals.slice(0,4).map(d=>(
          <div key={d.id} onClick={()=>{setSelectedDeal(d.id);setPage("deal-detail");}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid #f9f7f4",cursor:"pointer"}}>
            <Avatar name={d.client} size={34}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.title}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{d.client}</div>
            </div>
            <Badge stageKey={d.stage}/>
          </div>
        ))}
      </div>

      <div style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",overflow:"hidden"}}>
        <div style={{padding:"14px 16px",borderBottom:"1px solid #f0ece6",display:"flex",justifyContent:"space-between"}}>
          <div style={{fontSize:13,fontWeight:700}}>Задачи</div>
          <div style={{fontSize:12,color:"#C9956A",cursor:"pointer"}} onClick={()=>setPage("tasks")}>Все →</div>
        </div>
        {data.tasks.filter(t=>t.status!=="done").slice(0,4).map(t=>{
          const overdue=t.dueDate<TODAY&&t.status==="active";
          const isPending=t.status==="pending";
          return (
            <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 16px",borderBottom:"1px solid #f9f7f4",borderLeft:`3px solid ${isPending?"#FF9800":t.priority==="high"?"#C9956A":overdue?"#E24B4A":"transparent"}`,background:isPending?"#FFFDE7":"transparent"}}>
              <div style={{width:18,height:18,border:`1.5px solid ${isPending?"#FF9800":"#ddd"}`,borderRadius:4,flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {isPending&&<span style={{fontSize:10}}>⏳</span>}
              </div>
              <div>
                <div style={{fontSize:13,color:"#1a1a1a"}}>{t.text}</div>
                <div style={{fontSize:11,color:isPending?"#F57C00":overdue?"#E24B4A":"#aaa",marginTop:2}}>
                  {isPending?"Ожидает подтверждения":t.dueDate+(overdue?" · Просрочено":"")}
                </div>
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
  const isDir = user.role==="director";
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const filtered = data.deals.filter(d=>filter==="all"||d.stage===filter);

  return (
    <div style={{padding:"0 16px 16px"}}>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
        {[{key:"all",label:`Все (${data.deals.length})`},...STAGES.map(s=>({key:s.key,label:`${s.label} ${data.deals.filter(d=>d.stage===s.key).length}`}))].map(f=>(
          <div key={f.key} onClick={()=>setFilter(f.key)} style={{flexShrink:0,padding:"6px 14px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:filter===f.key?"#C9956A":"#f0ece6",color:filter===f.key?"#fff":"#666"}}>{f.label}</div>
        ))}
      </div>
      {filtered.map(d=>(
        <div key={d.id} onClick={()=>{setSelectedDeal(d.id);setPage("deal-detail");}} style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",padding:"14px 16px",marginBottom:10,cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:600,color:"#1a1a1a",lineHeight:1.4,flex:1}}>{d.title}</div>
            <Badge stageKey={d.stage}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Avatar name={d.client} size={24}/>
              <span style={{fontSize:12,color:"#888"}}>{d.client}</span>
            </div>
            {isDir && <div style={{fontSize:13,fontWeight:700,color:d.amount>0?"#C9956A":"#bbb"}}>{fmt(d.amount)}</div>}
          </div>
        </div>
      ))}
      {isDir && <Btn onClick={()=>setShowAdd(true)} style={{width:"100%",marginTop:6}}>+ Новая сделка</Btn>}
      {showAdd && (
        <Modal title="Новая сделка" onClose={()=>setShowAdd(false)}>
          <DealForm onSave={deal=>{setData(d=>({...d,deals:[...d.deals,{...deal,id:Date.now()}]}));showToast("Сделка добавлена");setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ── DEAL DETAIL ──────────────────────────────────────────────────────────────
function DealDetail({ data, dealId, setPage, setData, showToast, user }) {
  const deal = data.deals.find(d=>d.id===dealId);
  const [editing, setEditing] = useState(false);
  const isDir = user.role==="director";
  if (!deal) return <div style={{padding:24,color:"#aaa",textAlign:"center"}}>Не найдено</div>;

  return (
    <div style={{padding:"0 16px 24px"}}>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",padding:"18px 16px",marginBottom:12}}>
        <div style={{marginBottom:10}}><Badge stageKey={deal.stage}/></div>
        <div style={{fontSize:16,fontWeight:700,color:"#1a1a1a",lineHeight:1.4,marginBottom:6}}>{deal.title}</div>
        {isDir && <div style={{fontSize:22,fontWeight:700,color:"#C9956A"}}>{fmt(deal.amount)}</div>}
      </div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",padding:16,marginBottom:12}}>
        {[
          {label:"Клиент",value:deal.client},
          {label:"Телефон",value:deal.phone||"—"},
          {label:"Адрес",value:deal.address},
          {label:"Площадь",value:deal.area+" м²"},
          ...(isDir?[{label:"Создана",value:deal.createdAt}]:[]),
        ].map(row=>(
          <div key={row.label} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f3ef"}}>
            <div style={{fontSize:13,color:"#aaa"}}>{row.label}</div>
            <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",textAlign:"right",maxWidth:"60%"}}>{row.value}</div>
          </div>
        ))}
      </div>
      {deal.note && (
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",padding:16,marginBottom:12}}>
          <div style={{fontSize:11,color:"#aaa",marginBottom:6,textTransform:"uppercase",fontWeight:600,letterSpacing:"0.05em"}}>Заметки</div>
          <div style={{fontSize:14,color:"#444",lineHeight:1.6}}>{deal.note}</div>
        </div>
      )}
      {isDir && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <Btn variant="outline" onClick={()=>setEditing(true)}>Редактировать</Btn>
            <Btn variant="danger" onClick={()=>{setData(d=>({...d,deals:d.deals.filter(x=>x.id!==dealId)}));showToast("Сделка удалена");setPage("deals");}}>Удалить</Btn>
          </div>
          <div style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",padding:16}}>
            <div style={{fontSize:12,color:"#aaa",marginBottom:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Изменить стадию</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {STAGES.map(st=>(
                <div key={st.key} onClick={()=>{setData(d=>({...d,deals:d.deals.map(x=>x.id===dealId?{...x,stage:st.key}:x)}));showToast("Стадия обновлена");}} style={{padding:"7px 14px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:deal.stage===st.key?st.bg:"#f5f3ef",color:deal.stage===st.key?st.text:"#888",border:deal.stage===st.key?`1.5px solid ${st.color}`:"1.5px solid transparent"}}>{st.label}</div>
              ))}
            </div>
          </div>
        </>
      )}
      {editing && (
        <Modal title="Редактировать" onClose={()=>setEditing(false)}>
          <DealForm initial={deal} onSave={u=>{setData(d=>({...d,deals:d.deals.map(x=>x.id===dealId?{...x,...u,id:dealId}:x)}));showToast("Сохранено");setEditing(false);}} onClose={()=>setEditing(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
function Tasks({ data, setData, showToast, user }) {
  const isDir = user.role==="director";
  const [filter, setFilter] = useState(isDir?"pending":"active");
  const [showAdd, setShowAdd] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  // Staff: marks task as "pending" (needs director confirmation)
  const staffToggle = id => {
    const task = data.tasks.find(t=>t.id===id);
    if (!task) return;
    if (task.status==="active") {
      setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,status:"pending"}:t)}));
      showToast("Отправлено на подтверждение");
    } else if (task.status==="pending") {
      setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,status:"active"}:t)}));
      showToast("Отменено");
    }
  };

  // Director: confirm or reject
  const confirm = id => { setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,status:"done"}:t)})); showToast("✅ Подтверждено"); setConfirmId(null); };
  const reject = id => { setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,status:"active"}:t)})); showToast("↩️ Возвращено"); setConfirmId(null); };
  const remove = id => { setData(d=>({...d,tasks:d.tasks.filter(t=>t.id!==id)})); showToast("Удалено"); };

  const tabs = isDir
    ? [["pending","На проверке"],["active","Активные"],["done","Выполненные"],["all","Все"]]
    : [["active","Мои задачи"],["pending","На проверке"],["done","Выполненные"]];

  const filtered = data.tasks.filter(t=>filter==="all"?true:t.status===filter);

  const pendingCount = data.tasks.filter(t=>t.status==="pending").length;

  return (
    <div style={{padding:"0 16px 16px"}}>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
        {tabs.map(([k,l])=>{
          const cnt = k==="pending"?pendingCount:null;
          return (
            <div key={k} onClick={()=>setFilter(k)} style={{flexShrink:0,padding:"6px 16px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:filter===k?(k==="pending"?"#FF9800":"#C9956A"):"#f0ece6",color:filter===k?"#fff":"#666",display:"flex",gap:5,alignItems:"center"}}>
              {l}{cnt>0&&<span style={{background:"rgba(255,255,255,0.3)",borderRadius:100,padding:"0 5px",fontSize:11}}>{cnt}</span>}
            </div>
          );
        })}
      </div>

      {/* Pending banner for director */}
      {isDir && filter==="pending" && pendingCount>0 && (
        <div style={{background:"#FFF3E0",border:"1px solid #FFB74D",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#E65100"}}>
          🔔 Сотрудник отметил {pendingCount} {pendingCount===1?"задачу":"задач"} как выполненные — подтверди или верни обратно
        </div>
      )}

      {filtered.length===0 && (
        <div style={{textAlign:"center",padding:"40px 0",color:"#bbb",fontSize:14}}>
          {filter==="pending"?"Нет задач на проверке ✓":"Задач нет"}
        </div>
      )}

      {filtered.map(t=>{
        const overdue=t.dueDate<TODAY&&t.status==="active";
        const isPending=t.status==="pending";
        const isDone=t.status==="done";

        return (
          <div key={t.id} style={{background:isPending?"#FFFDE7":"#fff",borderRadius:14,border:`1px solid ${isPending?"#FFB74D":"#ede9e3"}`,padding:"14px 16px",marginBottom:10,borderLeft:`4px solid ${isDone?"#639922":isPending?"#FF9800":t.priority==="high"?"#C9956A":overdue?"#E24B4A":"#ede9e3"}`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>

              {/* Checkbox — staff only, for active/pending */}
              {!isDir && (
                <div onClick={()=>!isDone&&staffToggle(t.id)} style={{width:24,height:24,borderRadius:7,border:`2px solid ${isDone?"#639922":isPending?"#FF9800":"#ddd"}`,background:isDone?"#639922":isPending?"#FFF3E0":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,cursor:isDone?"default":"pointer"}}>
                  {isDone&&<span style={{color:"#fff",fontSize:13,fontWeight:700}}>✓</span>}
                  {isPending&&<span style={{fontSize:12}}>⏳</span>}
                </div>
              )}

              {/* Status icon for director */}
              {isDir && (
                <div style={{width:24,height:24,borderRadius:7,border:`2px solid ${isDone?"#639922":isPending?"#FF9800":"#ddd"}`,background:isDone?"#639922":isPending?"#FFF3E0":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  {isDone&&<span style={{color:"#fff",fontSize:13,fontWeight:700}}>✓</span>}
                  {isPending&&<span style={{fontSize:12}}>⏳</span>}
                </div>
              )}

              <div style={{flex:1}}>
                <div style={{fontSize:14,color:isDone?"#bbb":"#1a1a1a",textDecoration:isDone?"line-through":"none",lineHeight:1.4}}>{t.text}</div>
                <div style={{fontSize:11,marginTop:4,color:isPending?"#F57C00":overdue?"#E24B4A":isDone?"#639922":"#aaa"}}>
                  {isDone?"Выполнено ✓":isPending?"Ожидает подтверждения руководства":t.dueDate+(overdue?" · Просрочено":"")}
                  {!isDone&&!isPending&&t.priority==="high"?" · Срочно":""}
                </div>
              </div>

              {/* Director actions */}
              {isDir && (
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {isPending && (
                    <>
                      <button onClick={()=>confirm(t.id)} style={{background:"#eaf3de",color:"#3B6D11",border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✓ Да</button>
                      <button onClick={()=>reject(t.id)} style={{background:"#ffeaea",color:"#c73534",border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>↩ Нет</button>
                    </>
                  )}
                  {!isPending && <div onClick={()=>remove(t.id)} style={{color:"#ddd",fontSize:18,cursor:"pointer",padding:"0 4px"}}>×</div>}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isDir && (
        <Btn onClick={()=>setShowAdd(true)} style={{width:"100%",marginTop:6}}>+ Новая задача</Btn>
      )}

      {showAdd && (
        <Modal title="Новая задача" onClose={()=>setShowAdd(false)}>
          <TaskForm onSave={t=>{setData(d=>({...d,tasks:[...d.tasks,t]}));showToast("Задача добавлена");setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ data, setData, showToast, user }) {
  const isDir = user.role==="director";
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({name:"",phone:"",email:"",type:"Физлицо",source:"Рекомендация"});
  const sf=(k,v)=>setForm(p=>({...p,[k]:v}));

  return (
    <div style={{padding:"0 16px 16px"}}>
      {data.clients.map(c=>(
        <div key={c.id} style={{background:"#fff",borderRadius:14,border:"1px solid #ede9e3",padding:"14px 16px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <Avatar name={c.name} size={40}/>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#1a1a1a"}}>{c.name}</div>
              <div style={{fontSize:12,color:"#aaa"}}>{c.source} · {c.type}</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
            <a href={`tel:${c.phone}`} style={{color:"#C9956A",textDecoration:"none",fontWeight:600}}>{c.phone}</a>
            {isDir && <div style={{color:c.totalAmount>0?"#C9956A":"#bbb",fontWeight:700}}>{fmt(c.totalAmount)}</div>}
          </div>
        </div>
      ))}
      {isDir && <Btn onClick={()=>setShowAdd(true)} style={{width:"100%",marginTop:6}}>+ Новый клиент</Btn>}
      {showAdd && (
        <Modal title="Новый клиент" onClose={()=>setShowAdd(false)}>
          <Field label="Имя / Компания"><FInput value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="Иванов А.Р."/></Field>
          <Field label="Телефон"><FInput value={form.phone} onChange={e=>sf("phone",e.target.value)} placeholder="+7 700 000 0000"/></Field>
          <Field label="Email"><FInput value={form.email} onChange={e=>sf("email",e.target.value)} placeholder="email@mail.ru"/></Field>
          <Field label="Тип"><FSelect value={form.type} onChange={e=>sf("type",e.target.value)} options={["Физлицо","Юрлицо"]}/></Field>
          <Field label="Источник"><FSelect value={form.source} onChange={e=>sf("source",e.target.value)} options={["Рекомендация","Instagram","2ГИС","Тендер","Сайт","Другое"]}/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
            <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Отмена</Btn>
            <Btn onClick={()=>{setData(d=>({...d,clients:[...d.clients,{...form,id:Date.now(),dealsCount:0,totalAmount:0}]}));showToast("Клиент добавлен");setShowAdd(false);}}>Сохранить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────
const PAGE_TITLES = {dashboard:"Дашборд",deals:"Сделки",clients:"Клиенты",tasks:"Задачи","deal-detail":"Сделка"};

export default function App() {
  const [user, setUser] = useState(()=>loadAuth());
  const [data, setData] = useState(()=>loadData());
  const [page, setPage] = useState("dashboard");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(()=>{ saveData(data); },[data]);
  const showToast = useCallback(msg=>setToast(msg),[]);
  const handleAuth = u => { saveAuth(u); setUser(u); };
  const handleLogout = () => { clearAuth(); setUser(null); setPage("dashboard"); };

  if (!user) return <PinScreen onAuth={handleAuth}/>;

  const isDetail = page==="deal-detail";
  const navPage = isDetail?"deals":page;
  const isDir = user.role==="director";
  const pendingCount = data.tasks.filter(t=>t.status==="pending").length;

  const NAV = [
    {key:"dashboard",label:"Главная",icon:"⊞"},
    {key:"deals",label:"Сделки",icon:"💼"},
    ...(isDir?[{key:"clients",label:"Клиенты",icon:"👥"}]:[]),
    {key:"tasks",label:"Задачи",icon:"✅",badge:isDir&&pendingCount>0?pendingCount:null},
  ];

  return (
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100dvh",background:"#f5f4f1",display:"flex",flexDirection:"column",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #ede9e3",padding:"12px 16px 10px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        {isDetail && <div onClick={()=>setPage("deals")} style={{fontSize:20,cursor:"pointer",color:"#C9956A"}}>←</div>}
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:700,color:"#1a1a1a"}}>{PAGE_TITLES[page]}</div>
          <div style={{fontSize:11,color:"#bbb"}}>Avanterra · {user.label}</div>
        </div>
        <div onClick={handleLogout} style={{width:32,height:32,borderRadius:"50%",background:isDir?"#C9956A":"#7F77DD",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}} title="Выйти">
          {isDir?"МГ":"СТ"}
        </div>
      </div>

      {!isDir && (
        <div style={{background:"#EEEDFE",padding:"7px 16px",fontSize:12,color:"#534AB7",fontWeight:500}}>
          👷 Режим просмотра — только задачи доступны для изменений
        </div>
      )}

      <div style={{flex:1,overflowY:"auto",paddingTop:16,paddingBottom:80}}>
        {page==="dashboard" && <Dashboard data={data} setPage={setPage} setSelectedDeal={setSelectedDeal} user={user}/>}
        {page==="deals" && <DealsList data={data} setPage={setPage} setSelectedDeal={setSelectedDeal} setData={setData} showToast={showToast} user={user}/>}
        {page==="deal-detail" && <DealDetail data={data} dealId={selectedDeal} setPage={setPage} setData={setData} showToast={showToast} user={user}/>}
        {page==="clients" && isDir && <Clients data={data} setData={setData} showToast={showToast} user={user}/>}
        {page==="tasks" && <Tasks data={data} setData={setData} showToast={showToast} user={user}/>}
      </div>

      {!isDetail && (
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #ede9e3",display:"flex",zIndex:10}}>
          {NAV.map(n=>(
            <div key={n.key} onClick={()=>setPage(n.key)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0 14px",cursor:"pointer",borderTop:`2px solid ${navPage===n.key?"#C9956A":"transparent"}`,position:"relative"}}>
              <div style={{fontSize:20,lineHeight:1,marginBottom:3}}>{n.icon}</div>
              <div style={{fontSize:10,fontWeight:600,color:navPage===n.key?"#C9956A":"#aaa"}}>{n.label}</div>
              {n.badge && <div style={{position:"absolute",top:6,right:"50%",transform:"translateX(10px)",background:"#E24B4A",color:"#fff",borderRadius:100,fontSize:9,fontWeight:700,padding:"1px 5px",minWidth:16,textAlign:"center"}}>{n.badge}</div>}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
