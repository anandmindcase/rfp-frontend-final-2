import "~/styles/globals.css";
import ReactGA from "react-ga4";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

import { GOOGLE_ANALYTICS_ID } from "~/constants";
import Layout from "~/components/Layout";
import { type AppType } from "next/dist/shared/lib/utils";
import { Toaster } from "~/components/ui/toaster";
import HydrationZustand from "~/components/HydrationZustand";
import { useRouter } from 'next/router'
ReactGA.initialize(GOOGLE_ANALYTICS_ID);
// const publicPages = ['/']

const MyApp: AppType = ({ Component, pageProps }) => {
  // const { pathname } = useRouter()
  // const isPublicPage = publicPages.includes(pathname)
  return (
    <ClerkProvider appearance={{
        elements: {
          footer: "hidden",
        },
      }}>
      <HydrationZustand>
      <Layout>
        <Component {...pageProps} />
        <Toaster/>
      </Layout>

      </HydrationZustand>
    </ClerkProvider>
  );
};

export default MyApp;
