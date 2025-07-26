import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <Loader2 className="w-12 h-12 text-[var(--cosmic-purple)] animate-spin-slow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-[var(--stellar-blue)] rounded-full animate-pulse-gentle"></div>
          </div>
        </div>
        <p className="text-[var(--cosmic-gray)] font-light">Loading cosmic content...</p>
      </div>
    </div>
  );
}
