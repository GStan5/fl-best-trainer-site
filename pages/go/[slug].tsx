import { getPickBySlug } from "@/components/gear/data/gearPicks";
import { amazonUrl } from "@/lib/gearConfig";

// Own-domain redirect for Check Price buttons (GGR's /go/ shape).
// The click stays on our domain, the tag is ours, and the destination
// can change without editing every page. The link is built by us from
// the product's ASIN — never copied off another site.
export async function getServerSideProps({ params, res }) {
  const pick = getPickBySlug(params.slug);

  if (!pick) {
    return { notFound: true };
  }

  res.writeHead(302, { Location: amazonUrl(pick.amazon.asin) });
  res.end();

  return { props: {} };
}

export default function GoRedirect() {
  return null;
}
