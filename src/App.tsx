import React from 'react';
import Desktop from './components/Desktop/Desktop';
import { SpeedInsights } from "@vercel/speed-insights/react";
import './App.css';

function App() {
  return (
    <div className="App">
      <Desktop />
      <SpeedInsights />
    </div>
  );
}

export default App;
