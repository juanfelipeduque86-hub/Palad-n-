import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { SheetHeader } from '../ui/SheetHeader';
import { press } from '../../lib/motion';

interface AboutSheetProps {
  engineLabel: string;
  storageOk: boolean;
  onClose: () => void;
  onClearAll: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] bg-raised p-4 text-[14px] leading-relaxed text-sub">
      <h3 className="mb-1.5 text-[14px] font-semibold text-text">{title}</h3>
      {children}
    </section>
  );
}

/** Honest description of what this prototype is and isn't. */
export function AboutSheet({ engineLabel, storageOk, onClose, onClearAll }: AboutSheetProps) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <SheetHeader id="about-title" title="Cómo funciona" subtitle={engineLabel} onClose={onClose} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-5">
        <Section title="Es un prototipo con reglas, no una IA">
          <p>
            Paladin reconoce palabras y expresiones en español sobre proyectos, estudio, trabajo, decisiones y organización.
            Con eso arma lo que entiende, pregunta por lo que mencionaste y no repite lo que ya contestaste.
          </p>
          <p className="mt-2">
            No comprende el lenguaje como un modelo de IA: frases complejas o temas fuera de esos ámbitos pueden no
            entenderse. Cuando pasa, te lo dice y te pide que lo expliques de otra forma, en lugar de inventar.
          </p>
        </Section>
        <Section title="Tus datos">
          <p>
            {storageOk
              ? 'Las conversaciones y acciones se guardan solo en este navegador. No se envía nada a ningún servidor.'
              : 'Este navegador no permite guardar datos: lo que escribas se perderá al cerrar la página. No se envía nada a ningún servidor.'}
          </p>
        </Section>
        <Section title="Para una conversación con IA real">
          <p>
            Haría falta un pequeño servidor (por ejemplo, una función serverless) que guarde la clave de API y hable con un
            modelo como Claude. La clave nunca puede ir en el navegador. Tus mensajes se enviarían a ese proveedor, y cada
            mensaje tendría un coste por uso. La interfaz ya está preparada para cambiar el motor sin rehacer la app.
          </p>
        </Section>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={press}
          onClick={() => (confirm ? onClearAll() : setConfirm(true))}
          className={`mt-1 h-12 rounded-full text-[14px] font-medium ${confirm ? 'bg-lav/20 text-lav' : 'bg-raised text-sub hover:text-text'}`}
        >
          {confirm ? 'Toca otra vez para borrarlo todo' : 'Borrar conversaciones y acciones'}
        </motion.button>
      </div>
    </>
  );
}
