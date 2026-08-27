

// "use client"

// import FgRecheckingRejectionEntry from "@/components/Mes/components/Packing/FgRejection";
// import PackingForm from "@/components/Mes/components/Packing/PackingForm";
// import RejectionForm from "@/components/Mes/components/Packing/RejectionFrom";
// import WipBGradeEntry from "@/components/Mes/components/Packing/WipBgradeFrom";
// import LogoutButton from "@/components/Mes/logout/logoutButton";

// export default function PackingPage() {
//   return (
//     <div className="max-w-5xl mx-auto p-6 bg-gradient-to-b from-white to-green-50 min-h-screen">
//       <div className="absolute top-4 right-4 z-50">
//         <LogoutButton />
//       </div>
//       <h1 className="text-3xl font-bold text-center text-green-800 mb-10">Packing Entry</h1>
//       <PackingForm />
//       <div className="my-10 border-t border-gray-300" />
//       <WipBGradeEntry />
//       <div className="my-10 border-t border-gray-300" />
//       <RejectionForm />
//       <div className="my-10 border-t border-gray-300" />
//       <FgRecheckingRejectionEntry />
//     </div>
//   )
// }


"use client";

import FgRecheckingRejectionEntry from "@/components/Mes/components/Packing/FgRejection";
import PackingForm from "@/components/Mes/components/Packing/PackingForm";
import RejectionForm from "@/components/Mes/components/Packing/RejectionFrom";
import WipBGradeEntry from "@/components/Mes/components/Packing/WipBgradeFrom";
import LogoutButton from "@/components/Mes/logout/logoutButton";
import { useRouter } from "next/navigation";


export default function PackingPage() {
  // const navigateReport = (id) => {
  //   document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  // };
  const router = useRouter();
  const navigateReport = (reportName) => {
    router.push(`/mes/report/${reportName}`)
  }


  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-b from-white to-green-50 min-h-screen">
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold text-center text-green-800 mb-6">Packing Entry</h1>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-300 py-2 mb-6 shadow-sm">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigateReport("fgEntry")}
            className="px-4 py-1 rounded-full bg-green-200 hover:bg-green-300 text-green-800 font-medium transition"
          >
            FG Packing
          </button>
          <button
            onClick={() => navigateReport("wipBgradeEntry")}
            className="px-4 py-1 rounded-full bg-purple-200 hover:bg-purple-300 text-purple-800 font-medium transition"
          >
            WIP Bgrade
          </button>
          <button
            onClick={() => navigateReport("wipRejectionEntry")}
            className="px-4 py-1 rounded-full bg-red-200 hover:bg-red-300 text-red-800 font-medium transition"
          >
            WIP Rejection
          </button>
          <button
            onClick={() => navigateReport("fgRejectionEntry")}
            className="px-4 py-1 rounded-full bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-medium transition"
          >
            FG Rejection
          </button>
        </div>
      </div>

      {/* Sections */}
      <div id="fg">
        <PackingForm />
      </div>

      <div className="my-10 border-t border-gray-300" />

      <div id="wip">
        <WipBGradeEntry />
      </div>

      <div className="my-10 border-t border-gray-300" />

      <div id="rejection">
        <RejectionForm />
      </div>

      <div className="my-10 border-t border-gray-300" />

      <div id="fgRejection">
        <FgRecheckingRejectionEntry />
      </div>
    </div>
  );
}
