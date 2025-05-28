// Update BlogPost for better mobile view

export default function BlogPost({ post, isMobile }) {
  return (
    <article className={`py-6 ${isMobile ? 'px-4' : 'px-8'}`}>
      {/* Post header */}
      <header className="mb-8">
        <h1 className={`font-heading font-bold text-white mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center text-sm text-white/60 gap-4 mb-6">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2" size={14} />
            <span>{post.date}</span>
          </div>
          
          <div className="flex items-center">
            <FaClock className="mr-2" size={14} />
            <span>{post.readTime}</span>
          </div>
          
          <div className="flex items-center">
            <FaTags className="mr-2" size={14} />
            <span className="bg-royal/20 text-royal-light px-2 py-0.5 rounded-full border border-royal/30">
              {post.category}
            </span>
          </div>
        </div>
        
        {post.image && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-6">
            <img
              src={post.image}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </header>
      
      {/* Post content */}
      <div className="prose prose-invert prose-royal max-w-none">
        {post.content}
      </div>
      
      {/* Mobile specific navigation */}
      {isMobile && (
        <div className="mt-8 pt-4 border-t border-white/10">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full py-3 bg-royal/20 hover:bg-royal/30 text-royal-light rounded-lg flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m18 15-6-6-6 6"/>
            </svg>
            Back to Top
          </button>
        </div>
      )}
    </article>
  );
}