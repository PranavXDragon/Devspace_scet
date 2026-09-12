"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from "react-redux";
import { adminService } from "@/services/adminService";
import { setLogin, setLogout, setAuthResolved } from "@/context/authSlice";
import SplashScreen from "@/components/common/SplashScreen";

export default function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const isAuthResolved = useSelector((state) => state.auth.isAuthResolved);
  const user = useSelector((state) => state.auth.user);
  const location = usePathname();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    dispatch(setAuthResolved(false));

    // Optimization: check if we even have a valid session before making the API call
    const hasAuthFlag = localStorage.getItem("devspace_admin_auth") === "true";

    if (!hasAuthFlag) {
      dispatch(setLogout());
      setTimeout(() => {
        setShowSplash(false);
      }, 500); // Shorter splash since no network request is made
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await adminService.getCurrentAdmin();
        dispatch(setLogin(response.data || response));
      } catch {
        dispatch(setLogout());
      } finally {
        dispatch(setAuthResolved(true));
        setTimeout(() => {
          setShowSplash(false);
        }, 1200);
      }
    };

    fetchProfile();
  }, [dispatch]);

  const isLoginPage = location === "/admin/login";

  useEffect(() => {
    if (isAuthResolved) {
      if (!user && !isLoginPage) {
        router.replace("/admin/login");
      } else if (user && isLoginPage) {
        router.replace("/admin/dashboard");
      }
    }
  }, [isAuthResolved, user, isLoginPage, router]);

  // Don't render content until auth is resolved and redirects are handled
  if (!isAuthResolved) return <SplashScreen show={true} />;
  if (!user && !isLoginPage) return null;
  if (user && isLoginPage) return null;

  return (
    <>
      <SplashScreen show={showSplash} />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></div>
          </div>
        }
      >
        {children}
      </Suspense>
    </>
  );
}
