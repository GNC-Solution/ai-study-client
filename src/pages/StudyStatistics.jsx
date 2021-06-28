import NavigationBar from "../components/NavigationBar";
import {
  Button,
  ButtonGroup,
  useCounter
} from "@chakra-ui/react";
import { useDailyQuery } from "../hooks/useDailyQuery";
import { Bar, Chart } from 'react-chartjs-2';
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useUserStore } from "../hooks/useUserStore";
import moment from 'moment';
import 'moment/locale/ko';
import { func } from "@tensorflow/tfjs-data";

const ChartWrapper = styled.div`
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

const Title = styled.div`
  font-size: 20pt;
  font-weight: bold;
  float: left;
`;

// 받아온 전체 데이터 저장 array
const dates = [];
const studyHour = [];
const pauseHour = [];
const pauseCount = [];
const phoneUsageCount = [];

// 차트에 노출할 부분 데이터 (15개)
let datesSliced = [];
let studyHourSliced = [];
let pauseHourSliced = [];
let pauseCountSliced = [];
let phoneUsageCountSliced = [];

// 차트 데이터, 옵션
let _data;
let _options;
let _legend;

// 차트 제일 좌측/우측 날짜
let leftDateOnChart = moment().subtract(14,'d').format('yyyyMMDD');
let rightDateOnChart = moment().format('yyyyMMDD');

// 날짜 왼쪽으로 움직인 횟수 (1이면 좌측/우측 끝 날짜 -1일)
let moveLoc = 0;

export function ChartDiv() {
  const [countings, updateCountings] = useState([0, 0, 0]);
  const { user } = useUserStore();
  const { loading, error, data } = useDailyQuery({ userName: user.name });
  const { success, message, dailyStudyRatio } = {...data?.dailyResponse };

  // chart를 가리킬 ref 생성
  const myChartRef = useRef();
  let chart = myChartRef.current; // getinstance 받는 법
  // chart.update();
  console.log(myChartRef.current);

  useEffect ( () => {
    // 차트 업데이트
    setChartData();
    console.log('effect');
  }, [dailyStudyRatio])

  setChartConfig();
  _options.onClick = (event, config, ctx) => {
    if(config.length == 0)
      alert('click bars');
    else {
      let idx = config[1].index;
      console.log(datesSliced);
      console.log(pauseCountSliced);
      console.log(phoneUsageCountSliced);
      updateCountings([datesSliced[idx], pauseCountSliced[idx], phoneUsageCountSliced[idx]]);
    }
    
    ctx.data.labels.push('aaa');
    console.log(ctx.data.labels);
  }

  if(dailyStudyRatio != undefined) {
    for(let i=0; i<dailyStudyRatio.length; i++) {
      dates[i] = dailyStudyRatio[i].date;
      studyHour[i] = dailyStudyRatio[i].dailyStudyHour;
      pauseHour[i] = dailyStudyRatio[i].dailyPauseHour;
      pauseCount[i] = dailyStudyRatio[i].pauseCount;
      phoneUsageCount[i] = dailyStudyRatio[i].phoneUsageCount;
    }

    setChartData();

    return (
      <>
        <Title>{user.name}님의 학습 기록</Title>
        <br/>
        <br/>
        <div>
          <Title>{moment().format('yyyy.MM.DD (dd)')}</Title>
          <ButtonGroup variant="outline" spacing="0" isAttached="true" float="right"> 
            <Button onClick={showDaily}>일간</Button>
            <Button onClick={showWeekly}>주간</Button>
            <Button onClick={showMonthly}>월간</Button>
          </ButtonGroup>
        </div>
        <br/>
        <br/>
        <div>
          <Bar ref={myChartRef} data={_data} legend={_legend} options={_options} width={550} height={250}/>
          <Button onClick={goLeft} float='left'>◀</Button>
          <Button onClick={goRight} float='right'>▶</Button>
        </div>
        <br/>
        <br/>
        <div>
          <label>날짜: {countings[0]}</label>
          <br/>
          <label>자리비움 횟수: {countings[1]}</label>
          <br/>
          <label>폰 사용 횟수: {countings[2]}</label>
        </div>
      </>
    );
  }
  else {
    return (
    <>
      <Button
        isLoading
        loadingText="Loading"
        colorScheme="teal"
        variant="ghost"
        spinnerPlacement="start"
      >
      </Button>
    </>
    );
  }
}

export default function StudyStatistics() {
  return (
    <>
      <NavigationBar/>
      <section id="statistics" className="statistics">
        <div className="container">
          <div className="row content">
            <div className="col-lg-6">
              <ChartWrapper>
                <ChartDiv />
              </ChartWrapper>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function showDaily() { console.log("Show Daily"); }
function showWeekly() { alert('준비 중입니다..'); }
function showMonthly() { alert('준비 중입니다..'); }

function goLeft() {
  // 날짜 범위 -1일
  if(leftDateOnChart > dates[0]) {
    moveLoc++;

    rightDateOnChart = moment().subtract(moveLoc, 'd').format('yyyyMMDD');
    leftDateOnChart = moment().subtract(14 + moveLoc, 'd').format('yyyyMMDD');
    alert(rightDateOnChart + ", " + leftDateOnChart);
    
    setChartData();
  }

  if(moveLoc <= dates[0]) {} // 버튼 비활성화 
}

function goRight() {
  // 날짜 범위 +1일
  if(moveLoc > 0) {
    moveLoc--;

    rightDateOnChart = moment().subtract(moveLoc, 'd').format('yyyyMMDD');
    leftDateOnChart = moment().subtract(14 + moveLoc, 'd').format('yyyyMMDD');
    alert(rightDateOnChart + ", " + leftDateOnChart);
    
    setChartData();
  }

  if(moveLoc == 0) {} // 버튼 비활성화 
}

function setChartConfig() {
  _data= {
    labels: [],
    datasets: [
      {
        label: "공부한 시간",
        data: [],
        lineTension: 0,
        backgroundColor: "#909090",
        fill: true,
        stack: true
      },
      {
        label: "자리비움 시간",
        data: [],
        lineTension: 0,
        backgroundColor: "#F8A669",
        fill: true,
        stack: true
      },
    ],
  };
  _options = {
    onClick: (event, config, ctx) => {},
    responsive: true,
    barThickness: 6,
    scales: {
      xAxes: {
        grid: {
          display: false
        },
        ticks: {
          callback: (value, index, values) => { 
            if(datesSliced[index] % 100 == moment().format('DD'))
              return '오늘';
            else
              return datesSliced[index] % 100;
          }
        },
        scaleLabels: {
          labelString: 'q',
          display: true
        }
      },
      yAxes: {
        grid: {
          drawTicks: false,
          color: '#e0e0e0',
          borderDash: [5, 4]
        },
        ticks: {
          min: -20,
          padding: 10
        }
      }
    }
  }
    /*
  const _options = {
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
  _legend = {
    display: true,
    position: 'bottom',
    labels: {
      fontColor: "black",
    },
    position: "top", //label를 넣어주지 않으면 position이 먹히지 않음
  };
}

function setChartData() {
  for(let i=0; i<15; i++) {
    let when = moment().subtract(14+moveLoc-i, 'd').format('yyyyMMDD');
    datesSliced[i] = when;
    let idxOfDatesArray = dates.indexOf(when);

    if(idxOfDatesArray == -1) {
      studyHourSliced[i] = 0;
      pauseHourSliced[i] = 0;
      pauseCountSliced[i] = 0;
      phoneUsageCountSliced[i] = 0;
    }
    else {
      studyHourSliced[i] = studyHour[idxOfDatesArray];
      pauseHourSliced[i] = pauseHour[idxOfDatesArray];
      pauseCountSliced[i] = pauseCount[idxOfDatesArray];
      phoneUsageCountSliced[i] = phoneUsageCount[idxOfDatesArray];
    }
  }

  _data.labels = datesSliced;
  _data.datasets[0].data = studyHourSliced;
  _data.datasets[1].data = pauseHourSliced;
}