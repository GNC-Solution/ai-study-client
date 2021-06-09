import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Redirect } from "react-router";
import { useLoginLazyQuery } from "../hooks/useLoginQuery";
import { useUser } from "../hooks/useUser";

type FormInputType = {
  userName: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<FormInputType>();
  const [login, { called, loading, data }] = useLoginLazyQuery();
  const { setUser } = useUser();

  const loginResponse = data?.loginResponse;

  const onSubmit: SubmitHandler<FormInputType> = (data) => {
    return login({ variables: data });
  };

  if (called && loginResponse?.success) {
    setUser(loginResponse.user!);
    return <Redirect to="/home" />;
  }

  if (called && data) {
    console.log(data);
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {called && loading ? (
        <Spinner color="teal" />
      ) : (
        <div
          style={{ width: "80vw", padding: 30, border: "1px solid #a0a0a0" }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl id="first-name" isRequired>
              <FormLabel>Username</FormLabel>
              <Input placeholder="Username" {...register("userName")} />
              <Box h={10} />
              <FormLabel>Password</FormLabel>
              <Input
                placeholder="Password"
                type="password"
                {...register("password")}
              />
              {loginResponse?.success ? (
                <div>
                  <Box h={4} />
                  <p style={{ color: "red", fontSize: "1.2rem" }}>
                    {loginResponse.message}
                  </p>
                </div>
              ) : null}
              <Box h={10} />
              <Button type="submit" bgColor="teal" color="white">
                로그인
              </Button>
            </FormControl>
          </form>
        </div>
      )}
    </div>
  );
}