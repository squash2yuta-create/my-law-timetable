"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 【重要】自分のURLとKeyに書き換えてください
const supabase = createClient('https://hdoezurdicoynrxtykyp.supabase.co', 'sb_publishable_60ElpiAcjQzNr13Ch14z6Q_LcymJA2H');

export default function SmartTimetable() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayData, setDisplayData] = useState<{ [key: number]: any }>({});
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const currentDayName = dayNames[new Date(selectedDate).getDay()];

  // データの読み込みロジック
  const fetchCombinedData = async () => {
    // 1. 「基本の曜日スケジュール」を取得 (dateが空のもの)
    const { data: baseData } = await supabase
      .from('timetables')
      .select('*')
      .eq('day', currentDayName)
      .is('date', null);

    // 2. 「今日だけの予定」を取得 (dateが一致するもの)
    const { data: dailyData } = await supabase
      .from('timetables')
      .select('*')
      .eq('date', selectedDate);

    // 3. 1〜9限までを合体（今日限定があれば優先）
    const combined = {};
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
      const base = baseData?.find(d => d.period === p);
      const daily = dailyData?.find(d => d.period === p);
      combined[p] = daily || base || { subject: "空きコマ" };
    });
    setDisplayData(combined);
  };

  useEffect(() => { fetchCombinedData(); }, [selectedDate]);

  // 保存処理（ここが簡易化のキモです）
  const handleSave = async (period: number, subject: string, isPermanent: boolean) => {
    if (isPermanent) {
      // 「毎週固定」として保存
      await supabase.from('timetables').upsert({
        day: currentDayName,
        period: period,
        subject: subject,
        date: null // 日付を空にすることで固定枠にする
      });
    } else {
      // 「今日だけ」として保存
      await supabase.from('timetables').upsert({
        date: selectedDate,
        period: period,
        subject: subject,
        day: currentDayName
      });
    }
    setEditingPeriod(null);
    fetchCombinedData();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black mb-6 text-center tracking-tighter text-gray-900">LAW SCHOOL DIARY</h1>

      {/* 日付・曜日選択 */}
      <div className="mb-8 p-4 bg-white rounded-3xl shadow-sm flex justify-between items-center border border-gray-100">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="font-bold border-none outline-none"/>
        <span className="text-blue-600 font-black">{currentDayName}曜</span>
      </div>

      {/* 時間割リスト */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
          <div key={p} onClick={() => setEditingPeriod(p)} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex items-center gap-6 cursor-pointer active:scale-95 transition border border-transparent hover:border-gray-200">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-black text-gray-300">{p}</div>
            <div className="flex-1">
              <p className={`font-bold text-lg ${displayData[p]?.date ? 'text-blue-600' : 'text-gray-800'}`}>
                {displayData[p]?.subject}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {displayData[p]?.date ? "★ 今日限定" : "○ 固定"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* モーダル */}
      {editingPeriod && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-center">{currentDayName}曜 {editingPeriod}限</h2>
            <input id="sub-input" className="w-full bg-gray-100 p-5 rounded-2xl border-none mb-4 font-bold" placeholder="科目名を入力" defaultValue={displayData[editingPeriod]?.subject === "空きコマ" ? "" : displayData[editingPeriod]?.subject}/>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => handleSave(editingPeriod, (document.getElementById('sub-input') as HTMLInputElement).value, false)} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-100">今日だけ上書き</button>
              <button onClick={() => handleSave(editingPeriod, (document.getElementById('sub-input') as HTMLInputElement).value, true)} className="w-full bg-black text-white p-4 rounded-2xl font-bold shadow-lg shadow-gray-200">毎週固定で登録</button>
              <button onClick={() => setEditingPeriod(null)} className="w-full p-2 font-bold text-gray-400 text-sm mt-2">閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}