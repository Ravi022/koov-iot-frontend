"use client";
import { API_BASE_URL } from "@/lib/api";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Import from next/navigation
import axios from "axios";

const isAuthenticated = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const accessTk = localStorage.getItem("accessToken");
  if(refreshToken && accessTk)
    return true; 
  // console.log(refreshToken);
  if (!refreshToken) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return false;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/common/token`, {
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

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  // const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname()

  // console.log("checkAuth is running")

  useEffect(() => {
    const checkAuth = async () => {
      // console.log("checkAuth is running")
      const result = await isAuthenticated();
      setIsAuth(result);
      if (result) {
        const userDetails = JSON.parse(localStorage.getItem("userDetails"));
        if (userDetails?.role === "salesperson") {
          // console.log("/saleperson")
          if(pathname === '/production' || pathname === '/admin'){
            // console.log(pathname)
            router.push('/login');
            return;
          }
          router.push("/"); // Redirect to admin-specific URL
        }
        else if (userDetails?.role === 'production'){
          if(pathname === '/' || pathname === '/admin'){
            router.push('/login');
            return;
          }
          router.push('/production')
        }
        else if(userDetails?.role === 'admin'){
          if(pathname === '/' || pathname === '/production'){
             router.push('/login');
             return;
          }
          else if(pathname === '/purchaseOrder'){
            router.push('/purchaseOrder');
            return;
          }
          router.push('/admin');
        }
        else {
          //  return (<>
          //     <div className="flex items-center justify-center h-screen bg-gray-100">
          //       <div className="text-center">
          //         <h1 className="text-9xl font-bold text-blue-500">404</h1>
          //         <p className="text-2xl font-medium text-gray-800 mt-4">Page Not Found</p>
          //         <p className="text-gray-600 mt-2">Sorry, the page you're looking for doesn't exist.</p>
          //       </div>
          //     </div>
          //   </>)
          // console.log('/login')
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // useEffect(() => {
  //   if (isAuth) {
  //     const getAccessToken = async () => {
  //       const refreshToken = localStorage.getItem("refreshToken");
  //       if (!refreshToken) return;

  //       try {
  //         const response = await axios.post(
  //           `${API_BASE_URL}/common/token`,
  //           {
  //             refreshToken,
  //           }
  //         );

  //         if (response.data.statusCode === 200 && response.data.data) {
  //           const { accessToken, refreshToken: newRefreshToken } =
  //             response.data.data;
  //           // console.log('/second function')
  //           localStorage.setItem("accessToken", accessToken);
  //           localStorage.setItem("refreshToken", newRefreshToken); // Update refresh token if provided
  //         } else {
  //           // console.log('/second login')
  //           localStorage.removeItem("refreshToken");
  //           localStorage.removeItem("accessToken");
  //           router.push("/login");
  //         }
  //       } catch (e) {
  //         console.error("Token refresh failed:", e);
  //         router.push("/login");
  //       }
  //     };

  //     getAccessToken();
  //     const interval = setInterval(getAccessToken, 1000 * 60 * 20); // Refresh token every 20 minutes
  //     return () => clearInterval(interval);
  //   }
  // }, [isAuth, router]);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return null; // Avoid rendering content if not authenticated
  }

  return <>{children}</>;
};

export default ProtectedRoute;








// "use client";

// import { useState, useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation"; // Import from next/navigation
// import axios from "axios";

// const isAuthenticated = async () => {
//   const refreshToken = localStorage.getItem("refreshToken");
//   if (!refreshToken) {
//     localStorage.removeItem("accessToken");
//     return false;
//   }

//   try {
//     const response = await axios.post(`${API_BASE_URL}/common/token`, {
//       refreshToken,
//     });

//     // console.log("isAuthenticate", response.data);
    
//     if (response.data.statusCode === 200 && response.data.data) {
//       const { accessToken, refreshToken: newRefreshToken } = response.data.data;
//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", newRefreshToken); // Update refresh token if provided
//       return true;
//     } else {
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("accessToken");
//       return false;
//     }
//   } catch (error) {
//     console.error("Authentication check failed:", error);
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("accessToken");
//     return false;
//   }
// };

// const ProtectedRoute = ({ children }) => {
//   const [isAuth, setIsAuth] = useState(null);
//   let [loading, setLoading] = useState(false)
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     loading = false;
//     // console.log("router is working")
//     const checkAuth = async () => {
//       const result = await isAuthenticated();
//       // console.log("res", result);
//       setIsAuth(result);
//       if (result) {
//         const userDetails = JSON.parse(localStorage.getItem("userDetails"));
//         console.log(pathname);
//         if (userDetails?.role === "salesperson") {
//           // console.log("ad")
//           router.push("/"); // Redirect to admin-specific URL
//         }
//         else{
//           router.push("/login");
//         }
//       } else {
//         // console.log("true");
//         router.push("/login");
//         // return;
//       }
//     };
//     checkAuth();
//     loading = true;
//   }, [router]);

//   // useEffect(() => {
//   //   if (isAuth) {
//   //     const getAccessToken = async () => {
//   //       const refreshToken = localStorage.getItem("refreshToken");
//   //       if (!refreshToken) return;

//   //       try {
//   //         const response = await axios.post(
//   //           `${API_BASE_URL}/common/token`,
//   //           {
//   //             refreshToken,
//   //           }
//   //         );

//   //         if (response.data.statusCode === 200 && response.data.data) {
//   //           const { accessToken, refreshToken: newRefreshToken } = 
//   //             response.data.data;
//   //           localStorage.setItem("accessToken", accessToken);
//   //           localStorage.setItem("refreshToken", newRefreshToken); // Update refresh token if provided
//   //         } else {
//   //           localStorage.removeItem("refreshToken");
//   //           localStorage.removeItem("accessToken");
//   //           router.push("/login");
//   //         }
//   //       } catch (e) {
//   //         console.error("Token refresh failed:", e);
//   //         router.push("/login");
//   //       }
//   //     };

//   //     getAccessToken();
//   //     const interval = setInterval(getAccessToken, 1000 * 60 * 20); // Refresh token every 20 minutes
//   //     return () => clearInterval(interval);
//   //   }
//   // }, [isAuth, router]);

//   if (isAuth === null) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuth) {
//     return null;  // Avoid rendering content if not authenticated
//   }

//   if(loading)
//     return <>loading...</>

//   return <>{children}</>;
// };

// export default ProtectedRoute;

