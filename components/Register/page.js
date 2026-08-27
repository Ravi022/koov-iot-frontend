// "use client";

// import axios from 'axios';
// import React, { useState } from 'react';

// const Page = () => {
//   // State to hold form data
//   const [formData, setFormData] = useState({
//     fullName: '',
//     jobId: '',
//     password: '',
//     area: '',
//     role: '',
//   });

//   // State to manage error and success messages
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // Handle form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     // Check if all fields are filled
//     const { fullName, jobId, password, area, role } = formData;
//     if (!fullName || !jobId || !password || !area || !role) {
//       setError('All fields are required');
//       return;
//     }

//     // Send POST request to the backend
//     try {
//       const response = await axios.post('http://127.0.0.1:5001/user/register', {
//         // method: 'POST',
//         // headers: {
//         //   'Content-Type': 'application/json',
//         // },
//         fullName, jobId, password, area, role
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSuccess(data.message || 'User registered successfully');
//       } else {
//         setError(data.message || 'Something went wrong');
//       }
//     } catch (error) {
//       console.log(error)
//       setError('Error connecting to the server');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md bg-white p-8 border rounded-lg shadow-md">
//         <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Register</h2>

//         {error && <p className="text-red-500 text-sm text-center">{error}</p>}
//         {success && <p className="text-green-500 text-sm text-center">{success}</p>}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
//             <input
//               type="text"
//               id="fullName"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div className="mb-4">
//             <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">Job ID</label>
//             <input
//               type="text"
//               id="jobId"
//               name="jobId"
//               value={formData.jobId}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div className="mb-4">
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div className="mb-4">
//             <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area</label>
//             <input
//               type="text"
//               id="area"
//               name="area"
//               value={formData.area}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div className="mb-6">
//             <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
//             <input
//               type="text"
//               id="role"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//           >
//             Register
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Page;
