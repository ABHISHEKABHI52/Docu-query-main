import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { MemberActions, MemberContext, MemberState } from '.';
import { getCurrentMember, mockLogin, mockLogout, Member } from '..';

// Local storage key
const MEMBER_STORAGE_KEY = 'member-store';

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState<MemberState>(() => {
    let storedMemberData: Member | null = null;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MEMBER_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          storedMemberData = parsedData.member || null;
        }
      } catch (error) {
        console.error('Error loading member state from localStorage:', error);
      }
    }

    return {
      member: storedMemberData,
      isAuthenticated: !!storedMemberData,
      isLoading: true,
      error: null,
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving member state to localStorage:', error);
      }
    }
  }, [state]);

  // Update state helper
  const updateState = useCallback((updates: Partial<MemberState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Member actions
  const actions: MemberActions = {
    /**
     * Load current member from storage
     */
    loadCurrentMember: useCallback(async () => {
      try {
        updateState({ isLoading: true, error: null });

        const member = await getCurrentMember();

        if (member) {
          updateState({
            member,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          updateState({
            member: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (err) {
        updateState({
          error: err instanceof Error ? err.message : 'Failed to load member',
          member: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }, [updateState]),

    /**
     * Mock login for demo
     */
    login: useCallback(() => {
      // For demo purposes, create a mock user
      const member = mockLogin('demo@example.com', 'Demo User');
      updateState({
        member,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    }, [updateState]),

    /**
     * Logout action
     */
    logout: useCallback(() => {
      mockLogout();
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(MEMBER_STORAGE_KEY);
        } catch (error) {
          console.error('Error clearing member state from localStorage:', error);
        }
      }

      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, [updateState]),

    /**
     * Clear member state
     */
    clearMember: useCallback(() => {
      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, [updateState]),
  };

  // Auto-load member on mount
  useEffect(() => {
    actions.loadCurrentMember();
  }, [actions.loadCurrentMember]);

  // Context value
  const contextValue = {
    ...state,
    actions,
  };

  return (
    <MemberContext.Provider value={contextValue}>
      {children}
    </MemberContext.Provider>
  );
};
