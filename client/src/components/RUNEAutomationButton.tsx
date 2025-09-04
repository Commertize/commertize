import React, { useState } from "react";
import { useRUNEAutomation } from "@/hooks/useRUNEAutomation";
import { useLocation } from "wouter";

interface RUNEAutomationButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: (result: { dealId: string; docId: string; dqi: number }) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export function RUNEAutomationButton({ 
  className = "", 
  variant = 'primary',
  size = 'md',
  onSuccess,
  onError,
  children = "Let RUNE automate this"
}: RUNEAutomationButtonProps) {
  const [, navigate] = useLocation();
  const { runRUNEAutomation, isRunning, status, error, reset } = useRUNEAutomation();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    const result = await runRUNEAutomation(file);
    
    if (result && result.state === 'complete' && result.dealId) {
      onSuccess?.(result as { dealId: string; docId: string; dqi: number });
      
      // Auto-navigate to appropriate route based on success
      navigate(`/deals/${result.dealId}/financials`);
    } else if (error) {
      onError?.(error);
    }
  };

  const handleClick = () => {
    if (isRunning) return;
    document.getElementById('rune-file-input')?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFile(file);
    }
  };

  const baseClasses = "font-logo font-light transition-colors relative overflow-hidden";
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg"
  };
  const variantClasses = {
    primary: "bg-[#be8d00] text-white hover:bg-[#be8d00]/90 disabled:bg-[#be8d00]/50",
    secondary: "border border-[#be8d00]/30 text-black hover:bg-[#be8d00]/5 disabled:opacity-50"
  };

  const progressWidth = status?.progress || 0;

  return (
    <div className="relative">
      <input
        id="rune-file-input"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
        disabled={isRunning}
      />
      
      <button
        onClick={handleClick}
        disabled={isRunning}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${dragActive ? 'bg-[#be8d00]/10 border-[#be8d00]' : ''}
          ${className}
          rounded-xl
        `}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isRunning) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {/* Progress bar overlay */}
        {isRunning && (
          <div 
            className="absolute inset-0 bg-[#be8d00]/20 transition-all duration-300"
            style={{ width: `${progressWidth}%` }}
          />
        )}
        
        <span className="relative z-10">
          {isRunning ? (
            <>
              🤖 RUNE Working... {Math.round(progressWidth)}%
            </>
          ) : error ? (
            <>
              ❌ {error.slice(0, 30)}... 
              <button onClick={reset} className="ml-1 underline">Retry</button>
            </>
          ) : (
            children
          )}
        </span>
      </button>
      
      {/* Status message */}
      {status && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs sm:text-sm font-logo font-light text-black bg-white border border-[#be8d00]/20 rounded px-2 py-1 shadow-sm z-10">
          {status.state === 'queued' && '⏳ Queued for processing...'}
          {status.state === 'processing' && '🔄 Extracting and analyzing...'}
          {status.state === 'complete' && `✅ Complete! Deal created (DQI: ${status.dqi})`}
          {status.state === 'error' && `❌ Error: ${status.error}`}
        </div>
      )}
      
      {dragActive && (
        <div className="absolute inset-0 border-2 border-dashed border-[#be8d00] rounded-xl bg-[#be8d00]/5 flex items-center justify-center pointer-events-none">
          <span className="text-[#be8d00] font-logo font-light text-sm">Drop PDF to automate</span>
        </div>
      )}
    </div>
  );
}