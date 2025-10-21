

import React, { useState } from "react";
import { Star, Send } from "lucide-react";


// Types & Interfaces


interface ReviewFormData {
  rating: number;
  comment: string;
}





const RATING_TEXTS: Record<number, string> = {
  0: "",
  1: "😞 แย่มาก",
  2: "😕 ไม่ดี",
  3: "😐 พอใช้",
  4: "😊 ดี",
  5: "🤩 ดีเยี่ยม",
};

const COMMENT_MAX_LENGTH = 500;
const COMMENT_MIN_LENGTH = 10;

const SERVICE_PROVIDER = {
  name: "Nara",
  service: "ล้างแอร์",
  orderId: "AD04071205",
  completedDate: "25/04/2563",
  completedTime: "13:00 น.",
};


// ----------Utility Functions--------//


const getRatingText = (rating: number): string => {
  return RATING_TEXTS[rating] || "";
};

const validateReviewForm = (data: ReviewFormData): boolean => {
  return data.rating > 0 && data.comment.trim().length >= COMMENT_MIN_LENGTH;
};


// ------Main --------//


export default function HomeServicesReview() {
  
  // State Management//
 
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  
  // Computed Values
  
  const isFormValid = validateReviewForm({ rating, comment });

  
  // Event Handlers
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log success (replace with actual API call)
      console.log("Review submitted:", {
        rating,
        comment,
        timestamp: new Date().toISOString(),
      });

      // Show success message
      alert("ส่งรีวิวสำเร็จ! ขอบคุณสำหรับความคิดเห็นของคุณ");

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const handleStarMouseEnter = (star: number) => {
    setHoverRating(star);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(0);
  };

  const getStarClassName = (star: number): string => {
    const isActive = star <= (hoverRating || rating);
    return `w-12 h-12 sm:w-14 sm:h-14 transition-all ${
      isActive
        ? "fill-amber-400 text-amber-400 drop-shadow-lg"
        : "fill-gray-200 text-gray-300"
    }`;
  };

  
  // ------ Render and UI ------//
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/*Service Provider Card*/}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <span
                className="text-4xl sm:text-5xl"
                role="img"
                aria-label="technician"
              >
                {/* picture */}
              </span>
            </div>

            {/* Provider Info */}
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {SERVICE_PROVIDER.name}
              </h2>
              <div className="space-y-1">
                <p className="text-gray-600 font-medium">
                  {SERVICE_PROVIDER.service}
                </p>
                <p className="text-sm text-gray-500">
                  รหัส: {SERVICE_PROVIDER.orderId}
                </p>
                <p className="text-sm text-gray-500">
                  เสร็จสิ้น: {SERVICE_PROVIDER.completedDate} เวลา{" "}
                  {SERVICE_PROVIDER.completedTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form*/}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Rating Section*/}
            <div className="mb-8 sm:mb-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                คุณพอใจกับบริการนี้แค่ไหน?
              </h3>
              <div className="flex flex-col items-center gap-4 p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                {/* Rating Stars */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarMouseEnter(star)}
                      onMouseLeave={handleStarMouseLeave}
                      className="transition-all hover:scale-125 active:scale-95"
                      aria-label={`ให้คะแนน ${star} ดาว`}
                    >
                      <Star className={getStarClassName(star)} />
                    </button>
                  ))}
                </div>

                {/* Rating Text */}
                {rating > 0 && (
                  <span className="text-xl sm:text-2xl font-bold text-gray-800 animate-fade-in">
                    {getRatingText(rating)}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                แบ่งปันประสบการณ์ของคุณ
              </h3>

              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="บอกเล่าเกี่ยวกับบริการที่คุณได้รับ..."
                  className="w-full h-36 sm:h-40 p-4 sm:p-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base transition-all placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  maxLength={COMMENT_MAX_LENGTH}
                  disabled={isSubmitting}
                  aria-label="ความคิดเห็น"
                />
                <div className="absolute bottom-3 right-3 text-xs sm:text-sm text-gray-400 bg-white px-2 py-1 rounded-lg">
                  {comment.length}/{COMMENT_MAX_LENGTH}
                </div>
              </div>

              {/* Validation Message */}
              {!isFormValid && (
                <p className="text-sm text-gray-500 mt-3">
                  กรุณาให้คะแนนและเขียนความคิดเห็นอย่างน้อย {COMMENT_MIN_LENGTH}{" "}
                  ตัวอักษร
                </p>
              )}
            </div>

            {/* Submit Button*/}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid || isSubmitting}
              aria-label="ส่งรีวิว"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  ส่งรีวิว
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
