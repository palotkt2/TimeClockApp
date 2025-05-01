import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const updateUser = async (updatedUser) => {
    // Update the user state with the new user data
    setUser(updatedUser);
    // Optionally, you can add logic to update the user in your backend
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
