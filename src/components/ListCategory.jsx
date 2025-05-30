import React from 'react'

const categories = [
  "All", "Pop", "Rock", "Party", "Romance",
  "Energetic", "Relaxing", "Jazz", "Alternative"
]

const ListCategory = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div>
      <h2 className="text-l font-semibold mb-4 text-white">Select Categories</h2>
      <div className="flex flex-wrap gap-3 mb-2">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-1 rounded-full text-sm transition
              ${cat === selectedCategory
                ? "bg-emerald-600 text-white"
                : "border border-gray-600 text-gray-300 hover:bg-gray-700"}
            `}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ListCategory