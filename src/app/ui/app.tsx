import { useUnit } from "effector-react";
import { Button, Container } from "@mantine/core";

import { appModel } from "@app/model";

export const App = () => {
  const [forceRequest, abortRequest] = useUnit([
    appModel.requestForced,
    appModel.requestAbortForced,
  ]);

  return (
    <Container>
      <Container size="sm">
        <Button onClick={forceRequest}>Force Request</Button>
        <Button onClick={abortRequest}>Abort Request</Button>
      </Container>
    </Container>
  );
};
