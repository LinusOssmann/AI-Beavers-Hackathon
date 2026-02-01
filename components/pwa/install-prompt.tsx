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
    <>
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
        install-description="To get the best experience, install TripMatch on your device. You can get notifications, have a native-like experience, and more."
        name="TripMatch"
        description="TripMatch is your personal travel agent. Stop planning trips and let them be planned for you."
      ></pwa-install>
    </>
  );
}

export default App;
