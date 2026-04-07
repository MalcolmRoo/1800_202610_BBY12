import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { checkAuthState } from "./authentication.js";

// Imports and runs the auth state checker from authentication.js.
// This watches for login/logout changes and redirects to index.html
// if the user is not logged in
checkAuthState();
