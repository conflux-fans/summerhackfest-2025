import React from "react";

import { App } from "./App";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ReactDOM from "react-dom";
ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={ <App /> }>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer/>
    </React.StrictMode>,
    document.getElementById('root')
  );
  