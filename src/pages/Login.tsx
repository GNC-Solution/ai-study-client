import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHistory } from "react-router";
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
  const history = useHistory();

  const { success, message, user } = { ...data?.loginResponse };

  const onSubmit: SubmitHandler<FormInputType> = (data) => {
    return login({ variables: data });
  };

  useEffect(() => {
    if (called && success) {
      setUser(user!);
      history.push("/");
    }
  }, [called, history, setUser, success, user]);

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
        <div style={{ width: 400, padding: 30, border: "1px solid #a0a0a0" }}>
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
              {!success ? (
                <div>
                  <Box h={4} />
                  <p style={{ color: "red", fontSize: "1.2rem" }}>{message}</p>
                </div>
              ) : null}
              <Box h={10} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <Button type="submit" bgColor="teal" color="white">
                  로그인
                </Button>
              </div>
            </FormControl>
          </form>
        </div>
      )}
    </div>
  );
}
