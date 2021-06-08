import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
};


export type Mutations = {
  __typename?: 'Mutations';
  writeLog?: Maybe<Response>;
};


export type MutationsWriteLogArgs = {
  existflag?: Maybe<Scalars['String']>;
  roomno?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};

export type ProfileType = {
  __typename?: 'ProfileType';
  id: Scalars['ID'];
  user: UserType;
  role: ProfileRole;
  doublePwd: Scalars['String'];
  verifyType: Scalars['String'];
  userType: Scalars['String'];
  balanceAmt: Scalars['Int'];
  pointAmt: Scalars['Int'];
  profileImg?: Maybe<Scalars['String']>;
  profileUrl?: Maybe<Scalars['String']>;
  qrcodeImg?: Maybe<Scalars['String']>;
  qrcodeUrl?: Maybe<Scalars['String']>;
  usageFlag: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  userCheck?: Maybe<UserResponse>;
};


export type QueryUserCheckArgs = {
  username: Scalars['String'];
  userpwd: Scalars['String'];
};

export type Response = {
  __typename?: 'Response';
  success: Scalars['Boolean'];
  message?: Maybe<Scalars['String']>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  success: Scalars['Boolean'];
  message?: Maybe<Scalars['String']>;
  user?: Maybe<UserType>;
};

export type UserType = {
  __typename?: 'UserType';
  id: Scalars['ID'];
  password: Scalars['String'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean'];
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  /** Designates whether the user can log into this admin site. */
  isStaff: Scalars['Boolean'];
  /** Designates whether this user should be treated as active. Unselect this instead of deleting accounts. */
  isActive: Scalars['Boolean'];
  dateJoined: Scalars['DateTime'];
  profile?: Maybe<ProfileType>;
};

/** An enumeration. */
export enum ProfileRole {
  /** manager */
  Manager = 'MANAGER',
  /** partner */
  Partner = 'PARTNER',
  /** user */
  User = 'USER'
}

export type LoginQueryVariables = Exact<{
  userName: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginQuery = (
  { __typename?: 'Query' }
  & { loginResponse?: Maybe<(
    { __typename?: 'UserResponse' }
    & Pick<UserResponse, 'success' | 'message'>
    & { user?: Maybe<(
      { __typename?: 'UserType' }
      & Pick<UserType, 'id'>
      & { name: UserType['username'] }
    )> }
  )> }
);


export const LoginDocument = gql`
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

/**
 * __useLoginQuery__
 *
 * To run a query within a React component, call `useLoginQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoginQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoginQuery({
 *   variables: {
 *      userName: // value for 'userName'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginQuery(baseOptions: Apollo.QueryHookOptions<LoginQuery, LoginQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoginQuery, LoginQueryVariables>(LoginDocument, options);
      }
export function useLoginLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoginQuery, LoginQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoginQuery, LoginQueryVariables>(LoginDocument, options);
        }
export type LoginQueryHookResult = ReturnType<typeof useLoginQuery>;
export type LoginLazyQueryHookResult = ReturnType<typeof useLoginLazyQuery>;
export type LoginQueryResult = Apollo.QueryResult<LoginQuery, LoginQueryVariables>;