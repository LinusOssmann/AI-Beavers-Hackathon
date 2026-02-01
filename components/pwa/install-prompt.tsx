'use client'

import '@khmyznikov/pwa-install';
import { type PWAInstallElement } from '@khmyznikov/pwa-install';
import { useRef } from 'react';
import { Button } from '../ui/button';

function App() {
  const pwaInstallElement = useRef<PWAInstallElement | null>(null);

  const createDialog = () => {
    if (pwaInstallElement.current) {
      pwaInstallElement.current.showDialog(true);
    }
  };
  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      <Button
        onClick={createDialog}
        variant="outline"
      >
        Install TripMatch
      </Button>

      <pwa-install
        ref={(element) => {
          pwaInstallElement.current = element;
        }}
        icon="/icon.ico"
        install-description="To get the best experience, install TripMatch on your device. You can get notifications, have a native-like experience, and more."
        name="TripMatch"
        description="TripMatch is your personal travel agent."
      ></pwa-install>
    </div>
  );
}

export default App;
