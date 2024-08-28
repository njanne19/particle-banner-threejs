import React from 'react'; 
import ThreeCanvas from './ThreeCanvas'; 
import './App.css'

const App: React.FC = () => {

  return (
    <>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
        <ThreeCanvas /> 
      </div>
    </>
  );
};

export default App;
