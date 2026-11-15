import { getPostById } from "../../../utils/markdown";

// Returns one full blog post (including its body) by id. The blog list page
// ships summaries only; the body loads through here when a reader opens a
// post, keeping the list page light.
export default function handler(req, res) {
  const { id } = req.query;
  const post = getPostById(id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  return res.status(200).json(post);
}
