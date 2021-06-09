import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
// import * as cocoSsd from "@tensorflow-models/body-pix@2.0";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import dayjs from "dayjs";

const Video = styled.video`
  border: 1px solid blue;
  width: 600;
  height: 500;
`;

function WebRtcPage2() {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [model, setModel] = useState();
  // const [isLoading, setLoading] = useState(true);

  const canvasRef = useRef();
  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();

  const startButtonElement = useRef(null);
  const stopButtonElement = useRef(null);
  const leftSeatButtonElement = useRef(null);

  const shouldRecordRef = useRef(false);
  const recordingRef = useRef(false);
  const lastDetectionsRef = useRef([]);

  const [timeFlag, setTimeFlag] = useState(false);
  const [pauseFlag, setPauseFlag] = useState(false);
  const [pauseImageFlag, setPauseImageFlag] = useState(false);
  useEffect(() => {
    prepare();
    detectFrame();
  }, []);

  useEffect(() => {
    const countDown = () => {
      setTimeout(() => {
        console.log("countDown");
        stopRecording();
      }, 5000);
    };

    console.log("pauseFlag", pauseFlag, "timeFlag",timeFlag);
    if (!timeFlag) return;
    if (!pauseFlag) { // 사람이 몇오간 감지 안될땐 countDown 후 stop
      countDown();
      // return () => clearTimeout(countDown);
    } else { // 자리비움 버튼 클릭했을 땐 바로 stop
      console.log("자리비움");
      // puadeImage(true)
      setPauseImageFlag(true);
      stopRecording();
    }
    return () => clearTimeout(countDown);
  }, [timeFlag, pauseFlag]);

  let puadeImage;
  useEffect(() => {
    console.log("pauseImageFlag", pauseImageFlag);
    const ctx = canvasRef.current.getContext("2d");
    if (pauseImageFlag) {
      console.log("이미지")
      ctx.fillStyle = "#FF0000";
      ctx.font = "48px serif";
      ctx.fillText("자리비움", 250, 200, 200, 100);
    } else {
      console.log("????")
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }, [pauseImageFlag]);


  const prepare = async () => {
    try {
      await startButtonElement.current.setAttribute("disabled", true);
      await stopButtonElement.current.setAttribute("disabled", true);
      await leftSeatButtonElement.current.setAttribute("disabled", true);

      //! cam load
      const getWebCam = async () => {
        await navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            setStream(stream);
            if (userVideo.current) {
              window.stream = stream;
              userVideo.current.srcObject = stream;
            }
          });
      };

      //! model load
      const setModelFromCocoSsd = async () => {
        const model = await cocoSsd.load();
        setModel(model);
      };

      getWebCam();
      setModelFromCocoSsd();
    } catch (error) {
      console.error(error);
    } finally {
      await startButtonElement.current.removeAttribute("disabled");
      // setLoading(false);
    }
  };

  // requestAnimationFrame으로 지속적으로 detectFrame을 반복함.
  // shouldRecordRef로 detect 제어
  const detectFrame = async () => {
    // "shouldRecrodRef = true" : start 버튼 클릭 시
    // "shouldRecrodRef = false" : stop 버튼 클릭 시
    if (!shouldRecordRef.current) {
      stopRecording();
      return;
    }

    const predictions = await model.detect(userVideo.current);

    renderPredictions(predictions); // detect box UI

    // detect는 coco의 80개의 class가 다 detect
    // if로 사람만 필터
    let foundPerson = false;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].class === "person") {
        foundPerson = true;
      }
    }

    // 첫 if문에서 detect 되면 lastDetectionsRef.length가 증가
    // detect되지 않으면 else if문으로 인해 감소
    // else if문에서 lastDetectionsRef.current가 0이 되면 stopRecroding 호출
    if (foundPerson) {
      startRecording();
      lastDetectionsRef.current.push(true); // 배열로 ref가 정의되었기 때문에 push 사용
      // lastDetectionsRef.current = true; // error
    } else if (lastDetectionsRef.current.filter(Boolean).length) {
      // true인 것들의 배열 길이,
      startRecording();
      lastDetectionsRef.current.push(false);
    } else {
      setTimeFlag(true);
      setPauseFlag(false)
      // stopRecording();
    }

    // 이거 때문에 lastDetectionsRef가 10까지만 올라감.
    lastDetectionsRef.current = lastDetectionsRef.current.slice(
      Math.max(lastDetectionsRef.current.length - 10, 0)
    );

    requestAnimationFrame(() => {
      // 대강 애니메이션 반복에 최적화된 함수? => 동영상 detect를 하기 때문에 반복이 필요해서 사용됨
      detectFrame();
    });
  };

  //! StartRecording
  const startRecording = () => {
    if (recordingRef.current) {
      return;
    }

    setTimeFlag(false);

    // mutation.mutate({username: "studyuser", roomno: "testRoom1", existflag: "Y"});
    recordingRef.current = true;
    console.log("start recording");
  };

  //! StopRecoding
  const [nowArray, setNowArray] = useState([]);
  const stopRecording = () => {
    if (!recordingRef.current) {
      return;
    }

    // mutation.mutate({username: "studyuser", roomno: "testRoom1", existflag: "N"});

    recordingRef.current = false;
    console.log("stopped recording");
    lastDetectionsRef.current = [];

    const copiedNowArray = [...nowArray];
    copiedNowArray.push(dayjs().format("YYYY-MM-DD, HH:mm:ss"));
    setNowArray(copiedNowArray);

    // console.log("nowArray : ", nowArray);
  };

  //! detect box UI function
  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach((prediction) => {
      if (prediction.class === "person") {
        // console.log(prediction);
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      }
    });

    predictions.forEach((prediction) => {
      if (prediction.class === "person") {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      }
    });
  };

  let UserVideo;
  if (stream) {
    UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = <Video playsInline ref={partnerVideo} autoPlay />;
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div>
        <h1>{caller} is calling you</h1>
        {/* <button onClick={acceptCall}>Accept</button> */}
      </div>
    );
  }

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="container-fluid">
      <div class="row">
        <div class="col">
          {/* <video autoPlay playsInline muted ref={userVideo} /> */}
          {UserVideo}
          <canvas
            className="size"
            ref={canvasRef}
            width="600"
            height="500"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          {pauseImageFlag  ? (
            <canvas
              width="600"
              height="500"
              ref={puadeImage}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          ) : null}
        </div>
        <div class="col">
          <div>
            <div class="btn-toolbar" role="toolbar">
              <div className="btn-group mr-2" role="group">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    shouldRecordRef.current = true;
                    stopButtonElement.current.removeAttribute("disabled");
                    leftSeatButtonElement.current.removeAttribute("disabled");
                    startButtonElement.current.setAttribute("disabled", true);
                    detectFrame();
                    // puadeImage(false)
                    setPauseImageFlag(false);
                  }}
                  ref={startButtonElement}
                >
                  학습시작
                </button>
              </div>
              <div className="btn-group mr-2" role="group">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    shouldRecordRef.current = false;
                    startButtonElement.current.removeAttribute("disabled");
                    stopButtonElement.current.setAttribute("disabled", true);
                    leftSeatButtonElement.current.setAttribute(
                      "disabled",
                      true
                    );
                    stopRecording();
                    setPauseFlag(false);
                    // puadeImage(false)
                    setPauseImageFlag(false);
                  }}
                  ref={stopButtonElement}
                >
                  학습종료
                </button>
              </div>
              <div className="btn-group mr-2" role="group">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    shouldRecordRef.current = false;
                    startButtonElement.current.removeAttribute("disabled");
                    stopButtonElement.current.removeAttribute("disabled");
                    leftSeatButtonElement.current.setAttribute(
                      "disabled",
                      true
                    );
                    setTimeFlag(true);
                    setPauseFlag(true);
                    setPauseImageFlag(true);
                  }}
                  ref={leftSeatButtonElement}
                >
                  자리비움
                </button>
              </div>

              <div className="btn-group mr-2" role="group">
                <button className="btn btn-danger">Call </button>
              </div>
            </div>

            <div className="row p-3">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Records Time</th>
                  </tr>
                </thead>
                <tbody>
                  {nowArray.length === 0 ? (
                    <tr>
                      <td>No record yet</td>
                    </tr>
                  ) : (
                    nowArray.map((now) => {
                      return (
                        <tr>
                          <td>{now}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="row">{PartnerVideo}</div>
    </div>
  );
}

export default WebRtcPage2;
