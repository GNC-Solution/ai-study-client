import { gql, useMutation } from "@apollo/client";
import { ServerResponse } from "../model/response";

const WRITE_LOG_MUTATION = gql`
  mutation WriteLog(
    $roomNumber: String!
    $userName: String!
    $isExist: String!
  ) {
    response: writeLog(existflag: $isExist, roomno: $roomNumber, username: $userName) {
      success
      message
    }
  }
`;

export type WriteLogVars = {
  roomNumber: string;
  userName: string;
  isExist: "Y" | "N";
};

type WriteLogData = { response: ServerResponse };

export function useWriteLogMutation() {
  return useMutation<WriteLogData, WriteLogVars>(WRITE_LOG_MUTATION);
}
