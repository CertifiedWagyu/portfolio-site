import { profile } from "../data/profile";
import { useSiteProfile } from "../hooks/useSiteProfile";
import { About } from "./About";
import { Certificates } from "./Certificates";
import { CommandPalette } from "./CommandPalette";
import { Contact } from "./Contact";
import { BackToTop, ScrollProgress } from "./Decor";
import { EasterEgg } from "./EasterEgg";
import { Education } from "./Education";
import { Footer } from "./Footer";
import { Games } from "./Games";
import { Goals } from "./Goals";
import { Hero } from "./Hero";
import { Navbar } from "./Navbar";
import { Skills } from "./Skills";

export function Site() {
  const siteProfile = useSiteProfile();

  return (
    <div className="min-h-screen bg-parchment text-coal">
      <ScrollProgress />
      <Navbar name={siteProfile.displayName} />
      <main className="relative z-10">
        <Hero siteProfile={siteProfile} />
        <About siteProfile={siteProfile} />
        <Skills />
        <Certificates />
        <Games />
        <Education />
        <Goals />
        <Contact email={profile.email} />
        <Footer name={siteProfile.displayName} />
      </main>
      <BackToTop />
      <EasterEgg />
      <CommandPalette />
    </div>
  );
}
