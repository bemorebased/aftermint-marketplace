import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Only enable in production or if DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Capture 100% of the transactions
  // Learn more about sampling here: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/sampling/
  replaysSessionSampleRate: 0.1,

  // Capture 100% of the transactions when an error occurs
  replaysOnErrorSampleRate: 1.0,

  // Additional SDK configuration goes in here
  debug: false,
  
  beforeSend(event) {
    // Filter out known non-critical errors
    if (event.message?.includes('MetaMask encountered an error')) {
      return null;
    }
    return event;
  },
}); 