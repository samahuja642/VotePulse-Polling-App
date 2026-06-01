import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Minimal AuthContext mock — tests override via props
import { createContext, useContext } from 'react';

const AuthContext = createContext(null);
export const useAuthMock = () => useContext(AuthContext);

export function renderWithRouter(ui, { route = '/', authValue, ...options } = {}) {
  const defaultAuth = { user: null, loading: false, login: vi.fn(), logout: vi.fn() };
  const auth = { ...defaultAuth, ...authValue };

  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>
    </MemoryRouter>,
    options,
  );
}
