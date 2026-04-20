import { useAuth0 } from "@auth/auth0-react";
import { BaseButton } from "..general/BaseButton";

function LogoutButton() {
  const { isAuthenticated, logout } = useAuth0();

  return (
    isAuthenticated && (
      <BaseButton
        variant="primary"
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        Logout
      </BaseButton>
    )
  );
}

export default LogoutButton;
