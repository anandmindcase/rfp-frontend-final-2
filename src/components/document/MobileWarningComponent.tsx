import React from "react";
import { useRouter } from "next/router";
import { BiArrowBack } from "react-icons/bi";

const MobileWarningComponent = () => {
  const router = useRouter();
  return (
    <div className="landing-page-gradient-1 relative flex h-screen w-screen items-center justify-center">
      <div className="flex h-min w-3/4 flex-col items-center justify-center rounded border bg-white p-4">
        <div className="text-center text-xl ">
          Sorry, the mobile view of this page is currently a work in progress.
          Please switch to desktop!
        </div>
        <button
          onClick={() => {
            router.push(`/`).catch(() => console.log("error navigating to conversation"));
          }}
          className="bg-llama-indigo m-4 rounded border px-8 py-2 font-bold text-white hover:bg-[#3B3775]"
        >
          Back Home
        </button>
      </div>
    </div>
  );
};

export default MobileWarningComponent;
