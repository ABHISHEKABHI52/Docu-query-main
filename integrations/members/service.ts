import { Member } from "./types";

/**
 * Mock getCurrentMember - returns null (no authentication in standalone mode)
 */
export const getCurrentMember = async (): Promise<Member | null> => {
  // In standalone mode, we don't have Wix authentication
  // Return a mock member for demo purposes or null
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('docu-query-member');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading member from localStorage:', error);
    }
  }
  return null;
};

/**
 * Mock login - stores a demo member
 */
export const mockLogin = (email: string, name: string): Member => {
  const member: Member = {
    _id: crypto.randomUUID(),
    loginEmail: email,
    loginEmailVerified: true,
    status: "APPROVED",
    contact: {
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
    },
    profile: {
      nickname: name,
    },
    _createdDate: new Date(),
    lastLoginDate: new Date(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('docu-query-member', JSON.stringify(member));
  }

  return member;
};

/**
 * Mock logout - removes stored member
 */
export const mockLogout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('docu-query-member');
  }
};
