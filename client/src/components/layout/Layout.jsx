import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import PageTransition from '../ui/PageTransition.jsx';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
