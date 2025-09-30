import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Tg from '../components/toggle';
import AIDashboard from '../components/AIDashboard';
import AIChatAssistant from '../components/AIChatAssistant';

function AIDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div id="page-top">
      <div id="wrapper">
        {/* Sidebar */}
        <ul
          className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
          id="accordionSidebar"
        >
          {/* Sidebar - Brand */}
          <a
            className="sidebar-brand d-flex align-items-center justify-content-center"
            href="/"
          >
            <div className="sidebar-brand-icon rotate-n-15">
              <i className="fas fa-robot" />
            </div>
            <div className="sidebar-brand-text mx-3">AI Treasury DAO</div>
          </a>
          {/* Divider */}
          <hr className="sidebar-divider my-0" />
          {/* Nav Item - Dashboard */}
          <li className="nav-item active">
            <Link className="nav-link" to="/">
              <i className="fas fa-fw fa-tachometer-alt" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/joinclub">
              <i className="fas fa-fw fa-file-image-o" />
              <span>Available clubs</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/createclub">
              <i className="fas fa-fw fa-file-image-o" />
              <span>Create club</span>
            </Link>
          </li>
          <li className="nav-item active">
            <Link className="nav-link" to="/ai-dashboard">
              <i className="fas fa-fw fa-robot" />
              <span>AI Dashboard</span>
            </Link>
          </li>
          {/* Divider */}
          <hr className="sidebar-divider d-none d-md-block" />
          {/* Sidebar Toggler (Sidebar) */}
          <div className="text-center d-none d-md-inline">
            <button onClick={Tg} className="rounded-circle border-0" id="sidebarToggle" />
          </div>
        </ul>
        {/* End of Sidebar */}
        
        {/* Content Wrapper */}
        <div id="content-wrapper" className="d-flex flex-column">
          {/* Main Content */}
          <div id="content">
            {/* Topbar */}
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 shadow">
              <div className="text-lg mx-3 no-underline">
                <Link className="flex items-center justify-center alchemy-link" to="/">
                  <div className="mmh text-lg mx-3">🤖 AI-Powered Treasury DAO</div>
                </Link>
              </div>
            </nav>
            {/* End of Topbar */}
            
            {/* Begin Page Content */}
            <div className="container-fluid">
              {/* Page Heading */}
              <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">
                  AI-Powered Treasury DAO Dashboard
                </h1>
              </div>

              {/* AI Features Tabs */}
              <div className="row mb-4">
                <div className="col-12">
                  <ul className="nav nav-tabs" id="aiTabs" role="tablist">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                      >
                        <i className="fas fa-chart-line mr-2"></i>
                        Market Overview
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                      >
                        <i className="fas fa-comments mr-2"></i>
                        AI Assistant
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tab Content */}
              <div className="tab-content" id="aiTabContent">
                {/* Market Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="tab-pane fade show active">
                    <AIDashboard />
                  </div>
                )}


                {/* AI Chat Assistant Tab */}
                {activeTab === 'chat' && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-md-8">
                        <AIChatAssistant />
                      </div>
                      <div className="col-md-4">
                        <div className="card shadow">
                          <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                              AI Features
                            </h6>
                          </div>
                          <div className="card-body">
                            <h6>Available AI Services:</h6>
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <i className="fas fa-check text-success mr-2"></i>
                                Market Analysis
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check text-success mr-2"></i>
                                AI Chat Assistant
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check text-success mr-2"></i>
                                Predictive Analytics
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check text-success mr-2"></i>
                                Real-time Insights
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* /.container-fluid */}
          </div>
          {/* End of Main Content */}
        </div>
        {/* End of Content Wrapper */}
      </div>
      {/* End of Page Wrapper */}
    </div>
  );
}

export default AIDashboardPage;
