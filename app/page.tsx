"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hdoezurdicoynrxtykyp.supabase.co', 'sb_publishable_60ElpiAcjQzNr13Ch14z6Q_LcymJA2H');

const DAYS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5];

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

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-black mb-8 text-center tracking-tighter">LAW SCHOOL PLAN</h1>
      <div className="grid grid-cols-6 gap-2">
        <div className="h-12"></div>
        {DAYS.map(d => <div key={d} className="text-center font-bold py-3 text-gray-400">{d}</div>)}
        
        {PERIODS.map(p => (
          <>
            <div key={p} className="flex items-center justify-center font-bold text-gray-300">{p}</div>
            {DAYS.map(d => {
              const id = `2026-1-${d}-${p}`;
              return (
                <div 
                  key={id} 
                  onClick={() => setEditingId(id)}
                  className="aspect-[3/4] bg-white rounded-2xl shadow-sm p-2 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition border border-transparent hover:border-gray-200"
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

      {editingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-sm shadow-2xl text-center">
            <h2 className="text-xl font-black mb-6">
              {editingId.split('-')[2]}曜日 {editingId.split('-')[3]}時限
            </h2>
            <input 
              id="sub-input" 
              className="w-full bg-gray-100 p-5 rounded-2xl border-none mb-6 font-bold" 
              defaultValue={data[editingId]?.subject || ""}
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingId(null)} className="flex-1 p-4 font-bold text-gray-400">CLOSE</button>
              <button 
                onClick={() => handleSave((document.getElementById('sub-input') as HTMLInputElement).value)}
                className="flex-1 bg-black text-white p-4 rounded-2xl font-bold"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}