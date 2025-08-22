'use client';

import { useState } from 'react';
import { Calendar } from '@/components/schedule/calendar';
import { DayDetailModal } from '@/components/schedule/day-detail-modal';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  return (
    <div className="min-h-full p-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Schedule</h1>
      
      <Calendar onDateClick={setSelectedDate} />
      
      {selectedDate && (
        <DayDetailModal 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
        />
      )}
    </div>
  );
}
