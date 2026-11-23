import { useState } from 'react';

type FormState = "idle" | "submitting" | "success" | "error";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(
          data.error || "Something went wrong. Please check your email and try again."
        );
        setState("error");
        return;
      }
      setEmail("");
      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again in a moment.");
      setState("error");
    }
  };
  
  return (
    <section className="py-16 bg-[#1A1A1A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">
            Stay Updated with Fitness Tips & Special Offers
          </h2>
          <p className="text-white/70 mb-8 text-center">
            Join the newsletter to receive exclusive content and early access to promotions
          </p>
          
          {state === "success" ? (
            <p className="text-white text-center max-w-xl mx-auto py-3">
              Thanks — you&apos;re on the list.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-royal-light"
                required
                disabled={state === "submitting"}
              />
              <button
                type="submit"
                disabled={state === "submitting"}
                className="px-6 py-3 bg-royal text-white rounded-xl font-medium hover:bg-royal-light transition-all duration-300 disabled:opacity-60"
              >
                {state === "submitting" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
          {state === "error" && (
            <p className="text-red-400 text-sm mt-4 text-center" role="alert">
              {errorMsg}
            </p>
          )}
          
          <p className="text-white/50 text-sm mt-4 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}