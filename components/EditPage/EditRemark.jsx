import axios from "axios";
import React, { useState } from "react";
import { toast } from 'react-toastify';


const EditRemark = ({ data, setShowEditRemark, setSaveChange, showEditRemark }) => {
    // const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // State for popup visibility
    const [remark, setRemark] = useState(data.remark); // State to hold the remark text

    // Handle opening the edit popup
    // const handleEditClick = () => {
    //     setShowEditRemark(true)
    // };

    // console.log("data", data);

    // Handle closing the edit popup
    const handleClosePopup = () => {
        setShowEditRemark(false)
    };

    // Handle saving the updated remark
    // const handleSaveRemark = async() => {
    //     try{
    //       const orderId = data._id;
    //       const updatedRemark = remark;
    //       console.log("OID", orderId);
    //       console.log("remark", updatedRemark);
    //       const respose = await axios.put('http://127.0.0.1:5001/common/updateRemark', {orderId, updatedRemark})
    //       console.log("res", respose);
    //       if(respose.status === 200){
    //         toast.success("Remark is Updated");
    //         setShowEditRemark(false);
    //       }
    //     }
    //     catch(error){
    //       console.log(error);
    //     }
    //     // console.log("Updated Remark:", remark);
    //     // setShowEditRemark(false);
    //     // setIsEditPopupOpen(false);
    // };

    const handleSaveRemark = async () => {
        try {
            const orderId = data._id; // Fetch the order ID
            const updatedRemark = remark; // Fetch the updated remark

            const accessToken = localStorage.getItem('accessToken');
            console.log("orderId", orderId);
            console.log("remark", updatedRemark)
            // console.log("OID", orderId);
            // console.log("remark", updatedRemark);

            const response = await axios.put('http://127.0.0.1:5001/common/updateRemark', { orderId, updatedRemark },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
                    },
                }
            );


            console.log("res_update remark", response);
            // toast.success("Remark is updated successfully!");
            // Check if the status is 200
            if (response.status === 200) {
                toast.success("Remark is updated successfully!");
                setShowEditRemark(false); // Close the edit popup
                setSaveChange(prev => !prev);
            } else {
                toast.error("Failed to update remark.");
            }
        } catch (error) {
            console.error("Error updating remark:", error);
            toast.error("An error occurred while updating the remark.");
        }
    };


    return (
        <>
            {/* {isEditPopupOpen && ( */}
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <div className="bg-white dark:bg-black dark:border-gray-200 border-[1px] p-6 rounded-lg shadow-lg md:w-1/3 w-[20rem]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Edit Remark
                    </h3>
                    <textarea
                        className="w-full p-2 border rounded-lg dark:bg-black dark:text-white"
                        rows="4"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end space-x-4 mt-4">
                        <button
                            className="px-4 py-2 bg-gray-300 dark:bg-black text-gray-800 dark:text-white rounded-lg hover:bg-gray-400"
                            onClick={handleClosePopup}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-950"
                            onClick={handleSaveRemark}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
            {/* )} */}
        </>
    );
};

export default EditRemark;
