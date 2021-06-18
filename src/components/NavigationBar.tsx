/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router";
import { useUserStore } from "../hooks/useUserStore";
import { useCookies } from "react-cookie";
import { USER_KEY } from "../constants";

export default function NavigationBar() {
  const { user } = useUserStore();
  const history = useHistory();
  const [, , removeCookie] = useCookies([USER_KEY]);

  console.log("NavigationBar history", history);

  const path = history.location.pathname;
  console.log("경로?", path);

  const renderContent = () => {
    if (path === "/") {
      return (
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
    }

    if (path === "/studyStatistics") {
      return (
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

    return null;
  };

  const onLogoClick = useCallback(() => {
    if (path === "/") history.push("/");
    if (path === "/studyStatistics" || path === "/room") history.goBack();
  }, [history, path]);

  function handleCookie() {
    removeCookie(USER_KEY);
    history.go(0);
  }

  return (
    <header
      id="header"
      className="fixed-top header-transparent"
      style={path === "/" ? { background: "" } : { background: "#374055E6" }}
    >
      <div className="container d-flex align-items-center justify-content-between">
        <h1 className="logo">
          <a onClick={onLogoClick}>AI Study</a>;
        </h1>
        <nav id="navbar" className="navbar">
          <ul>
            {renderContent()}
            <li>
              <Link to="/test" className="nav-link scrollto">
                Test
              </Link>
            </li>
            <li>
              {!user ? (
                <Link to="/login">Login</Link>
              ) : (
                <a onClick={handleCookie}>Logout</a>
              )}
            </li>
          </ul>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>
      </div>
    </header>
  );
}
