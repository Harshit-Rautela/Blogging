import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserBlogs } from "../services/BlogsApi";
import BackButton from "./Buttons/BackButton";
import { formToJSON } from "axios";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const userBlogs = await getUserBlogs(token);
        setBlogs(userBlogs);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        navigate("/login");
      }
    };
    fetchBlogs();
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await deleteBlog(id, token);
    setBlogs(blogs.filter((blog) => blog._id !== id));
  };

  // const handleUpdate = (id) => {
  //   navigate(`/update/${id}`);
  // };

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmxvZ2dpbmd8ZW58MHx8MHx8fDA%3D";

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative container mx-auto py-12 px-6 text-white">
        <h1 className="text-4xl font-bold text-center mb-8 animate__animated animate__fadeIn">
          All Blogs
        </h1>
        <BackButton />
        <br />

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:scale-105"
              >
                <div className="p-6 text-gray-800">
                  <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                  <p className="text-gray-600 mb-4">
                    {blog.content.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => navigate(`/user/${blog._id}`)} // Updated path to match the new route
                      className="text-white bg-indigo-600 hover:bg-indigo-700 font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Read More
                    </button>
                    <button
                      onClick={() => navigate(`/user/update/${blog._id}`)}
                      className="text-white bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Update
                    </button>
                    <button
                      onClick={() =>navigate(`/user/delete/${blog._id}`)}
                      className="text-white bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-300">No blogs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBlogs;