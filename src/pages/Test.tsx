import { Button } from "@chakra-ui/button";
import { Spinner } from "@chakra-ui/spinner";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { useUserStore } from "../hooks/useUserStore";
import { useWriteLogMutation } from "../hooks/useWriteLogMutation";

type TestProps = {
  roomNumber: string;
};

export default function Test({ roomNumber }: TestProps) {
  const [writeLog, { data, loading }] = useWriteLogMutation();
  const history = useHistory();
  const { user } = useUserStore();

  const writeExistLog = (isExist: boolean) =>
    writeLog({
      variables: {
        userName: user!.name,
        roomNumber,
        isExist: isExist ? "Y" : "N",
      },
    });

  useEffect(() => {
    if (!user) return history.push("/login");
    if (!data) return;

    const { success } = data.response;
    if (!success) history.push("/login");
  }, [data, history, user]);

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
      {loading ? (
        <Spinner color="teal" />
      ) : (
        <div>
          <Button onClick={() => writeExistLog(true)}>공부중</Button>
          <Button onClick={() => writeExistLog(false)}>자리비움</Button>
        </div>
      )}
    </div>
  );
}
