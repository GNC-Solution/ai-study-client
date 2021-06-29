import React from "react";

export default function About() {
  return (
    <>
      <section id="about" className="about">
        <div className="container">
          <div className="row content">
            <div className="col-lg-6">
              <h2>GNC Solution</h2>
              <h3>AI 학습 몰입도 측정 솔루션</h3>
            </div>
            <div className="col-lg-6 pt-4 pt-lg-0">
              <p>Object Detection을 이용한 객체 인식 프로그램</p>
              <ul>
                <li>
                  <i className="ri-check-double-line"></i> Person Detection
                </li>
                <li>
                  <i className="ri-check-double-line"></i> Cell Phone Detection
                </li>
                <li>
                  <i className="ri-check-double-line"></i> 5초 이상 자리를 비울
                  시 자리비움으로 측정됨.
                </li>
              </ul>
              {/* <p className="fst-italic">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
