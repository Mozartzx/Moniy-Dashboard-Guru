import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/landing-header';
import { AboutSection } from '@/components/landing/about-section';
import { CtaSection } from '@/components/landing/cta-section';
import { FaqSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowSection } from '@/components/landing/how-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Hero } from '@/components/landing/landing-sections';
import { TeacherSection } from '@/components/landing/teacher-section';
import { ScenarioWall } from '@/components/landing/scenario-wall';
import './landing.css';
import './landing-next.css';

export const metadata: Metadata = {
  title: 'Moniy | Belajar keuangan lewat cerita seru',
  description: 'Moniy mengajak siswa SMA belajar keuangan lewat cerita interaktif, simulasi bisnis, dan proteksi judi online. Guru memantau kelas lewat dashboard.',
};

export default function Home() {
  return (
    <div className="lp">
      <a className="lp-skip" href="#lp-main">Lewati ke konten</a>
      <LandingHeader />
      <main id="lp-main">
        <Hero />
        <ScenarioWall />
        <AboutSection />
        <HowSection />
        <FeaturesSection />
        <TeacherSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
