import axios from 'axios'
const BACKEND_BASE_URL = 'https://blogging-backend-seven.vercel.app';

// Function to handle user signup
export const signupUser = async (userData) => {
  try {
    
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Returns the response data, which might include a token and user info
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Signup API error:', error.response ? error.response.data : error.message);
    throw error; // Rethrow the error to handle it in the component (e.g., display error message to user)
  }
};

// Function to handle user login
export const loginUser = async (userData) => {
  try {
    
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/login`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Returns the response data, which might include a token
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Login API error:', error.response ? error.response.data : error.message);
    throw error; // Rethrow the error to handle it in the component
  }
};