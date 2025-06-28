import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { usePlayerStore } from "./store/playerStore";
import { Suspense, lazy, Component, ErrorInfo, ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Error Boundary Component
class ErrorBoundary extends Component<{
  fallback: ReactNode;
  children: ReactNode;
}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

import { GameModeConfig } from "./types/game";

// Define HomePage props interface
interface HomePageProps extends Record<string, unknown> {
  onStartGame: (gameMode: GameModeConfig) => void;
}

// Lazy load pages for better performance with proper typing
const HomePage = lazy(
  () => import("./components/HomePage"),
) as unknown as React.LazyExoticComponent<React.ComponentType<HomePageProps>>;
const MatchPage = lazy(
  () => import("./pages/MatchPage"),
) as React.LazyExoticComponent<React.ComponentType>;
const VsBotPage = lazy(
  () => import("./pages/VsBotPage"),
) as React.LazyExoticComponent<React.ComponentType>;
const AccountPage = lazy(
  () => import("./pages/AccountPage"),
) as React.LazyExoticComponent<React.ComponentType>;

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

// Error fallback component
const ErrorFallback = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white">
    <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm max-w-md mx-4">
      <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
      <p className="mb-4 text-red-100">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-white text-purple-600 rounded-md font-medium hover:bg-purple-50 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

// Define props type for LazyRoute
interface LazyRouteProps<T = Record<string, unknown>> {
  element: React.ComponentType<T>;
  errorMessage: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

// Wrapper component for lazy-loaded routes
const LazyRoute = <T extends Record<string, unknown>>({
  element: Element,
  errorMessage,
  children,
  ...props
}: LazyRouteProps<T>) => {
  // Create props with correct type for the element
  const elementProps = props as unknown as T;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary
        fallback={
          <ErrorFallback
            message={
              errorMessage ||
              "An unexpected error occurred while loading this page."
            }
          />
        }
      >
        {children || <Element {...elementProps} />}
      </ErrorBoundary>
    </Suspense>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LazyRoute<HomePageProps>
        element={HomePage}
        onStartGame={(gameMode: GameModeConfig) => {
          console.log("Starting game with mode:", gameMode);
          // The actual game start logic is handled by the HomePage component
          // This is just a passthrough to satisfy the type system
        }}
        errorMessage="Failed to load the home page. Please try refreshing the page."
      />
    ),
  },
  {
    path: "/vs-bot",
    element: (
      <LazyRoute
        element={VsBotPage}
        errorMessage="Failed to load the bot game. Please try again later."
      />
    ),
  },
  {
    path: "/match/:roomId",
    element: (
      <LazyRoute
        element={MatchPage}
        errorMessage="Failed to load the match. Please check your connection and try again."
      >
        <ProtectedRoute>
          <MatchPage />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: "/account",
    element: (
      <LazyRoute
        element={AccountPage}
        errorMessage="Failed to load your account. Please try again later."
      >
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      </LazyRoute>
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
