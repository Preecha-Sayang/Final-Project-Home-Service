import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface BookingTimerProps {
  isActive: boolean; // เริ่มนับเมื่อเข้า step 2
  onTimeout: () => void; // callback เมื่อหมดเวลา
  onStop?: () => void; // callback เมื่อชำระเงินสำเร็จ
}

const BookingTimer: React.FC<BookingTimerProps> = ({ isActive, onTimeout, onStop }) => {
  const TIMER_DURATION = 5 * 60; // 10 นาที (600 วินาที)
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATION);
  const [hasShownAlert, setHasShownAlert] = useState(false);

  // Reset timer เมื่อ component mount หรือ isActive เปลี่ยน
  useEffect(() => {
    if (isActive) {
      setTimeLeft(TIMER_DURATION);
      setHasShownAlert(false);
    }
  }, [isActive, TIMER_DURATION]);

  // Countdown logic
  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive]);

  // แสดง SweetAlert เมื่อหมดเวลา
  useEffect(() => {
    if (timeLeft === 0 && isActive && !hasShownAlert) {
      setHasShownAlert(true);
      
      Swal.fire({
        icon: 'warning',
        title: 'หมดเวลา',
        html: '<p style="font-size: 16px;">คุณไม่ได้ดำเนินการชำระเงินให้เสร็จภายในเวลาที่กำหนด<br/>กรุณาเริ่มต้นใหม่</p>',
        confirmButtonText: 'กลับไปสู่การเลือกบริการ',
        confirmButtonColor: '#2563eb',
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed) {
          onTimeout();
        }
      });
    }
  }, [timeLeft, isActive, hasShownAlert, onTimeout]);

  // หยุด timer เมื่อเรียก onStop (เช่น ชำระเงินสำเร็จ)
  useEffect(() => {
    if (onStop && !isActive) {
      setTimeLeft(TIMER_DURATION);
      setHasShownAlert(false);
    }
  }, [onStop, isActive, TIMER_DURATION]);

  // Format time เป็น MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ไม่แสดงอะไรถ้า timer ไม่ active
  if (!isActive) return null;

  // เปลี่ยนสีเป็นแดงเมื่อเหลือเวลาน้อยกว่า 2 นาที
  const isUrgent = timeLeft < 120;

  return (
    <div 
      className={`
        rounded-lg border-2 p-4 mb-4 text-center transition-all duration-300
        ${isUrgent 
          ? 'border-red-500 bg-red-50 animate-pulse' 
          : 'border-blue-500 bg-blue-50'
        }
      `}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-gray-600">
          เวลาในการชำระเงิน
        </span>
        <div 
          className={`
            text-3xl font-bold tabular-nums
            ${isUrgent ? 'text-red-600' : 'text-blue-600'}
          `}
        >
          {formatTime(timeLeft)}
        </div>
        {isUrgent && (
          <span className="text-xs text-red-600 font-medium">
            ⚠️ เหลือเวลาไม่มาก!
          </span>
        )}
      </div>
    </div>
  );
};

export default BookingTimer;

/**
 * วิธีใช้งาน BookingTimer Component
 * 
 * import BookingTimer from '@/components/BookingTimer';
 * 
 * <BookingTimer
 *   isActive={currentStep === 'details' || currentStep === 'payment'}
 *   onTimeout={() => {
 *     setCurrentStep('items');
 *     setSelectedItems([]);
 *     resetForNewService();
 *   }}
 *   onStop={() => {
 *     // ถูกเรียกเมื่อชำระเงินสำเร็จ (optional)
 *   }}
 * />
 */