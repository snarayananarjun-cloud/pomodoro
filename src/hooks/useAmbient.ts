import { useCallback, useEffect, useRef, useState } from 'react';
import { createAmbientEngine } from '../lib/noise';

export function useAmbient() {
  const engineRef = useRef<ReturnType<typeof createAmbientEngine> | null>(null);
  const [ambientOn, setAmbientOn] = useState(false);

  const toggleAmbient = useCallback(() => {
    if (!engineRef.current) engineRef.current = createAmbientEngine();
    setAmbientOn((on) => {
      const next = !on;
      if (next) engineRef.current!.start();
      else engineRef.current!.stop();
      return next;
    });
  }, []);

  useEffect(() => () => engineRef.current?.stop(), []);

  return { ambientOn, toggleAmbient };
}
