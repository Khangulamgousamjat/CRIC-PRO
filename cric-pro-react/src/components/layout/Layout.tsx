import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-50 antialiased">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute -right-[10%] bottom-[10%] h-[40%] w-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>
            
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
