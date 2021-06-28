import React from "react";
import { useWriteStudyLogMutation } from "../hooks/useWriteStudyLogMutation";

export default function Test1() {
  const [writeLog, { loading, data }] = useWriteStudyLogMutation();
  if (loading) return <div>loading...</div>;

  return (
    <div>
      {JSON.stringify(data)}
      <button
        onClick={() =>
          writeLog({
            variables: {
              action: "start",
              roomId: "7",
              userName: "test",
            },
          })
        }
      >
        click
      </button>
    </div>
  );
}
