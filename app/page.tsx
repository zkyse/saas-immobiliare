import { redirect } from 'next/navigation';

export default function RootPage() {
  // Quando un utente va su http://localhost:3000/, viene mandato in automatico a Milano
  redirect('/premium-milano');
}