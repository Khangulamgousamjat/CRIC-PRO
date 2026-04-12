import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, Play, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const location = useLocation();
    
    const navItems = [
        { name: 'Dashboard', path: '/', icon: Trophy },
        { name: 'Teams', path: '/teams', icon: Users },
        { name: 'Live Score', path: '/live', icon: Play },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                    <span className="text-xl font-bold tracking-tight text-white uppercase">
                        CRIC<span className="text-blue-500">PRO</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "relative flex items-center space-x-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
                                location.pathname === item.path 
                                    ? "text-white" 
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <item.icon className="h-3.5 w-3.5" />
                            <span>{item.name}</span>
                            {location.pathname === item.path && (
                                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-500 rounded-full" />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center">
                    <Link
                        to="/admin"
                        className="flex items-center space-x-1 rounded-md bg-zinc-900 border border-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800 hover:border-white/10"
                    >
                        <ShieldAlert className="h-3 w-3 text-blue-500" />
                        <span>Admin</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
