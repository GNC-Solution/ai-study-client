import { gql, useMutation } from "@apollo/client";
import { ServerResponse } from "../model";

const WRITE_STUDY_LOG_MUTATION = gql`
  mutation WriteStudyLog($action: String!, $roomId: String!) {
    writeStudy(action: $action, roomid: $roomId) {
      success
      message
    }
  }
`;

export type WriteStudyVars = {
    action : "start" | "stop" | "pause" | "resume";
    roomId : string;
}

type WriteStudyLogData = {response : ServerResponse}

export function useWriteStudyLogMutation() {
  return useMutation<WriteStudyLogData, WriteStudyVars>(WRITE_STUDY_LOG_MUTATION);
}
