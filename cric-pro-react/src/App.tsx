import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Teams from './pages/Teams';
import LiveScoring from './pages/LiveScoring';


const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/teams" element={<Teams />} />
                        <Route path="/live/:matchId" element={<LiveScoring />} />
                    </Routes>
                </Layout>
            </Router>
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    );
}

export default App;
