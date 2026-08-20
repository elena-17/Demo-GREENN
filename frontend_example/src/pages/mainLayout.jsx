// MainLayout based on mantine AppShell component: https://mantine.dev/app-shell/?e=CollapseDesktop&s=demo
import { AppShell, Burger, Group, Text, Flex, ActionIcon, Button, NavLink as ManNavLink, Loader, Stack, TextInput, Textarea, Anchor, useMantineColorScheme, ScrollArea, Center, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { StorageService } from '../services/storageService';
import { ProjectService } from "../services/projectsService";
import { modals } from '@mantine/modals';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/projectsContext';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import ThemeChanger from '../components/theme-changer';
import { Icons } from '../icons';
import { useEffect, Suspense } from 'react';
import App from '../App';


const MainLayout = () => {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

    const { projects, loading, addProject, fetchProjects } = useProjects();

    const location = useLocation();
    const navigate = useNavigate();

    const { colorScheme } = useMantineColorScheme();

    const storage = new StorageService();
    const email = storage.getItem('userEmail');

    useEffect(() => {
        fetchProjects();
    }, []);

    const logout = () => {
        storage.clear();
        navigate('/')
    }

    const goHome = () => {
        navigate('/homepage');
    }

    const goProjects = () => {
        navigate('/projects');
    }

    const handleCreateProject = () => {
        let projectName = "";
        let projectDescription = "";

        modals.openConfirmModal({
            title: 'Create Project',
            children: (
                <Stack>
                    <TextInput
                        label="Project Name"
                        placeholder="Enter project name"
                        required
                        onChange={(event) => projectName = event.currentTarget.value}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Enter project description (optional)"
                        onChange={(event) => projectDescription = event.currentTarget.value}
                    />
                </Stack>
            ),
            labels: { confirm: 'Create', cancel: 'Cancel' },
            confirmProps: { color: 'green' },
            onConfirm: () => {
                if (!projectName.trim()) {
                    notifications.show({
                        title: 'Error',
                        message: 'Project name cannot be empty',
                        color: 'red',
                    });
                    return;
                }
                //handleAddProject(projectName, projectDescription);
            },
        });
    };

    const handleAddProject = async (projectName, projectDescription) => {
        try {
            const data = await ProjectService.createProject(projectName, projectDescription);

            const newP = data.project;

            addProject(newP);

        } catch (error) {
            console.error("Error saving the project:", error);
            notifications.show({
                title: 'Error',
                message: 'Error saving the project',
                color: 'red',
            });
        }
    };

    const handleNewTestCase = (projectID) => {
        navigate(`/newtestCase/${projectID}`);
    }

    return (
        <AppShell
            //layout='alt'
            header={{ height: 60 }}
            navbar={{
                width: { base: 250, lg: 350 },
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
            padding="md"
            styles={(theme) => ({
                header: { background: colorScheme === 'dark' ? theme.colors.green[9] : theme.colors.green[7], },
                navbar: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2], },
            })}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between" align="center" wrap="nowrap">
                    {/* Izquierda */}
                    <Group>
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" color="black" />
                        <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" color="black" />
                        <Text c="black">GREENN</Text>
                    </Group>

                    {/* Derecha */}
                    <Flex
                        align="center"
                        gap="sm"
                        wrap="wrap"
                        justify="flex-end"
                        style={{ maxWidth: "60%" }} // limite para que no invada toda la cabecera
                    >

                        <Button
                            variant="subtle" color='black'
                            onClick={goHome}
                            leftSection={<Icons.Home size={20} />}
                            visibleFrom="md"
                            px="sm"
                        >
                            Home
                        </Button>
                        <Button
                            variant="subtle" color='black'
                            onClick={goProjects}
                            leftSection={<Icons.ListUl size={20} />}
                            visibleFrom="md"
                            px="sm"
                        >
                            Projects
                        </Button>
                        <Button
                            variant="subtle" color='black'
                            onClick={logout}
                            leftSection={<Icons.SignOut size={20} />}
                            visibleFrom="md"
                            px="sm"
                        >
                            Logout
                        </Button>

                        <Group hiddenFrom="md" gap="md">
                            <ActionIcon variant="transparent" onClick={goHome} title="Home">
                                <Icons.Home size={28} color="black" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" onClick={goProjects} title="Project List">
                                <Icons.ListUl size={24} color="black" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" onClick={logout} title="Logout">
                                <Icons.SignOut size={28} color="black" />
                            </ActionIcon>
                        </Group>

                        {/* User info */}
                        <Flex align="center" gap="xs" style={{ maxWidth: 200, overflow: "hidden" }}>
                            <Icons.UserCircle size={28} color="black" />
                            <Text
                                c="black"
                                fw={500}
                                size="sm"
                                truncate
                            >
                                {email}
                            </Text>
                        </Flex>

                        {/* Theme */}
                        <ThemeChanger />
                    </Flex>
                </Group>
            </AppShell.Header>


            <AppShell.Navbar p="md" >
                <AppShell.Section>
                    <Button w="100%"
                        onClick={handleCreateProject}
                        variant="filled"
                        leftSection={<Icons.FolderPlus />}
                        style={(theme) => ({
                            backgroundColor: theme.colors.green[7],
                        })}
                        title="Create a new project"
                    >
                        Create Project
                    </Button>

                </AppShell.Section>

                <AppShell.Section grow my="md"
                    component={ScrollArea}>

                    {loading ? (
                        <Flex justify="center" align="center" w="100%" mt={30}>
                            <Loader size="md" />
                        </Flex>
                    ) : (
                        projects.map((project) => (
                            <ManNavLink
                                key={project.id}
                                label={project.projectName}
                                leftSection={<Icons.Folder />}
                                childrenOffset={40}
                                active={location.pathname === `/projects/${project.id}`}
                                onClick={() => navigate(`/projects/${project.id}`)}
                                variant='subtle'
                            >

                                {project.TestCases && project.TestCases.length > 0 ? (
                                    <ManNavLink
                                        label="Add new Test Case"
                                        leftSection={<Icons.Plus />}
                                        onClick={() => handleNewTestCase(project.id)}
                                        p={0}
                                        pt={5}
                                        c="dimmed"
                                        size="xs"
                                    />
                                ) : (
                                    <Anchor component="button" size="xs" c="dimmed" onClick={handleNewTestCase.bind(null, project.id)}>
                                        No test cases found. Click to add one.
                                    </Anchor>
                                )}


                                {project.TestCases && project.TestCases.map((exp) => (
                                    <ManNavLink
                                        key={exp.id}
                                        label={exp.name}
                                        leftSection={<Icons.File />}
                                        p={0}
                                        pt={5}
                                        component={Link}
                                        to={`/testCases/${exp.id}`}
                                        active={location.pathname === `/testCases/${exp.id}`}
                                        variant="subtle"
                                    />
                                ))}
                            </ManNavLink>
                        ))
                    )}
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main mb={50}>
                <Suspense
                    fallback={
                        <Center style={{ height: '100vh' }}>
                            <Loader size="lg" type="dots" />
                        </Center>
                    }
                >
                    <Outlet />
                </Suspense>
            </AppShell.Main>
            <AppShell.Footer height={50} p="md" style={{ backgroundColor: '#ffcc00ff' }}>
                <Text size="sm" weight={700} align="center" c="black">
                    DEMO VERSION – Note that some functionalities might be disabled
                </Text>
            </AppShell.Footer>


        </AppShell>
    );
};

export default MainLayout;
