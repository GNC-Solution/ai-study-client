import React from "react";
import { useHistory } from "react-router";
import { useUser } from "../../hooks/useUser";

export default function Header() {
  const { user } = useUser();
  const history = useHistory();

  const onClick = () => {
    if (user) {
      history.push("/room");
      return;
    }

    history.push("/login");
  };

  return (
    <section
      id="hero"
      className="d-flex align-items-center justify-content-center"
    >
      <div className="container position-relative">
        <h1>GNC AI LEARNING SOLUTION</h1>
        <h2>AI를 활용한 학습 몰입도 측정 솔루션입니다.</h2>
        <button className="btn-get-started scrollto" onClick={onClick}>
          GETTING STARTED
        </button>
      </div>
    </section>
    
  );
}
