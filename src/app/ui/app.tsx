import { useUnit } from "effector-react";
import {
  Badge,
  Card,
  Group,
  Button,
  Container,
  Text,
  Flex,
  Skeleton,
  Loader,
  Center,
} from "@mantine/core";

import { appModel } from "@app/model";
import type { GetUsersResponseDto } from "@app/model/api";

export const App = () => {
  const [forceRequest, abortRequest, resetCache] = useUnit([
    appModel.requestForced,
    appModel.requestAbortForced,
    appModel.resetCache,
  ]);

  return (
    <Container>
      <Container size="sm">
        <Button onClick={forceRequest}>Force Request</Button>
        <Button onClick={abortRequest}>Abort Request</Button>
        <Button onClick={resetCache}>Reset Cache</Button>
        <UserList />
      </Container>
    </Container>
  );
};

const UserList = () => {
  const { users, isLoading } = useUnit({
    users: appModel.$users,
    isLoading: appModel.$isLoading,
  });

  const isFetching = !users && isLoading;

  if (isFetching) {
    return (
      <Flex direction="column" gap="sm" mt="sm">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton height={100} radius="xl" key={index} />
        ))}
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Center h={100}>
        <Loader color="blue" />
      </Center>
    );
  }

  if (!users) {
    return <Text>No data</Text>;
  }

  return (
    <Flex direction="column" gap="sm" mt="sm">
      {users.users.map((user, index) => (
        <UserCard key={index} user={user} />
      ))}
    </Flex>
  );
};

const UserCard = ({ user }: { user: GetUsersResponseDto["users"][number] }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mih={100}>
      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{user.firstName}</Text>
        <Badge color="pink">{user.gender}</Badge>
      </Group>
    </Card>
  );
};
