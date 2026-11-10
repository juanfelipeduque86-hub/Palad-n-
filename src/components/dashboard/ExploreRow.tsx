import { motion } from 'framer-motion';
import { Icon, type IconName } from '../ui/Icon';
import { press } from '../../lib/motion';

function Entry({ icon, label, detail, onClick }: { icon: IconName; label: string; detail: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={press}
      className="flex h-[64px] items-center gap-3 rounded-full bg-card pr-4 pl-2 text-left shadow-card transition-colors hover:bg-raised"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-raised text-text">
        <Icon name={icon} size={19} />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold">{label}</span>
        <span className="block truncate text-[12px] text-sub">{detail}</span>
      </span>
    </motion.button>
  );
}

interface ExploreRowProps {
  libraryCount: number;
  historyCount: number;
  onLibrary: () => void;
  onHistory: () => void;
}

/** Progressive disclosure: the depth lives one tap away. */
export function ExploreRow({ libraryCount, historyCount, onLibrary, onHistory }: ExploreRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Entry icon="book" label="Biblioteca" detail={`${libraryCount} quests`} onClick={onLibrary} />
      <Entry icon="history" label="Historial" detail={historyCount === 0 ? 'Vacío' : `${historyCount} completadas`} onClick={onHistory} />
    </div>
  );
}
