import { useAuth0 } from '@auth0/auth0-react';
import { BaseButton } from '../general/BaseButton';

function LogoutButton() {
  const {
    isAuthenticated,
    logout,
  } = useAuth0();

  return isAuthenticated && (
    <BaseButton
      variant="outline"
      onClick={() => {
      logout({ 
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    }}
    >
      Log out
    </BaseButton>
  );
}

export default LogoutButton;
