import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { Territory } from './types';

const App: React.FC = () => {
  const [territory, setTerritory] = useState<Territory | undefined>(undefined);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-100">
      <Header territory={territory} setTerritory={setTerritory} />
      <main className="flex-1 w-full px-0 sm:px-4">
        <ChatInterface territory={territory} />
      </main>
    </div>
  );
};

export default App;