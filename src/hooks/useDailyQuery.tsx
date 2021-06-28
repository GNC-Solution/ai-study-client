import { gql, useQuery } from "@apollo/client";
import { DailyResponse } from "../model"

const DAILY_QUERY = gql`
    query Daily($userName: String!) {
        dailyResponse: dailyList(username: $userName) {
            success
            message
            dailyStudyRatio: daily {
                userName: username
                date: yyyymmdd
                dailyStudyHour:totalStudy
                dailyPauseHour:totalPause
                phoneUsageCount: phoneCnt
                pauseCount: pauseCnt
            }
        }
    }
`;

type DailyResponseData = {
    dailyResponse: DailyResponse
}

type DailyVars = {
    userName: string
}
  
export function useDailyQuery(variables: DailyVars) {
    return useQuery<DailyResponseData, DailyVars>(DAILY_QUERY, {
        variables,
    });
}