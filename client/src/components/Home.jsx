// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserBlogs } from "../services/BlogsApi";

const Home = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/blogs/auth/me",
          {
            headers: { "x-auth-token": token },
          }
        );
        setUser(response.data);

        const userBlogs = await getUserBlogs(token);
        setBlogs(userBlogs);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
    const backgroundImageUrl = 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGJsYW5rfGVufDB8fHx8MTY1NzEwNzk5Mw&ixlib=rb-1.2.1&q=80&w=1080'; // Replace with your desired image URL


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Your Blogs</h2>
        <Link to="/create">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-full shadow-lg hover:from-purple-600 hover:to-blue-500 transition duration-300 transform hover:scale-105">
            Create
          </button>
        </Link>
        <Link to="/all-blogs">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-full shadow-lg hover:from-purple-600 hover:to-blue-500 transition duration-300 transform hover:scale-105">
            All Blogs
          </button>
          </Link>
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="border rounded-lg p-4 bg-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                <p className="text-gray-700">{blog.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No blogs found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
