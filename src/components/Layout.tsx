import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { type PropsWithChildren } from "react";
import { Button } from "./ui/button";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className=" flex h-screen w-screen flex-col">
      {/* <div className="flex h-10 items-center justify-end px-2">
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" className="h-[32px] rounded text-sm font-medium">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div> */}
      {children}
    </div>
  );
};
export default Layout;
