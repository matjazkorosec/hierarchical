import { Bug, BugOff, SlidersHorizontal } from 'lucide-react';

interface ControlsProps {
  debug: boolean;
  onToggleDebug: () => void;
  onOpenSettings: () => void;
  disabled: boolean;
}

export default function Controls({
  debug,
  onToggleDebug,
  onOpenSettings,
  disabled,
}: ControlsProps) {
  return (
    <div className="controls">
      <button
        className="debug-icon"
        onClick={onToggleDebug}
        disabled={disabled}
      >
        {debug ? <BugOff size={18} /> : <Bug size={18} />}
      </button>
      <button
        className="settings-icon"
        onClick={onOpenSettings}
        disabled={disabled}
      >
        <SlidersHorizontal size={18} />
      </button>
    </div>
  );
}
