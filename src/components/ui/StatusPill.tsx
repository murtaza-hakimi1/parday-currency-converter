import { CheckCircle2, Clock3, WifiOff } from "lucide-react";

export default function StatusPill({
  online,
  stale = false,
}: {
  online: boolean;
  stale?: boolean;
}) {
  if (!online)
    return (
      <span className="status-pill offline">
        <WifiOff size={13} /> Offline
      </span>
    );
  if (stale)
    return (
      <span className="status-pill stale">
        <Clock3 size={13} /> Cached rate
      </span>
    );
  return (
    <span className="status-pill live">
      <CheckCircle2 size={13} /> Connected
    </span>
  );
}
