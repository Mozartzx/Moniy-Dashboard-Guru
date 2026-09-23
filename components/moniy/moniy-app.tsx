import { LoginScreen } from './login-screen';

export function MoniyApp({ onLogin }: { onLogin: () => void }) {
  return <LoginScreen onLogin={onLogin} />;
}
