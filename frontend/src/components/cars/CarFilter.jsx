import React from 'react';

const CAR_TYPES = [
  { value: '', label: 'সব টাইপ (All Types)' },
  { value: 'sedan', label: 'সেডান (Sedan)' },
  { value: 'suv', label: 'এসইউভি (SUV)' },
  { value: 'hatchback', label: 'হ্যাচব্যাক (Hatchback)' },
  { value: 'microbus', label: 'মাইক্রোবাস (Microbus)' },
  { value: 'pickup', label: 'পিকআপ (Pickup)' },
];

const CAR_STATUSES = [
  { value: '', label: 'সব স্ট্যাটাস (All Statuses)' },
  { value: 'available', label: 'উপলব্ধ (Available)' },
  { value: 'rented', label: 'ভাড়ায় আছে (Rented)' },
  { value: 'reserved', label: 'সংরক্ষিত (Reserved)' },
  { value: 'maintenance', label: 'রক্ষণাবেক্ষণে (Maintenance)' },
  { value: 'inactive', label: 'নিষ্ক্রিয় (Inactive)' },
];

const CarFilter = ({ filters, onFilterChange, onResetFilters, showStatusFilter = true }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm mb-6">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        {/* Top Row: Search input */}
        <div className="relative">
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="গাড়ির নাম, ব্র্যান্ড, মডেল বা রেজিস্ট্রেশন দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800 placeholder-gray-400"
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>

        {/* Bottom Row: Selects & Price inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Car Type Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">গাড়ির ধরণ</label>
            <select
              name="carType"
              value={filters.carType || filters.type || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-gray-800"
            >
              {CAR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          {showStatusFilter && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">স্ট্যাটাস</label>
              <select
                name="status"
                value={filters.status || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-gray-800"
              >
                {CAR_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Min Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">সর্বনিম্ন ভাড়া (৳)</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice || ''}
              onChange={handleChange}
              placeholder="যেমন: ১০০০"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800"
              min="0"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">সর্বোচ্চ ভাড়া (৳)</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice || ''}
              onChange={handleChange}
              placeholder="যেমন: ১০০০০"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800"
              min="0"
            />
          </div>
        </div>

        {/* Reset Action */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center gap-1"
          >
            🔄 ফিল্টার রিক্লিয়ার করুন
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarFilter;
