import { FaSearch } from "react-icons/fa";

export default function BlogSearch({ 
  searchTerm, 
  setSearchTerm, 
  categories, 
  activeCategory, 
  setActiveCategory 
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12 justify-between items-center">
      {/* Search bar */}
      <div className="relative w-full md:w-auto md:min-w-[300px]">
        <input
          type="text"
          placeholder="Search articles..."
          className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg py-3 px-4 pr-10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-royal/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute right-4 top-3.5 text-white/50" />
      </div>

      {/* Category filters */}
      <div className="flex overflow-x-auto hide-scrollbar pb-2 w-full md:w-auto">
        <div className="flex bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-white/10">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize whitespace-nowrap
                ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-royal to-royal-light text-white shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}