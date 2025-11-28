import './v2-overrides.css';
import { Navbar } from '@/components/v2/Navbar';
import { Footer } from '@/components/v2/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Basak Pastanesi | Premium Baklava & Tatlı',
    description: 'Geleneksel lezzet, modern sunum. İzmir\'in en özel baklavaları.',
};

export default function V2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-basak-cream font-sans text-neutral-800 selection:bg-basak-pistachio selection:text-white">
            <Navbar />
            <main className="pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
