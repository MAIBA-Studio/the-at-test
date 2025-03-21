
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import IdentityResult from '@/components/IdentityResult';
import { useArchetype } from '@/context/ArchetypeContext';

const Result = () => {
  const navigate = useNavigate();
  const { generatedIdentity } = useArchetype();
  
  useEffect(() => {
    if (!generatedIdentity) {
      navigate('/selection');
    }
  }, [generatedIdentity, navigate]);
  
  if (!generatedIdentity) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white relative overflow-hidden">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none grain-bg"></div>
      
      <Header />
      
      <main className="flex-1 flex flex-col items-center pt-6 pb-10">
        <IdentityResult identity={generatedIdentity} />
      </main>
      
      <footer className="py-4 px-4 text-center flex flex-col items-center justify-center mt-auto">
        <a href="https://x.com/MaibaStudio" target="_blank" rel="noopener noreferrer" className="block mb-3 hover:opacity-80 transition-opacity">
          <img 
            src="/lovable-uploads/6b4df03c-dbc9-4186-98fd-d5d03a5575ee.png" 
            alt="Maiba Studio" 
            className="h-12 md:h-14"
          />
        </a>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Maiba Studio - All rights reserved</p>
      </footer>
    </div>
  );
};

export default Result;
