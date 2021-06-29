import { gql, useMutation } from "@apollo/client";
import { ServerResponse } from "../model";

const USE_CELL_PHONE_LOG_MUTATION = gql`
  mutation UseCellPhone($userName: String!) {
    usePhone(username: $userName) {
      success
      message
    }
  }
`;

export type UseCellPhoneVars = {
  userName: string;
};

type UseCellPhoneLogData = { response: ServerResponse };

export function usePhoneLogMutation() {
  return useMutation<UseCellPhoneLogData, UseCellPhoneVars>(
    USE_CELL_PHONE_LOG_MUTATION
  );
}
