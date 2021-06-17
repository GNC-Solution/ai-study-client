import React from "react";
import { Link } from "react-router-dom";
import { useHistory } from 'react-router';
import { useUser } from "../hooks/useUser";
import { useCookies } from "react-cookie";

export default function NavigationBar() {
  const { user } = useUser();
  const history = useHistory();
  const [cookies, setCookie, removeCookie] = useCookies(['user']);

  function handleCookie() {
    removeCookie('user');
    history.go(0);
  }
  
  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link className="navbar-brand page-scroll" to="/">
            AI Study
          </Link>
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <Link to="/about" className="page-scroll">
                About
              </Link>
            </li>
            <li>
              <Link to="/services" className="page-scroll">
                Services
              </Link>
            </li>
            <li>
              <Link to="/test" className="page-scroll">
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
        </div>
      </div>
    </nav>
  );
}
