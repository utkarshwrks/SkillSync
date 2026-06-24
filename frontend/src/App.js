import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import WarpSplash from "./components/WarpSplash";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

// Eager: the first paint (landing + auth). Everything else is lazy-loaded
// so the initial bundle stays small and routes load on demand.
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Insights = lazy(() => import("./pages/Insights"));
const Tracker = lazy(() => import("./pages/Tracker"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const protect = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <WarpSplash />
          <AnimatedBackground />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<Loader label="Loading…" />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/u/:username" element={<PublicProfile />} />
                  <Route path="/onboarding" element={protect(<Onboarding />)} />
                  <Route path="/dashboard" element={protect(<Dashboard />)} />
                  <Route path="/jobs" element={protect(<Jobs />)} />
                  <Route path="/insights" element={protect(<Insights />)} />
                  <Route path="/tracker" element={protect(<Tracker />)} />
                  <Route path="/profile" element={protect(<Profile />)} />
                  <Route path="/settings" element={protect(<Settings />)} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
