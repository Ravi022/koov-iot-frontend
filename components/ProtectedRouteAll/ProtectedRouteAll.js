// "use client"


// // import { useRouter } from 'next/router';
// import { useEffect } from 'react';
// import { usePathname, useRouter } from "next/navigation";


// const ProtectedRouteAll = ({ children }) => {
//   const router = useRouter();
//   const pathname = usePathname();

// //   console.log(isAuthenticated);
//   let isAuthenticated;

//   useEffect(() => {
//     console.log("hello")
//      isAuthenticated = localStorage.getItem('accessToken');
//     //  console.log(isAuthenticated);
//     // console.log(pathname);
//     if (!isAuthenticated) {
//       router.push('/login'); // Redirect to login page if not authenticated
//     }

//     if (!isAuthenticated && pathname != '/login') {
//         return (<div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
//         <div className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
//           <div className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</div>
//           <div className="text-xl text-gray-600 dark:text-gray-300 mb-4">Page Not Found</div>

//           {/* Loading Spinner */}
//           <div className="flex justify-center items-center">
//             <div className="animate-spin rounded-full border-4 border-t-4 border-gray-800 dark:border-gray-300 w-16 h-16 mb-4"></div>
//           </div>

//           <p className="text-gray-500 dark:text-gray-400">Redirecting you back to the homepage...</p>
//         </div>
//         </div>); // Show a loading state until redirect happens
//       }
//      else{
//         return <>{children}</>;
//      }

//   }, [router,isAuthenticated]);


// };

// export default ProtectedRouteAll;


// "use client";

// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";

// const ProtectedRouteAll = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(null); // State to track authentication status
//     const router = useRouter();
//     const pathname = usePathname();

//     useEffect(() => {
//         // Check for the token in localStorage on client side
//         const token = localStorage.getItem('accessToken');
//         if (!token) {
//             // If no token, redirect to login page
//             router.push('/login');
//         } else {
//             setIsAuthenticated(true); // Set authenticated state to true if token exists
//         }
//     }, []); // Empty dependency array to run only once on mount

//     // If authentication check is still in progress (isAuthenticated is null), show a loading state
//     if (isAuthenticated === null && pathname != '/login') {
//         return (
//             <div className="flex items-center justify-center h-screen dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
//                 <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-lg">
//                     {/* Animated Text */}
//                     <div className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 animate-pulse">
//                         Loading...
//                     </div>

//                     {/* Animated Spinner */}
//                     <div className="relative flex justify-center items-center mb-6">
//                         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white dark:border-gray-500"></div>
//                         <div className="absolute text-xl font-bold text-blue-500 dark:text-gray-300">⏳</div>
//                     </div>

//                     {/* Redirecting Text */}
//                     <p className="text-gray-600 dark:text-gray-400 animate-fade-in">
//                         Redirecting you back to the homepage...
//                     </p>
//                 </div>
//             </div>

//         );
//     }

//     // If authenticated, render children
//     return <>{children}</>;
// };

// export default ProtectedRouteAll;



// "use client";

// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";

// const ProtectedRouteAll = ({ children }) => {

//     const [isAuthenticated, setIsAuthenticated] = useState(() => {
//         // Check for token immediately on initialization
//         return !!localStorage.getItem('accessToken');
//     });

//     const router = useRouter();
//     const pathname = usePathname();

//     useEffect(() => {
//         // Redirect to login if token is missing
//         if (!isAuthenticated) {
//             router.push('/login');
//         }
//     }, [isAuthenticated, router]);

//     // If authentication check is still in progress (isAuthenticated is null), show a loading state
//     if (isAuthenticated === null && pathname !== '/login') {
//         return (
//             <div className="flex items-center justify-center h-screen dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
//                 <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-lg">
//                     {/* Animated Text */}
//                     <div className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 animate-pulse">
//                         Loading...
//                     </div>

//                     {/* Animated Spinner */}
//                     <div className="relative flex justify-center items-center mb-6">
//                         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white dark:border-gray-500"></div>
//                         <div className="absolute text-xl font-bold text-blue-500 dark:text-gray-300">⏳</div>
//                     </div>

//                     {/* Redirecting Text */}
//                     <p className="text-gray-600 dark:text-gray-400 animate-fade-in">
//                         Redirecting you back to the homepage...
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     // If authenticated, render children
//     return <>{children}</>;
// };

// export default ProtectedRouteAll;


"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";



const ProtectedRouteAll = ({ children }) => {

    const isAuth = async () => {
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


    const [isAuthenticated, setIsAuthenticated] = useState(null); // Initial state as null
    const router = useRouter();
    const pathname = usePathname();

    // console.log("page is loading")

    useEffect(() => {

        // console.log("Auth is running 1")

        const checkAuthentication = async () => {
            // console.log("Auth is running")
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            if (!token) {
                const checkAuth = await isAuth();
                // console.log("checkAuth", checkAuth);
                if (checkAuth) {
                    console.log("checkAuth is true");
                    setIsAuthenticated(true);
                }
                else {
                    setIsAuthenticated(false);
                    router.push('/login');
                }
            }
            else {
                setIsAuthenticated(true);
            }
        }

        checkAuthentication()
        // Ensure localStorage is only accessed on the client side
        // const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        // if (!token) {
        //     // Redirect to login if no token
        //     setIsAuthenticated(false);
        //     router.push("/login");
        // } else {
        //     setIsAuthenticated(true); // Token exists, user is authenticated
        // }
    }, [router, pathname]);

    // If authentication is still being checked, show a loading state
    if (isAuthenticated === null && pathname !== "/login") {
        return (
            <div className="flex items-center justify-center h-screen dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-lg">
                    {/* Animated Text */}
                    <div className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 animate-pulse">
                        Loading...
                    </div>

                    {/* Animated Spinner */}
                    <div className="relative flex justify-center items-center mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white dark:border-gray-500"></div>
                        <div className="absolute text-xl font-bold text-blue-500 dark:text-gray-300">⏳</div>
                    </div>

                    {/* Redirecting Text */}
                    <p className="text-gray-600 dark:text-gray-400 animate-fade-in">
                        Redirecting you back to the homepage...
                    </p>
                </div>
            </div>
        );
    }

    // If authenticated, render children
    return <>{children}</>;
};

export default ProtectedRouteAll;




