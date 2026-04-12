import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";
import { Zap, AlertCircle, User, Activity } from 'lucide-react';

interface LiveScore {
    match_id: number;
    team1_name: string;
    team2_name: string;
    team1_score: string;
    team2_score: string;
    current_innings: number;
    status: string;
}

const LiveScoring = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    
    const [strikerId, setStrikerId] = useState<string>('');
    const [bowlerId, setBowlerId] = useState<string>('');
    const [nonStrikerId, setNonStrikerId] = useState<string>('');

    const { data: score, isLoading: isScoreLoading } = useQuery<LiveScore>({
        queryKey: ['liveScore', matchId],
        queryFn: async () => {
            const res = await api.get(`/scoring/live/${matchId}`);
            return res.data;
        },
        refetchInterval: 5000,
    });

    const { data: players } = useQuery<any[]>({
        queryKey: ['players'],
        queryFn: async () => {
            const res = await api.get('/players/');
            return res.data;
        }
    });

    const addBallMutation = useMutation({
        mutationFn: async (payload: any) => api.post('/scoring/ball', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liveScore', matchId] });
            toast.success('SCORE UPDATED');
        },
        onError: () => toast.error('DATA ERROR')
    });

    const handleAddBall = (runs: number, options: any = {}) => {
        if (!strikerId || !bowlerId || !nonStrikerId) {
            toast.warning('SELECT ACTIVE PERSONNEL FIRST');
            return;
        }

        addBallMutation.mutate({
            match_id: parseInt(matchId || '0'),
            over_no: 0, ball_no: 0,
            batsman_id: parseInt(strikerId),
            bowler_id: parseInt(bowlerId),
            non_striker_id: parseInt(nonStrikerId),
            runs,
            extra_runs: options.extras || 0,
            extra_type: options.extraType || null,
            is_wicket: options.isWicket || false,
            wicket_type: options.wicketType || null
        });
    };

    if (isScoreLoading) return <div className="p-20 text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">Syncing Live Data...</div>;
    if (!matchId) return navigate('/');

    return (
        <div className="container mx-auto px-4 py-8 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
                {/* Scoreboard Column */}
                <div className="space-y-8">
                    <Card className="rounded-none border border-white/10 bg-black shadow-2xl overflow-hidden shadow-blue-900/10">
                        <div className="bg-zinc-900/50 px-6 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Match in Progress</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-blue-500">Innings {score?.current_innings}</span>
                        </div>
                        <CardContent className="p-12 text-center">
                            <div className="flex flex-col space-y-8 md:flex-row md:items-center md:justify-around md:space-y-0">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">{score?.team1_name}</h3>
                                    <div className="text-7xl font-black tracking-tighter text-white sm:text-8xl">
                                        {score?.team1_score.split(' (')[0]}
                                    </div>
                                    <div className="inline-block rounded-none bg-blue-600/10 px-3 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                        {score?.team1_score.split(' (')[1]?.replace(')', '') || '0 OVER'}
                                    </div>
                                </div>

                                <div className="text-2xl font-black italic text-zinc-800">VS</div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">{score?.team2_name}</h3>
                                    <div className="text-7xl font-black tracking-tighter text-white sm:text-8xl">
                                        {score?.team2_score.split(' (')[0]}
                                    </div>
                                    <div className="inline-block rounded-none bg-blue-600/10 px-3 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                        {score?.team2_score.split(' (')[1]?.replace(')', '') || '0 OVER'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Personnel Selection */}
                    {token && (
                        <Card className="rounded-none border-white/5 bg-zinc-950 p-6">
                            <header className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Active Field Personnel</h3>
                                <Activity className="h-3.5 w-3.5 text-zinc-700" />
                            </header>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Striker</label>
                                    <Select value={strikerId} onValueChange={setStrikerId}>
                                        <SelectTrigger className="h-10 rounded-none border-white/10 bg-zinc-900 text-white font-bold uppercase text-[10px]">
                                            <SelectValue placeholder="SELECT PLAYER" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                                            {players?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Non-Striker</label>
                                    <Select value={nonStrikerId} onValueChange={setNonStrikerId}>
                                        <SelectTrigger className="h-10 rounded-none border-white/10 bg-zinc-900 text-white font-bold uppercase text-[10px]">
                                            <SelectValue placeholder="SELECT PLAYER" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                                            {players?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Bowler</label>
                                    <Select value={bowlerId} onValueChange={setBowlerId}>
                                        <SelectTrigger className="h-10 rounded-none border-white/10 bg-zinc-900 text-white font-bold uppercase text-[10px]">
                                            <SelectValue placeholder="SELECT PLAYER" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                                            {players?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Scoring Logic Column */}
                <div className="space-y-8">
                    {token ? (
                        <Card className="rounded-none border border-white/10 bg-zinc-900/20 p-8">
                            <header className="mb-10 flex items-center space-x-4 border-l-4 border-white pl-6">
                                <Zap className="h-6 w-6 text-white" />
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Score Control</h2>
                            </header>

                            <div className="grid grid-cols-4 gap-2">
                                {[0, 1, 2, 3].map(run => (
                                    <Button 
                                        key={run} 
                                        variant="outline" 
                                        className="h-14 rounded-none border-white/5 bg-zinc-900 text-xl font-bold transition-all hover:bg-white hover:text-black"
                                        onClick={() => handleAddBall(run)}
                                    >
                                        {run}
                                    </Button>
                                ))}
                                <Button 
                                    className="h-14 rounded-none bg-blue-600 text-2xl font-black text-white hover:bg-blue-500"
                                    onClick={() => handleAddBall(4)}
                                >
                                    4
                                </Button>
                                <Button 
                                    className="h-14 rounded-none bg-zinc-100 text-2xl font-black text-black hover:bg-white"
                                    onClick={() => handleAddBall(6)}
                                >
                                    6
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-14 rounded-none border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-400 hover:bg-blue-500 hover:text-white"
                                    onClick={() => handleAddBall(0, { extras: 1, extraType: 'wide' })}
                                >
                                    WIDE
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-14 rounded-none border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-400 hover:bg-blue-500 hover:text-white"
                                    onClick={() => handleAddBall(0, { extras: 1, extraType: 'noball' })}
                                >
                                    NO-BALL
                                </Button>
                            </div>

                            <div className="mt-16 space-y-6">
                                <h3 className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
                                    <AlertCircle className="mr-2 h-4 w-4" /> Termination Zone
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Bowled', 'Caught', 'LBW', 'In-Field-Out'].map(type => (
                                        <Button 
                                            key={type}
                                            variant="outline" 
                                            className="h-12 rounded-none border-red-500/20 bg-red-950/10 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            onClick={() => handleAddBall(0, { isWicket: true, wicketType: type })}
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-none border border-white/5 bg-zinc-950/50 p-12 text-center">
                            <User className="mb-6 h-16 w-16 text-zinc-800" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500">Authorized Personnel Only</h2>
                            <p className="mt-2 max-w-xs text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-700">
                                Scoring control panel is encrypted and restricted to tournament officials.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveScoring;
