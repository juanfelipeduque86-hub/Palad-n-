import { useState } from 'react';
import { Button } from '../ui/Button';
import { SheetHeader } from '../ui/SheetHeader';

/** Plain account of what is scripted and what is not. */
export function AboutSheet({ storageOk, onClose, onReset }: { storageOk: boolean; onClose: () => void; onReset: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const Section = ({ title, children }: { title: string; children: string }) => (
    <section className="rounded-[20px] border border-line bg-card p-4">
      <h3 className="font-serif text-[18px] font-semibold">{title}</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-sub">{children}</p>
    </section>
  );
  return (
    <>
      <SheetHeader id="about-title" title="Qué es y qué no es" subtitle="Todo funciona en tu navegador" onClose={onClose} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-5">
        <Section title="Contenido escrito a mano">
          Los acertijos, datos, retos creativos y mazmorras están escritos y diseñados de antemano. No hay IA: Paladin no genera contenido, no conversa libremente y no evalúa la calidad de tus ideas.
        </Section>
        <Section title="Qué sí comprueba">
          En Lucha compara tu respuesta con la solución y variantes previstas. En Encantamientos solo revisa reglas explícitas (número de palabras, palabras obligatorias, ideas por línea). En Aventuras, el juego aplica sus propias reglas.
        </Section>
        <Section title="Progreso">
          {storageOk
            ? 'Tu progreso se guarda solo en este navegador. No se envía a ningún servidor.'
            : 'Este navegador no permite guardar datos: el progreso se perderá al cerrar la página.'}
        </Section>
        <Section title="Con una IA real">
          Haría falta un servidor propio con una clave de API. Permitiría conversaciones abiertas y comentarios sobre tus ideas, pero los textos saldrían del dispositivo y tendría un coste por uso.
        </Section>
        <Button variant={confirm ? 'primary' : 'secondary'} onClick={() => (confirm ? onReset() : setConfirm(true))}>
          {confirm ? 'Toca otra vez para borrar todo' : 'Borrar todo el progreso'}
        </Button>
      </div>
    </>
  );
}
