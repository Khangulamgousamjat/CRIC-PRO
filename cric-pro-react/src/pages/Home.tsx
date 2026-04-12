import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Target } from 'lucide-react';

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

    if (isLoading) return <div className="container mx-auto p-12 text-center text-slate-400">Loading leaderboard stats...</div>;

    const topScorers = [...(leaderboard || [])].sort((a, b) => b.total_runs - a.total_runs).slice(0, 5);
    const topBowlers = [...(leaderboard || [])].sort((a, b) => b.total_wickets - a.total_wickets).slice(0, 5);

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Hero Section */}
            <div className="relative mb-20 text-center">
                <div className="absolute inset-0 bg-blue-500/5 blur-[120px] -z-10 rounded-full" />
                <h1 className="text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                    STAT <span className="text-blue-500 italic">COMMAND</span>
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-slate-400">
                    Real-time statistics from the frontline of cricket. Track every run and wicket at CRIC PRO speed.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Top Scorers Card */}
                <Card className="border-white/5 bg-slate-900/40 backdrop-blur-sm transition-all hover:border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <CardTitle className="flex items-center text-2xl font-bold">
                            <Zap className="mr-3 h-6 w-6 text-yellow-400" /> Top Scorers
                        </CardTitle>
                        <Trophy className="h-5 w-5 text-slate-700" />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-500">PLAYER</TableHead>
                                    <TableHead className="text-right text-slate-500">RUNS</TableHead>
                                    <TableHead className="text-right text-slate-500">SR</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topScorers.map((player) => (
                                    <TableRow key={player.player_id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-bold text-white">{player.name}</TableCell>
                                        <TableCell className="text-right font-black text-blue-400 text-lg">{player.total_runs}</TableCell>
                                        <TableCell className="text-right text-sm text-slate-400 font-mono">{player.strike_rate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Bowlers Card */}
                <Card className="border-white/5 bg-slate-900/40 backdrop-blur-sm transition-all hover:border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <CardTitle className="flex items-center text-2xl font-bold">
                            <Target className="mr-3 h-6 w-6 text-purple-400" /> Top Bowlers
                        </CardTitle>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">WICKET KINGS</Badge>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-500">PLAYER</TableHead>
                                    <TableHead className="text-right text-slate-500">WKTS</TableHead>
                                    <TableHead className="text-right text-slate-500">ECON</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topBowlers.map((player) => (
                                    <TableRow key={player.player_id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-bold text-white">{player.name}</TableCell>
                                        <TableCell className="text-right font-black text-purple-400 text-lg">{player.total_wickets}</TableCell>
                                        <TableCell className="text-right text-sm text-slate-400 font-mono">{player.economy}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Home;
