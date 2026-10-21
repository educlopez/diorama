/** The site is a static export of a few pages plus the example pages the prebuild writes into public/examples. */
export default {
  reactStrictMode: true,
  redirects: async () => [
    { source: "/gallery", destination: "/svg", permanent: true },
    { source: "/figures", destination: "/svg", permanent: true },
  ],
};
