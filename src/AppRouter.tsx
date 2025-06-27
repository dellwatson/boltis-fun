import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { usePlayerStore } from "./store/playerStore";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const HomePage = lazy(() => import("./components/HomePage"));
const MatchPage = lazy(() => import("./pages/MatchPage"));
const VsBotPage = lazy(() => import("./pages/VsBotPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
    <Loader2 className="w-12 h-12 text-white animate-spin" />
  </div>
);

// Auth wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { guestPlayer } = usePlayerStore();

  // If not authenticated and no guest player, redirect to home
  if (!user && !guestPlayer) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      // <Suspense fallback={<LoadingSpinner />}>
      <HomePage onStartGame={() => {}} />
      // </Suspense>
    ),
  },
  {
    path: "/vs-bot",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <VsBotPage />
      </Suspense>
    ),
  },
  {
    path: "/match/:roomId",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <MatchPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/vs-bot",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <VsBotPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/account",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <AccountPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
