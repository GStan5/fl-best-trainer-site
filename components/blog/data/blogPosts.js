import { beginnerTrainingTips } from "./posts/beginnerTrainingTips";
import { coreForOver40 } from "./posts/coreForOver40";
import { fitnessLifestyleOver40 } from "./posts/fitnessLifestyleOver40";
import { importanceOfForm } from "./posts/importanceOfForm";
import { inHomeVsGym } from "./posts/inHomeVsGym";
import { macronutrients } from "./posts/macronutrients";
import { mentalHealthBenefits } from "./posts/mentalHealthBenefits";
import { mindsetInHomeTraining } from "./posts/mindsetInHomeTraining";
import { pushPullLegs } from "./posts/pushPullLegs";
import { recoveryForOver40 } from "./posts/recoveryForOver40";
import { scienceBehindTraining } from "./posts/scienceBehindTraining";
import { strengthAfter50 } from "./posts/strengthAfter50";
import { threeEssentialExercises } from "./posts/threeEssentialExercises";

// Import more posts as you add them

export const blogPosts = [
  beginnerTrainingTips,
  coreForOver40,
  fitnessLifestyleOver40,
  importanceOfForm,
  inHomeVsGym,
  macronutrients,
  mentalHealthBenefits,
  mindsetInHomeTraining,
  pushPullLegs,
  recoveryForOver40,
  scienceBehindTraining,
  strengthAfter50,
  threeEssentialExercises,
  // Add more posts to the array as you create them
];

// Optional: Export helper functions
export const getFeaturedPost = () => blogPosts.find((post) => post.featured);
export const getPostById = (id) => blogPosts.find((post) => post.id === id);
export const getPostsByCategory = (category) => {
  if (category === "all") return blogPosts;
  return blogPosts.filter((post) => post.category === category);
};
