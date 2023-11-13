'use client';
import { useState, useLayoutEffect } from 'react';

import RegistrationPage from './components/registration';
import LoginPage from './components/login';

export default function Home() {
  const [showRegistration, setShowRegistration] = useState(null);

  useLayoutEffect(() => {
    fetch('/api/v1/initial')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        switch (data.showRegistration) {
          case true:
            setShowRegistration(true);
            break;
          default:
            setShowRegistration(false);
            break;
        }
      });
  }, []);

  if (showRegistration === null) return null;

  if (showRegistration === true) {
    return <RegistrationPage />;
  } else {
    return <LoginPage />;
  }
}
