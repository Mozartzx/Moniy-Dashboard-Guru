'use client';

import { useState } from 'react';
import { LoginScreen } from './login-screen';
import { TeacherDashboard } from './teacher-dashboard';

export function MoniyApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? <TeacherDashboard onLogout={() => setLoggedIn(false)} /> : <LoginScreen onLogin={() => setLoggedIn(true)} />;
}
