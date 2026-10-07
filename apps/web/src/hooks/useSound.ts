import { useState, useEffect, useCallback } from 'react';
import { soundFx } from '../utils/audio';

export function useSound() {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMuted());

  useEffect(() => {
    const unsubscribe = soundFx.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const toggleSound = useCallback(() => {
    soundFx.toggleMute();
  }, []);

  const playSound = useCallback((type: Parameters<typeof soundFx.play>[0]) => {
    soundFx.play(type);
  }, []);

  return {
    isMuted,
    toggleSound,
    playSound,
  };
}
