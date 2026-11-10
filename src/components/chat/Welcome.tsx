import { motion } from 'framer-motion';
import { PaladinSprite } from '../paladin/PaladinSprite';
import { Icon } from '../ui/Icon';
import { press } from '../../lib/motion';

interface WelcomeProps {
  question: string;
  resumeTitle: string | null;
  onResume: () => void;
}

/** First screen of a conversation: the knight, one open question, and an optional "continue". */
export function Welcome({ question, resumeTitle, onResume }: WelcomeProps) {
  return (
    <div className="flex flex-1 flex-col justify-center py-4">
      <div className="mx-auto h-[190px] w-[210px]">
        <PaladinSprite state="resting" className="h-full w-full" />
      </div>
      <h1 className="mt-4 text-center text-[24px] leading-tight font-semibold tracking-[-0.01em]">{question}</h1>
      <p className="mx-auto mt-2 max-w-[300px] text-center text-[14px] leading-relaxed text-sub">
        Cuéntamelo con tus palabras. Te preguntaré por lo que me digas, no por una lista fija.
      </p>
      {resumeTitle && (
        <motion.button
          type="button"
          onClick={onResume}
          whileTap={{ scale: 0.98 }}
          transition={press}
          className="mx-auto mt-6 flex h-14 w-full max-w-[340px] items-center gap-3 rounded-full bg-card pr-2 pl-5 text-left shadow-card"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-sub">Continuar donde lo dejaste</span>
            <span className="block truncate text-[14px] font-semibold">{resumeTitle}</span>
          </span>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-mint-ink">
            <Icon name="play" size={16} filled />
          </span>
        </motion.button>
      )}
    </div>
  );
}
