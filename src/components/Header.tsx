import React from 'react'
import { useHistory } from 'react-router';
import { useUser } from '../hooks/useUser';

export default function Header() {
  const { user } = useUser();
  const history = useHistory();

  const onClick = () => {
    if (user) {
      history.push("/room");
      return;
    }

    history.push("/login");
  }

  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <h1>GNC AI LEARNING SOLUTION</h1>
                <p>
                  AI를 활용한 학습 몰입도 측정 솔루션입니다.
                </p>
                <button className="btn btn-custom btn-lg page-scroll" onClick={onClick}>
                  GETTING STARTED
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
