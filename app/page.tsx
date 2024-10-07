import CosmicChickenRhapsody from "@/components/ui/game";
import PWAInstallAndNotifications from "@/components/ui/install";
import RedirectOverlay from "@/components/ui/sorry";
import Welcome from "@/components/ui/welcome";
// import CosmicChickenGame from "@/components/ui/game";
// import SlothSprint from "@/components/ui/game";
// import HungryCloudSnackAttack from "@/components/ui/game";
// import SausageSlap from "@/components/ui/game";
// import Image from "next/image";
const siteFeatures = ["Offline capability", "Reset Game", "Harder Gameplay"];

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center">
      {/* <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"> */}
      <CosmicChickenRhapsody />
      <PWAInstallAndNotifications />
      {/* <Welcome/>
       */}
      <Welcome features={siteFeatures} />
      {/* const siteFeatures = ["Offline capability", "Reset Game", "Harder
      Gameplay"]; */}
      <RedirectOverlay />
    </div>
  );
}
