import { MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MAPS } from './adventure/maps';
import { useProgress } from './hooks/useProgress';
import { Home, type ModeId } from './components/home/Home';
import { AboutSheet } from './components/home/AboutSheet';
import { LuchaView } from './components/lucha/LuchaView';
import { PocionesView } from './components/pociones/PocionesView';
import { EncantamientosView } from './components/encantamientos/EncantamientosView';
import { AventurasView } from './components/aventuras/AventurasView';
import { AdventurePlay } from './components/aventuras/AdventurePlay';
import { ModeHeader } from './components/modes/ModeHeader';
import { Sheet } from './components/ui/Sheet';

type Route = { name: 'home' } | { name: ModeId } | { name: 'play'; mapId: string };

export default function App() {
  const api = useProgress();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [about, setAbout] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  const home = () => setRoute({ name: 'home' });
  const playing = route.name === 'play' ? MAPS.find((m) => m.id === route.mapId) : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`mx-auto min-h-dvh w-full px-4 pt-safe pb-safe ${route.name === 'home' ? 'max-w-[480px] lg:max-w-[1000px] lg:px-8 lg:pt-8' : 'max-w-[480px] md:max-w-[600px] md:pt-6'}`}>
        {route.name === 'home' && (
          <Home api={api} onOpen={(m) => setRoute({ name: m })} onPlay={(id) => setRoute({ name: 'play', mapId: id })} onAbout={() => setAbout(true)} />
        )}
        {route.name === 'lucha' && <LuchaView api={api} onBack={home} />}
        {route.name === 'pociones' && <PocionesView api={api} onBack={home} />}
        {route.name === 'encantamientos' && <EncantamientosView api={api} onBack={home} />}
        {route.name === 'aventuras' && <AventurasView api={api} onBack={home} onPlay={(id) => setRoute({ name: 'play', mapId: id })} />}
        {playing && (
          <>
            <ModeHeader numeral="IV · Aventura" title={playing.title} subtitle="Flechas, WASD, cruceta o desliza sobre el mapa." onBack={() => setRoute({ name: 'aventuras' })} />
            <AdventurePlay key={playing.id} map={playing} api={api} onExit={() => setRoute({ name: 'aventuras' })} />
          </>
        )}
      </div>
      <Sheet open={about} onClose={() => setAbout(false)} labelledBy="about-title">
        <AboutSheet
          storageOk={api.storageOk}
          onClose={() => setAbout(false)}
          onReset={() => {
            api.reset();
            setAbout(false);
            home();
          }}
        />
      </Sheet>
    </MotionConfig>
  );
}
