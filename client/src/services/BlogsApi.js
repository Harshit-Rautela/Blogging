import axios from 'axios';

//const BASE_URL = 'https://blogging-ten-nu.vercel.app';

// Function to create a blog
export const createBlog = async (blogData, token) => {
  try {
    const response = await axios.post('https://blogging-theta-sand.vercel.app', blogData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.log("Error creating blog:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to get all blogs for the logged-in user
export const getUserBlogs = async (token) => {
  try {
    const response = await axios.get('https://blogging-theta-sand.vercel.app/user', {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    console.log("Error getting user blogs:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to get a blog by ID
export const getBlogById = async (id, token) => {
  try {
    const response = await axios.get(`https://blogging-theta-sand.vercel.app/${id}`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (err) {
    console.error("Error getting blog:", err);
    throw err;
  }
};

// Function to update a blog by ID
export const updateBlog = async (id, updatedBlog, token) => {
  try {
    const response = await axios.put(`https://blogging-theta-sand.vercel.app/${id}`, updatedBlog, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (err) {
    console.error("Error updating blog:", err);
    throw err;
  }
};

// Function to delete a blog by ID
export const deleteBlog = async (id, token) => {
  try {
    await axios.delete(`https://blogging-theta-sand.vercel.app/${id}`, {
      headers: { 'x-auth-token': token }
    });
  } catch (err) {
    console.error("Error deleting blog:", err);
    throw err;
  }
};
