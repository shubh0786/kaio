import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { CloudUpload, Download, Upload, AlertTriangle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertBanner } from './ui/AlertBanner';
import { backupStatus } from '../lib/backupStatus';

export default function BackupStatusCard({
  onBackup,
  onRestore,
}: {
  onBackup: () => void;
  onRestore: () => void;
}) {
  const st = backupStatus();

  return (
    <Card size="lg">
      <div className="flex items-center gap-3 mb-3">
        <span className="record-card-icon" style={{ background: 'rgba(14,165,233,0.12)', color: 'var(--kaio-blue)' }}>
          <CloudUpload size={20} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Backup & data safety</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {st.never
              ? 'Never backed up'
              : st.lastAt
                ? `Last backup ${formatDistanceToNow(parseISO(st.lastAt))} ago`
                : 'No backup yet'}
          </p>
        </div>
      </div>

      {st.never && (
        <div className="mb-3">
          <AlertBanner variant="warning" title="No backup yet" icon={AlertTriangle}>
            Kaio stores data on this device only. Back up now so records aren't lost.
          </AlertBanner>
        </div>
      )}
      {st.stale && !st.never && (
        <div className="mb-3">
          <AlertBanner variant="warning" title="Backup recommended" icon={AlertTriangle}>
            It's been over 7 days since your last backup.
          </AlertBanner>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button block size="md" icon={Download} onClick={onBackup}>Backup now</Button>
        <Button block variant="secondary" size="md" icon={Upload} onClick={onRestore}>Restore from file</Button>
      </div>

      {st.lastAt && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
          Last backup: {format(parseISO(st.lastAt), 'd MMM yyyy, h:mm a')}
        </p>
      )}
    </Card>
  );
}
