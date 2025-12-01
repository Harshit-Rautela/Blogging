import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaPlusCircle, FaBlog, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/get-started');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 shadow-lg fixed top-0 left-0 w-full z-10 rounded-b-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-white text-xl font-bold flex items-center space-x-2">
          <FaHome className="text-2xl" />
          <Link to="/" className="hover:text-yellow-300 transition duration-300">
            My Blog
          </Link>
        </div>
        <div className="flex-1 flex justify-center space-x-8">
          <Link
            to="/"
            className="text-white text-lg flex items-center space-x-2 hover:text-yellow-300 transition duration-300"
          >
            <FaHome />
            <span>Home</span>
          </Link>
          <Link
            to="/create"
            className="text-white text-lg flex items-center space-x-2 hover:text-yellow-300 transition duration-300"
          >
            <FaPlusCircle />
            <span>Create Blog</span>
          </Link>
          <Link
            to="/all-blogs"
            className="text-white text-lg flex items-center space-x-2 hover:text-yellow-300 transition duration-300"
          >
            <FaBlog />
            <span>All Blogs</span>
          </Link>
        </div>
        <div className="flex-none">
          <button
            onClick={handleLogout}
            className="text-white text-lg flex items-center space-x-2 hover:text-yellow-300 transition duration-300 focus:outline-none"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
