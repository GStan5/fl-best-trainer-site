import { hexDumbbells } from "./picks/hexDumbbells";
import { resistanceBands } from "./picks/resistanceBands";
import { garminForerunner265s } from "./picks/garminForerunner265s";
import { ospreyFarpointTrek55 } from "./picks/ospreyFarpointTrek55";

// Gear picks, file-based, mirroring the blog (components/blog/data).
// No database table — if the blog ever moves to the DB, gear moves with
// it. One decision, not two.

export const gearPicks = [
  hexDumbbells,
  resistanceBands,
  garminForerunner265s,
  ospreyFarpointTrek55,
];

export const getPickBySlug = (slug) =>
  gearPicks.find((pick) => pick.slug === slug);

export const getPicksByGroup = (groupId) =>
  gearPicks.filter((pick) => pick.group === groupId);

// Job groups at launch — grouped by JOB, not brand (Gavin, decided).
// Balance and Recovery & Feeling Better open later, only with a real
// pick and a teaching post. No group opens empty.
export const GEAR_GROUPS = [
  {
    id: "strength-at-home",
    name: "Strength at Home",
    blurb: "Weights you use in your living room.",
  },
  {
    id: "walking-and-tracking",
    name: "Walking & Tracking",
    blurb: "Gear for the walk, and for knowing the walk counted.",
  },
  {
    id: "travel-and-everyday",
    name: "Travel & Everyday",
    blurb: "Gear for the trainer — and the client — who travels and still wants to move.",
  },
];

export const getGroupById = (id) =>
  GEAR_GROUPS.find((group) => group.id === id);
