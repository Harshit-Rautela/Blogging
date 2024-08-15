import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./components/Home";
import Create from "./components/Create";
import AllBlogs from "./components/AllBlogs";
import Login from "./components/LogIn";
import SignUp from "./components/Signup";
import Navbar from "./components/Navbar";
import MainPage from "./components/MainPage";
import GettingStarted from "./components/Header/GettingStarted";
//import UpdateBlog from "./components/UpdateBlog";
//import { Blog } from "../../server/models/Model";
import DetailedBlog from "./components/DetailedBlog";
import UpdateBlog from "./components/UpdateBlog";
import DeleteBlog from "./components/DeleteBlog";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/create" element={<Create />} />
          <Route path="/all-blogs" element={<AllBlogs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/home" element={<Home/>} />
          <Route path="/user/:id" element={<DetailedBlog/>} />
          <Route path="/user/update/:id" element={<UpdateBlog/>} />
          <Route path="/user/delete/:id" element={<DeleteBlog/>} />
          <Route path="/get-started" element={<GettingStarted/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
