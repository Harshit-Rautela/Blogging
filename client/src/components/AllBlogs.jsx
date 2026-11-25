
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserBlogs } from "../services/BlogsApi";
import BackButton from "./Buttons/BackButton";
import "./component.css";

const PAGE_LIMIT = 9;

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageLimit: PAGE_LIMIT,
    totalBlogs: 0,
    totalPages: 1,
  });

  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const fetchBlogs = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const result = await getUserBlogs(token, {
          page,
          limit: PAGE_LIMIT,
          search: search.trim(),
          category: category.trim(),
          tag: tag.trim(),
          sortBy,
        });

        if (!isActive) return;

        setBlogs(result.blogs);
        setPagination(result.pagination);
      } catch (err) {
        if (!isActive) return;

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.msg ||
          "We couldn't load your stories. Please try again."
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    // Small delay prevents an API request on every keystroke.
    const timer = setTimeout(fetchBlogs, 350);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [navigate, page, search, category, tag, retryKey, sortBy]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleTagChange = (value) => {
    setTag(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setTag("");
    setPage(1);
  };
  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };
  const hasActiveFilters =
    search.trim() || category.trim() || tag.trim();

  const handleRetry = () => {
    setPage((currentPage) => currentPage);
    setError("");
    // Changing a filter or page will trigger a new request.
    // This key forces a retry without changing the visible filters.
    setRetryKey((key) => key + 1);
  };



  const goToPage = (nextPage) => {
    if (
      nextPage >= 1 &&
      nextPage <= pagination.totalPages &&
      nextPage !== page
    ) {
      setPage(nextPage);
    }
  };

  return (
    <div className="all-blogs-page">
      <div className="blogs-bg-glow blogs-glow-one"></div>
      <div className="blogs-bg-glow blogs-glow-two"></div>

      <div className="all-blogs-container">
        <header className="all-blogs-header">
          <div className="blogs-heading-content">
            <span className="blogs-eyebrow">
              YOUR CREATIVE COLLECTION
            </span>

            <h1>
              Explore Your <span>Stories.</span>
            </h1>

            <p>
              Every story has a place. Revisit your ideas,
              discover your writing, and keep creating something
              meaningful.
            </p>
          </div>

          <BackButton />
        </header>

        <section className="blogs-collection-section">
          <div className="blogs-section-heading">
            <div>
              <h2>Your Collection</h2>
              <p>
                {pagination.totalBlogs}{" "}
                {pagination.totalBlogs === 1 ? "story" : "stories"}{" "}
                published
              </p>
            </div>

            <button
              className="blogs-create-button"
              onClick={() => navigate("/create")}
            >
              <span>+</span> Create Story
            </button>
          </div>

          {/* Search and filters */}
          <div className="blogs-filter-panel">
            <div className="blogs-search-wrapper">
              <span className="blogs-search-icon">⌕</span>
              <input
                type="search"
                placeholder="Search your stories..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search blogs by title or content"
              />
            </div>

            <div className="blogs-filter-fields">
              <input
                type="text"
                placeholder="Filter by category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                aria-label="Filter by category"
              />

              <input
                type="text"
                placeholder="Filter by tag"
                value={tag}
                onChange={(e) => handleTagChange(e.target.value)}
                aria-label="Filter by tag"
              />

              {hasActiveFilters && (
                <button
                  className="blogs-clear-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="blogs-sort-wrapper">
              <label htmlFor="blogs-sort">Sort stories by</label>

              <select
                id="blogs-sort"
                className="blogs-sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title_asc">Title: A–Z</option>
                <option value="title_desc">Title: Z–A</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="blogs-loading">
              <div className="blogs-spinner"></div>
              <p>Gathering your stories...</p>
            </div>
          ) : error ? (
            <div className="blogs-empty-state">
              <div className="empty-state-icon">!</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button
                className="blogs-empty-button"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          ) : blogs.length > 0 ? (
            <>
              <div className="blogs-results-info">
                <p>
                  Showing {blogs.length} of {pagination.totalBlogs}{" "}
                  {pagination.totalBlogs === 1 ? "story" : "stories"}
                </p>

                {hasActiveFilters && (
                  <span className="blogs-filter-active">
                    Filters applied
                  </span>
                )}
              </div>

              <div className="blogs-grid">
                {blogs.map((blog, index) => (
                  <article
                    className="blog-card"
                    key={blog._id}
                    style={{ "--card-index": index }}
                  >
                    <div className="blog-card-top">
                      <span className="blog-card-number">
                        STORY{" "}
                        {String(
                          (page - 1) * PAGE_LIMIT + index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div className="blog-card-icon">✦</div>
                    </div>

                    <div className="blog-card-content">
                      <h3>{blog.title}</h3>
                      <p>
                        {String(blog.content || "").slice(0, 150)}
                        {String(blog.content || "").length > 150
                          ? "..."
                          : ""}
                      </p>
                    </div>

                    <div className="blog-card-divider"></div>

                    <div className="blog-card-actions">
                      <button
                        className="blog-read-button"
                        onClick={() =>
                          navigate(`/user/${blog._id}`)
                        }
                      >
                        Read Story <span>→</span>
                      </button>

                      <div className="blog-secondary-actions">
                        <button
                          className="blog-edit-button"
                          onClick={() =>
                            navigate(`/user/update/${blog._id}`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="blog-delete-button"
                          onClick={() =>
                            navigate(`/user/delete/${blog._id}`)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="blogs-pagination">
                  <button
                    className="blogs-page-button"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    ← Previous
                  </button>

                  <div className="blogs-page-indicator">
                    <span>Page</span>
                    <strong>{page}</strong>
                    <span>of {pagination.totalPages}</span>
                  </div>

                  <button
                    className="blogs-page-button"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="blogs-empty-state">
              <div className="empty-state-icon">
                {hasActiveFilters ? "⌕" : "✦"}
              </div>

              <h3>
                {hasActiveFilters
                  ? "No stories found."
                  : "Your story starts here."}
              </h3>

              <p>
                {hasActiveFilters
                  ? "We couldn't find any stories matching your search or filters. Try changing them."
                  : "You haven't published any stories yet. Start writing and let your ideas take shape."}
              </p>

              {hasActiveFilters ? (
                <button
                  className="blogs-empty-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  className="blogs-empty-button"
                  onClick={() => navigate("/create")}
                >
                  Create Your First Story
                </button>
              )}
            </div>
          )}
        </section>

        <footer className="all-blogs-footer">
          <span>MY BLOG</span>
          <p>Read. Write. Inspire.</p>
        </footer>
      </div>
    </div>
  );
};

export default AllBlogs;
