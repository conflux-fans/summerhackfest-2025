import React from "react";
import { Outlet } from "react-router-dom";
import Base from "./base";
import { ToastContainer } from 'react-toastify';
import Nav from "./nav";




const Layout = () => {
  return (
    <div className="">
      <Nav/>
      <ToastContainer/>
      <Outlet />
    </div>
  );
};

export default Layout;