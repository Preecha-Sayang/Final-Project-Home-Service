import React from 'react'

interface BookingFooterProps {
  onBack: () => void
  onNext: () => void
  backText?: string
  nextText?: string
  nextDisabled?: boolean
  showBack?: boolean
  showNext?: boolean
}

const BookingFooter: React.FC<BookingFooterProps> = ({
  onBack,
  onNext,
  backText = "ย้อนกลับ",
  nextText = "ดำเนินการต่อ",
  nextDisabled = false,
  showBack = true,
  showNext = true,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {backText}
            </button>
          )}
          
          {showNext && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className={`px-6 py-3 rounded-lg transition-colors ${
                nextDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {nextText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingFooter
