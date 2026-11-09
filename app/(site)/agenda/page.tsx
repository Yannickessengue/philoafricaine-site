import { redirect } from 'next/navigation';

// L'agenda fait partie de la page Actualités, comme sur le site d'origine.
export default function Agenda() {
  redirect('/actualites#agenda');
}
