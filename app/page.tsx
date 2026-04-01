"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ★ここをメモした自分のものに書き換えてください★
const SUPABASE_URL = 'https://hdoezurdicoynrxtykyp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_60ElpiAcjQzNr13Ch14z6Q_LcymJA2H';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SEMESTERS = [
  { id: '2026-1', label: '2026 前期' },
  { id: '2026-2', label: '2026 後期' },
  { id: '2027-1', label: '2027 前期' },
  { id: '2027-2', label: '2027 後期' },
];

const DAYS = ['月', '火', '水', '木', '金'];
const PERIODS = [
  { id: 1, start: "10:00", end: "10:50" },
  { id: 2, start: "11:00", end: "11:50" },
  { id: 3, start: "13:00", end: "13:50" },
  { id: 4, start: "14:00", end: "14:50" },
  { id: 5, start: "15:00", end: "15:50" },
  { id: 6, start: "16:00", end: "16:50" },
  { id: 7, start: "17:00", end: "17:50" },
  { id: 8, start: "18:00", end: "18:50" },
  { id: 9, start: "19:00", end: "19:50" },
];

export default function TimetableApp() {
  const [currentSemester, setCurrentSemester] = useState('2026-1');
  const [isMultiView, setIsMultiView] = useState(false);
  const [data, setData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // 起動時にデータを読み込む
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: dbData, error } = await supabase.from('timetables').select('*');
    if (!error && dbData) {
      const formatted = dbData.reduce((acc: any, curr: any) => {
        acc[curr.id] = { subject: curr.subject, detail: curr.detail, color: curr.color };
        return acc;
      }, {});
      setData(formatted);
    }
  };

  const saveCell = async (id: string, subject: string, detail: string, color: string) => {
    const { error } = await supabase
      .from('timetables')
      .upsert({ id, subject, detail, color });

    if (!error) {
      setData({ ...data, [id]: { subject, detail, color } });
      setEditingId(null);
    } else {
      alert("エラーが発生しました: " + error.message);
    }
  };

  const TimetableGrid = ({ semesterId, isSmall }: { semesterId: string, isSmall?: boolean }) => (
    <div className={`bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100`}>
      <h2 className="text-center font-black mb-4 text-gray-500 tracking-tighter">
        {SEMESTERS.find(s => s.id === semesterId)?.label}
      </h2>
      <div className="grid grid-cols-6 gap-1.5">
        <div className="w-10"></div>
        {DAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-black py-1 text-gray-400">{day}</div>
        ))}
        {PERIODS.map(p => (
          <React.Fragment key={p.id}>
            <div className="flex flex-col items-center justify-center py-1 bg-gray-50 rounded-lg">
              <span className="font-black text-gray-800 text-[11px]">{p.id}</span>
              <div className="flex flex-col text-[7px] text-gray-400 font-medium scale-90 origin-center leading-none mt-0.5">
                <span>{p.start}</span>
                <span className="text-center opacity-30">|</span>
                <span>{p.end}</span>
              </div>
            </div>
            {DAYS.map(day => {
              const id = `${semesterId}-${day}-${p.id}`;
              const cell = data[id] || { subject: '', color: 'bg-white' };
              return (
                <div
                  key={id}
                  onClick={() => setEditingId(id)}
                  className={`${cell.color} aspect-[4/5] rounded-xl border border-gray-100 flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:shadow-inner transition-all active:scale-95 overflow-hidden`}
                >
                  <span className={`${isSmall ? 'text-[8px]' : 'text-[10px]'} font-bold leading-tight break-all text-gray-800`}>
                    {cell.subject}
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto bg-[#F2F4F7] min-h-screen pb-32 font-sans">
      <header className="p-8 flex flex-col items-center gap-4 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-black italic tracking-tighter text-gray-900">LAW SCHOOL PLAN</h1>
        <button 
          onClick={() => setIsMultiView(!isMultiView)}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center gap-2"
        >
          {isMultiView ? '集中モードへ' : '全学期を表示'}
        </button>
      </header>

      <main className="px-4">
        {isMultiView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
            {SEMESTERS.map(s => (
              <TimetableGrid key={s.id} semesterId={s.id} isSmall={true} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <TimetableGrid semesterId={currentSemester} />
          </div>
        )}
      </main>

      {!isMultiView && (
        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl p-2 rounded-[2.5rem] flex gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-40 border border-gray-100">
          {SEMESTERS.map(s => (
            <button
              key={s.id}
              onClick={() => setCurrentSemester(s.id)}
              className={`px-5 py-3 rounded-full text-[11px] font-black transition-all ${
                currentSemester === s.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {s.label.split(' ')[1]}
            </button>
          ))}
        </nav>
      )}

   {editingId && (
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl overflow-hidden relative">
         <h2 className="text-xl font-black mb-8 text-center text-gray-900">
          {editingId.split('-')[2]}曜日 {Number(editingId.split('-')[3]) }時限
         </h2>
      
      <div className="space-y-5">
              <input
                id="sub-input"
                autoFocus
                className="w-full bg-gray-50 border-none p-5 rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-gray-900 transition-all text-lg"
                placeholder="科目名"
                defaultValue={data[editingId]?.subject}
              />
              <textarea
                id="det-input"
                className="w-full bg-gray-50 border-none p-5 rounded-[1.5rem] h-28 outline-none focus:ring-2 focus:ring-gray-900 resize-none text-sm font-medium"
                placeholder="詳細・メモ"
                defaultValue={data[editingId]?.detail}
              />
              <div className="flex justify-between px-2 py-2 bg-gray-50 rounded-2xl">
                {['bg-blue-100', 'bg-rose-100', 'bg-emerald-100', 'bg-amber-100', 'bg-indigo-100', 'bg-white'].map(c => (
                  <button
                    key={c}
                    onClick={() => {(document.getElementById('color-val') as HTMLInputElement).value = c}}
                    className={`${c} w-8 h-8 rounded-full border-2 border-white shadow-sm active:scale-75 transition-transform`}
                  />
                ))}
                <input type="hidden" id="color-val" defaultValue={data[editingId]?.color || 'bg-white'} />
              </div>
              <div className="flex gap-3 pt-6">
                <button onClick={() => setEditingId(null)} className="flex-1 py-5 bg-gray-100 rounded-[1.5rem] font-black text-gray-500 active:scale-95 transition-all text-sm">CLOSE</button>
                <button 
                  onClick={() => {
                    const s = (document.getElementById('sub-input') as HTMLInputElement).value;
                    const d = (document.getElementById('det-input') as HTMLTextAreaElement).value;
                    const c = (document.getElementById('color-val') as HTMLInputElement).value;
                    saveCell(editingId, s, d, c);
                  }}
                  className="flex-1 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black shadow-xl active:scale-95 transition-all text-sm"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}