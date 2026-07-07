import { useState } from 'react';
import { AlertOctagon, Save } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertBanner } from './ui/AlertBanner';
import { SelectField } from './ui/InputField';
import { saveCorrectiveAction } from '../lib/correctiveActions';

const WHAT_OPTIONS = [
  'Unit not reaching temperature',
  'Door left open',
  'Stock overload / poor airflow',
  'Power outage / unit off',
  'Unit fault / needs service',
  'Other',
];

const ACTION_OPTIONS = [
  'Moved stock to another unit',
  'Adjusted unit temperature',
  'Called technician',
  'Discarded affected food',
  'Monitored and rechecked',
  'Other',
];

const WHO_OPTIONS = ['Recorder on shift', 'Manager', 'Chef', 'Other staff'];

export default function CorrectiveActionScreen({
  title,
  detail,
  module,
  refId,
  handledBy,
  onDone,
}: {
  title: string;
  detail: string;
  module: string;
  refId: string;
  handledBy: string;
  onDone: () => void;
}) {
  const [what, setWhat] = useState('');
  const [action, setAction] = useState('');
  const [foodAtRisk, setFoodAtRisk] = useState(false);
  const [foodDiscarded, setFoodDiscarded] = useState(false);
  const [who, setWho] = useState(handledBy || WHO_OPTIONS[0]);
  const [followUp, setFollowUp] = useState(true);

  const canSave = what && action && who;

  const save = () => {
    if (!canSave) return;
    saveCorrectiveAction({
      module,
      refId,
      date: new Date().toISOString().slice(0, 10),
      whatHappened: what,
      actionTaken: action,
      foodAtRisk,
      foodDiscarded,
      handledBy: who,
      followUpNeeded: followUp,
    });
    onDone();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28 md:pb-10">
      <div className="mb-4">
        <AlertBanner variant="danger" title={title} icon={AlertOctagon}>
          {detail}
        </AlertBanner>
      </div>

      <Card size="lg">
        <div className="space-y-4">
          <SelectField label="What happened?" options={WHAT_OPTIONS.map((v) => ({ value: v, label: v }))} value={what} onChange={(e) => setWhat(e.target.value)} />
          <SelectField label="What action was taken?" options={ACTION_OPTIONS.map((v) => ({ value: v, label: v }))} value={action} onChange={(e) => setAction(e.target.value)} />
          <SelectField label="Who handled this?" options={WHO_OPTIONS.map((v) => ({ value: v, label: v }))} value={who} onChange={(e) => setWho(e.target.value)} />

          <div className="ca-toggle-row">
            <ToggleRow label="Was any food at risk?" on={foodAtRisk} onChange={setFoodAtRisk} />
            <ToggleRow label="Was food discarded?" on={foodDiscarded} onChange={setFoodDiscarded} />
            <ToggleRow label="Is a follow-up check needed?" on={followUp} onChange={setFollowUp} />
          </div>

          <Button block size="lg" icon={Save} onClick={save} disabled={!canSave}>Save & complete</Button>
        </div>
      </Card>
    </div>
  );
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="ca-toggle">
      <span className="ca-toggle-label">{label}</span>
      <div className="ca-toggle-pills">
        <button type="button" className={`ca-pill ${on ? 'ca-pill-yes' : ''}`} onClick={() => onChange(true)}>Yes</button>
        <button type="button" className={`ca-pill ${!on ? 'ca-pill-no' : ''}`} onClick={() => onChange(false)}>No</button>
      </div>
    </div>
  );
}
