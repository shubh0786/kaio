import { useState } from 'react';
import {
  Thermometer, ClipboardCheck, SprayCan, Users, Truck, AlertTriangle,
  CalendarCheck, Download, Smartphone, Shield, ChevronDown, Check, ArrowRight,
  BookOpen, Snowflake, Settings, MessageSquareWarning,
} from 'lucide-react';
import { KaioLogo, KaioMark } from './KaioLogo';
import { loadStr } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/storageKeys';

interface LandingPageProps {
  onEnterApp: () => void;
}

const FEATURES = [
  { icon: Thermometer, title: 'Temperature logging', desc: 'Log fridge, freezer, and hot-hold temps. See what\'s missing before service starts.' },
  { icon: ClipboardCheck, title: 'Daily diary', desc: 'Opening and closing checks, pest control, cleaning — one place, every shift.' },
  { icon: Users, title: 'Staff & training', desc: 'Track who was trained, when, and on what. Audit view ready for verifiers.' },
  { icon: Truck, title: 'Suppliers & deliveries', desc: 'Record incoming goods and supplier details.' },
  { icon: MessageSquareWarning, title: 'Complaints & incidents', desc: 'Document customer complaints and food safety incidents properly.' },
  { icon: CalendarCheck, title: '4-week review', desc: 'Never miss your self-audit. Kaio tracks when you\'re overdue.' },
  { icon: Download, title: 'Audit-ready exports', desc: 'PDF and Excel per section. Hand your verifier a complete pack in minutes.' },
  { icon: Smartphone, title: 'Works offline', desc: 'Installs on any phone or tablet. No app store. No WiFi required in the kitchen.' },
];

const EXTRAS = ['Cooking validation', 'Cooling records', 'Calibration', 'Allergen register', 'Cleaning & maintenance'];

const FREE_FEATURES = [
  'All 13 compliance modules',
  'Offline PWA',
  'PDF & Excel export',
  'Manual JSON backup',
  'Operator & audit modes',
];

const PRO_FEATURES = [
  'Automatic cloud backup',
  'Multi-device sync',
  'Staff accounts + PIN sign-off',
  'Photo evidence',
  'Email & push alerts',
  'Verifier share link',
];

const FAQ = [
  {
    q: 'Is Kaio approved by MPI?',
    a: 'Kaio helps you keep records required under the Food Act 2014 and MPI\'s Simply Safe & Suitable template. It is not affiliated with or endorsed by MPI. You remain responsible for your registered Food Control Plan.',
  },
  {
    q: 'Is my data safe?',
    a: 'On the free plan, all records stay on your device in your browser. Nothing is sent to any server. Kaio Pro will add optional encrypted cloud backup — you choose when to sync.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Open the app, enter your name, and start logging. Pro features will require an account for cloud sync.',
  },
  {
    q: 'Does it work on iPhone and Android?',
    a: 'Yes. Kaio is a Progressive Web App — install it from your browser to your home screen. No app store required.',
  },
  {
    q: 'Can my verifier use it?',
    a: 'Yes. Switch to Audit mode for verifier-friendly navigation, then export PDFs for each section. Kaio Pro will add a read-only share link for remote verification.',
  },
  {
    q: 'How is this different from Chomp or Safe Food Pro?',
    a: 'Those are excellent tools for larger operations and multi-site groups. Kaio is free for independents who need full MPI record-keeping without a $80–90/month subscription.',
  },
  {
    q: 'What if I lose my phone?',
    a: 'On the free plan, use Backup & Export regularly to download a JSON file. Kaio Pro adds automatic cloud backup so your records survive device changes.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{q}</span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-200"
          style={{ color: 'var(--text-faint)', transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>
      {open && (
        <p className="text-sm pb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{a}</p>
      )}
    </div>
  );
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const dark = loadStr(STORAGE_KEYS.theme) === 'dark';

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const joinWaitlist = () => {
    window.location.href = 'mailto:hello@kaio.app?subject=Kaio%20Pro%20waitlist&body=Please%20notify%20me%20when%20Kaio%20Pro%20launches.%0A%0AVenue%20name%3A%20%0ACity%3A%20';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ background: dark ? 'rgba(15, 27, 45, 0.85)' : 'rgba(246, 248, 251, 0.85)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KaioMark size={32} className="rounded-lg" />
            <KaioLogo dark={dark} className="h-7 w-auto" />
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <button type="button" onClick={() => scrollTo('features')} className="text-sm" style={{ color: 'var(--text-muted)' }}>Features</button>
            <button type="button" onClick={() => scrollTo('pricing')} className="text-sm" style={{ color: 'var(--text-muted)' }}>Pricing</button>
            <button type="button" onClick={() => scrollTo('faq')} className="text-sm" style={{ color: 'var(--text-muted)' }}>FAQ</button>
          </nav>
          <button
            type="button"
            onClick={onEnterApp}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)' }}
          >
            Open app
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34, 197, 94, 0.12), transparent)' }}
        />
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center relative">
          <KaioMark size={72} className="rounded-2xl mx-auto mb-6" />
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            Free MPI compliance for NZ hospitality
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--navy)', fontFamily: "'Poppins', sans-serif" }}
          >
            Food safety, sorted.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            The free Food Control Plan app for NZ cafes and restaurants. Log temperatures, daily checks,
            training, and more — on any phone, offline, with audit-ready PDF exports.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={onEnterApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-3.5 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)', boxShadow: 'var(--shadow-fab)' }}
            >
              Install free — no account needed
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('modes')}
              className="w-full sm:w-auto text-base font-medium px-8 py-3.5 rounded-xl"
              style={{ color: 'var(--navy)', border: '1px solid var(--border)' }}
            >
              See how audit mode works
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Built for MPI Simply Safe &amp; Suitable template FCPs · Works offline · Your data stays on your device
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 md:py-20" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--navy)', fontFamily: "'Poppins', sans-serif" }}>
            Paper binders don&apos;t pass verifications.<br className="hidden sm:block" /> $90/month apps don&apos;t fit small cafes.
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Every NZ cafe on a Food Control Plan must keep daily records for at least four years. Most independents
            still use clipboards and ring binders — messy, easy to lose, stressful when the verifier arrives.
          </p>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Digital tools exist, but they&apos;re priced for groups and chains. If you&apos;re a 1-site cafe with tight
            margins, you need something that actually works without another subscription eating your smoko break.
          </p>
          <p className="text-base font-semibold" style={{ color: 'var(--navy)' }}>
            Kaio is that tool. Free. NZ-native. Ready in minutes.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--navy)', fontFamily: "'Poppins', sans-serif" }}>
              Everything MPI expects. Nothing you don&apos;t.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card rounded-2xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--bg-check)' }}>
                  <Icon size={20} style={{ color: 'var(--navy)' }} />
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text)' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {EXTRAS.map((label) => (
              <span
                key={label}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-check)', color: 'var(--text-secondary)' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Two modes */}
      <section id="modes" className="py-16 md:py-20" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: 'var(--navy)', fontFamily: "'Poppins', sans-serif" }}>
            Two modes. One app.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card rounded-2xl p-6 shadow-sm" style={{ borderLeft: '4px solid var(--navy)' }}>
              <div className="flex items-center gap-3 mb-3">
                <ClipboardCheck size={22} style={{ color: 'var(--navy)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Operator mode</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your team&apos;s daily dashboard. Log temps, complete diary checks, see what&apos;s overdue.
                Built for the 6am shift when nobody wants to think about compliance.
              </p>
            </div>
            <div className="card rounded-2xl p-6 shadow-sm" style={{ borderLeft: '4px solid var(--gold)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Shield size={22} style={{ color: 'var(--gold)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Audit mode</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your verifier&apos;s navigation map. Every MPI record category in one screen — refrigeration,
                cleaning, staff, proven cooking methods, self-audit. Export and go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency */}
      <section className="py-14" style={{ background: 'var(--navy)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold-light)' }}>
            Paperless food safety
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Ditch the clipboard and ring binder
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Every NZ cafe on a Food Control Plan must keep daily records for at least four years. Kaio makes it fast, digital, and audit-ready — free, on any phone, offline.
          </p>
          <button
            type="button"
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'white', color: 'var(--navy)' }}
          >
            Start free — no account needed
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={{ color: 'var(--navy)', fontFamily: "'Poppins', sans-serif" }}>
            Free forever. Upgrade when you need more.
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
            Start with the full app at no cost. Add cloud backup and team features when your cafe grows.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card rounded-2xl p-6 shadow-sm flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>Kaio Free</p>
              <p className="text-3xl font-bold mb-4" style={{ color: 'var(--navy)' }}>$0</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text)' }}>
                    <Check size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onEnterApp}
                className="w-full text-sm font-semibold py-3 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)' }}
              >
                Start free — no credit card
              </button>
            </div>
            <div
              className="card rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden"
              style={{ border: '2px solid var(--gold)' }}
            >
              <span
                className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ background: 'var(--bg-check)', color: 'var(--navy)' }}
              >
                Coming soon
              </span>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>Kaio Pro</p>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--navy)' }}>
                $29<span className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>/mo</span>
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>or $299/year · NZD ex GST</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text)' }}>
                    <Check size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={joinWaitlist}
                className="w-full text-sm font-semibold py-3 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'var(--bg-check)', color: 'var(--navy)', border: '1px solid var(--border)' }}
              >
                Join Pro waitlist — 3 months free at launch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Module icons strip */}
      <section className="py-10 border-t border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-12">
          {[
            { icon: Snowflake, label: 'Refrigeration' },
            { icon: BookOpen, label: 'Training' },
            { icon: Settings, label: 'Calibration' },
            { icon: SprayCan, label: 'Cleaning' },
            { icon: AlertTriangle, label: 'Incidents' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon size={22} style={{ color: 'var(--text-faint)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--navy)', fontFamily: "'Poppins', sans-serif" }}>
            Frequently asked questions
          </h2>
          <div>
            {FAQ.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-center" style={{ background: 'var(--bg-alt)' }}>
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--navy)', fontFamily: "'Poppins', sans-serif" }}>
            Ready to go paperless?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Open Kaio on your phone, add it to your home screen, and log your first temperature check in under five minutes.
          </p>
          <button
            type="button"
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 text-base font-semibold px-8 py-3.5 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'var(--navy)', color: 'var(--btn-primary-text)', boxShadow: 'var(--shadow-fab)' }}
          >
            Open Kaio free
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <KaioLogo dark={dark} className="h-7 w-auto mb-2" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Food safety, sorted.</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Built in Aotearoa New Zealand</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <button type="button" onClick={onEnterApp} className="hover:underline">Open app</button>
              <button type="button" onClick={() => scrollTo('pricing')} className="hover:underline">Pricing</button>
              <button type="button" onClick={() => scrollTo('faq')} className="hover:underline">FAQ</button>
              <a href="mailto:hello@kaio.app?subject=Kaio%20feedback" className="hover:underline">Contact</a>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            Kaio assists with food safety record-keeping but does not guarantee MPI compliance.
            Not affiliated with the Ministry for Primary Industries.
          </p>
        </div>
      </footer>
    </div>
  );
}
