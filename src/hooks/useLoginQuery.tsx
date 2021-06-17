import { gql, useLazyQuery } from "@apollo/client";
import { LoginResponse } from "../model";

const LOGIN_QUERY = gql`
  query Login($userName: String!, $password: String!) {
    loginResponse: userCheck(username: $userName, userpwd: $password) {
      success
      message
      user {
        id
        name: username
      }
    }
  }
`;

type LoginResponseData = {
  loginResponse: LoginResponse
}

export type LoginVars = {
  userName: string;
  password: string;
}

export function useLoginLazyQuery() {
  return useLazyQuery<LoginResponseData, LoginVars>(LOGIN_QUERY);
}
