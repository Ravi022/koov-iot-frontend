"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Import from next/navigation
import axios from "axios";

const isAuthenticated = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    localStorage.removeItem("accessToken");
    return false;
  }

  try {
    const response = await axios.post("http://127.0.0.1:5001/common/token", {
      refreshToken,
    });

    // console.log("isAuthenticate", response.data);

    if (response.data.statusCode === 200 && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken); // Update refresh token if provided
      return true;
    } else {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      return false;
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    return false;
  }
};

const ProtectedRouteAdmin = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // console.log("router is working")
    const checkAuth = async () => {
      const result = await isAuthenticated();
      // console.log("res", result);
      setIsAuth(result);
      if (result) {
        const userDetails = JSON.parse(localStorage.getItem("userDetails"));
        // console.log("user", userDetails);
        // console.log("userDetailsAuth", userDetails);
        console.log(pathname);
        if (userDetails?.role === "admin") {
          // console.log("ad")
          if (pathname === '/admin')
            router.push('/admin');
          else if (pathname === '/changePasswordByAdmin')
            router.push('/changePasswordByAdmin'); // Redirect to admin-specific URL
        }
        else {
          router.push("/login");
        }
      } else {
        // console.log("true");
        router.push("/login");
        // return;
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuth) {
      const getAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return;

        try {
          const response = await axios.post(
            "http://127.0.0.1:5001/common/token",
            {
              refreshToken,
            }
          );

          if (response.data.statusCode === 200 && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken); // Update refresh token if provided
          } else {
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("accessToken");
            router.push("/login");
          }
        } catch (e) {
          console.error("Token refresh failed:", e);
          router.push("/login");
        }
      };

      getAccessToken();
      const interval = setInterval(getAccessToken, 1000 * 60 * 20); // Refresh token every 20 minutes
      return () => clearInterval(interval);
    }
  }, [isAuth, router]);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return null;  // Avoid rendering content if not authenticated
  }

  return <>{children}</>;
};

export default ProtectedRouteAdmin;
