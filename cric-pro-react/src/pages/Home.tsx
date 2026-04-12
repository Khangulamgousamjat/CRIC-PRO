import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Trophy, TrendingUp, Target } from 'lucide-react';

interface LeaderboardEntry {
    player_id: number;
    name: string;
    total_runs: number;
    total_wickets: number;
    strike_rate: number;
    economy: number;
}

const Home = () => {
    const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await api.get('/stats/leaderboard');
            return res.data;
        },
    });

    if (isLoading) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-zinc-500 animate-pulse font-mono text-sm tracking-widest uppercase">Initializing Dashboard...</div>
        </div>
    );

    const topScorers = [...(leaderboard || [])].sort((a, b) => b.total_runs - a.total_runs).slice(0, 8);
    const topBowlers = [...(leaderboard || [])].sort((a, b) => b.total_wickets - a.total_wickets).slice(0, 8);

    return (
        <div className="container mx-auto px-4 py-8 lg:px-8">
            {/* Header Section */}
            <header className="mb-12 border-l-4 border-blue-600 pl-6 py-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
                    Tournament <span className="text-zinc-600">Analytics</span>
                </h1>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Frontline statistics and player performance metrics
                </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Batting Leaderboard */}
                <Card className="border-white/5 bg-zinc-950 shadow-none ring-1 ring-white/5">
                    <CardHeader className="border-b border-white/5 bg-zinc-900/50 py-4">
                        <CardTitle className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-400">
                            <TrendingUp className="mr-2 h-4 w-4 text-blue-500" /> Leading Batsmen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-900/30">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Player</TableHead>
                                    <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-600">Runs</TableHead>
                                    <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-600 whitespace-nowrap">Strike Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topScorers.map((player) => (
                                    <TableRow key={player.player_id} className="border-white/5 group hover:bg-white/[0.02]">
                                        <TableCell className="py-4 font-bold text-zinc-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                            {player.name}
                                        </TableCell>
                                        <TableCell className="py-4 text-right font-black text-white text-lg">
                                            {player.total_runs}
                                        </TableCell>
                                        <TableCell className="py-4 text-right font-mono text-xs text-zinc-500">
                                            {player.strike_rate.toFixed(1)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Bowling Leaderboard */}
                <Card className="border-white/5 bg-zinc-950 shadow-none ring-1 ring-white/5">
                    <CardHeader className="border-b border-white/5 bg-zinc-900/50 py-4">
                        <CardTitle className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-400">
                            <Target className="mr-2 h-4 w-4 text-purple-500" /> Wicket Kings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-900/30">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Player</TableHead>
                                    <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-600">Wickets</TableHead>
                                    <TableHead className="h-10 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-600 whitespace-nowrap">Economy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topBowlers.map((player) => (
                                    <TableRow key={player.player_id} className="border-white/5 group hover:bg-white/[0.02]">
                                        <TableCell className="py-4 font-bold text-zinc-200 group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                                            {player.name}
                                        </TableCell>
                                        <TableCell className="py-4 text-right font-black text-white text-lg">
                                            {player.total_wickets}
                                        </TableCell>
                                        <TableCell className="py-4 text-right font-mono text-xs text-zinc-500">
                                            {player.economy.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            {leaderboard?.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 mt-12">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">Awaiting Match Results</p>
                </div>
            )}
        </div>
    );
};

export default Home;
