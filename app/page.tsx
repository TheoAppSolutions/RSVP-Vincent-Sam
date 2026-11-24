import Hero from "@/components/template-3/Hero";
import Countdown from "@/components/template-3/Countdown";
import MapSection from "@/components/template-3/MapSection";
import Attire from "@/components/template-3/Attire";
import Gift from "@/components/template-3/Gift";
import GoodToKnow from "@/components/template-3/GoodToKnow";
import Gallery from "@/components/template-3/Gallery";
import DesignShell from "@/components/template-3/MusicPlayer";
import { EVENT } from "@/lib/event";

export default function Home() {
  return (
    <DesignShell>
      <main className="wedding-site">
        <Hero />
        <Countdown />
        <MapSection />
        <Gallery />
        <Attire />
        <GoodToKnow />
        <Gift />
        <section id="rsvp" className="rsvp-section" aria-labelledby="rsvp-title">
          <div className="rsvp-section-inner">
            <div className="rsvp-intro">
              <span className="eyebrow light">The celebration is better with you</span>
              <h2 id="rsvp-title" className="display-heading">The pleasure of your <em>company</em></h2>
              <p>Thank you for your warm wishes. View the guest responses and messages shared for our celebration.</p>
              <div className="rsvp-monogram" aria-hidden="true">{EVENT.initials}</div>
            </div>
            <a href="/admin/" className="dashboard-button">View admin dashboard <span aria-hidden="true">↗</span></a>
          </div>
        </section>
        <footer className="site-footer">
          <div className="footer-mark">{EVENT.initials}</div>
          <p>{EVENT.dateLabel} <span aria-hidden="true">·</span> {EVENT.venue.name}</p>
          <p>Made with love, for the people we love.</p>
          <a href="#top">Back to top ↑</a>
        </footer>
      </main>
    </DesignShell>
  );
}
