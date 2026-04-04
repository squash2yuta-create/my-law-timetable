"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ここにあなたの Supabase URL と KEY を入れてください
const supabase = createClient('あなたのURL', 'あなたのKEY');

export default function TimetableApp() {
  const [data, setData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTimetable = async () => {
    const { data: res } = await supabase.from('timetables').select('*');
    const formatted = (res || []).reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {});
    setData(formatted);
  };

  useEffect(() => { fetchTimetable(); }, []);

  const handleSave = async (subject: string) => {
    if (!editingId) return;
    await supabase.from('timetables').upsert({ id: editingId, subject });
    setEditingId(null);
    fetchTimetable();
  };

  const DAYS = ["月", "火", "水", "木", "金"];
  const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-black mb-8 text-center tracking-tighter">LAW SCHOOL PLAN</h1>
      
      <div className="grid grid-cols-6 gap-2">
        <div className="h-10"></div>
        {DAYS.map(d => (
          <div key={d} className="text-center font-bold text-gray-400 py-2">{d}</div>
        ))}

        {PERIODS.map(p => (
          <>
            <div key={p} className="flex items-center justify-center font-bold text-gray-300">{p}</div>
            {DAYS.map(d => {
              const id = `2026-1-${d}-${p}`;
              return (
                <div 
                  key={id} 
                  onClick={() => setEditingId(id)}
                  className="aspect-[3/4] bg-white rounded-2xl shadow-sm p-2 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition"
                >
                  <p className="text-[10px] font-bold text-gray-800 text-center leading-tight">
                    {data[id]?.subject || ""}
                  </p>
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* 編集モーダル（画像に写っていた部分） */}
      {editingId && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl overflow-hidden relative">
            <h2 className="text-xl font-black mb-8 text-center text-gray-900">
              {editingId.split('-')[2]}曜日 {editingId.split('-')[3]}時限
            </h2>
            
            <div className="space-y-5">
              <input
                id="sub-input"
                autoFocus
                className="w-full bg-gray-50 border-none p-5 rounded-2xl font-bold"
                placeholder="科目名"
                defaultValue={data[editingId]?.subject || ""}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-4 font-bold text-gray-400"
                >
                  CLOSE
                </button>
                <button 
                  onClick={() => handleSave((document.getElementById('sub-input') as HTMLInputElement).value)}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-bold"
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