import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";
import { Zap, AlertTriangle, User, TrendingUp } from 'lucide-react';

interface LiveScore {
    match_id: number;
    team1_name: string;
    team2_name: string;
    team1_score: string;
    team2_score: string;
    current_innings: number;
    status: string;
}

interface Player {
    id: number;
    name: string;
    role: string;
}

const LiveScoring = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    
    const [strikerId, setStrikerId] = useState<string>('');
    const [bowlerId, setBowlerId] = useState<string>('');
    const [nonStrikerId, setNonStrikerId] = useState<string>('');

    // Fetch Live Score
    const { data: score } = useQuery<LiveScore>({
        queryKey: ['liveScore', matchId],
        queryFn: async () => {
            const res = await api.get(`/scoring/live/${matchId}`);
            return res.data;
        },
        refetchInterval: 5000,
    });

    // Fetch Players for selection
    const { data: players } = useQuery<Player[]>({
        queryKey: ['players'],
        queryFn: async () => {
            const res = await api.get('/players/');
            return res.data;
        }
    });

    // Mutation for adding a ball
    const addBallMutation = useMutation({
        mutationFn: async (payload: any) => {
            return api.post('/scoring/ball', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liveScore', matchId] });
            toast.success('Ball added!');
        },
        onError: () => toast.error('Failed to update score.')
    });

    const handleAddBall = (runs: number, options: any = {}) => {
        if (!strikerId || !bowlerId || !nonStrikerId) {
            toast.warning('Please select Striker, Bowler, and Non-Striker first!');
            return;
        }

        const payload = {
            match_id: parseInt(matchId!),
            over_no: 0, // Simplified for now
            ball_no: 0, // Simplified for now
            batsman_id: parseInt(strikerId),
            bowler_id: parseInt(bowlerId),
            non_striker_id: parseInt(nonStrikerId),
            runs: runs,
            extra_runs: options.extras || 0,
            extra_type: options.extraType || null,
            is_wicket: options.isWicket || false,
            wicket_type: options.wicketType || null
        };

        addBallMutation.mutate(payload);
    };

    if (!matchId) return navigate('/matches');

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Scoreboard Column */}
                <div className="space-y-6">
                    <Card className="overflow-hidden border-blue-500/20 bg-slate-900 shadow-2xl shadow-blue-500/10">
                        <div className="bg-blue-600/10 py-3 text-center">
                            <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">
                                {score?.status || 'LIVE'} • INNINGS {score?.current_innings}
                            </span>
                        </div>
                        <CardContent className="p-12 text-center">
                            <div className="flex items-center justify-around space-x-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-500 uppercase tracking-tighter">{score?.team1_name}</h3>
                                    <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                        {score?.team1_score.split(' (')[0]}
                                    </div>
                                    <div className="text-xs font-medium text-blue-400">{score?.team1_score.split(' (')[1]?.replace(')', '')}</div>
                                </div>

                                <div className="text-3xl font-black italic text-slate-800">VS</div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-500 uppercase tracking-tighter">{score?.team2_name}</h3>
                                    <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                        {score?.team2_score.split(' (')[0]}
                                    </div>
                                    <div className="text-xs font-medium text-blue-400">{score?.team2_score.split(' (')[1]?.replace(')', '')}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Selection */}
                    {token && (
                        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="flex items-center text-sm font-bold uppercase tracking-widest text-slate-400">
                                    <TrendingUp className="mr-2 h-4 w-4" /> Active Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Striker</label>
                                    <Select value={strikerId} onValueChange={setStrikerId}>
                                        <SelectTrigger className="border-white/5 bg-slate-800 text-white">
                                            <SelectValue placeholder="Select Batsman" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 text-white">
                                            {players?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Non-Striker</label>
                                    <Select value={nonStrikerId} onValueChange={setNonStrikerId}>
                                        <SelectTrigger className="border-white/5 bg-slate-800 text-white">
                                            <SelectValue placeholder="Select Batsman" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 text-white">
                                            {players?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Bowler</label>
                                    <Select value={bowlerId} onValueChange={setBowlerId}>
                                        <SelectTrigger className="border-white/5 bg-slate-800 text-white">
                                            <SelectValue placeholder="Select Bowler" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 text-white">
                                            {players?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Scoring Actions Column */}
                {token ? (
                    <Card className="border-white/5 bg-slate-900/60 p-8 backdrop-blur-xl">
                        <div className="mb-8 flex items-center space-x-3">
                            <div className="rounded-xl bg-blue-500 p-2 text-white">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-white">SCORING PANEL</h2>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {[0, 1, 2, 3].map(run => (
                                <Button 
                                    key={run} 
                                    variant="outline" 
                                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-xl font-bold transition-all hover:bg-blue-600 hover:text-white"
                                    onClick={() => handleAddBall(run)}
                                >
                                    {run}
                                </Button>
                            ))}
                            <Button 
                                className="h-14 rounded-2xl bg-blue-600 text-2xl font-black text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                onClick={() => handleAddBall(4)}
                            >
                                4
                            </Button>
                            <Button 
                                className="h-14 rounded-2xl bg-purple-600 text-2xl font-black text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                                onClick={() => handleAddBall(6)}
                            >
                                6
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-14 rounded-2xl border-yellow-500/50 bg-yellow-500/10 text-xl font-bold text-yellow-500 hover:bg-yellow-500 hover:text-black"
                                onClick={() => handleAddBall(0, { extras: 1, extraType: 'wide' })}
                            >
                                WD
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-14 rounded-2xl border-yellow-500/50 bg-yellow-500/10 text-xl font-bold text-yellow-500 hover:bg-yellow-500 hover:text-black"
                                onClick={() => handleAddBall(0, { extras: 1, extraType: 'noball' })}
                            >
                                NB
                            </Button>
                        </div>

                        <div className="mt-12 space-y-4">
                            <h3 className="flex items-center text-xs font-bold uppercase tracking-widest text-red-500">
                                <AlertTriangle className="mr-2 h-4 w-4" /> WICKET ZONE
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {['Bowled', 'Caught', 'LBW', 'Run Out'].map(type => (
                                    <Button 
                                        key={type}
                                        variant="outline" 
                                        className="h-14 rounded-2xl border-red-500/50 bg-red-500/5 text-sm font-bold text-red-500 hover:bg-red-600 hover:text-white"
                                        onClick={() => handleAddBall(0, { isWicket: true, wicketType: type.toLowerCase() })}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center border-white/5 bg-slate-950/50 p-12 text-center text-slate-500">
                        <div>
                            <User className="mx-auto mb-4 h-12 w-12 opacity-20" />
                            <p className="text-lg font-medium">Scoring panel is restricted to admins.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default LiveScoring;
