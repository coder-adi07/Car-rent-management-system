import React, { useState } from 'react';

const RATING_LABELS = {
  1: 'খুবই বাজে (Very Poor)',
  2: 'মোটামুটি (Fair)',
  3: 'ভালো (Good)',
  4: 'খুব ভালো (Very Good)',
  5: 'অসাধারণ (Excellent)',
};

const RatingInput = ({ rating, onChange, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const current = hoverRating || rating || 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`text-2xl transition focus:outline-none ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${star <= current ? 'text-amber-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs font-bold text-gray-700 ml-2">
            ({rating}/৫)
          </span>
        )}
      </div>
      {!readOnly && current > 0 && (
        <p className="text-xs font-semibold text-emerald-700">
          {RATING_LABELS[current]}
        </p>
      )}
    </div>
  );
};

export default RatingInput;
