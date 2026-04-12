import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Plus, Trash2, Users } from 'lucide-react';

interface Team {
    id: number;
    name: string;
    tournament_id: number;
}

const Teams = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [teamName, setTeamName] = useState('');
    const token = localStorage.getItem('token');

    // Fetch Teams
    const { data: teams, isLoading, error } = useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: async () => {
            const res = await api.get('/teams/');
            return res.data;
        },
    });

    // Create Team Mutation
    const createTeamMutation = useMutation({
        mutationFn: async (name: string) => {
            return api.post('/teams/', { name, tournament_id: 1 });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team registered successfully!');
            setIsDialogOpen(false);
            setTeamName('');
        },
        onError: () => {
            toast.error('Failed to register team.');
        }
    });

    // Delete Team Mutation
    const deleteTeamMutation = useMutation({
        mutationFn: async (id: number) => {
            return api.delete(`/teams/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team deleted.');
        },
        onError: () => {
            toast.error('Failed to delete team.');
        }
    });

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamName.trim()) {
            createTeamMutation.mutate(teamName);
        }
    };

    if (isLoading) return <div className="container mx-auto p-12 text-center text-slate-400">Loading your league...</div>;
    if (error) return <div className="container mx-auto p-12 text-center text-red-500">Error loading teams. Check backend.</div>;

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-sm">
                        Registered <span className="text-blue-500 italic">Teams</span>
                    </h1>
                    <p className="mt-2 text-slate-400">Manage and view all tournament participants.</p>
                </div>

                {token && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                                <Plus className="mr-2 h-4 w-4" /> Register New Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-white/10 bg-slate-900 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Register Team</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTeam} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Team Name</label>
                                    <Input
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="e.g. Royal Strikers"
                                        className="border-white/5 bg-slate-800 focus-visible:ring-blue-500"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={createTeamMutation.isPending}
                                >
                                    {createTeamMutation.isPending ? 'Registering...' : 'Complete Registration'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams?.map((team) => (
                    <Card key={team.id} className="group relative overflow-hidden border-white/5 bg-slate-900/40 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5">
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        
                        <CardHeader className="flex flex-row items-center space-x-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-white/5 text-2xl group-hover:border-blue-500/30 transition-colors">
                                <Shield className="h-7 w-7 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-white transition-colors group-hover:text-blue-400">
                                    {team.name}
                                </CardTitle>
                                <Badge variant="secondary" className="mt-1 bg-white/5 text-[10px] text-slate-400">
                                    TOURNAMENT #{team.tournament_id}
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardFooter className="flex justify-between border-t border-white/5 bg-white/2 transition-colors group-hover:bg-white/5 pt-4">
                            <div className="flex items-center space-x-2 text-sm text-slate-400">
                                <Users className="h-4 w-4" />
                                <span>Squad View</span>
                            </div>
                            <div className="flex space-x-2">
                                {token && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-slate-500 hover:bg-red-500/20 hover:text-red-500"
                                        onClick={() => deleteTeamMutation.mutate(team.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {teams?.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center">
                    <p className="text-xl font-medium text-slate-500">No teams found in the archives.</p>
                </div>
            )}
        </div>
    );
};

export default Teams;
