import { FaArrowRight } from "react-icons/fa";

export default function BlogPagination() {
  return (
    <div className="flex justify-center mt-16">
      <div className="inline-flex bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-white/10">
        {["1", "2", "3"].map((page) => (
          <button
            key={page}
            className={`w-10 h-10 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center
              ${
                page === "1"
                  ? "bg-gradient-to-r from-royal to-royal-light text-white shadow-md"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
          >
            {page}
          </button>
        ))}
        <button className="w-10 h-10 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center justify-center">
          <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}