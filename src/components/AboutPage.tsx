import { X, Thermometer, ClipboardCheck, SprayCan, Users, Truck, MessageSquareWarning, AlertTriangle, CalendarCheck, BookOpen } from 'lucide-react';

const SECTIONS = [
  { icon: Thermometer, label: 'Temperature Logging' },
  { icon: ClipboardCheck, label: 'Daily Diary (Opening & Closing Checks)' },
  { icon: SprayCan, label: 'Cleaning & Maintenance' },
  { icon: Users, label: 'Staff Records' },
  { icon: BookOpen, label: 'Staff Training' },
  { icon: Truck, label: 'Suppliers & Deliveries' },
  { icon: MessageSquareWarning, label: 'Customer Complaints' },
  { icon: AlertTriangle, label: 'Incident Reports' },
  { icon: CalendarCheck, label: '4-Week Review' },
];

export default function AboutPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 no-print"
      style={{ background: 'var(--overlay)', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}>
      <div className="rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 rounded-full mx-auto mb-4 md:hidden" style={{ background: 'var(--sheet-handle)' }} />

        <div className="flex items-center justify-between mb-2">
          <div />
          <button onClick={onClose} className="p-2 rounded-xl" style={{ color: 'var(--text-faint)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-[4px]" style={{ color: 'var(--navy)' }}>KAIO</h1>
          <p className="text-xs font-medium mt-1" style={{ color: 'var(--gold)' }}>v1.0.0</p>
          <p className="text-sm font-semibold mt-2" style={{ color: 'var(--text)' }}>food safety, sorted.</p>
          <p className="text-xs mt-2 px-4" style={{ color: 'var(--text-muted)' }}>
            Free food safety compliance app for NZ cafes and restaurants. Built for MPI Food Control Plan record-keeping.
          </p>
        </div>

        {/* What's included */}
        <div className="card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--navy)' }}>What's included</h3>
          <ul className="space-y-2">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <li key={s.label} className="flex items-center gap-2.5">
                  <Icon size={14} style={{ color: 'var(--text-faint)' }} className="shrink-0" />
                  <span className="text-sm" style={{ color: 'var(--text)' }}>{s.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* MPI Compliance */}
        <div className="card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>MPI Compliance</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Under the Food Act 2014, food businesses operating under a Food Control Plan must keep records for at least 4 years. Records should be in English, include dates and the name of the person recording.
          </p>
        </div>

        {/* Data & Privacy */}
        <div className="card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>Data & Privacy</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            All data stays on your device. Nothing is sent to any server. Your records are stored locally in your browser.
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>Legal Disclaimer</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            This app assists with food safety record-keeping but does not guarantee MPI compliance. You are responsible for maintaining your Food Control Plan.
          </p>
        </div>

        {/* Support */}
        <div className="card rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>Support</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Email: <a href="mailto:support@kaio.app" className="font-semibold" style={{ color: 'var(--navy)' }}>support@kaio.app</a>
          </p>
        </div>

        <button onClick={onClose} className="w-full min-h-[44px] px-4 text-sm font-semibold rounded-xl btn-outline">
          Close
        </button>
      </div>
    </div>
  );
}
