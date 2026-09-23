// Adds a guard on top of app.json (Expo passes it in as `config`).
//
// A store build without Supabase settings would quietly ship demo mode,
// including the demo sign-in code. On EAS build servers, fail instead.
// The values come from EAS environment variables (see README, "Building for
// the stores"); mobile/.env is gitignored, so it never reaches EAS.
module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const configured =
    process.env.EXPO_PUBLIC_SUPABASE_URL &&
    (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

  if (process.env.EAS_BUILD === "true" && profile === "production" && !configured) {
    throw new Error(
      "Production builds need EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "in the EAS 'production' environment. See mobile/README.md.",
    );
  }
  return config;
};
