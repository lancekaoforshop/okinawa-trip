import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db = null;
try {
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {}

const DAY_CONFIGS = [
  { id:"day1", label:"D1", date:"5/20", weekday:"週三", title:"抵達日｜輕鬆模式", subtitle:"抵達後不安排景點，好好休息", emoji:"✈️", gradient:["#0077b6","#00b4d8"] },
  { id:"day2", label:"D2", date:"5/21", weekday:"週四", title:"北部景點日 🌊", subtitle:"古宇利島・鳳梨園・國際通夜市", emoji:"🌊", gradient:["#006d77","#83c5be"] },
  { id:"day3", label:"D3", date:"5/22", weekday:"週五", title:"還願＋市區＋伴手禮", subtitle:"首里還願・港川文青區・DMM水族館", emoji:"🙏", gradient:["#e76f51","#f4a261"] },
  { id:"day4", label:"D4", date:"5/23", weekday:"週六", title:"中部＋海中公園 🌊", subtitle:"部瀨名海中公園・美國村・蒸氣海鮮", emoji:"🌺", gradient:["#7209b7","#a663cc"] },
  { id:"day5", label:"D5", date:"5/24", weekday:"週日", title:"回程日 🏠", subtitle:"早起還車，準時出發回台灣", emoji:"🏠", gradient:["#c1121f","#e63946"] },
];

const INITIAL_ITEMS = {
  day1: [
    { id:"d1-1", time:"16:25 出發", title:"桃園機場T2 出發", desc:"BR186 長榮航空・請提早 2–3 小時報到", emoji:"✈️", booked:false, map:"" },
    { id:"d1-2", time:"18:55 抵達", title:"那霸機場 OKA 入境", desc:"入境、取行李", emoji:"🛬", booked:false, map:"" },
    { id:"d1-3", time:"抵達後", title:"取車（豐見城市米）", desc:"💴 現場支付日幣租車費", emoji:"🚗", booked:false, map:"" },
    { id:"d1-4", time:"晚餐", title:"機場附近 or LAWSON", desc:"抵達較晚，輕食解決即可", emoji:"🍽️", booked:false, map:"" },
    { id:"d1-5", time:"晚上", title:"回住宿（糸滿）休息", desc:"✔ 今天不排景點，好好睡一覺", emoji:"🏠", booked:false, map:"" },
  ],
  day2: [
    { id:"d2-1", time:"08:30", title:"出發北上", desc:"", emoji:"🚗", booked:false, map:"" },
    { id:"d2-2", time:"中途", title:"許田休息站", desc:"🍩 必買：炸魚糕、三矢沙翁（炸甜甜圈）非常出名！", emoji:"🛣️", booked:false, map:"" },
    { id:"d2-3", time:"10:30", title:"黑糖咖啡", desc:"", emoji:"☕", booked:false, map:"" },
    { id:"d2-4", time:"11:30", title:"古宇利島", desc:"看海＋拍照，超美的跨海大橋！", emoji:"🏝️", booked:false, map:"https://www.google.com/maps/search/古宇利島+沖縄" },
    { id:"d2-5", time:"13:00", title:"沖繩鳳梨園", desc:"", emoji:"🍍", booked:false, map:"https://www.google.com/maps/search/沖縄パイナップルパーク" },
    { id:"d2-6", time:"14:30", title:"燒肉五苑 名護店", desc:"", emoji:"🥩", booked:false, map:"https://www.google.com/maps/search/燒肉五苑+名護" },
    { id:"d2-7", time:"17:30–18:30", title:"傍晚回程", desc:"🛣️ 過路費來回約 ¥3,000（全車分攤）", emoji:"🚗", booked:false, map:"" },
    { id:"d2-8", time:"晚上", title:"國際通屋台村（夜市）", desc:"吃喝逛夜市，氣氛超棒！", emoji:"🍺", booked:false, map:"https://share.google/Pink9r2D2QnEXE5IE" },
  ],
  day3: [
    { id:"d3-1", time:"09:00", title:"泊港魚市場", desc:"新鮮海鮮，逛逛早市氣氛", emoji:"🐟", booked:false, map:"https://www.google.com/maps/search/泊港魚市場+那覇" },
    { id:"d3-2", time:"10:30", title:"琉貿百貨", desc:"買刮刮樂！海賊王刮刮樂 🏴‍☠️", emoji:"🎰", booked:false, map:"https://www.google.com/maps/search/琉貿百貨+那覇" },
    { id:"d3-3", time:"12:00 ⚠️ 重要", title:"首里達摩寺 還願 🙏", desc:"重要行程，不可跳過", emoji:"🏯", booked:false, map:"https://www.google.com/maps/search/首里達摩寺+那覇" },
    { id:"d3-4", time:"13:30", title:"港川外人住宅區", desc:"文青甜點咖啡＋拍照，超有氣氛的老洋房街區", emoji:"☕", booked:false, map:"https://www.google.com/maps/search/港川外人住宅区+浦添" },
    { id:"d3-5", time:"15:00", title:"DMM Kariyushi Aquarium", desc:"不想進去的人可逛旁邊百貨公司", emoji:"🐠", booked:false, map:"https://www.google.com/maps/search/DMM+Kariyushi+Aquarium+沖縄" },
    { id:"d3-6", time:"16:30 🔑 關鍵", title:"回飯店休息", desc:"晚上還有大餐，先儲備體力！", emoji:"🏨", booked:false, map:"" },
    { id:"d3-7", time:"18:45", title:"國際通 島豚屋", desc:"沖繩豬肉料理，飯後逛國際通買伴手禮 🛍️", emoji:"🍽️", booked:true, map:"https://share.google/Jv6Ax2WIPhN4jq2bV" },
  ],
  day4: [
    { id:"d4-1", time:"早餐", title:"LAWSON 便利商店", desc:"沖繩 LAWSON 飯糰、炸雞超好吃！", emoji:"🍙", booked:false, map:"" },
    { id:"d4-2", time:"上午", title:"部瀨名海中公園", desc:"海中觀景塔，從水中看珊瑚礁和魚群！", emoji:"🌊", booked:false, map:"https://www.google.com/maps/search/部瀬名海中公園+うるま市" },
    { id:"d4-3", time:"午餐", title:"浜の家海鮮料理", desc:"超新鮮海鮮，份量超大！", emoji:"🦐", booked:false, map:"https://www.google.com/maps/search/浜の家+沖縄+海鮮" },
    { id:"d4-4", time:"下午", title:"美國村 逛逛", desc:"逛逛走走 or 永旺超市吹冷氣 ❄️", emoji:"🛍️", booked:false, map:"https://www.google.com/maps/search/美国村+北谷町" },
    { id:"d4-5", time:"18:00", title:"美國村 蒸氣海鮮", desc:"6位・看煙火吃海鮮，超享受！\n⚠️ 備註：需要兒童座椅（已備註）", emoji:"🦞", booked:true, map:"" },
  ],
  day5: [
    { id:"d5-1", time:"07:00", title:"整理行李＋早起準備", desc:"", emoji:"⏰", booked:false, map:"" },
    { id:"d5-2", time:"07:00–07:30", title:"出發 → 還車（豐見城市米）", desc:"", emoji:"🚗", booked:false, map:"" },
    { id:"d5-3", time:"10:15 起飛", title:"那霸機場 OKA 出發", desc:"BR113 長榮航空・1小時40分鐘直飛", emoji:"✈️", booked:false, map:"" },
    { id:"d5-4", time:"10:55 抵達", title:"桃園機場T2 回家！🎉", desc:"平安回台灣", emoji:"🏠", booked:false, map:"" },
  ],
};

const EMOJIS = ["🍽️","🏖️","🏝️","☕","🛍️","🚗","🏯","🐟","🍍","🌊","🏨","🎰","⏰","🍺","🛣️","🏪","📸","🌺","🎡","🏄","🎁","🍜","🍣","🍦","🎶","🛒","🗺️","🍧","🎪","🦞","🦐","🥩","🛬","🏠","📍","🍙","🐠","☀️","🌙"];
const DOT_COLORS = {"🍽️":"#ffd6c0","🍜":"#ffd6c0","🍣":"#ffd6c0","🍦":"#fff3cd","🍺":"#fff3cd","🍍":"#fff3cd","🍙":"#fff3cd","🏖️":"#caf0f8","🌊":"#caf0f8","🏝️":"#caf0f8","🐟":"#caf0f8","🏄":"#caf0f8","🛬":"#caf0f8","🐠":"#caf0f8","☕":"#e9d8fd","🛍️":"#e9d8fd","🚗":"#ffd6c0","🛣️":"#fff3cd","⏰":"#fff3cd","🎰":"#fff3cd","🏯":"#ffd6c0","🥩":"#ffd6c0","🦞":"#ffd6c0","🦐":"#ffd6c0","🏨":"#d8f3dc","🌺":"#d8f3dc","🏠":"#d8f3dc","📍":"#f0f0f0","📸":"#caf0f8","🎶":"#e9d8fd","🛒":"#fff3cd","🗺️":"#caf0f8","☀️":"#fff3cd","🌙":"#e9d8fd"};

function genId() { return "i"+Date.now()+Math.random().toString(36).slice(2,5); }

// ── 確認儲存視窗 ──────────────────────────────────────────────────────────
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:"white",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"popIn 0.2s ease"}}>
        <div style={{fontSize:36,textAlign:"center",marginBottom:12}}>🔀</div>
        <div style={{fontSize:17,fontWeight:800,color:"#1a1a2e",textAlign:"center",marginBottom:8}}>確認儲存排序？</div>
        <div style={{fontSize:13,color:"#718096",textAlign:"center",lineHeight:1.6,marginBottom:24}}>
          儲存後所有人都會看到<br/>更新後的行程順序
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"13px",border:"1.5px solid #e2e8f0",background:"white",borderRadius:12,fontFamily:"'Noto Sans TC',sans-serif",fontSize:14,fontWeight:700,color:"#718096",cursor:"pointer"}}>
            取消
          </button>
          <button onClick={onConfirm} style={{flex:2,padding:"13px",background:"#0077b6",border:"none",borderRadius:12,fontFamily:"'Noto Sans TC',sans-serif",fontSize:14,fontWeight:700,color:"white",cursor:"pointer"}}>
            ✓ 確認儲存
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// ── Add Modal ─────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }) {
  const [time,setTime]=useState(""); const [title,setTitle]=useState(""); const [desc,setDesc]=useState("");
  const [mapUrl,setMapUrl]=useState(""); const [booked,setBooked]=useState(false); const [emoji,setEmoji]=useState("📍"); const [err,setErr]=useState(false);
  const ref=useRef();
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),300);},[]);
  function submit(){if(!title.trim()){setErr(true);ref.current?.focus();return;}onAdd({id:genId(),time:time.trim(),title:title.trim(),desc:desc.trim(),map:mapUrl.trim(),booked,emoji});onClose();}
  const inputStyle={width:"100%",padding:"11px 13px",border:"1.5px solid #e2e8f0",borderRadius:10,fontFamily:"'Noto Sans TC',sans-serif",fontSize:14,color:"#2d3748",background:"#fff8f0",outline:"none"};
  const labelStyle={display:"block",fontSize:11,fontWeight:700,color:"#718096",marginBottom:4,marginTop:13,textTransform:"uppercase",letterSpacing:"0.5px"};
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:"22px 22px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{width:40,height:4,background:"#ddd",borderRadius:4,margin:"0 auto 18px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:"#1a1a2e",marginBottom:16}}>✏️ 新增行程</div>
        <label style={labelStyle}>時間</label>
        <input style={inputStyle} value={time} onChange={e=>setTime(e.target.value)} placeholder="例如：14:00 或 下午"/>
        <label style={labelStyle}>標題 *</label>
        <input ref={ref} style={{...inputStyle,borderColor:err?"#f4845f":"#e2e8f0"}} value={title} onChange={e=>{setTitle(e.target.value);setErr(false);}} placeholder="例如：美麗海水族館"/>
        <label style={labelStyle}>說明（選填）</label>
        <textarea style={{...inputStyle,height:60,resize:"none"}} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="簡短描述或備注"/>
        <label style={labelStyle}>Google Maps 連結（選填）</label>
        <input type="url" style={inputStyle} value={mapUrl} onChange={e=>setMapUrl(e.target.value)} placeholder="https://maps.google.com/..."/>
        <label style={labelStyle}>Emoji 圖示</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {EMOJIS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:34,height:34,border:`1.5px solid ${emoji===e?"#0077b6":"#e2e8f0"}`,borderRadius:8,background:emoji===e?"#caf0f8":"white",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{e}</button>)}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16,paddingTop:14,borderTop:"1px solid #f0f0f0"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#2d3748"}}>已訂位 / 已預約</span>
          <div onClick={()=>setBooked(b=>!b)} style={{width:44,height:26,borderRadius:26,background:booked?"#2d6a4f":"#ddd",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:"white",position:"absolute",top:3,left:booked?21:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:13,border:"1.5px solid #e2e8f0",background:"white",borderRadius:12,fontFamily:"'Noto Sans TC',sans-serif",fontSize:14,fontWeight:700,color:"#718096",cursor:"pointer"}}>取消</button>
          <button onClick={submit} style={{flex:2,padding:13,background:"#0077b6",border:"none",borderRadius:12,fontFamily:"'Noto Sans TC',sans-serif",fontSize:14,fontWeight:700,color:"white",cursor:"pointer"}}>加入行程 ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── Timeline Item ─────────────────────────────────────────────────────────
function TlItem({item,onDelete,onDragStart,onDragOver,onDrop,onDragEnd,isDragging,isOver}){
  const bg=DOT_COLORS[item.emoji]||"#f0f0f0";
  return(
    <div
      draggable
      onDragStart={()=>onDragStart(item.id)}
      onDragOver={e=>{e.preventDefault();onDragOver(item.id);}}
      onDrop={()=>onDrop(item.id)}
      onDragEnd={onDragEnd}
      style={{
        display:"flex", alignItems:"stretch", gap:0, marginBottom:6,
        position:"relative", borderRadius:14,
        background: isOver ? "rgba(202,240,248,0.45)" : isDragging ? "rgba(0,0,0,0.03)" : "white",
        border: isOver ? "2px solid #00b4d8" : "2px solid transparent",
        boxShadow: isDragging ? "0 8px 24px rgba(0,119,182,0.18)" : "0 1px 6px rgba(0,0,0,0.06)",
        opacity: isDragging ? 0.5 : 1,
        transition:"box-shadow 0.15s, border 0.15s, opacity 0.15s",
        cursor:"grab",
        userSelect:"none",
      }}>

      {/* 左側 emoji dot（含 timeline line 對齊用 padding） */}
      <div style={{flexShrink:0,padding:"14px 0 14px 14px",display:"flex",alignItems:"flex-start",zIndex:1}}>
        <div style={{width:42,height:42,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>{item.emoji}</div>
      </div>

      {/* 主要內容 */}
      <div style={{flex:1,padding:"14px 8px 14px 12px",minWidth:0}}>
        {item.time&&<div style={{fontSize:12,color:"#718096",fontWeight:600,marginBottom:5}}>{item.time}</div>}
        <div style={{fontSize:16,fontWeight:700,color:"#1a1a2e",lineHeight:1.35}}>{item.title}</div>
        {item.booked&&<div style={{display:"inline-flex",alignItems:"center",gap:3,background:"#d8f3dc",color:"#2d6a4f",borderRadius:7,padding:"3px 9px",fontSize:12,fontWeight:700,marginTop:6}}>✅ 已訂位</div>}
        {item.desc&&<div style={{fontSize:13,color:"#4a5568",marginTop:7,lineHeight:1.65,whiteSpace:"pre-line"}}>{item.desc}</div>}
        <div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap"}}>
          {item.map&&<a href={item.map} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"inline-flex",alignItems:"center",gap:4,background:"#caf0f8",color:"#0077b6",borderRadius:7,padding:"5px 11px",fontSize:12,fontWeight:700,textDecoration:"none"}}>🗺️ Google Maps</a>}
          <button onClick={e=>{e.stopPropagation();onDelete(item.id);}} style={{display:"inline-flex",alignItems:"center",gap:3,background:"#fff0f0",color:"#c53030",border:"none",borderRadius:7,padding:"5px 11px",fontSize:12,fontWeight:700,cursor:"pointer"}}>🗑️ 刪除</button>
        </div>
      </div>

      {/* 右側拖拉把手 — 大面積、明顯 */}
      <div style={{
        flexShrink:0, width:36, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:4,
        borderLeft:"1px solid #f0f4f8", borderRadius:"0 12px 12px 0",
        background:"#fafbfc", cursor:"grab", padding:"0 4px",
      }}>
        {/* 六個點的 grip icon */}
        {[[0,1],[2,3],[4,5]].map((_,row)=>(
          <div key={row} style={{display:"flex",gap:4}}>
            {[0,1].map(col=>(
              <div key={col} style={{width:5,height:5,borderRadius:"50%",background:"#c0ccd8"}}/>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day View ──────────────────────────────────────────────────────────────
function DayView({ config, items, onAdd, onDelete, onReorder }) {
  const [showModal, setShowModal] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  // 拖拉中的暫存順序（尚未確認儲存）
  const [pendingItems, setPendingItems] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const originalItems = useRef(items);

  // 同步外部 items 到 originalItems（非拖拉期間）
  useEffect(() => {
    if (!dragId && !showConfirm) {
      originalItems.current = items;
      setPendingItems(null);
    }
  }, [items, dragId, showConfirm]);

  const displayItems = pendingItems || items;

  function handleDragStart(id) {
    setDragId(id);
    originalItems.current = items;
  }

  function handleDragOver(id) {
    if (!dragId || id === dragId) return;
    setOverId(id);
    // 即時預覽排序（視覺上移動，但還沒儲存）
    const arr = [...displayItems];
    const from = arr.findIndex(i => i.id === dragId);
    const to = arr.findIndex(i => i.id === id);
    if (from === -1 || to === -1) return;
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setPendingItems(arr);
  }

  function handleDrop(targetId) {
    setOverId(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setOverId(null);
    // 如果順序有變動，跳出確認視窗
    if (pendingItems) {
      const changed = pendingItems.some((item, i) => item.id !== originalItems.current[i]?.id);
      if (changed) {
        setShowConfirm(true);
      } else {
        setPendingItems(null);
      }
    }
  }

  function handleConfirm() {
    if (pendingItems) onReorder(config.id, pendingItems);
    setPendingItems(null);
    setShowConfirm(false);
  }

  function handleCancel() {
    setPendingItems(null);
    setShowConfirm(false);
  }

  const [g1, g2] = config.gradient;
  return (
    <div>
      {showConfirm && <ConfirmDialog onConfirm={handleConfirm} onCancel={handleCancel} />}

      <div style={{background:`linear-gradient(135deg,${g1},${g2})`,borderRadius:16,padding:"18px 20px",marginBottom:18,position:"relative",overflow:"hidden",color:"white"}}>
        <div style={{position:"absolute",right:-8,top:-8,fontSize:64,opacity:0.13}}>{config.emoji}</div>
        <div style={{fontSize:11,fontWeight:700,opacity:0.75,letterSpacing:1,textTransform:"uppercase"}}>DAY {config.label.slice(1)} · {config.date}（{config.weekday}）</div>
        <div style={{fontSize:21,fontWeight:900,marginTop:3,lineHeight:1.2}}>{config.title}</div>
        <div style={{fontSize:13,opacity:0.8,marginTop:5}}>{config.subtitle}</div>
      </div>

      {/* 拖拉提示 */}
      <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#b0bec5",marginBottom:10,paddingLeft:4}}>
        <span style={{fontSize:13}}>⠿</span><span>拖拉右側圖示可調整行程順序</span>
      </div>

      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:34,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,#00b4d8,#caf0f8)",borderRadius:2,zIndex:0}}/>
        {displayItems.map(item=>(
          <TlItem key={item.id} item={item} onDelete={onDelete}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDragging={dragId===item.id}
            isOver={overId===item.id}
          />
        ))}
      </div>

      <button onClick={()=>setShowModal(true)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"13px 16px",background:"white",border:"2px dashed #caf0f8",borderRadius:12,cursor:"pointer",fontSize:15,fontWeight:600,color:"#0077b6",marginTop:6}}>
        <div style={{width:28,height:28,background:"#0077b6",color:"white",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,flexShrink:0}}>+</div>
        新增行程
      </button>

      {showModal&&<AddModal onClose={()=>setShowModal(false)} onAdd={item=>{onAdd(config.id,item);}}/>}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────
function Overview(){
  return(
    <div>
      {[{grad:"linear-gradient(135deg,#023e8a,#0077b6)",tag:"去程",label:"台北 → 沖繩（那霸）",dep:"16:25",depApt:"TPE 桃園T2",arr:"18:55",arrApt:"OKA 那霸機場",dur:"1h 30m",info:"5月20日（週三）",flight:"BR186 長榮航空",plane:"A321 經濟艙V"},{grad:"linear-gradient(135deg,#1b4332,#52b788)",tag:"回程",label:"沖繩（那霸）→ 台北",dep:"10:15",depApt:"OKA 那霸機場",arr:"10:55",arrApt:"TPE 桃園T2",dur:"1h 40m",info:"5月24日（週日）",flight:"BR113 長榮航空",plane:"A321 經濟艙V"}].map((f,i)=>(
        <div key={i} style={{background:f.grad,borderRadius:16,padding:18,color:"white",marginBottom:14,boxShadow:"0 8px 40px rgba(0,119,182,0.18)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span style={{background:"rgba(255,255,255,0.2)",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{f.tag}</span><span style={{fontSize:13,fontWeight:700,opacity:0.9}}>{f.label}</span></div>
          <div style={{display:"flex",alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontSize:28,fontWeight:900,letterSpacing:-1}}>{f.dep}</div><div style={{fontSize:11,opacity:0.72,marginTop:2}}>{f.depApt}</div></div>
            <div style={{flexShrink:0,textAlign:"center",padding:"0 10px"}}><div style={{fontSize:11,opacity:0.68}}>{f.dur}</div><div style={{display:"flex",alignItems:"center",gap:3,margin:"5px 0"}}><div style={{flex:1,height:1,background:"rgba(255,255,255,0.38)"}}/><span>✈️</span><div style={{flex:1,height:1,background:"rgba(255,255,255,0.38)"}}/></div><div style={{fontSize:11,opacity:0.68}}>直飛</div></div>
            <div style={{flex:1,textAlign:"right"}}><div style={{fontSize:28,fontWeight:900,letterSpacing:-1}}>{f.arr}</div><div style={{fontSize:11,opacity:0.72,marginTop:2}}>{f.arrApt}</div></div>
          </div>
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.18)",display:"flex",justifyContent:"space-between",fontSize:11,opacity:0.78}}><span>📅 {f.info}</span><span>{f.flight}</span><span>{f.plane}</span></div>
        </div>
      ))}
      <div style={{background:"white",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 4px 20px rgba(0,119,182,0.10)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:15,fontWeight:700,marginBottom:14,color:"#1a1a2e"}}><div style={{width:32,height:32,borderRadius:9,background:"#d8f3dc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🍽️</div>已訂位餐廳</div>
        {[{emoji:"🐟",name:"國際通 島豚屋",detail:"5/22（五）・18:45・已訂位",map:"https://share.google/Jv6Ax2WIPhN4jq2bV",warn:null},{emoji:"🦞",name:"美國村 蒸氣海鮮",detail:"5/23（六）・18:00・已訂位・6位",map:null,warn:"⚠️ 備註：需要兒童座椅"}].map((b,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i===0?"1px solid #f0f4f8":"none"}}>
            <div style={{fontSize:24,flexShrink:0,marginTop:2}}>{b.emoji}</div>
            <div><div style={{fontSize:15,fontWeight:700,color:"#1a1a2e"}}>{b.name}</div><div style={{fontSize:13,color:"#718096",marginTop:3}}>{b.detail}</div>{b.warn&&<div style={{fontSize:13,color:"#f4845f",marginTop:3}}>{b.warn}</div>}{b.map&&<a href={b.map} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,background:"#caf0f8",color:"#0077b6",borderRadius:7,padding:"5px 10px",fontSize:12,fontWeight:700,textDecoration:"none",marginTop:7}}>🗺️ Google Maps</a>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("overview");
  const [items,setItems]=useState(INITIAL_ITEMS);
  const [sync,setSync]=useState("idle");
  const saveTimer=useRef(null);
  const loaded=useRef(false);

  useEffect(()=>{
    if(!db){setSync("offline");loaded.current=true;return;}
    const ref=doc(db,"trips","okinawa-2025");
    const unsub=onSnapshot(ref,snap=>{
      if(snap.exists()&&snap.data().items) setItems(snap.data().items);
      loaded.current=true;
    },()=>setSync("error"));
    return()=>unsub();
  },[]);

  useEffect(()=>{
    if(!loaded.current)return;
    clearTimeout(saveTimer.current);
    if(db) setSync("saving");
    saveTimer.current=setTimeout(async()=>{
      if(!db)return;
      try{await setDoc(doc(db,"trips","okinawa-2025"),{items},{merge:true});setSync("saved");setTimeout(()=>setSync("idle"),2500);}
      catch{setSync("error");}
    },800);
  },[items]);

  function addItem(dayId,item){setItems(p=>({...p,[dayId]:[...p[dayId],item]}));}
  function deleteItem(id){setItems(p=>{const n={};for(const[k,a]of Object.entries(p))n[k]=a.filter(i=>i.id!==id);return n;});}
  function reorder(dayId,arr){setItems(p=>({...p,[dayId]:arr}));}

  const NAV=[{id:"overview",label:"📋",sub:"總覽"},...DAY_CONFIGS.map(d=>({id:d.id,label:d.label,sub:d.date}))];
  const syncMsg={saving:"同步中…",saved:"☁️ 已同步，所有人即時更新",error:"⚠️ 同步失敗",offline:"📴 本地模式",idle:""};
  const syncColor={saving:"#a0aec0",saved:"#2d6a4f",error:"#c53030",offline:"#e07800",idle:"transparent"};

  return(
    <div style={{background:"#fff8f0",minHeight:"100vh",fontFamily:"'Noto Sans TC',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(160deg,#023e8a 0%,#0077b6 45%,#00b4d8 80%,#90e0ef 100%)",padding:"44px 20px 72px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.07,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 22px)"}}/>
        <div style={{position:"absolute",bottom:-2,left:0,right:0,height:48,background:"#fff8f0",clipPath:"ellipse(60% 100% at 50% 100%)"}}/>
        <div style={{fontSize:50,marginBottom:10,position:"relative"}}>🌺</div>
        <div style={{fontSize:24,fontWeight:900,color:"white",letterSpacing:2,textShadow:"0 2px 10px rgba(0,0,0,0.2)",position:"relative"}}>沖繩旅行手冊</div>
        <div style={{color:"rgba(255,255,255,0.82)",fontSize:13,marginTop:5,letterSpacing:1,position:"relative"}}>5月20日 – 5月24日 · 2025</div>
        <div style={{display:"flex",justifyContent:"center",gap:7,marginTop:14,flexWrap:"wrap",position:"relative"}}>
          {["✈️ 長榮航空","🚗 租車自駕","🏠 糸滿 Airbnb","👥 6人同行"].map(b=><span key={b} style={{background:"rgba(255,255,255,0.18)",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.28)",color:"white",padding:"4px 11px",borderRadius:20,fontSize:11,fontWeight:600}}>{b}</span>)}
        </div>
      </div>

      <div style={{position:"sticky",top:0,zIndex:200,background:"white",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex",overflowX:"auto",padding:"0 6px",scrollbarWidth:"none"}}>
          {NAV.map(n=><button key={n.id} onClick={()=>setTab(n.id)} style={{flexShrink:0,padding:"13px 14px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"'Noto Sans TC',sans-serif",fontSize:11,fontWeight:700,color:tab===n.id?"#0077b6":"#718096",borderBottom:`3px solid ${tab===n.id?"#0077b6":"transparent"}`,whiteSpace:"nowrap"}}><span style={{fontSize:15,display:"block",marginBottom:1}}>{n.label}</span>{n.sub}</button>)}
        </div>
        <div style={{textAlign:"center",fontSize:11,fontWeight:600,minHeight:20,paddingBottom:4,color:syncColor[sync]||"transparent",transition:"color 0.3s"}}>{syncMsg[sync]||"‎"}</div>
      </div>

      <div style={{padding:"18px 16px 60px"}}>
        {tab==="overview"&&<Overview/>}
        {DAY_CONFIGS.map(d=>tab===d.id&&<DayView key={d.id} config={d} items={items[d.id]} onAdd={addItem} onDelete={deleteItem} onReorder={reorder}/>)}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;900&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  );
}
