import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Local tooling / generated workspaces
    ".claude/**",
    ".playwright-cli/**",

    // Archived / non-production code
    "obsoletos/**",

    // One-off local migration script
    "scripts/import-legals.js",
  ]),

  {
    // These components intentionally render dynamic/user-generated media,
    // including blob/object URLs, previews, zoomable media and video frames.
    files: [
      "components/comments/CommentList.tsx",
      "components/feed/FeedPost.tsx",
      "components/feed/ZoomableMedia.tsx",
      "components/layout/PublicMenu.tsx",
      "components/moderation/WorkPreview.tsx",
      "components/onboarding/OnboardingForm.tsx",
      "components/profile/AuthorDashboard.tsx",
      "components/profile/EditProfileForm.tsx",
      "components/profile/UserProfile.tsx",
      "components/project/ProjectAuthor.tsx",
      "components/project/ProjectMedia.tsx",
      "components/works/CreateWorkForm.tsx",
      "components/works/ImageUploader.tsx",
      "components/works/MyWorks.tsx",
      "components/works/VideoPosterPicker.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
