import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import dayjs from "dayjs";
import { useUserStore } from "../hooks/useUserStore";
import { Spinner, Button, Stack, Box } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import NavigationBar from "../components/NavigationBar";
import { useWriteStudyLogMutation } from "../hooks/useWriteStudyLogMutation";
import { usePhoneLogMutation } from "../hooks/usePhoneLogMutation";

const Video = styled.video`
  border: 1px solid blue;
  width: 100%;
  height: 450;
`;

function Room() {
  const { user } = useUserStore(); //* mutation에 필요한 user.name
  const [stream, setStream] = useState(null); //* vedio stream

  const [model, setModel] = useState();

  const canvasRef = useRef();
  const userVideo = useRef();

  const shouldDetectRef = useRef(false); //* 버튼 클릭 시 detect 유무
  const recordingRef = useRef(false); //* 기록 flag. true: 기록 중, false: 기록 중지

  const [timeFlag, setTimeFlag] = useState(false); //* 자리비움 or 자리비움 버튼 클릭 시 countDown실행
  const [pauseFlag, setPauseFlag] = useState(false);

  const [startToRestartButtonFlag, setStartToRestartButtonFlag] =
    useState(true); //* 학습 시작 -> 학습 재시작 버튼으로 만드는 flag

  const isPhoneMutation = useRef(false);
  const [writeStudyMutation] = useWriteStudyLogMutation();
  const [countPhoneUseMutation] = usePhoneLogMutation();

  //* 버튼 활성, 비활성 유무
  const [stopButtonDisabled, setStopButtonDisabled] = useState(true);
  const [leftButtonDisabled, setLeftButtonDisabled] = useState(true);
  const [startButtonDisabled, setStartButtonDisabled] = useState(false);

  //* video 준비 되기 전까지 spinner 동작을 하기위한 flag
  const [isVideoReady, setVideoState] = useState(false);

  //* 학습 Box UI flag
  const [isPauseImageFlag, setIsPauseImageFlag] = useState(false);
  const [isStartImageFlag, setIsStartImageFlag] = useState(false);

  //* 자동 자리 비움 시 사람이 있냐 없냐에 따른 timer start, stop을 위한 flag....Y / N
  const [isPerson, setIsPerson] = useState();

  //* 자동 자리 비움 시 timer id를 통한 start, stop
  const [timerId, setTimerId] = useState();

  //!============================================================================================================================================
  //* Room page 첫 로딩 시
  useEffect(() => {
    prepare();
  }, []);

  //!============================================================================================================================================
  //* page Destroy 되면 실행될 부분
  //* 기록 중일 때 detect Stop, 카메라 Stop
  useEffect(() => {
    return () => {
      if (stream !== null) {
        stream.getTracks().forEach((track) => {
          if (track.readyState === "live" && track.kink === "video") {
            track.stop();
          }
        });

        //* 기록 중일 시 stop
        if (recordingRef.current) stopRecording();
      }
    };
  }, [stream]);

  //!============================================================================================================================================
  //* 자리 비움 시 Timer를 통한 Pause 실행
  const startTimer = () => {
    const countId = setTimeout(() => {
      console.log("카메라에 안보여서 자동 자리 비움");
      // console.log("일시 중지");
      pauseRecording();
    }, 5000);
    setTimerId(countId);
    // console.log("start ID : ", timerId);
  };

  const stopTimer = () => {
    clearTimeout(timerId);
    // console.log("stop ID : ", timerId);
  };

  //* 카메라에 사람이 안보이면 "N", 보이면  "Y"
  useEffect(() => {
    // console.log("사람인가?", isPerson, timerId);
    if (isPerson === "N") {
      startTimer();
    } else if (isPerson === "Y") {
      stopTimer();
    }
  }, [isPerson]);
  //!============================================================================================================================================
  useEffect(() => {
    // console.log("pauseFlag", pauseFlag, "timeFlag", timeFlag);
    if (!timeFlag) return;

    if (pauseFlag) {
      //* 자리비움 버튼 클릭했을 땐 바로 stop
      console.log("자리비움 버튼으로 자리 비움");
      pauseRecording();
    }
  }, [timeFlag, pauseFlag]);

  //!============================================================================================================================================
  //* page 로딩 시 첫 실행될 부분
  const prepare = async () => {
    try {
      //* cam load
      const getWebCam = async () => {
        const devices = navigator.mediaDevices;
        const videoStream = await devices.getUserMedia({ video: true });

        setStream(videoStream);

        if (userVideo.current) {
          window.stream = videoStream;
          userVideo.current.srcObject = videoStream;
        }
      };

      //* model load
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

  //!============================================================================================================================================
  //* requestAnimationFrame으로 지속적으로 detectFrame을 반복함.
  //* shouldDetectRef로 detect 제어
  const detectFrame = async () => {
    //* "shouldRecrodRef = true" : start 버튼 클릭 시
    //* "shouldRecrodRef = false" : stop 버튼 클릭 시
    if (!shouldDetectRef.current) {
      return;
    }

    if (!userVideo.current) return;
    const predictions = await model.detect(userVideo.current);

    //* detect box UI
    renderPredictions(predictions);

    //* detect는 coco의 80개의 class가 다 detect.
    //* if로 사람과 핸드폰만 필터
    let foundPerson = false;
    let foundCellPhone = false;
    let isCalled = false;

    //* 사람일 때
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].class === "person") {
        foundPerson = true;
        setIsPerson("Y");
      }
    }

    //* 핸드폰일 때
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].class === "cell phone") {
        foundCellPhone = true;

        if (isPhoneMutation.current || isCalled) break;

        console.log("mutation call");
        // countPhoneUseMutation({
        //   variables: { userName: user.name },
        // });
        isCalled = true;
        isPhoneMutation.current = true;
      }
    }

    if (!foundCellPhone) {
      isPhoneMutation.current = false;
    }

    if (foundPerson) {
      if (!recordingRef.current) {
        resumeRecoding();
      }
    } else {
      // 사람 검출이 안되면 실행.
      setIsPerson("N");
      setTimeFlag(true);
      setPauseFlag(false);
    }

    requestAnimationFrame(() => {
      // 대강 애니메이션 반복에 최적화된 함수? => 동영상 detect를 하기 때문에 반복이 필요해서 사용됨
      detectFrame();
    });
  };

  //!============================================================================================================================================
  // 사람 detect 하면 startRecoding 계속 실행. 하지만 if문으로 인해 return됨.
  // 즉, 첫 실행일 때만 if문 아래 코드 실행됨.
  const startRecording = () => {
    recordingRef.current = true;
    // writeStudyMutation({
    //   variables: { action: "start", roomId: "7", userName: user.name },
    // });
    setIsStartImageFlag(true);
    console.log("start recording");
  };

  const resumeRecoding = () => {
    if (recordingRef.current) {
      return;
    }

    // writeStudyMutation({
    //   variables: { action: "resume", roomId: "7", userName: user.name },
    // });
    setIsStartImageFlag(true);
    setIsPauseImageFlag(false);
    setTimeFlag(false);
    setPauseFlag(false);
    recordingRef.current = true;
    console.log("resume recording");
  };
  //* StopRecoding
  const [nowArray, setNowArray] = useState([]);
  const copiedNowArray = [...nowArray];

  const stopRecording = () => {
    // writeStudyMutation({
    //   variables: { action: "stop", roomId: "7", userName: user.name },
    // });
    recordingRef.current = false;
    setIsStartImageFlag(false);
    setIsPauseImageFlag(false);
    console.log("stopped recording");

    copiedNowArray.push(dayjs().format("YYYY-MM-DD, HH:mm:ss"));
    setNowArray(copiedNowArray);
  };

  const pauseRecording = () => {
    // writeStudyMutation({
    //   variables: { action: "pause", roomId: "7", userName: user.name },
    // });
    setIsStartImageFlag(false);
    setIsPauseImageFlag(true);
    recordingRef.current = false;
    console.log("pause recording");

    copiedNowArray.push(dayjs().format("YYYY-MM-DD, HH:mm:ss"));
    setNowArray(copiedNowArray);
  };

  //!============================================================================================================================================
  //* detect box UI function
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

  //! 공부중, 자리비움 BOX UI
  const actionImage = () => {
    // if (window.location.width > 700) {
    if (isStartImageFlag) {
      return (
        <>
          <Box bg="green" w="100%" h="7.5vh" p={4} color="white">
            공부 중
          </Box>
        </>
      );
    } else if (isPauseImageFlag) {
      return (
        <>
          <Box bg="tomato" w="100%" h="7.5vh" p={4} color="white">
            자리 비움
          </Box>
        </>
      );
    } else if (!isPauseImageFlag) {
      return (
        <>
          <Box bg="white" w="100%" h="7.5vh" p={4} color="white">
            ----------
          </Box>
        </>
      );
    }
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
            right: "50%",
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
                height: "110vh",
                width: "100%",
                top: "50%",
                left: "50%",
                display: "flex",
                textAlign: "center",
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
        >
          <div className="row">
            <div className="col">
              <Video playsInline muted ref={userVideo} autoPlay />
              {actionImage()}

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
            </div>
            <div className="col">
              <div>
                <Stack
                  spacing={4}
                  direction="row"
                  align="center"
                  marginBottom="10px"
                  marginTop="10px"
                >
                  {startToRestartButtonFlag ? (
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
                        setStartToRestartButtonFlag(false);
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

                        detectFrame();
                        setTimeFlag(false);
                        setPauseFlag(false);
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
                      setStartToRestartButtonFlag(true);

                      stopRecording();
                      setPauseFlag(false);
                      setTimeFlag(false);
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
