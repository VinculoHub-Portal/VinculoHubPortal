import { useAuth0 } from "@auth/auth0-react";
import { BaseButton } from "..general/BaseButton";

function LoginButton() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    !isAuthenticated && (
      <BaseButton
        variant="primary"
        onClick={() =>
          loginWithRedirect({ authorizationParams: { ui_locales: "pt-BR" } })
        }
      >
        Login
      </BaseButton>
    )
  );
}

export default LoginButton;
