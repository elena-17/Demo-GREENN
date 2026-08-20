import { Box, Title, Text, List, Anchor, Divider, Code, Card, Image, Group } from "@mantine/core";
import Author from "../components/author";
import alarcosLogo from '../styles/Logos/alarcos_logo_v3.png';

const HelpPage = () => (
    <Box maw={800} mx="auto" p="xl">
        <Title order={1} mb="md">Help & Documentation</Title>
        <Text mb="md">
            Welcome to the help page! Here you will find information about how to use the main features of this platform.
        </Text>

        <Divider my="md" />

        <Text mt="md" mb="xs" fz={25} fw={700}>Getting Started</Text>
        <List spacing="xs" size="sm" mb="md">
            <List.Item>Register or log in with your email and password.</List.Item>
            <List.Item>Navigate to the <b>Projects</b> section to create or manage your projects.</List.Item>
            <List.Item>Upload datasets in <Code>.pkl</Code> format from the <b>Datasets</b> section.</List.Item>
            <List.Item>Configure and launch test cases from the <b>Test Cases</b> panel.</List.Item>
        </List>

        <Text mt="md" mb="xs" fz={25} fw={700}>Uploading Datasets</Text>
        <Text mb="xs">
            Only files in <Code>.pkl</Code> format are accepted. The file must contain a dictionary with the following keys:
        </Text>
        <List size="sm" spacing="xs" mb="md">
            <List.Item><b>X</b>: Numpy array with shape (N, C, H, W)</List.Item>
            <List.Item><b>y</b>: One-hot encoded labels</List.Item>
            <List.Item><b>labels</b>: Class names</List.Item>
        </List>

        <Text mt="md" mb="xs" fz={25} fw={700}>Managing Users (Admins)</Text>
        <List size="sm" spacing="xs" mb="md">
            <List.Item>Admins can view, edit, and delete users from the <b>User Management</b> panel.</List.Item>
            <List.Item>Roles: <Code>admin</Code> and <Code>user</Code>.</List.Item>
            <List.Item>Admins can reset user passwords.</List.Item>
        </List>

        <Text mt="md" mb="xs" fz={25} fw={700}>Working with Projects</Text>
        <List size="sm" spacing="xs" mb="md">
            <List.Item>Create new projects from the <b>Projects</b> section.</List.Item>
            <List.Item>Edit project details or delete projects as needed.</List.Item>
            <List.Item>Download your project and all associated test cases as a ZIP file.</List.Item>
        </List>

        <Text mt="md" mb="xs" fz={25} fw={700}>Test Cases & Experiments</Text>
        <List size="sm" spacing="xs" mb="md">
            <List.Item>Configure test cases by selecting datasets, models, and parameters.</List.Item>
            <List.Item>Launch test cases and monitor their progress in real time.</List.Item>
            <List.Item>View results, metrics, and download reports after completion.</List.Item>
        </List>

        <Text mt="md" mb="xs" fz={25} fw={700}>Troubleshooting</Text>
        <List size="sm" spacing="xs" mb="md">
            <List.Item>If you see an error about file type, check that your dataset is a <Code>.pkl</Code> file with the correct structure.</List.Item>
            <List.Item>If you have issues with project downloads, check that your project contains at least one test case.</List.Item>
        </List>

        <Divider my="md" />

        <Text size="sm" c="dimmed">
            For further assistance, contact the administrator or visit the project repository.
        </Text>

        <Group mt="xl" justify="center" gap="xl">
            <Author username={"elena-17"} />
            <Card shadow="sm" padding="lg" radius="md" withBorder h={275} w={200}>
                <Card.Section bg="white">
                    <Anchor href={"https://greenteamalarcos.uclm.es/index.php"} target="_blank" rel="noopener noreferrer" mt="xs">
                        <Image
                            src={alarcosLogo}
                            alt={"Green Team Alarcos"}
                            fit="cover"
                            radius="md"
                            height={200}
                        />
                    </Anchor>
                </Card.Section>
                <Text size='md' mt="md" ta='center' fw={700}>
                    Green Team Alarcos
                </Text>
            </Card>
        </Group>
    </Box>
);

export default HelpPage;
