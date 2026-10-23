import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { FloatingCta } from '@/components/FloatingCta';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <Nav />
      <main id="view">{children}</main>
      <Footer />
      <FloatingCta />
    </div>
  );
}
