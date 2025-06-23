import React from 'react';
import axios from 'axios';

// Define your backend API base URL as a constant for easier management
// This should match your deployed backend URL
const BACKEND_BASE_URL = 'https://blogging-backend-seven.vercel.app';

// Function to create a blog
export const createBlog = async (blogData, token) => {
  try {
    // Construct the full URL using the base URL
    const response = await axios.post(`${BACKEND_BASE_URL}`, blogData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
        // 'Content-Type': 'multipart/form-data' // Uncomment if you are sending files
      }
    });
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.log("Error creating blog:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to get all blogs for the logged-in user
// This endpoint typically returns blogs associated with the user whose token is provided
export const getUserBlogs = async (token) => {
  try {
    // Construct the full URL using the base URL
    const response = await axios.get(`${BACKEND_BASE_URL}/user`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.log("Error getting user blogs:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to get a blog by ID
export const getBlogById = async (id, token) => {
  try {
    // Construct the full URL using the base URL and the blog ID
    const response = await axios.get(`${BACKEND_BASE_URL}/${id}`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error getting blog:", err.response ? err.response.data : err.message);
    throw err;
  }
};

// Function to update a blog by ID
export const updateBlog = async (id, updatedBlog, token) => {
  try {
    // Construct the full URL for updating a specific blog
    const response = await axios.put(`${BACKEND_BASE_URL}/${id}`, updatedBlog, {
      headers: { 'x-auth-token': token, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error updating blog:", err.response ? err.response.data : err.message);
    throw err;
  }
};

// Function to delete a blog by ID
export const deleteBlog = async (id, token) => {
  try {
    // Construct the full URL for deleting a specific blog
    await axios.delete(`${BACKEND_BASE_URL}/${id}`, {
      headers: { 'x-auth-token': token }
    });
    // No data is typically returned for a successful delete, just a status code
    console.log(`Blog with ID ${id} deleted successfully.`);
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error deleting blog:", err.response ? err.response.data : err.message);
    throw err;
  }
};
