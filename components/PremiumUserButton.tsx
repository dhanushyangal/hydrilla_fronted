"use client";

import { useEffect, useState } from "react";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { checkEarlyAccess } from "../lib/api";

interface PremiumUserButtonProps {
  afterSignOutUrl?: string;
  appearance?: any;
  className?: string;
}

/**
 * UserButton with Premium Pass badge
 * Shows a minimalistic silver/white badge if user has early access
 */
export default function PremiumUserButton({ 
  afterSignOutUrl = "/", 
  appearance,
  className = ""
}: PremiumUserButtonProps) {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [hasPremium, setHasPremium] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || null;

  useEffect(() => {
    const checkPremium = async () => {
      if (!isSignedIn || !userEmail) {
        setHasPremium(false);
        setIsChecking(false);
        return;
      }

      try {
        const { hasAccess } = await checkEarlyAccess(userEmail, getToken);
        setHasPremium(hasAccess);
      } catch (err) {
        console.error("Error checking premium status:", err);
        setHasPremium(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkPremium();
  }, [isSignedIn, userEmail, getToken]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <UserButton
        afterSignOutUrl={afterSignOutUrl}
        appearance={appearance}
      />
      {hasPremium && !isChecking && (
        <div 
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100 border-2 border-white shadow-md flex items-center justify-center"
          title="Premium Pass"
        >
          <svg 
            className="w-2.5 h-2.5 text-slate-600" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 .723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}
    </div>
  );
}
