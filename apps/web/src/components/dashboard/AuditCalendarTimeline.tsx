'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Lightbulb, Mic, CheckCircle2 } from 'lucide-react';

export function AuditCalendarTimeline() {
  const [selectedDate, setSelectedDate] = useState(21);

  // Calendar dates matrix
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = [
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true, dotColor: '#fb7185' },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true, badge: 'teal' },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true, badge: 'teal' },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true, dotColor: '#ffb703' },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true, badge: 'coral' },
    { day: 21, isCurrentMonth: true, badge: 'gold' },
    { day: 22, isCurrentMonth: true, dotColor: '#fb7185' },
    { day: 23, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true, dotColor: '#8b5cf6' },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false },
    { day: 5, isCurrentMonth: false },
  ];

  return (
    <div className="flex flex-col h-full bg-white p-6 lg:p-8 lg:border-l border-slate-100">
      {/* Calendar Month Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Jan, 21 <span className="font-normal text-slate-500">Tuesday</span>
        </h3>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-slate-400 mb-2">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Matrix */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-700 gap-y-1">
        {calendarDays.map((item, idx) => {
          let badgeClass = '';
          if (item.badge === 'teal') {
            badgeClass = 'bg-[#0d3834] text-white rounded-full';
          } else if (item.badge === 'coral') {
            badgeClass = 'bg-[#fb7185] text-white rounded-full';
          } else if (item.badge === 'gold') {
            badgeClass = 'bg-[#ffb703] text-slate-900 font-bold rounded-full';
          }

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(item.day)}
              className="relative flex flex-col items-center justify-center h-8 cursor-pointer group"
            >
              <span
                className={`w-7 h-7 flex items-center justify-center transition-all ${
                  badgeClass || (item.isCurrentMonth ? 'hover:bg-slate-100 rounded-full' : 'text-slate-300')
                }`}
              >
                {item.day}
              </span>
              {item.dotColor && !item.badge && (
                <span
                  className="w-1 h-1 rounded-full absolute bottom-0.5"
                  style={{ backgroundColor: item.dotColor }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Audit Timeline */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex-1 space-y-4">
        <div className="relative pl-12 space-y-7">
          {/* Time Slot 08:30 */}
          <div className="relative">
            <span className="absolute -left-12 top-2 text-[11px] font-medium text-slate-400 font-mono">
              08:30
            </span>
            <div className="bg-white border border-[#0d3834]/30 rounded-2xl p-3 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0d3834] text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">AST Security Scan Completed</div>
                <div className="text-[10px] text-slate-400">09:00 AM — 10:00 AM</div>
              </div>
            </div>
          </div>

          {/* Time Slot 09:30 with Yellow Indicator Line */}
          <div className="relative">
            <span className="absolute -left-12 top-2 text-[11px] font-medium text-slate-400 font-mono">
              09:30
            </span>
            <div className="relative flex items-center">
              <div className="absolute -left-3 w-2.5 h-2.5 rounded-full bg-[#ffb703] border-2 border-white shadow" />
              <div className="w-full bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffb703] text-slate-900 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Architecture & Dependency Review</div>
                  <div className="text-[10px] text-slate-500">11:00 AM — 12:30 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Slot 10:30 with Coral Card */}
          <div className="relative">
            <span className="absolute -left-12 top-2 text-[11px] font-medium text-slate-400 font-mono">
              10:30
            </span>
            <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-3 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fb7185] text-white flex items-center justify-center flex-shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">CVE Triage & AI Remediation</div>
                <div className="text-[10px] text-slate-500">12:00 PM — 03:30 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
