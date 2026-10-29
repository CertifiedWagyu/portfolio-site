import { useCallback, useState } from "react";
import { profile } from "../data/profile";
import { useSiteProfile } from "../hooks/useSiteProfile";
import { About } from "./About";
import { AsciiArt } from "./AsciiArt";
import { BootScreen } from "./BootScreen";
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
  const [booted, setBooted] = useState(false);
  const handleBooted = useCallback(() => setBooted(true), []);

  return (
    <div className="min-h-screen bg-parchment text-coal">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <AsciiArt
          variant="gothic"
          className="absolute inset-0"
          fontSize={11}
          fps={12}
          speed={0.8}
        />
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_30%,var(--color-ink)_0%,transparent_100%)] opacity-[0.07]" />
        <div className="absolute inset-0 bg-[radial-gradient(64%_58%_at_50%_34%,var(--color-parchment)_0%,transparent_74%)] opacity-30" />
        <div className="vignette absolute inset-0" />
      </div>
      {!booted && <BootScreen onDone={handleBooted} />}
      <div
        aria-hidden="true"
        className="grain pointer-events-none fixed inset-0 z-[70] opacity-[0.04]"
      />
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
