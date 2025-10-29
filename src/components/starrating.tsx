import { useState, useEffect } from "react";

interface StarRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  initialRating?: number;
  initialComment?: string;
}

export default function StarRatingModal({
  isOpen,
  onClose,
  onSubmit,
  initialRating = 0,
  initialComment = "",
}: StarRatingModalProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialComment);

  // ✅ รีเซ็ต state ทุกครั้งที่ modal เปิด
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
      setHover(0);
    }
  }, [isOpen, initialRating, initialComment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 max-w-full">
        <h2 className="text-lg font-semibold mb-4">แสดงความคิดเห็น</h2>

        {/* Star Rating */}
        <div className="flex gap-1 text-4xl mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer transition-colors ${
                star <= (hover || rating) ? "text-blue-500" : "text-gray-300"
              }`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment Textarea */}
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="เขียนความคิดเห็นของคุณ..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
            onClick={() => {
              setRating(0);      // รีเซ็ต rating
              setComment("");    // รีเซ็ต comment
              onClose();         // ปิด modal
            }}
          >
            ยกเลิก
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            onClick={() => {
              if (rating === 0) return; // validate
              onSubmit(rating, comment);
              onClose();
            }}
            disabled={rating === 0}
          >
            ส่งความคิดเห็น
          </button>
        </div>
      </div>
    </div>
  );
}