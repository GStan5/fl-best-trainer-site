import { useState, useEffect } from "react";
import { FaQuoteRight, FaStar } from "react-icons/fa";

const testimonials = [
	{
		name: "Karen S.",
		age: "65",
		achievement: "Lost 30 lbs & gained strength",
		quote:
			"Training with Gavin has completely transformed my life. At 65, I feel stronger and more confident than I did at 45. His expertise in working with seniors makes every session both safe and effective.",
		rating: 5,
	},
	{
		name: "Robert T.",
		age: "58",
		achievement: "Overcame back pain",
		quote:
			"After years of chronic back pain, I was hesitant to start training. Gavin's knowledge of corrective exercise and patient approach helped me regain my mobility and strength. His in-home training makes it convenient and comfortable.",
		rating: 5,
	},
	{
		name: "Anna M.",
		age: "42",
		achievement: "Reached fitness goals post-pregnancy",
		quote:
			"Every session is perfectly tailored to my needs and goals. Gavin's motivating approach and expert guidance have helped me achieve fitness levels I never thought possible after having children.",
		rating: 5,
	},
];

export default function TestimonialCarousel() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setIsAnimating(true);
			setTimeout(() => {
				setActiveIndex((prev) => (prev + 1) % testimonials.length);
				setIsAnimating(false);
			}, 300);
		}, 8000);

		return () => clearInterval(timer);
	}, []);

	return (
		<section className="relative py-24 bg-[#1A1A1A] overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
			<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>
			<div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
				{/* Section Header */}
				<div className="text-center mb-16 overflow-hidden">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 whitespace-nowrap">
						Client Success Stories
					</h2>
					<p className="text-lg text-white/70 mx-auto whitespace-nowrap">
						Real results from real people who trusted their fitness journey with
						Gavin Stanifer
					</p>
				</div>

				{/* Testimonial Card */}
				<div className="max-w-4xl mx-auto">
					<div
						className={`relative bg-black/30 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/10
            transition-all duration-300 ${
							isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
						}`}
					>
						{/* Quote Icon */}
						<FaQuoteRight className="absolute top-6 right-8 text-royal/20 w-16 h-16" />

						{/* Content */}
						<div className="relative">
							<div className="text-center">
								<div className="flex items-center justify-center gap-1 mb-6">
									{[...Array(testimonials[activeIndex].rating)].map((_, i) => (
										<FaStar key={i} className="w-5 h-5 text-royal-light" />
									))}
								</div>

								<blockquote className="text-lg sm:text-xl text-white/90 italic mb-8">
									"{testimonials[activeIndex].quote}"
								</blockquote>

								<div>
									<cite className="not-italic">
										<span className="block text-xl font-semibold text-white mb-2">
											{testimonials[activeIndex].name}
										</span>
										<span className="text-royal-light">
											Age {testimonials[activeIndex].age} •{" "}
											{testimonials[activeIndex].achievement}
										</span>
									</cite>
								</div>
							</div>
						</div>
					</div>

					{/* Navigation Dots */}
					<div className="flex justify-center gap-3 mt-8">
						{testimonials.map((_, idx) => (
							<button
								key={idx}
								onClick={() => {
									setIsAnimating(true);
									setTimeout(() => {
										setActiveIndex(idx);
										setIsAnimating(false);
									}, 300);
								}}
								className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                  ${
										idx === activeIndex
											? "bg-royal-light w-8"
											: "bg-white/20 hover:bg-white/40"
									}`}
								aria-label={`Go to testimonial ${idx + 1}`}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
