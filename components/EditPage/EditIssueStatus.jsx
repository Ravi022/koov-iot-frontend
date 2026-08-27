import { API_BASE_URL } from "@/lib/api";

import axios from "axios";
// import { Axis3D } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function EditIssueStatus({ data, editSvg, setEditStatus }) {
  const [isEditing, setIsEditing] = useState(false);
  // const [currentStatus, setCurrentStatus] = useState(data.currentStatus);

  const statuses = [
    {
      label: "Open",
      svg: "M12 2v20M2 12h20", // Example SVG path for Open
    },
    {
      label: "In Progress",
      svg: "M12 2v20M2 12h10M12 12h10", // Example SVG path for In Progress
    },
    {
      label: "Resolved",
      svg: "M5 13l4 4L19 7", // Example SVG path for Resolved
    },
    {
      label: "Closed",
      svg: "M6 18L18 6M6 6l12 12", // Example SVG path for Closed
    },
  ];

  // console.log(data);

  const handleStatusChange = async (status, data) => {
    // console.log(data);
    try {
      const id = data._id;
      const selectedStatus = status;
      const userDetail = JSON.parse(localStorage.getItem("userDetails"));
      const accessToken = localStorage.getItem("accessToken");
      // console.log(userDetail.role)
      // console.log(selectedStatus);
      if (userDetail?.role === 'admin') {
        const res = await axios.put(`${API_BASE_URL}/common/updateIssueStatus`, { id, selectedStatus },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
            },
          }
        )
        setEditStatus(prev => !prev);
        // console.log(res);
        toast.success("Status is updated")
      }
    }
    catch (error) {
      console.log(error)
    }
    // console.log(12);



    // in
    // setCurrentStatus(status);
    setIsEditing(false); // Close the dropdown after selection
  };

  return (
    <div className="mr-4 inline-block align-middle">

      {!isEditing ? (
        <>
          <div className="flex items-center">
            <span className="mr-2">{data.currentStatus}</span>
            {editSvg && (
              <span
                title="Edit Order Status"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer"
              >
                <svg
                  className="w-6 h-6 text-gray-500 hover:text-gray-600 dark:text-white inline-block align-middle"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                  />
                </svg>
              </span>
            )}
          </div>
          {/* <div className="mt-2"> */}
          {/* {statuses
              .filter((status) => status.label === currentStatus)
              .map((status) => (
                <svg
                  key={status.label}
                  className="w-6 h-6 text-blue-500 inline-block align-middle"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={status.svg}
                  />
                </svg>
              ))} */}
          {/* </div> */}
        </>
      ) : (
        <div className="relative">
          <select
            className="block w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.currentStatus}
            onChange={(e) => handleStatusChange(e.target.value, data)}
          >
            {statuses.map((status) => (
              <option
                key={status.label}
                value={status.label}
                className="flex items-center space-x-2"
              >
                {status.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}


// import { useState } from "react";

// export default function EditIssueStatus({ data, editSvg }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentStatus, setCurrentStatus] = useState(data.currentStatus);

//   const statuses = ["Open", "In Progress", "Resolved", "Closed"];

//   const handleStatusChange = (status) => {
//     setCurrentStatus(status);
//     setIsEditing(false); // Close the dropdown after selection
//   };

//   return (
//     <div className="mr-4 inline-block align-middle">
//       {!isEditing ? (
//         <>
//           <div className="flex items-center">
//             <span className="mr-2">{currentStatus}</span>
//             {editSvg && (
//               <span
//                 title="Edit Order Status"
//                 onClick={() => setIsEditing(true)}
//                 className="cursor-pointer text-blue-500 hover:underline"
//               >
//                 Edit
//               </span>
//             )}
//           </div>
//         </>
//       ) : (
//         <div className="relative">
//           <select
//             className="block w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={currentStatus}
//             onChange={(e) => handleStatusChange(e.target.value)}
//           >
//             {statuses.map((status) => (
//               <option key={status} value={status}>
//                 {status}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}
//     </div>
//   );
// }
