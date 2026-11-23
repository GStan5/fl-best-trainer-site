import { hexDumbbells } from "./picks/hexDumbbells";
import { resistanceBands } from "./picks/resistanceBands";
import { garminForerunner265s } from "./picks/garminForerunner265s";
import { ospreyFarpointTrek55 } from "./picks/ospreyFarpointTrek55";
import { repKettlebellSet } from "./picks/repKettlebellSet";
import { repAdjustableKettlebell } from "./picks/repAdjustableKettlebell";
import { repQuickDrawAdjustableDumbbell } from "./picks/repQuickDrawAdjustableDumbbell";
import { repBalanceBallTrainer } from "./picks/repBalanceBallTrainer";
import { nordicTrackCommercial1750 } from "./picks/nordicTrackCommercial1750";
import { nordicTrackX24Bike } from "./picks/nordicTrackX24Bike";
import { concept2RowErg } from "./picks/concept2RowErg";
import { nordicTrackAirGlide16 } from "./picks/nordicTrackAirGlide16";
import { saunaBoxSmartSteamKitPro } from "./picks/saunaBoxSmartSteamKitPro";
import { higherDoseInfraredSaunaBlanket } from "./picks/higherDoseInfraredSaunaBlanket";
import { theragunPrime } from "./picks/theragunPrime";
import { sereneLifePortableSauna } from "./picks/sereneLifePortableSauna";
import { hypervoltGo2 } from "./picks/hypervoltGo2";
import { amazonBasicsFoamRoller } from "./picks/amazonBasicsFoamRoller";
import { iceBarrel300 } from "./picks/iceBarrel300";
import { bobAndBradIMasterPro } from "./picks/bobAndBradIMasterPro";
import { assaultAirBikeClassic } from "./picks/assaultAirBikeClassic";

// Gear picks, file-based, mirroring the blog (components/blog/data).
// No database table — if the blog ever moves to the DB, gear moves with
// it. One decision, not two.

export const gearPicks = [
  hexDumbbells,
  resistanceBands,
  garminForerunner265s,
  ospreyFarpointTrek55,
  repKettlebellSet,
  repAdjustableKettlebell,
  repQuickDrawAdjustableDumbbell,
  repBalanceBallTrainer,
  nordicTrackCommercial1750,
  nordicTrackX24Bike,
  concept2RowErg,
  nordicTrackAirGlide16,
  saunaBoxSmartSteamKitPro,
  higherDoseInfraredSaunaBlanket,
  theragunPrime,
  sereneLifePortableSauna,
  hypervoltGo2,
  amazonBasicsFoamRoller,
  iceBarrel300,
  bobAndBradIMasterPro,
  assaultAirBikeClassic,
];

export const getPickBySlug = (slug) =>
  gearPicks.find((pick) => pick.slug === slug);

export const getPicksByGroup = (groupId) =>
  gearPicks.filter((pick) => pick.group === groupId);

// Job groups — grouped by JOB, not brand (Gavin, decided).
// Strength at Home, Walking & Tracking, Travel & Everyday opened at
// launch. Cardio at Home, Recovery & Feeling Better, and Balance opened
// with the GGR expansion (2026-11-23): every pick in them is a GGR
// roundup winner proposed for Gavin to confirm (proposed: true on the
// pick). No group opens empty.
export const GEAR_GROUPS = [
  {
    id: "strength-at-home",
    name: "Strength at Home",
    blurb: "Weights you use in your living room.",
  },
  {
    id: "cardio-at-home",
    name: "Cardio at Home",
    blurb: "Low-impact cardio you can do in your living room. Walk, ride, or row, without wrecking your knees.",
  },
  {
    id: "recovery-and-feeling-better",
    name: "Recovery & Feeling Better",
    blurb: "The stuff that helps you bounce back. Heat, cold, and massage, at home.",
  },
  {
    id: "balance",
    name: "Balance",
    blurb: "Standing steady on one leg. The tools that train it.",
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
