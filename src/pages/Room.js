import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import dayjs from "dayjs";
import { useUserStore } from "../hooks/useUserStore";
import { Spinner, Button, Stack } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import NavigationBar from "../components/NavigationBar";
import { useWriteStudyLogMutation } from "../hooks/useWriteStudyLogMutation";

const Video = styled.video`
  border: 1px solid blue;
  width: 600;
  height: 500;
`;

function Room() {
  const [stream, setStream] = useState(null);

  const [model, setModel] = useState();

  const canvasRef = useRef();
  const userVideo = useRef();

  const shouldDetectRef = useRef(false); // 버튼 클릭 시 detect 유무
  const recordingRef = useRef(false); // 기록 flag. start, stop의 if문 실행 여부

  const [timeFlag, setTimeFlag] = useState(false); // 자리비움 or 자리비움 버튼 클릭 시 countDown실행
  const [pauseFlag, setPauseFlag] = useState(false);
  const [pauseImageFlag, setPauseImageFlag] = useState(false);

  const [startToRestartButton, setStartToRestartButton] = useState(true);

  const [writeStudyMutaion, { data }] = useWriteStudyLogMutation();

  const [stopButtonDisabled, setStopButtonDisabled] = useState(true);
  const [leftButtonDisabled, setLeftButtonDisabled] = useState(true);
  const [startButtonDisabled, setStartButtonDisabled] = useState(false);
  const [isVideoReady, setVideoState] = useState(false);

  const [isExist, setExistState] = useState(false);

  useEffect(() => {
    prepare();
  }, []);

  //! page Destroy 되면 실행될 부분
  //! 기록 중일 때 detect Stop, 카메라 Stop
  useEffect(() => {
    return () => {
      if (stream !== null) {
        stream.getTracks().forEach((track) => {
          if (track.readyState === "live" && track.kink === "video") {
            track.stop();
          }
        });
        // window.stream = null
        console.log(recordingRef.current);
        if (recordingRef.current) stopRecording();
      }
    };
  }, [stream]);

  let timeOut;
  const countDown = () => {
    timeOut = setTimeout(() => {
      console.log("countDown");
      pauseRecording();
    }, 5000);
    return timeOut;
  };
  useEffect(() => {
    // console.log("pauseFlag", pauseFlag, "timeFlag", timeFlag);
    if (!timeFlag) return;

    if (!pauseFlag) {
      //! 사람이 카메라에 안보일때, 사람이 몇초간 감지 안될땐 countDown 후 stop
      console.log("카메라에 안보여서 자동 자리 비움");
      recordingRef.current = false;
      if (!isExist) countDown();
    } else {
      //! 자리비움 버튼 클릭했을 땐 바로 stop
      console.log("자리비움 버튼으로 자리 비움");
      // puadeImage(true)
      setPauseImageFlag(true);
      pauseRecording();
    }
    return () => clearTimeout(timeOut);
  }, [timeFlag, pauseFlag]);

  //! 일시 정지할 때 UI 표시하기 위한 Hook. 수정 해야함
  let puadeImage;
  useEffect(() => {
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
      //! cam load
      const getWebCam = async () => {
        const devices = navigator.mediaDevices;
        const videoStream = await devices.getUserMedia({ video: true });

        setStream(videoStream);

        if (userVideo.current) {
          window.stream = videoStream;
          userVideo.current.srcObject = videoStream;
        }
      };

      //! model load
      const setModelFromCocoSsd = async () => {
        const model = await cocoSsd.load();
        setModel(model);
      };
      await Promise.all([getWebCam(), setModelFromCocoSsd()]);
      setVideoState(true);
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
      // pauseRecording();
      return;
    }

    if (!userVideo.current) return;
    const predictions = await model.detect(userVideo.current);

    //! detect box UI
    renderPredictions(predictions);

    //! detect는 coco의 80개의 class가 다 detect.
    //! if로 사람과 핸드폰만 필터
    let foundPerson = false;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].class === "person") {
        foundPerson = true;
      }
    }

    // 첫 if문에서 detect 되면 lastDetectionsRef.length가 증가
    // detect되지 않으면 else if문으로 인해 lastDetectionsRef.length 감소
    // else if문에서 lastDetectionsRef.current가 0이 되면 stopRecroding 호출
    // if (foundPerson || foundCellPhone) {
    console.log(foundPerson);
    if (foundPerson) {
      // console.log("if : ", lastDetectionsRef.current.length);
      exist.current = true;
      resumeRecoding();
    } else {
      // 사람 검출이 안되면 실행.
      foundPerson = false;
      setTimeFlag(true);
      setPauseFlag(false);
      exist.current = false;
    }

    requestAnimationFrame(() => {
      // 대강 애니메이션 반복에 최적화된 함수? => 동영상 detect를 하기 때문에 반복이 필요해서 사용됨
      detectFrame();
    });
  };

  // 사람 detect 하면 startRecoding 계속 실행. 하지만 if문으로 인해 return됨.
  // 즉, 첫 실행일 때만 if문 아래 코드 실행됨.
  const startRecording = () => {
    recordingRef.current = true;
    // writeStudyMutaion({
    //   variables: { action: "start", roomId: "7", userName: user.name },
    // });

    console.log("start recording");
  };

  const exist = useRef(false);
  const resumeRecoding = () => {
    // console.log("ㄹㅇㄴㅁㄹㄴ recording");
    // clearTimeout(countDown());
    if (exist.current) {
      // console.log("???");
      clearTimeout(timeOut);
    }
    if (recordingRef.current) {
      return;
    }

    // writeStudyMutaion({
    //   variables: { action: "resume", roomId: "7", userName: user.name },
    // });

    setTimeFlag(false);
    setPauseFlag(false);
    recordingRef.current = true;
    console.log("resume recording");
  };
  //! StopRecoding
  const [nowArray, setNowArray] = useState([]);
  const copiedNowArray = [...nowArray];

  const stopRecording = () => {
    // writeStudyMutaion({
    //   variables: { action: "stop", roomId: "7", userName: user.name },
    // });

    recordingRef.current = false;
    console.log("stopped recording");

    copiedNowArray.push(dayjs().format("YYYY-MM-DD, HH:mm:ss"));
    setNowArray(copiedNowArray);
  };

  const pauseRecording = () => {
    // if (!recordingRef.current) {
    //   return;
    // }
    // writeStudyMutaion({
    //   variables: { action: "pause", roomId: "7", userName: user.name },
    // });

    recordingRef.current = false;
    console.log("pause recording");

    copiedNowArray.push(dayjs().format("YYYY-MM-DD, HH:mm:ss"));
    setNowArray(copiedNowArray);
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
  return (
    <div>
      <NavigationBar />
      {!isVideoReady ? (
        <Spinner
          color="red.500"
          size="xl"
          emptyColor="gray.200"
          thickness="4px"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : null}
      <div
        style={
          !isVideoReady
            ? {
                height: "0vh",
                width: "0vw",
                visibility: "hidden",
                display: "block",
              }
            : {
                height: "100vh",
                width: "100vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                visibility: "visible",
              }
        }
      >
        {/* {JSON.stringify(data)} */}
        <div
          className="container-fluid"
          style={
            !isVideoReady
              ? {
                  visibility: "hidden",
                }
              : {
                  visibility: "visible",
                }
          }
          // style={
          //   !isVideoReady ? { visibility: "hidden" } : { visibility: "visible" }
          // }
        >
          <div className="row">
            <div className="col">
              {/* <video autoPlay playsInline muted ref={userVideo} /> */}
              <Video playsInline muted ref={userVideo} autoPlay />;
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
                <Stack
                  spacing={4}
                  direction="row"
                  align="center"
                  marginBottom="10px"
                >
                  {startToRestartButton ? (
                    <Button
                      colorScheme="green"
                      size="md"
                      isDisabled={startButtonDisabled}
                      onClick={() => {
                        shouldDetectRef.current = true;
                        setStartButtonDisabled(true);
                        setStopButtonDisabled(false);

                        setLeftButtonDisabled(false);

                        startRecording();
                        detectFrame();
                        setStartToRestartButton(false);
                        // puadeImage(false)
                        setPauseImageFlag(false);
                      }}
                    >
                      학습 시작
                    </Button>
                  ) : (
                    <Button
                      colorScheme="green"
                      size="md"
                      isDisabled={startButtonDisabled}
                      onClick={() => {
                        shouldDetectRef.current = true;
                        setStartButtonDisabled(true);
                        setStopButtonDisabled(false);

                        setLeftButtonDisabled(false);

                        // resumeRecoding();
                        detectFrame();
                        setTimeFlag(false);
                        setPauseFlag(false);
                        // puadeImage(false)
                        setPauseImageFlag(false);
                      }}
                    >
                      학습 재시작
                    </Button>
                  )}
                  <Button
                    colorScheme="red"
                    size="md"
                    isDisabled={stopButtonDisabled}
                    onClick={() => {
                      shouldDetectRef.current = false;
                      setStartButtonDisabled(false);
                      setStopButtonDisabled(true);

                      setLeftButtonDisabled(true);
                      setStartToRestartButton(true);

                      stopRecording();
                      setPauseFlag(false);
                      setTimeFlag(false);
                      // puadeImage(false)
                      setPauseImageFlag(false);
                    }}
                  >
                    학습 종료
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="md"
                    isDisabled={leftButtonDisabled}
                    onClick={() => {
                      shouldDetectRef.current = false;
                      setStartButtonDisabled(false);
                      setLeftButtonDisabled(true);

                      setTimeFlag(true); // true : 일시 정지 버튼 클릭 시 countDown하고 stopRecoding
                      setPauseFlag(true);
                      setPauseImageFlag(true);
                    }}
                  >
                    자리비움
                  </Button>
                </Stack>

                {/* <div className="row p-3"> */}
                {!isVideoReady ? null : (
                  <Table
                    variant="simple"
                    size="md"
                    border="1px"
                    borderColor="red.200"
                    colorScheme="red"
                  >
                    <Thead borderBottom="1px">
                      <Tr>
                        <Th>학습종료(자리비움) 시간</Th>
                      </Tr>
                    </Thead>
                    <Tbody display="block" overflow="auto" height="300px">
                      {nowArray.length === 0 ? (
                        <Tr>
                          <Td>No record yet</Td>
                        </Tr>
                      ) : (
                        nowArray.map((now, index) => {
                          return (
                            <Tr key={index}>
                              <Td>{now}</Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
