import type React from "react";
import { Lock } from "lucide-react";

interface FeatureLockWrapperProps {
  children: React.ReactNode;
  isLocked?: boolean;
}

export function FeatureLockWrapper({
  children,
  isLocked = true,
}: FeatureLockWrapperProps) {
  return (
    <div className="relative cursor-not-allowed ">
      <div className="h-full pointer-events-none">
        {children}
        {isLocked && (
          <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none">
            <div className="absolute top-[-4] right-[-4]">
              <Lock className="w-3 h-3 text-gray-800" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
