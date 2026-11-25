
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUserCircle, FaArrowRight } from "react-icons/fa";

import { searchUsers } from "../services/UserApi";
import "./component.css";

const DiscoverUsers = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      setUsers([]);
      setPagination(null);
      setPage(1);
      setError("");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Please log in to discover writers.");
      return;
    }

    let isActive = true;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await searchUsers(token, trimmedSearch, page, 10);

        if (!isActive) return;

        setUsers(data.users || []);
        setPagination(data.pagination || null);
      } catch (err) {
        if (!isActive) return;

        setUsers([]);
        setPagination(null);
        setError(
          err.response?.data?.msg ||
          "Unable to search users. Please try again."
        );
      } finally {
        if (isActive) setLoading(false);
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [search, page, token]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <main className="discover-page">
      <section className="discover-hero">
        <span className="discover-eyebrow">THE WRITING COMMUNITY</span>

        <h1>Discover <span>Writers.</span></h1>

        <p>
          Find interesting people, explore their perspectives,
          and discover stories worth reading.
        </p>

        <div className="discover-search">
          <FaSearch />

          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or username..."
            aria-label="Search writers"
            maxLength={50}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <span className="discover-search-hint">
          Try a name or a username such as @rahul_writes
        </span>
      </section>

      <section className="discover-results">
        {!search.trim() ? (
          <div className="discover-placeholder">
            <FaUserCircle />
            <h2>Find your next favourite writer.</h2>
            <p>Start typing a name or username to explore the community.</p>
          </div>
        ) : loading ? (
          <div className="discover-message">
            Searching for writers...
          </div>
        ) : error ? (
          <div className="discover-message discover-error">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="discover-placeholder">
            <FaSearch />
            <h2>No writers found</h2>
            <p>Try another name or username.</p>
          </div>
        ) : (
          <>
            <div className="discover-results-heading">
              <div>
                <h2>Search results</h2>
                <p>
                  {pagination?.totalUsers || 0} writers found
                </p>
              </div>
            </div>

            <div className="discover-user-grid">
              {users.map((user) => (
                <article className="discover-user-card" key={user._id}>
                  <div className="discover-user-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="discover-user-info">
                    <h3>{user.name}</h3>
                    <span>@{user.username}</span>
                  </div>

                  <Link
                    to={`/users/${user._id}`}
                    className="discover-profile-link"
                    aria-label={`View ${user.name}'s profile`}
                  >
                    <FaArrowRight />
                  </Link>
                </article>
              ))}
            </div>

            {pagination?.totalPages > 1 && (
              <div className="discover-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default DiscoverUsers;
