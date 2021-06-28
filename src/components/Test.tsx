import React, { CSSProperties } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  background-color: blue;
`;

export default function Test() {
  const cssProperty: CSSProperties = {
    backgroundColor: "yellow",
  };
  return (
    <Wrapper>
      hello world
      <div style={cssProperty}>hi</div>
    </Wrapper>
  );
}
