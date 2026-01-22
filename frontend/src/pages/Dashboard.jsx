import React from 'react';
import ChatInterface from '../components/Chat/ChatInterface';

const Dashboard = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Chat */}
            <div className="lg:h-[calc(100vh-100px)]">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Finance Co-Pilot</h2>
                    <p className="text-gray-400">Ask questions, visualize data, and manage expenses.</p>
                </div>
                <ChatInterface />
            </div>

            {/* Right Column: Widgets Overview (Static for now) */}
            <div className="space-y-6">
                <header className="mb-8 hidden lg:block">
                    <h2 className="text-3xl font-bold text-white mb-2">My Overview</h2>
                    <p className="text-gray-400">Your financial snapshot</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {/* Recent Activity Card */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-primary/50 transition-colors">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-primary rounded-full" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors text-sm font-medium">
                                Add Expense
                            </button>
                            <button className="p-4 rounded-xl bg-white/5 hover:bg-special/20 hover:text-special transition-colors text-sm font-medium">
                                Settle Up
                            </button>
                        </div>
                    </div>

                    {[1, 2].map((i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <h3 className="text-xl font-semibold mb-2">Pinned Widget {i}</h3>
                            <div className="h-32 bg-black/20 rounded-xl flex items-center justify-center text-gray-500">
                                Chart Placeholder
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
