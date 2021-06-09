import { gql, useLazyQuery } from "@apollo/client";

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

export type UserType = {
  id: number;
  name: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  user: UserType | null;
}

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
