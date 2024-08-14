import axios from 'axios';


// Function to handle user signup
export const signupUser = async (userData) => {
  try {
    const response = await axios.post('https://blogging-ten-nu.vercel.app/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Returns the response data, which might include a token
  } catch (error) {
    throw error; // Rethrow the error to handle it in the component
  }
};

export const loginUser = async (userData) => {
    try {
      const response = await axios.post('https://blogging-ten-nu.vercel.app/auth/login', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data; // Returns the response data, which might include a token
    } catch (error) {
      throw error; // Rethrow the error to handle it in the component
    }
  };
