import axios from "axios";

const BACKEND_BASE_URL = "https://blogging-iota-three.vercel.app";

const getAuthConfig = (token) => ({
  headers: {
    "x-auth-token": token,
  },
});

// Search users by name or username
export const searchUsers = async (token, search, page = 1, limit = 10) => {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/users/search`,
    {
      ...getAuthConfig(token),
      params: { search, page, limit },
    }
  );

  return response.data;
};

// Get a user's public profile
export const getUserProfile = async (token, userId) => {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/users/${userId}/profile`,
    getAuthConfig(token)
  );

  return response.data.user;
};

// Get a user's published blogs
export const getUserPublishedBlogs = async (
  token,
  userId,
  page = 1,
  limit = 9
) => {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/users/${userId}/blogs`,
    {
      ...getAuthConfig(token),
      params: { page, limit },
    }
  );

  return response.data;
};