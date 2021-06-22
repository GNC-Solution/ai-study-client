import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import dayjs from "dayjs";
import { Spinner } from "@chakra-ui/react";
import NavigationBar from "../components/NavigationBar";
import { useWriteStudyLogMutation } from "../hooks/useWriteStudyLogMutation";

const Video = styled.video`
  border: 1px solid blue;
  width: 600;
  height: 500;
`;

function Room() {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState(null);

  const [model, setModel] = useState();
  const [isLoading, setLoading] = useState(false);

  const canvasRef = useRef();
  const userVideo = useRef();

  const startButtonElement = useRef(null);
  const stopButtonElement = useRef(null);
  const leftSeatButtonElement = useRef(null);

  const shouldDetectRef = useRef(false); // 버튼 클릭 시 detect 유무
  const recordingRef = useRef(false); // 기록 flag. start, stop의 if문 실행 여부
  const lastDetectionsRef = useRef([]);

  const [timeFlag, setTimeFlag] = useState(false); // 자리비움 or 자리비움 버튼 클릭 시 countDown실행
  const [pauseFlag, setPauseFlag] = useState(false);
  const [pauseImageFlag, setPauseImageFlag] = useState(false);

  const [firstStart, setFirstStart] = useState(true);

  const [writeStudyMutaion, { data }] = useWriteStudyLogMutation();
  useEffect(() => {
    prepare();
    detectFrame();
  }, []);

  //! page Destroy 되면 실행될 부분
  //! 기록 중일 때 detect Stop, 카메라 Stop
  useEffect(() => {
    return () => {
      console.log("화면 꺼짐");
      // console.log(stream.getTracks());
      console.log(stream);
      setLoading(false);
      if (stream !== null) {
        stream.getTracks().forEach((track) => {
          if (track.readyState === "live" && track.kink === "video") {
            track.stop();
          }
        });
        // window.stream = null
        console.log("화면 권한을 꺼야하나??");
        stopRecording();
      }
    };
  }, [stream]);

  useEffect(() => {
    const countDown = () => {
      setTimeout(() => {
        console.log("countDown");
        pauseRecording();
      }, 5000);
    };

    console.log("pauseFlag", pauseFlag, "timeFlag", timeFlag);
    if (!timeFlag) return;

    if (!pauseFlag) {
      //! 사람이 카메라에 안보일때, 사람이 몇초간 감지 안될땐 countDown 후 stop
      console.log("자동 자리 비움");
      countDown();
      // return () => clearTimeout(countDown);
    } else {
      //! 자리비움 버튼 클릭했을 땐 바로 stop
      console.log("자리비움");
      // puadeImage(true)
      setPauseImageFlag(true);
      pauseRecording();
    }
    return () => clearTimeout(countDown);
  }, [timeFlag, pauseFlag]);

  //! 일시 정지할 때 UI 표시하기 위한 Hook. 수정 해야함
  let puadeImage;
  useEffect(() => {
    console.log("pauseImageFlag", pauseImageFlag);

    let ctx;
    if (pauseImageFlag) {
      ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = "#FF0000";
      ctx.font = "48px serif";
      ctx.fillText("자리비움", 250, 200, 200, 100);
    }
  }, [pauseImageFlag]);

  //! page 로딩 시 첫 실행될 부분
  const prepare = async () => {
    try {
      await startButtonElement.current.setAttribute("disabled", true);
      await stopButtonElement.current.setAttribute("disabled", true);
      await leftSeatButtonElement.current.setAttribute("disabled", true);

      //! cam load
      const getWebCam = async () => {
        await navigator.mediaDevices
          // .getUserMedia({ video: true, audio: false })
          .getUserMedia({ video: true })
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
      await startButtonElement.current.removeAttribute("disabled");
    } catch (error) {
      console.error(error);
    }
  };

  // requestAnimationFrame으로 지속적으로 detectFrame을 반복함.
  // shouldDetectRef로 detect 제어
  const detectFrame = async () => {
    // "shouldRecrodRef = true" : start 버튼 클릭 시
    // "shouldRecrodRef = false" : stop 버튼 클릭 시
    if (!shouldDetectRef.current) {
      pauseRecording();
      return;
    }

    if (!userVideo.current) return;
    const predictions = await model.detect(userVideo.current);

    //! detect box UI
    renderPredictions(predictions);

    //! detect는 coco의 80개의 class가 다 detect.
    //! if로 사람과 핸드폰만 필터
    let foundPerson = false;
    let foundCellPhone = false;
    for (let i = 0; i < predictions.length; i++) {
      if (
        predictions[i].class === "person" ||
        predictions[i].class === "cell phone"
      ) {
        foundPerson = true;
        foundCellPhone = true;
      }
    }

    // 첫 if문에서 detect 되면 lastDetectionsRef.length가 증가
    // detect되지 않으면 else if문으로 인해 lastDetectionsRef.length 감소
    // else if문에서 lastDetectionsRef.current가 0이 되면 stopRecroding 호출
    if (foundPerson) {
      console.log("if : ", lastDetectionsRef.current.length);
      resumeRecoding();
      lastDetectionsRef.current.push(true); // 배열로 ref가 정의되었기 때문에 push 사용
      // lastDetectionsRef.current = true; // error
    } else if (lastDetectionsRef.current.filter(Boolean).length) {
      // true인 것들의 배열 길이,
      console.log("else if : ", lastDetectionsRef.current.length);
      resumeRecoding();
      lastDetectionsRef.current.push(false);
    } else {
      // 사람 검출이 안되면 실행.
      console.log("else : ", lastDetectionsRef.current.length);
      setTimeFlag(true); //
      setPauseFlag(false);
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

  // 사람 detect 하면 startRecoding 계속 실행. 하지만 if문으로 인해 return됨.
  // 즉, 첫 실행일 때만 if문 아래 코드 실행됨.
  const startRecording = () => {
    recordingRef.current = true;
    // writeStudyMutaion({ variables: { action: "start", roomId: "8" } });
    // mutation.mutate({username: "studyuser", roomno: "testRoom1", existflag: "Y"});
    console.log("start recording");
  };

  const resumeRecoding = () => {
    if (recordingRef.current) {
      return;
    }

    setTimeFlag(false);

    // writeStudyMutaion({ variables: { action: "resume", roomId: "8" } });
    // mutation.mutate({username: "studyuser", roomno: "testRoom1", existflag: "Y"});
    recordingRef.current = true;
    console.log("resume recording");
  };
  //! StopRecoding
  const [nowArray, setNowArray] = useState([]);
  const stopRecording = () => {
    console.log("끝?");
    // if (!recordingRef.current) {
    //   return;
    // }

    // mutation.mutate({username: "studyuser", roomno: "testRoom1", existflag: "N"});

    recordingRef.current = false;
    console.log("stopped recording");

    lastDetectionsRef.current = [];

    const copiedNowArray = [...nowArray];
    copiedNowArray.push(dayjs().format("YYYY-MM-DD, HH:mm:ss"));
    setNowArray(copiedNowArray);

    // console.log("nowArray : ", nowArray);
  };

  const pauseRecording = () => {
    if (!recordingRef.current) {
      return;
    }

    // mutation.mutate({username: "studyuser", roomno: "testRoom1", existflag: "N"});

    recordingRef.current = false;
    console.log("pause recording");

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
      if (prediction.class === "person" || prediction.class === "cell phone") {
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

  return (
    <div>
      <NavigationBar />
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* {JSON.stringify(data)} */}
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              {/* <video autoPlay playsInline muted ref={userVideo} /> */}
              {UserVideo}
              <canvas
                className="size"
                ref={canvasRef}
                width="500"
                height="400"
                style={{
                  position: "absolute",
                  top: 120,
                  left: 0,
                }}
              />
              {pauseImageFlag ? (
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
            <div className="col">
              <div>
                <div className="btn-toolbar" role="toolbar">
                  <div className="btn-group mr-2" role="group">
                    {firstStart ? (
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          shouldDetectRef.current = true;
                          stopButtonElement.current.removeAttribute("disabled");
                          leftSeatButtonElement.current.removeAttribute(
                            "disabled"
                          );
                          startButtonElement.current.setAttribute(
                            "disabled",
                            true
                          );
                          startRecording();
                          detectFrame();
                          setFirstStart(false);
                          // puadeImage(false)
                          setPauseImageFlag(false);
                        }}
                        ref={startButtonElement}
                      >
                        학습시작
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          shouldDetectRef.current = true;
                          stopButtonElement.current.removeAttribute("disabled");
                          leftSeatButtonElement.current.removeAttribute(
                            "disabled"
                          );
                          startButtonElement.current.setAttribute(
                            "disabled",
                            true
                          );
                          // resumeRecoding();
                          detectFrame();
                          // puadeImage(false)
                          setPauseImageFlag(false);
                        }}
                        ref={startButtonElement}
                      >
                        학습재시작
                      </button>
                    )}
                  </div>
                  <div className="btn-group mr-2" role="group">
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        shouldDetectRef.current = false;
                        startButtonElement.current.removeAttribute("disabled");
                        stopButtonElement.current.setAttribute(
                          "disabled",
                          true
                        );
                        leftSeatButtonElement.current.setAttribute(
                          "disabled",
                          true
                        );
                        stopRecording();
                        setPauseFlag(false);
                        setTimeFlag(false);
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
                        shouldDetectRef.current = false;
                        startButtonElement.current.removeAttribute("disabled");
                        stopButtonElement.current.removeAttribute("disabled");
                        leftSeatButtonElement.current.setAttribute(
                          "disabled",
                          true
                        );
                        setTimeFlag(true); // true : 일시 정지 버튼 클릭 시 countDown하고 stopRecoding
                        setPauseFlag(true);
                        setPauseImageFlag(true);
                      }}
                      ref={leftSeatButtonElement}
                    >
                      자리비움
                    </button>
                  </div>
                </div>

                <div className="row p-3">
                  <table className="table table-bordered">
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
                        nowArray.map((now, index) => {
                          return (
                            <tr key={index}>
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
        </div>
      </div>
    </div>
  );
}

export default Room;
