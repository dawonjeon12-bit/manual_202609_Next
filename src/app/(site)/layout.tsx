import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <Nav />
      <main id="view">{children}</main>
      <Footer />
    </div>
  );
}
