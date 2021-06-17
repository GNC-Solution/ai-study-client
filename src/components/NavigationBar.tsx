import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useHistory } from "react-router";
import room from "../pages/Room";
export default function NavigationBar() {
  const { user } = useUser();
  const history = useHistory();

  console.log("NavigationBar history", history);

  const path = history.location.pathname;
  console.log("경로?", path);

  let navigationBarContent;
  if (path === "/") {
    navigationBarContent = (
      <>
        <li>
          <a className="nav-link scrollto active" href="#hero">
            Home
          </a>
        </li>
        <li>
          <a className="nav-link scrollto" href="#about">
            About
          </a>
        </li>
        <li>
          <a className="nav-link scrollto" href="/studyStatistics">
            Statistics
          </a>
        </li>
      </>
    );

    // window.location.reload()
  } else if (path === "/studyStatistics") {
    navigationBarContent = (
      <>
        <li>
          <a className="nav-link scrollto" onClick={history.goBack}>
            Home
          </a>
        </li>
        <li>
          <a className="nav-link scrollto active" href="/studyStatistics">
            Statistics
          </a>
        </li>
      </>
    );
  }


  let logopath = null;
  if (path === "/") {
    logopath = <a onClick={() => window.location.replace("/")}>AI Study</a>;
  } else if (path === "/studyStatistics" || path === "/room") {
    logopath = <a onClick={history.goBack}>AI Study</a>;
  }

  return (
    <header
      id="header"
      className="fixed-top header-transparent"
      style={
        path === "/"
          ? {
              background: "",
            }
          : {
              background: "#374055E6",
            }
      }
    >
      <div className="container d-flex align-items-center justify-content-between">
        <h1 className="logo">{logopath}</h1>
        <nav id="navbar" className="navbar">
          <ul>
            {navigationBarContent}

            <li>
              <Link to="/test" className="nav-link scrollto">
                Test
              </Link>
            </li>
            <li>
              {!user ? (
                <Link to="/login">Login</Link>
              ) : (
                <Link to="/logout">Logout</Link>
              )}
            </li>
          </ul>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>
      </div>
    </header>
  );
}
