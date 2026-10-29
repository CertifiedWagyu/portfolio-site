import { AdminApp } from "./admin/AdminApp";
import { Site } from "./components/Site";
import { AuthProvider } from "./context/AuthProvider";
import { useRoute } from "./lib/router";

function App() {
  const path = useRoute();
  const isAdminRoute = path === "/admin" || path.startsWith("/admin/");

  if (isAdminRoute) {
    return (
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Site />
    </AuthProvider>
  );
}

export default App;
