
import React, { useRef, useEffect, useState } from 'react';
import { GeneratedIdentity } from '@/lib/archetypes';
import { useArchetype } from '@/context/ArchetypeContext';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getArchetypeDescription } from '@/lib/archetypeDescriptions';
import html2canvas from 'html2canvas';

interface IdentityResultProps {
  identity: GeneratedIdentity;
}

const IdentityResult: React.FC<IdentityResultProps> = ({ identity }) => {
  const { resetSelections, selectedFoundation, selectedExpression, selectedFunction } = useArchetype();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  // Preload logo image for export
  useEffect(() => {
    const img = new Image();
    img.src = "/lovable-uploads/4048d3b1-d98a-4f7c-a3f2-97a8db4ca71f.png";
    img.onload = () => {
      setLogoImage(img);
      setLogoLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load logo image");
      setLogoLoaded(true); // Continue without logo if it fails to load
    };
  }, []);

  const handleRestart = () => {
    resetSelections();
    navigate('/selection');
  };

  const handleSave = async () => {
    if (!resultRef.current) {
      toast.error("Unable to generate image");
      return;
    }

    try {
      // Show loading toast
      toast.loading("Generating your archetype image...");
      
      // Create temporary element for clean export - using square dimensions
      const exportDiv = document.createElement('div');
      exportDiv.className = "archetype-export";
      exportDiv.style.width = "800px";
      exportDiv.style.height = "800px";
      exportDiv.style.position = "absolute";
      exportDiv.style.left = "-9999px";
      exportDiv.style.backgroundColor = "#222222";
      exportDiv.style.borderRadius = "16px";
      exportDiv.style.padding = "40px";
      exportDiv.style.color = "white";
      exportDiv.style.fontFamily = "Inter, sans-serif";
      exportDiv.style.display = "flex";
      exportDiv.style.flexDirection = "column";
      exportDiv.style.justifyContent = "space-between";
      document.body.appendChild(exportDiv);
      
      // Fill with formatted content
      exportDiv.innerHTML = `
        <div class="text-center" style="position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
          <!-- Header section with logo -->
          <div style="text-align: center; margin-bottom: 10px;">
            <img 
              src="/lovable-uploads/4048d3b1-d98a-4f7c-a3f2-97a8db4ca71f.png" 
              alt="Maiba Studio" 
              style="height: 50px; margin: 0 auto;"
            />
          </div>

          <!-- Large emojis section -->
          <div style="margin: 0 auto 20px; display: flex; justify-content: center; gap: 20px;">
            ${identity.emojis.map(emoji => `<span style="font-size: 84px; margin-bottom: 10px;">${emoji}</span>`).join('')}
          </div>
          
          <!-- Title and description -->
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 36px; font-weight: bold; margin-bottom: 16px; color: white; text-align: center;">${identity.title}</h2>
            
            <div style="font-size: 16px; line-height: 1.6; color: #E0E0E0; max-width: 600px; margin-left: auto; margin-right: auto; text-align: center;">
              ${identity.description}
            </div>
          </div>
          
          <!-- Strengths and challenges -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; margin-left: auto; margin-right: auto; width: 90%; max-width: 720px;">
            <div>
              <h3 style="color: #10B981; font-weight: 600; margin-bottom: 10px; text-align: center;">Strengths</h3>
              <ul style="color: #D1D5DB; list-style-type: none; padding-left: 0; font-size: 14px; text-align: center;">
                ${identity.strengths.map(s => `<li style="margin-bottom: 8px;">• ${s}</li>`).join('')}
              </ul>
            </div>
            
            <div>
              <h3 style="color: #EF4444; font-weight: 600; margin-bottom: 10px; text-align: center;">Challenges</h3>
              <ul style="color: #D1D5DB; list-style-type: none; padding-left: 0; font-size: 14px; text-align: center;">
                ${identity.challenges.map(c => `<li style="margin-bottom: 8px;">• ${c}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <!-- Key attributes -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: center;">
              <div style="display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 600px;">
                ${identity.traits.map(trait => 
                  `<span style="display: inline-block; font-size: 14px; background-color: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 4px; margin: 4px;">${trait}</span>`).join('')}
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: auto; text-align: center; font-size: 12px; color: #9CA3AF;">
            Generated by Archetype - Maiba Studio
          </div>
        </div>
      `;
      
      // Generate canvas from the hidden element
      const canvas = await html2canvas(exportDiv, {
        backgroundColor: "#222222",
        scale: 2, // Better resolution
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Convert to JPEG and download
      canvas.toBlob((blob) => {
        if (blob) {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${identity.title.replace(/\s+/g, '-').toLowerCase()}-archetype.jpg`;
          link.href = url;
          link.click();
          
          // Clean up
          URL.revokeObjectURL(url);
          document.body.removeChild(exportDiv);
          toast.dismiss();
          toast.success('Archetype image saved!');
        } else {
          toast.dismiss();
          toast.error('Failed to generate image');
        }
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      toast.dismiss();
      toast.error('Error generating image');
      console.error('Error generating image:', error);
    }
  };

  // Display emojis in their original order
  const displayEmojis = [...identity.emojis];

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-4 animate-fade-in" ref={resultRef}>
      <section id="identity-core" className="text-center mb-8 w-full">
        <div id="glyphs" className="mb-6 flex justify-center gap-4">
          {displayEmojis.map((emoji, index) => (
            <span 
              key={index} 
              className="text-4xl animate-float" 
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
        
        <h2 className="text-3xl font-bold mb-3">{identity.title}</h2>
        
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          {identity.description}
        </p>
      </section>
      
      <section id="archetype-details" className="w-full space-y-4 mb-8">
        {/* Foundation */}
        <div id="foundation" className="bg-white/5 rounded-xl p-4">
          <h3 className="text-crimson font-semibold mb-2 flex items-center gap-2">
            <span>◉</span> Foundation: {selectedFoundation?.name}
          </h3>
          <p className="text-gray-300 text-sm">
            {getArchetypeDescription(selectedFoundation?.id || '')}
          </p>
        </div>

        {/* Expression */}
        <div id="expression" className="bg-white/5 rounded-xl p-4">
          <h3 className="text-crimson font-semibold mb-2 flex items-center gap-2">
            <span>◉</span> Expression: {selectedExpression?.name}
          </h3>
          <p className="text-gray-300 text-sm">
            {getArchetypeDescription(selectedExpression?.id || '')}
          </p>
        </div>

        {/* Function */}
        <div id="function" className="bg-white/5 rounded-xl p-4">
          <h3 className="text-crimson font-semibold mb-2 flex items-center gap-2">
            <span>✧</span> Function: {selectedFunction?.name}
          </h3>
          <p className="text-gray-300 text-sm">
            {getArchetypeDescription(selectedFunction?.id || '')}
          </p>
        </div>

        {/* Identity Traits */}
        <div id="identity-traits" className="bg-white/5 rounded-xl p-4 space-y-4">
          {/* Strengths */}
          <div id="strengths">
            <h3 className="text-green-400 text-sm font-semibold mb-2">Strengths</h3>
            <ul className="text-gray-300 text-sm list-disc list-inside">
              {identity.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          {/* Challenges */}
          <div id="challenges">
            <h3 className="text-red-400 text-sm font-semibold mb-2">Challenges</h3>
            <ul className="text-gray-300 text-sm list-disc list-inside">
              {identity.challenges.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Attributes */}
        <div id="adjectives" className="bg-white/5 rounded-xl p-4">
          <h3 className="text-crimson font-semibold mb-2 flex items-center gap-2">
            <span>✧</span> Key Attributes
          </h3>
          <div className="flex flex-wrap gap-2">
            {identity.traits.map((trait, index) => (
              <span 
                key={index} 
                className="text-xs bg-white/10 px-2 py-1 rounded"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </section>
      
      <section id="action-buttons" className="flex gap-4 w-full">
        <button 
          onClick={handleRestart}
          className="flex-1 bg-transparent border-2 border-crimson text-crimson rounded-xl py-3 font-semibold hover:bg-crimson hover:text-white transition-colors flex items-center justify-center"
        >
          <ArrowLeft size={18} className="mr-2" /> Restart
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 bg-crimson text-white rounded-xl py-3 font-semibold hover:bg-crimson/90 transition-colors flex items-center justify-center"
        >
          <Save size={18} className="mr-2" /> Save Image
        </button>
      </section>
    </div>
  );
};

export default IdentityResult;
