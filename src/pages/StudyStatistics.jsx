import React from "react";
import NavigationBar from "../components/NavigationBar";

export default function StudyStatistics() {
  return (
    <>
      <NavigationBar/>
      <section id="statistics" className="statistics">
        <div className="container">
          <div className="row content">
            <div className="col-lg-6">
              <h2>Eum ipsam laborum deleniti velitena</h2>
              <h3>
                Voluptatem dignissimos provident quasi corporis voluptates sit
                assum perenda sruen jonee trave
              </h3>
            </div>
            <div className="col-lg-6 pt-4 pt-lg-0">
              <p>
                Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
                aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum
              </p>
              <ul>
                <li>
                  <i className="ri-check-double-line"></i> Ullamco laboris nisi
                  ut aliquip ex ea commodo consequa
                </li>
                <li>
                  <i className="ri-check-double-line"></i> Duis aute irure dolor
                  in reprehenderit in voluptate velit
                </li>
                <li>
                  <i className="ri-check-double-line"></i> Ullamco laboris nisi
                  ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                  reprehenderit in
                </li>
              </ul>
              <p className="fst-italic">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
