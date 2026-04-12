import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, Play, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const location = useLocation();
    
    const navItems = [
        { name: 'Home', path: '/', icon: Trophy },
        { name: 'Teams', path: '/teams', icon: Users },
        { name: 'Matches', path: '/matches', icon: Play },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-black tracking-tighter text-white">
                        CRIC <span className="text-blue-500">PRO</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-400",
                                location.pathname === item.path ? "text-blue-400" : "text-slate-400"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                    <Link
                        to="/admin"
                        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                        Admin Panel
                    </Link>
                </div>

                <button className="md:hidden text-white">
                    <Settings className="h-6 w-6" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
