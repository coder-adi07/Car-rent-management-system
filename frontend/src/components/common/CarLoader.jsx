import React from 'react';

/**
 * CarLoader - Creative animated cartoon car loading component for Gari Lagbe
 */
const CarLoader = ({ text = 'গাড়ি লোড হচ্ছে...' }) => {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className="relative flex flex-col items-center justify-center max-w-sm w-full">
        {/* Animated Speed Lines / Exhaust Smoke */}
        <div className="relative w-48 h-20 flex items-center justify-center">
          {/* Wind / Speed Lines */}
          <div className="absolute left-2 top-4 flex flex-col gap-1.5 opacity-75">
            <span className="w-6 h-1 bg-emerald-400 rounded-full animate-ping" style={{ animationDuration: '0.8s' }}></span>
            <span className="w-10 h-1 bg-emerald-500 rounded-full animate-pulse" style={{ animationDuration: '0.6s' }}></span>
            <span className="w-4 h-1 bg-teal-400 rounded-full animate-ping" style={{ animationDuration: '1s' }}></span>
          </div>

          {/* Cartoon Car Graphic (SVG with driving motion) */}
          <div className="animate-bounce" style={{ animationDuration: '0.6s' }}>
            <svg
              className="w-24 h-24 text-emerald-600 drop-shadow-lg"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Car Body Top / Roof */}
              <path
                d="M18 34L24 20C25.5 16.5 28.5 15 32 15H42C45.5 15 47.5 17 49 20L54 34"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#059669"
              />
              {/* Windshield Glass */}
              <path
                d="M26 23H44L47.5 32H20.5L26 23Z"
                fill="#9CA3AF"
                opacity="0.8"
              />
              {/* Car Main Base */}
              <rect
                x="8"
                y="32"
                width="50"
                height="14"
                rx="6"
                fill="#047857"
              />
              {/* Headlight */}
              <circle cx="53" cy="37" r="3" fill="#FBBF24" className="animate-pulse" />
              {/* Taillight */}
              <circle cx="11" cy="37" r="2.5" fill="#EF4444" />

              {/* Front Wheel */}
              <g className="animate-spin" style={{ transformOrigin: '44px 46px', animationDuration: '0.5s' }}>
                <circle cx="44" cy="46" r="7" fill="#1F2937" />
                <circle cx="44" cy="46" r="3" fill="#9CA3AF" />
                <line x1="44" y1="39" x2="44" y2="53" stroke="#F3F4F6" strokeWidth="1.5" />
                <line x1="37" y1="46" x2="51" y2="46" stroke="#F3F4F6" strokeWidth="1.5" />
              </g>

              {/* Back Wheel */}
              <g className="animate-spin" style={{ transformOrigin: '18px 46px', animationDuration: '0.5s' }}>
                <circle cx="18" cy="46" r="7" fill="#1F2937" />
                <circle cx="18" cy="46" r="3" fill="#9CA3AF" />
                <line x1="18" y1="39" x2="18" y2="53" stroke="#F3F4F6" strokeWidth="1.5" />
                <line x1="11" y1="46" x2="25" y2="46" stroke="#F3F4F6" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
        </div>

        {/* Moving Road Line */}
        <div className="w-56 h-1.5 bg-gray-200 rounded-full overflow-hidden relative mt-2 shadow-inner">
          <div
            className="absolute inset-0 w-[200%] bg-[repeating-linear-gradient(90deg,#059669_0,#059669_12px,transparent_12px,transparent_24px)] animate-[moveRoad_0.5s_linear_infinite]"
          />
        </div>

        {/* Text and Pulse */}
        <div className="mt-6 flex items-center gap-2 text-emerald-800 font-bold text-lg">
          <span>{text}</span>
          <span className="flex gap-1">
            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 font-medium">গাড়ি লাগবে • Gari Lagbe</p>
      </div>

      {/* Inline Keyframes style for road motion */}
      <style>{`
        @keyframes moveRoad {
          0% { transform: translateX(0); }
          100% { transform: translateX(-24px); }
        }
      `}</style>
    </div>
  );
};

export default CarLoader;
