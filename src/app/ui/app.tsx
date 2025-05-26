import { ColorInput, Container } from "@mantine/core";

export const App = () => {
  return (
    <Container>
      <ColorInput
        label="Input label"
        description="Input description"
        placeholder="Input placeholder"
      />
    </Container>
  );
};
