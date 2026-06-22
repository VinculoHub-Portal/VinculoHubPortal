import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('../hooks/useAuthProfile', () => ({
  AUTH_PROFILE_QUERY_KEY: ['auth-profile'],
  useAuthProfile: () => ({
    data: null,
    error: null,
    isError: false,
    isLoading: false,
  }),
}))
