import { useUnit } from "effector-react";
import { Button, Container } from "@mantine/core";

import { appModel } from "@app/model";

export const App = () => {
  const [requestStarted, abortRequests] = useUnit([
    appModel.requestStarted,
    appModel.abortRequests,
  ]);

  return (
    <Container>
      <Container size="sm">
        <Button onClick={requestStarted}>startReqeust</Button>
        <Button onClick={abortRequests}>abort</Button>
      </Container>
    </Container>
  );
};
