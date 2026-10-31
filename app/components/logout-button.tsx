import { logoutAction } from "../actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="button button-primary" type="submit">
        Log out
      </button>
    </form>
  );
}
