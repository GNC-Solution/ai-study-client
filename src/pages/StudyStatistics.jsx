import NavigationBar from "../components/NavigationBar";
import { Button, ButtonGroup, Select, Spinner } from "@chakra-ui/react";
import { useDailyQuery } from "../hooks/useDailyQuery";
import { Bar, Chart, Doughnut } from "react-chartjs-2";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useUserStore } from "../hooks/useUserStore";
import moment from "moment";
import "moment/locale/ko";

const BarWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 13%);
  width: 1000px;
  height: 700px;
  /*
  position: flex;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center; 
  */
`;

const DoughnutWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 13%);
  width: 90vw;
  height: 40vh;
`;

const Title = styled.div`
  font-size: 18pt;
  font-weight: bold;
  float: left;
`;

// 받아온 전체 데이터 저장 array
const dates = [];               // 전체 날짜
const studyHour = [];           // 전체 공부 시간
const pauseHour = [];           // 전체 자리비움 시간
const pauseCount = [];          // 전체 자리비움 횟수
const phoneUsageCount = [];     // 전체 폰 사용 횟수

// 차트에 노출할 부분 데이터 (15개)
let datesSliced = [];
let studyHourSliced = [];
let pauseHourSliced = [];
let pauseCountSliced = [];
let phoneUsageCountSliced = [];

// bar 차트 데이터, 옵션
let _barData;
let _barOptions;
let _barLegend;

// doughnut 차트 데이터, 옵션
let _doughnutData;
let _doughnutOptions;
let _doughnutLegend;

// 차트 제일 좌측/우측 날짜
let leftDateOnChart = moment().subtract(14, "d").format("yyyyMMDD");
let rightDateOnChart = moment().format("yyyyMMDD");

// 날짜 왼쪽으로 움직인 횟수 (1이면 좌측/우측 끝 날짜 -1일)
let moveLoc = 0;
let clickedBarIndex = 14;
let doughnutDate = moment().format('yyyyMMDD');

function LandscapeChartDiv() {
  const [countings, updateCountings] = useState([0, 0, 0]);
  const { user } = useUserStore();
  const { loading, error, data } = useDailyQuery({ userName: user.name });
  const { success, message, dailyStudyRatio } = { ...data?.dailyResponse };

  // chart를 가리킬 ref 생성
  const studyBarChartRef = useRef();

  useEffect(() => {
    // 차트 데이터 업데이트
    setBarChartData();
    
    updateCountings([moment().format("yyyy.MM.DD (dd)"), pauseCountSliced[pauseCountSliced.length - 1], phoneUsageCountSliced[phoneUsageCountSliced.length - 1]]);
  }, [dailyStudyRatio]);

  setBarChartConfig();
  
  _barOptions.onClick = (event, config, chart) => {
    if (config.length == 0) {}
    else {
      let idx = config[1].index;
      clickedBarIndex = idx;

      updateCountings([
        moment().subtract(moveLoc + (14 - idx), 'd').format("yyyy.MM.DD (dd)"),
        pauseCountSliced[idx],
        phoneUsageCountSliced[idx],
      ]);
    }
  };

  if (dailyStudyRatio != undefined) {
    for (let i = 0; i < dailyStudyRatio.length; i++) {
      dates[i] = dailyStudyRatio[i].date;
      studyHour[i] = dailyStudyRatio[i].dailyStudyHour;
      pauseHour[i] = dailyStudyRatio[i].dailyPauseHour;
      pauseCount[i] = dailyStudyRatio[i].pauseCount;
      phoneUsageCount[i] = dailyStudyRatio[i].phoneUsageCount;
    }
    setBarChartData();

    return (
      <>
        <Title>{user.name}님의 학습 기록</Title>
        <br />
        <br />
        <div>
          <Title>{countings[0]}</Title>
          <ButtonGroup
            variant="outline"
            spacing="0"
            isAttached="true"
            float="right"
          >
            <Button onClick={showDaily}>일간</Button>
            <Button onClick={showWeekly}>주간</Button>
            <Button onClick={showMonthly}>월간</Button>
          </ButtonGroup>
        </div>
        <br />
        <br />
        <div>
          <Bar
            ref={studyBarChartRef}
            data={_barData}
            legend={_barLegend}
            options={_barOptions}
            width={550}
            height={250}
          />
          <Button background="#4C5264" textColor="white" onClick={goLeft} float="left">
            ◀◀
          </Button>
          <Button background="#4C5264" textColor="white" onClick={goLeftOneDay} float="left">
            ◀
          </Button>
          <Button background="#4C5264" textColor="white" onClick={goRight} float="right">
            ▶▶
          </Button>
          <Button background="#4C5264" textColor="white" onClick={goRightOneDay} float="right">
            ▶
          </Button>
        </div>
        <br />
        <br />
        <br />
        <div>
          <label>자리비움 횟수: {countings[1]}</label>
          <br />
          <label>폰 사용 횟수: {countings[2]}</label>
        </div>
      </>
    );
  } else {
    return (
      <>
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
      </>
    );
  }
  
  // 날짜 이동 버튼 클릭 이벤트
  function goLeft() {
    // 날짜 범위 -15일
    if (leftDateOnChart > dates[0]) {
      if (moment().subtract(moveLoc + 29, 'd') < dates[0]) {
        moveLoc += 15;
      }
      else {
        let idx = dates.indexOf(leftDateOnChart);
        moveLoc += idx;
      }

      rightDateOnChart = moment().subtract(moveLoc, "d").format("yyyyMMDD");
      leftDateOnChart = moment()
        .subtract(14 + moveLoc, "d")
        .format("yyyyMMDD");

      setBarChartData();
      clickedBarIndex = -1;

      updateCountings([countings[0], countings[1], countings[2]]);
    }

    if (leftDateOnChart <= dates[0]) {

    } // 버튼 비활성화
  }

  function goRight() {
    // 날짜 범위 +15일
    if (moveLoc > 0) {
      if (moveLoc >= 15) {
        moveLoc -= 15;
      }
      else {
        moveLoc = 0;
      }

      rightDateOnChart = moment().subtract(moveLoc, "d").format("yyyyMMDD");
      leftDateOnChart = moment()
        .subtract(14 + moveLoc, "d")
        .format("yyyyMMDD");

      setBarChartData();
      clickedBarIndex = -1;

      updateCountings([countings[0], countings[1], countings[2]]);
    }

    if (moveLoc == 0) {
    } // 버튼 비활성화
  }

  function goLeftOneDay() {
    // 날짜 범위 -1일
    if (leftDateOnChart > dates[0]) {
      moveLoc++;

      rightDateOnChart = moment().subtract(moveLoc, "d").format("yyyyMMDD");
      leftDateOnChart = moment()
        .subtract(14 + moveLoc, "d")
        .format("yyyyMMDD");

      setBarChartData();
      clickedBarIndex = -1;
    
      updateCountings([countings[0], countings[1], countings[2]]);
    }

    if (leftDateOnChart <= dates[0]) {
    } // 버튼 비활성화
  }

  function goRightOneDay() {
    // 날짜 범위 +1일
    if (moveLoc > 0) {
      moveLoc--;

      rightDateOnChart = moment().subtract(moveLoc, "d").format("yyyyMMDD");
      leftDateOnChart = moment()
        .subtract(14 + moveLoc, "d")
        .format("yyyyMMDD");

      setBarChartData();
      clickedBarIndex = -1;
    
      updateCountings([countings[0], countings[1], countings[2]]);
    }

    if (moveLoc == 0) {
    } // 버튼 비활성화
  }

}

function PortraitChartDiv() {
  const [countings, updateCountings] = useState([0, 0, 0]);
  const { user } = useUserStore();
  const { loading, error, data } = useDailyQuery({ userName: user.name });
  const { success, message, dailyStudyRatio } = { ...data?.dailyResponse };
  const mySelectRef = useRef();
  let dateSelect = mySelectRef.current;

  useEffect(() => {

    // 차트 데이터 업데이트
    updateCountings([moment().format("yyyy.MM.DD (dd)"), pauseCount[pauseCount.length - 1], phoneUsageCount[phoneUsageCount.length - 1]]);
  }, [dailyStudyRatio]);

  if (dailyStudyRatio != undefined) {
    for (let i = 0; i < dailyStudyRatio.length; i++) {
      dates[i] = dailyStudyRatio[i].date;
      studyHour[i] = dailyStudyRatio[i].dailyStudyHour;
      pauseHour[i] = dailyStudyRatio[i].dailyPauseHour;
      pauseCount[i] = dailyStudyRatio[i].pauseCount;
      phoneUsageCount[i] = dailyStudyRatio[i].phoneUsageCount;
    }

    setDoughnutChartConfig(doughnutDate);

    return (
      <>
        <Select 
          ref={mySelectRef}
          onChange={() => {
            doughnutDate = dateSelect.value;
            let idx = dates.indexOf(doughnutDate);
            updateCountings([moment(doughnutDate).format('yyyy.MM.DD (dd)'), pauseCount[idx], phoneUsageCount[idx]]);
          }} 
          placeholder="조회할 날짜를 선택하세요"
        >
          <option>20210611</option>
          <option>20210612</option>
          <option>20210613</option>
          <option>20210614</option>
          <option>20210615</option>
          <option>20210616</option>
          <option>20210617</option>
          <option>20210618</option>
          <option>20210619</option>
          <option>20210620</option>
          <option>20210621</option>
          <option>20210622</option>
          <option>20210623</option>
          <option>20210624</option>
          <option>20210625</option>
          <option>20210626</option>
          <option>20210627</option>
          <option>20210628</option>
          <option>20210629</option>
        </Select>
        <br />
        <div>
          <Title style={{
            width : "180px",
            position: "absolute",
            left: "50%",
            transform: "translate(-50%)"
           }}>{countings[0]}</Title>
        </div>
        <br />
        <br />
        <br />
        <div>
          <Doughnut
            data={_doughnutData}
            legend={_doughnutLegend}
            options={_doughnutOptions}
            width={375}
            height={400}
          />
        </div>
        <br />
        <br />
        <br />
        <div> 
          <label>자리비움 횟수: {countings[1]}</label>
          <br />
          <label>폰 사용 횟수: {countings[2]}</label>
        </div>
      </>
    );
  } else {
    return (
      <>
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
      </>
    );
  }
}

export default function StudyStatistics() {
  if(window.innerWidth > 1000) {
    return (
      <>
        <NavigationBar />
        <section id="statistics" className="statistics">
          <div className="container">
            <div className="row content">
              <div className="col-lg-6">
                <BarWrapper>
                  <LandscapeChartDiv />
                </BarWrapper>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
  else {
    return (
      <>
        <NavigationBar />
        <section id="statistics" className="statistics">
          <div className="container" backgroundColor="#0000FF">
            <div className="row content">
              <div className="col-lg-6">
                <DoughnutWrapper>
                  <PortraitChartDiv />
                </DoughnutWrapper>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

// 일/주/월 버튼 클릭 이벤트
function showDaily() {
  console.log("Show Daily");
}
function showWeekly() {
  alert("준비 중입니다..");
}
function showMonthly() {
  alert("준비 중입니다..");
}


// 날짜 select box 세팅
// function setDateSelect() {
//   let dateSelect = document.getElementById('date-select');
//   let option = document.createElement('option');

//   for(let i=0; i<dates.length; i++) {
//     let textNode = document.createTextNode(dates[i]);
//     option.appendChild(textNode);
//     dateSelect.appendChild(option);
//   }
// }



// bar --------------------------------------------------------------------------------------------------------------------------

// bar chart config 세팅 메서드
function setBarChartConfig() {
  _barData = {
    labels: [],
    datasets: [
      {
        label: "공부한 시간",
        data: [],
        lineTension: 0,
        backgroundColor: "rgba(144, 144, 144, 0.5)",
        hoverBackgroundColor: "rgb(144, 144, 144)",
        fill: true,
        stack: true,
      },
      {
        label: "자리비움 시간",
        data: [],
        lineTension: 0,
        backgroundColor: "rgba(248, 166, 105, 0.5)",
        hoverBackgroundColor: "rgb(248, 166, 105)",
        fill: true,
        stack: true,
      },
    ],
  };

  _barOptions = {
    onClick: (event, config, ctx) => {},
    responsive: () => {
      if(window.innerWidth > 1000) return true;
      else                        return false;
    },
    plugins: {
      tooltip: {
        backgroundColor: "#5FA17A",
        callbacks: {
          title: function(context) {
            let temp = context.dataset;
            return moment(context[0].label).format("yyyy.MM.DD (dd)");
          },
          label: function(context) {
            var label = context.dataset.label || '';

            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              let refined = Math.floor((context.parsed.y) / 3600) + "시간" 
                + Math.floor(((context.parsed.y) % 3600) / 60) + "분"
                + ((context.parsed.y) % 3600) % 60 + "초";
              label += refined;
            }
            return label;
          }
        }
      }
    },
    barThickness: 6,
    scales: {
      xAxes: {
        grid: {
          display: false,
        },
        ticks: {
          callback: (value, index, values) => {
            if (datesSliced[index] % 100 == moment().format("DD"))
              return "오늘";
            else return datesSliced[index] % 100;
          },
        },
        scaleLabels: {
          labelString: "q",
          display: true,
        },
      },
      yAxes: {
        grid: {
          drawTicks: false,
          color: "#e0e0e0",
          borderDash: [5, 4],
        },
        ticks: {
          maxTicksLimit: 6,
          padding: 10,
        },
      },
    },
  };
  /*
  _barOptions = {
    responsive: true,
    //maintainAspectRatio: false,
    //tooltips 사용시
    cornerRadius: 20,
    tooltips: {
      enabled: false,
      mode: "nearest",
      position: "average",
      intersect: false,
    },
    scales: {
      xAxes: [
        {
          barThickness: 1,
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          // position: "top", //default는 bottom
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Step",
            fontFamily: "Montserrat",
            fontColor: "black",
          },
          ticks: {
            // beginAtZero: true,
            maxTicksLimit: 10, //x축에 표시할 최대 눈금 수
          },
        },
      ],
      yAxes: [
        {
          //  padding: 10,
          scaleLabel: {
            display: true,
            labelString: "Coverage",
            fontFamily: "Montserrat",
            fontColor: "black",
          },
          ticks: {
            beginAtZero: true,
            stepSize: 20,
            min: -100,
            max: 100,
          //y축 scale 값에 % 붙이기 위해 사용
            callback: function (value) {
              return value + "%";
            },
          },
        },
      ],
    },
  };
  */
  _barLegend = {
    display: true,
    position: "bottom",
    labels: {
      fontColor: "black",
    },
    position: "top", //label를 넣어주지 않으면 position이 먹히지 않음
  };

  if(clickedBarIndex != -1) {
    let studyBGColor = [];
    let pauseBGColor = [];

    for(let i=0; i<15; i++) {
      if(i == clickedBarIndex) {
        studyBGColor[i] = "rgb(144, 144, 144)";
        pauseBGColor[i] = "rgb(248, 166, 105)";
      }
      else {
        studyBGColor[i] = "rgba(144, 144, 144, 0.5)";
        pauseBGColor[i] = "rgba(248, 166, 105, 0.5)";
      }
    }

    _barData.datasets[0].backgroundColor = studyBGColor;
    _barData.datasets[1].backgroundColor = pauseBGColor;
  }
}

// bar 차트 데이터 세팅 / update 메서드
function setBarChartData() {
  for (let i = 0; i < 15; i++) {
    let when = moment()
      .subtract(14 + moveLoc - i, "d")
      .format("yyyyMMDD");
    datesSliced[i] = when;
    let idxOfDatesArray = dates.indexOf(when);

    if (idxOfDatesArray == -1) {
      studyHourSliced[i] = 0;
      pauseHourSliced[i] = 0;
      pauseCountSliced[i] = 0;
      phoneUsageCountSliced[i] = 0;
    } else {
      studyHourSliced[i] = studyHour[idxOfDatesArray];
      pauseHourSliced[i] = pauseHour[idxOfDatesArray];
      pauseCountSliced[i] = pauseCount[idxOfDatesArray];
      phoneUsageCountSliced[i] = phoneUsageCount[idxOfDatesArray];
    }
  }

  _barData.labels = datesSliced;
  _barData.datasets[0].data = studyHourSliced;
  _barData.datasets[1].data = pauseHourSliced;
}








// doughnut -----------------------------------------------------------------------------------------------------------------------------

function setDoughnutChartConfig(date) {
  let idx = dates.indexOf(date);

  _doughnutData = {
    labels: [
      "공부한 시간",
      "자리비움 시간"
    ],
    datasets: [{
      label: ["공부한 시간", "자리비움 시간"],
      data: [studyHour[idx], pauseHour[idx]],
      backgroundColor: [
        "rgba(144, 144, 144, 0.5)",
        "rgba(248, 166, 105, 0.5)",
      ],
      hoverBackgroundColor: (elem) => {
        if(elem.index == 0)
          return "rgb(144, 144, 144)";
        else if(elem.index == 1)
          return "rgb(248, 166, 105)";
      },
    }]
  };
  _doughnutOptions = {
    // plugins: {
    //   tooltip: {
    //     backgroundColor: "#5FA17A",
    //     callbacks: {
    //       title: function(context) {
    //         let temp = context.dataset;
    //         return moment(context[0].label).format("yyyy.MM.DD (dd)");
    //       },
    //       label: function(context) {
    //         var label = context.dataset.label || '';

    //         if (label) {
    //           console.log(!label);
    //           label += ': ';
    //         }
    //         if (context.parsed.y !== null) {
    //           let refined = Math.floor((context.parsed.y) / 3600) + "시간" 
    //             + Math.floor(((context.parsed.y) % 3600) / 60) + "분"
    //             + ((context.parsed.y) % 3600) % 60 + "초";
    //           label += refined;
    //         }
    //         return label;
    //       }
    //     }
    //   }
    // },
    cutout: "75%",
    elements: {
      center: {
        text: 'Red is 2/3 the total numbers',
        color: '#FF6384', // Default is #000000
        fontStyle: 'Arial', // Default is Arial
        sidePadding: 20, // Default is 20 (as a percentage)
        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
        lineHeight: 25 // Default is 25 (in px), used for when text wraps
      }
    }
  };
  _doughnutLegend = {};
}