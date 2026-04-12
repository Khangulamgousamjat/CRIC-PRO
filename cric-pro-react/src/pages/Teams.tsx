import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

    const { data: teams, isLoading } = useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: async () => {
            const res = await api.get('/teams/');
            return res.data;
        },
    });

    const createTeamMutation = useMutation({
        mutationFn: async (name: string) => {
            return api.post('/teams/', { name, tournament_id: 1 });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team registered successfully');
            setIsDialogOpen(false);
            setTeamName('');
        },
        onError: () => toast.error('Registration failed')
    });

    const deleteTeamMutation = useMutation({
        mutationFn: async (id: number) => {
            return api.delete(`/teams/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team removed');
        },
        onError: () => toast.error('Delete failed')
    });

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamName.trim()) createTeamMutation.mutate(teamName);
    };

    if (isLoading) return <div className="p-20 text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">Accessing Database...</div>;

    return (
        <div className="container mx-auto px-4 py-8 lg:px-8">
            <header className="mb-12 flex flex-col justify-between space-y-4 md:flex-row md:items-end md:space-y-0">
                <div className="border-l-4 border-white pl-6">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
                        Roster <span className="text-zinc-600">Registry</span>
                    </h1>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                        Official tournament team logs and squad management
                    </p>
                </div>

                {token && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 rounded-none bg-blue-600 px-6 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-700">
                                <Plus className="mr-2 h-3.5 w-3.5" /> Registry New Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-white/5 bg-zinc-950 text-white rounded-none ring-1 ring-white/10">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight">Team Protocol</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTeam} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Official Team Name</label>
                                    <Input
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="INPUT NAME..."
                                        className="h-12 rounded-none border-white/10 bg-zinc-900 text-white focus-visible:ring-blue-500 uppercase font-bold"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 rounded-none bg-blue-600 font-bold uppercase tracking-[0.2em] hover:bg-blue-700"
                                    disabled={createTeamMutation.isPending}
                                >
                                    {createTeamMutation.isPending ? 'Processing...' : 'Authorize Registration'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </header>

            <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
                {teams?.map((team) => (
                    <Card key={team.id} className="rounded-none border-white/5 bg-zinc-900/40 transition-all hover:bg-zinc-900 shadow-none hover:ring-1 hover:ring-white/20">
                        <CardHeader className="flex flex-row items-center space-x-6 py-6">
                            <div className="flex h-14 w-14 items-center justify-center bg-zinc-950 border border-white/5 text-blue-500">
                                <Shield className="h-7 w-7" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CardTitle className="truncate text-lg font-black uppercase tracking-tight text-white">
                                    {team.name}
                                </CardTitle>
                                <Badge variant="outline" className="mt-1 border-white/10 bg-transparent px-2 py-0 text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
                                    ID: {team.id.toString().padStart(3, '0')}
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardFooter className="flex justify-between border-t border-white/5 bg-black/20 py-4 px-6">
                            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                <Users className="h-3.5 w-3.5" />
                                <span>Verified Squad</span>
                            </div>
                            {token && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-zinc-700 hover:bg-red-950/30 hover:text-red-500"
                                    onClick={() => deleteTeamMutation.mutate(team.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {teams?.length === 0 && (
                <div className="flex h-40 items-center justify-center border border-dashed border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">Database Entry Null - Awaiting Records</p>
                </div>
            )}
        </div>
    );
};

export default Teams;
