import { Button, Container, Group, Text, Title } from '@mantine/core';


const NotFound = () => {
    return (
        <Container fluid m={0} h='100vh'>
            <div style={{
                fontSize: 220,
                fontWeight: 900,
                textAlign: 'center',
                paddingTop: 100,
            }}>404</div>
            <Title fw={900} fz={38} ta='center'>You have found a secret place.</Title>
            <Text c="dimmed" size="lg" ta="center" m='auto' maw={500}>
                Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has
                been moved to another URL.
            </Text>
            <Group justify="center" mt={30}>
                <Button
                    variant="outline"
                    component="a"
                    href="/homepage" size="md">
                    Take me back to home page
                </Button>
            </Group>
        </Container>
    );
}

export default NotFound;
