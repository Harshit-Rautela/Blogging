import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBlogById, updateBlog } from '../services/BlogsApi';
import BackButton from './Buttons/BackButton';

const UpdateBlog = () => {
  const { id } = useParams(); // Get the blog ID from the URL parameters
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  useEffect(()=>{
    const fetchBlog = async()=>{
        const token = localStorage.getItem('token');
        if(!token){
            navigate('/login');
        }
        try {
            const blog = await getBlogById(id,token);
            setTitle(blog.title);
            setContent(blog.content);           
        } catch (err) {
            console.error('Failed to fetch blog:', err);           
        }
    }
    fetchBlog()
  },[id])
  const handleUpdate =async(e)=>{
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        if(!token){
            navigate('/login');
        }
        const updatedBlog = {title, content};
        await  updateBlog(id,updatedBlog, token);
        navigate('/home');
        
    } catch (err) {
        console.err({msg:'Cannot update the blog:', err});     
    }
  }

  

  const backgroundImageUrl =
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDI4fHx1cGRhdGV8ZW58MHx8fHwxNjU3MTM2MzA5&ixlib=rb-1.2.1&q=80&w=1080';

  return (
    <div className="relative bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
      <BackButton />
      <div className="relative container mx-auto p-8 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-8">Update Your Blog</h1>
        <form className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-lg">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full mb-4 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-600 transition duration-300"
          >
            Update Blog
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBlog;