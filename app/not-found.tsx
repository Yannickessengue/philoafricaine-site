import SiteLayout from './(site)/layout';
import Introuvable from './(site)/not-found';

export default function NotFound() {
  return (
    <SiteLayout>
      <Introuvable />
    </SiteLayout>
  );
}
