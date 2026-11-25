
import axios from "axios";

const BACKEND_BASE_URL = "https://blogging-iota-three.vercel.app";

// Create a blog
export const createBlog = async (blogData, token) => {
  try {
    const response = await axios.post(
      BACKEND_BASE_URL,
      blogData,
      {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get the logged-in user's blogs with search, filters and pagination

export const getUserBlogs = async (token, filters = {}) => {
  const response = await axios.get(`${BACKEND_BASE_URL}/user`, {
    headers: {
      "x-auth-token": token,
    },
    params: {
      page: filters.page || 1,
      limit: filters.limit || 9,
      search: filters.search || "",
      category: filters.category || "",
      tag: filters.tag || "",
      sortBy: filters.sortBy || "newest",
    },
  });

  const blogs = Array.isArray(response.data) ? response.data : [];

  const currentPage =
    Number(response.headers["x-current-page"]) || 1;

  const pageLimit =
    Number(response.headers["x-page-limit"]) || 9;

  const headerTotal = Number(response.headers["x-total-blogs"]);

  const totalBlogs =
    Number.isFinite(headerTotal) && headerTotal > 0
      ? headerTotal
      : blogs.length;

  const headerPages = Number(response.headers["x-total-pages"]);

  const totalPages =
    Number.isFinite(headerPages) && headerPages > 0
      ? headerPages
      : Math.max(1, Math.ceil(totalBlogs / pageLimit));

  return {
    blogs,
    pagination: {
      currentPage,
      pageLimit,
      totalBlogs,
      totalPages,
    },
  };
};


// Get a blog by ID
export const getBlogById = async (id, token) => {
  try {
    const response = await axios.get(`${BACKEND_BASE_URL}/${id}`, {
      headers: {
        "x-auth-token": token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a blog
export const updateBlog = async (id, updatedBlog, token) => {
  try {
    const response = await axios.put(
      `${BACKEND_BASE_URL}/${id}`,
      updatedBlog,
      {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a blog
export const deleteBlog = async (id, token) => {
  try {
    await axios.delete(`${BACKEND_BASE_URL}/${id}`, {
      headers: {
        "x-auth-token": token,
      },
    });
  } catch (error) {
    throw error;
  }
};
