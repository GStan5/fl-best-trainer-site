import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { getAllPosts } from "../../utils/markdown";

// Reader-facing topic groups for the start-here hub. Grouped the way a
// reader thinks (where they are, what hurts, what they want), not by the
// internal category field. Any post not listed in a group falls into
// "More from the blog" below, so nothing is ever missing.
const TOPICS = [
  {
    title: "Starting after 50",
    blurb:
      "New to lifting, or coming back after years off. Start here.",
    ids: [
      "strength-training-after-50",
      "slow-down-form-first-after-50",
      "osteoporosis-weight-lifting",
      "walking-weight-lifting",
      "fitness-as-a-lifestyle-over-40",
      "5-essential-training-tips-for-beginners",
    ],
  },
  {
    title: "Form and the exercises",
    blurb: "How to move right, and the exercises Gavin leans on most.",
    ids: [
      "importance-of-proper-form-over-40",
      "farmer-carries-every-class",
      "farmer-carries-benefits",
      "push-pull-legs-workout-routine",
      "best-core-exercises-over-40",
      "best-3-daily-exercises",
    ],
  },
  {
    title: "Joints, pain and recovery",
    blurb: "Sore knees, stiff backs, and how to train around them.",
    ids: [
      "recovery-techniques-for-active-aging",
      "science-of-training-after-40",
    ],
  },
  {
    title: "Mindset and staying with it",
    blurb: "The hard part is rarely the exercise. It is showing up.",
    ids: [
      "overcoming-mental-obstacles-fitness-journey",
      "mindset-barriers-in-home-training-benefits",
      "mental-health-benefits-of-exercise",
      "mental-benefits-workout-consistency",
    ],
  },
  {
    title: "Food and lifestyle",
    blurb: "Eating well and living well around the training.",
    ids: [
      "understanding-macronutrients",
      "healthy-fulfilling-lifestyle-balance",
      "wellness-lifestyle-balance-sarasota",
    ],
  },
  {
    title: "Training at home and gear",
    blurb: "In-home training, and the gear worth having at home.",
    ids: ["in-home-training-vs-public-gym", "beyond-power-voltra-1-review"],
  },
];

export default function BlogStartHere({ groups, ungrouped }) {
  return (
    <Layout>
      <SEO
        title="Start Here | FL Best Trainer Blog"
        description="New to the FL Best Trainer blog? Find the right post for where you are: starting after 50, form and exercises, joints and recovery, mindset, food, or training at home."
        keywords="strength training after 50, beginner workout, form, osteoporosis exercise, balance, in-home training"
        url="/blog/start-here"
        ogImage="/images/blog-header.jpg"
        isArticle={false}
      />

      <main>
        <section className="pt-32 pb-20 bg-gradient-to-b from-black to-navy relative">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-[1100px]">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Start here
            </h1>
            <p className="text-white/70 mt-3 mb-10 max-w-2xl">
              Every post on the blog, grouped by what you are looking for.
              Pick the group that matches where you are.
            </p>

            {groups.map((group) => (
              <div key={group.title} className="mb-12">
                <h2 className="text-2xl font-bold text-white">
                  {group.title}
                </h2>
                <p className="text-white/60 text-sm mt-1 mb-5">
                  {group.blurb}
                </p>
                <ul className="space-y-3">
                  {group.posts.map((post) => (
                    <li
                      key={post.id}
                      className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl px-5 py-4 hover:border-royal/30 transition-colors"
                    >
                      <a href={`/blog/${post.id}`} className="block">
                        <span className="text-lg font-bold text-white hover:text-royal-light transition-colors">
                          {post.title}
                        </span>
                        {post.excerpt && (
                          <span className="block text-white/70 text-sm mt-1">
                            {post.excerpt}
                          </span>
                        )}
                        <span className="block text-white/50 text-xs mt-2">
                          {post.date} · {post.readTime}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {ungrouped.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white">
                  More from the blog
                </h2>
                <ul className="space-y-3 mt-5">
                  {ungrouped.map((post) => (
                    <li
                      key={post.id}
                      className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl px-5 py-4 hover:border-royal/30 transition-colors"
                    >
                      <a href={`/blog/${post.id}`} className="block">
                        <span className="text-lg font-bold text-white hover:text-royal-light transition-colors">
                          {post.title}
                        </span>
                        <span className="block text-white/50 text-xs mt-2">
                          {post.date} · {post.readTime}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-white/60 text-sm">
              <a href="/blog" className="text-royal-light hover:text-white">
                See all posts
              </a>{" "}
              or{" "}
              <a href="/start" className="text-royal-light hover:text-white">
                get the free 7-day guide
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  // Summaries only; the hub links out to each post's own page.
  const posts = getAllPosts().map(({ content, ...summary }) => summary);
  const byId = new Map(posts.map((post) => [post.id, post]));

  const groups = TOPICS.map((topic) => ({
    ...topic,
    posts: topic.ids.map((id) => byId.get(id)).filter(Boolean),
  }));
  const groupedIds = new Set(TOPICS.flatMap((topic) => topic.ids));
  const ungrouped = posts.filter((post) => !groupedIds.has(post.id));

  return {
    props: {
      groups,
      ungrouped,
    },
  };
}
