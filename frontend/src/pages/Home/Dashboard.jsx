import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {LuCirclePlus} from 'react-icons/lu'
import moment from 'moment'
import ResumeSummaryCard from "../../components/Cards/ResumeSummaryCard";
import CreateResumeForm from "./CreateResumeForm";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [allResumes, setAllResumes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllResumes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view your resumes");
        navigate("/");
        return;
      }

      const response = await axiosInstance.get(API_PATHS.RESUME.GET_ALL);
      console.log("Resumes fetched:", response.data);
      setAllResumes(response.data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data.message || "Failed to fetch resumes");
      } else {
        toast.error("Failed to connect to the server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResumes();
  }, []);

  return <DashboardLayout>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0 font-sans">
        <div
          className="h-[300px] flex flex-col gap-5 items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg border border-purple-100 hover:border-purple-300 hover:opacity-90 cursor-pointer transition-all duration-300 shadow-lg"
          onClick={() => setOpenCreateModal(true)}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-2xl">
            <LuCirclePlus className="text-xl text-white" />
          </div>

          <h3 className="font-medium text-white font-display">Add New Resume</h3>
        </div>

        {isLoading ? (
          <div className="col-span-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : allResumes && allResumes.length > 0 ? (
          allResumes.map((resume) => (
            <ResumeSummaryCard
              key={resume?._id}
              imgUrl={resume?.thumbnailLink || null}
              title={resume.title}
              lastUpdated={
                resume?.updatedAt
                  ? moment(resume.updatedAt).format("Do MMM YYYY")
                  : ""
              }
              onSelect={()=>navigate(`/resume/${resume?._id}`)}
            />
          ))
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            No resumes found. Create your first resume!
          </div>
        )}
      </div>

       <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
        }}
        hideHeader
      >
        <div className="font-sans">
          <CreateResumeForm onSuccess={() => {
            setOpenCreateModal(false);
            fetchAllResumes();
          }} />
        </div>
      </Modal>
  </DashboardLayout>;
};

export default Dashboard;
