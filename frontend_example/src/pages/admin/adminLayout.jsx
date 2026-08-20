import { AppShell, Flex, Group, Tooltip, Text, Button, useMantineColorScheme, ActionIcon, Center, Loader } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { StorageService } from "../../services/storageService";
import { Outlet } from "react-router-dom";
import { Icons } from "../../icons"
import ThemeChanger from '../../components/theme-changer';
import { Suspense } from 'react';

const AdminHomepage = () => {
    const { colorScheme } = useMantineColorScheme();
    const navigate = useNavigate();
    const storage = new StorageService();
    const email = storage.getItem('userEmail');


    const goHome = () => {
        navigate('/admin');
    }
    const logout = () => {
        storage.removeItem('token');
        storage.removeItem('refreshToken');
        storage.removeItem('userEmail');
        navigate('/')
    }

    const goUsers = () => {
        navigate('/admin/users');
    }

    const goDatabase = () => {
        navigate('/admin/datasets');
    }

    const goProjects = () => {
        navigate('/admin/projects');
    }

    const goJobs = () => {
        navigate('/admin/jobs');
    }

    return (
        <AppShell
            //layout='alt'
            header={{ height: 60 }}
            padding="md"
            styles={(theme) => ({
                header: { background: colorScheme === 'dark' ? theme.colors.green[9] : theme.colors.green[7], },
                navbar: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2], },
            })}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between" align="center" wrap="nowrap">
                    {/* Izquierda */}
                    <Text c="black">GREENN</Text>


                    {/* Derecha */}
                    <Flex
                        align="center"
                        gap="sm"
                        wrap="wrap"
                        justify="flex-end"
                        style={{ flex: 1, minWidth: 0 }}
                    >
                        <Group visibleFrom="md" gap="xs" wrap="wrap">
                            <Button
                                variant="subtle" color='black'
                                onClick={goHome}
                                leftSection={<Icons.Home size={20} />}
                                px="sm"
                            >
                                Home
                            </Button>
                            <Button
                                variant="subtle" color='black'
                                onClick={goUsers}
                                leftSection={<Icons.Users size={20} />}
                                px="sm"
                            >
                                Users
                            </Button>

                            <Button
                                variant="subtle" color='black'
                                onClick={goDatabase}
                                leftSection={<Icons.Database size={20} />}
                                px="sm"
                            >
                                Datasets
                            </Button>
                            <Button
                                variant="subtle" color='black'
                                onClick={goProjects}
                                leftSection={<Icons.ListUl size={20} />}
                                px="sm"
                            >
                                Projects
                            </Button>
                            <Button
                                variant="subtle" color='black'
                                onClick={goJobs}
                                leftSection={<Icons.Test size={20} />}
                                px="sm"
                            >
                                Jobs
                            </Button>

                            <Button
                                variant="subtle" color='black'
                                onClick={logout}
                                leftSection={<Icons.SignOut size={20} />}
                                px="sm"
                            >
                                Logout
                            </Button>
                        </Group>

                        <Group hiddenFrom="md" gap="md">
                            <ActionIcon variant="transparent" onClick={goHome} title="Home">
                                <Icons.Home size={28} color="black" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" onClick={goUsers} title="Project List">
                                <Icons.Users size={24} color="black" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" onClick={goDatabase} title="Project List">
                                <Icons.Database size={24} color="black" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" onClick={goProjects} title="Project List">
                                <Icons.ListUl size={24} color="black" />
                            </ActionIcon>
                            <ActionIcon variant="transparent" title="Results">
                                <Icons.Test size={24} color="black" />
                            </ActionIcon>

                            <ActionIcon variant="transparent" onClick={logout} title="Logout">
                                <Icons.SignOut size={28} color="black" />
                            </ActionIcon>
                        </Group>

                        {/* User info */}
                        <Flex align="center" gap="xs" style={{ maxWidth: 150, overflow: "hidden" }}>
                            <Icons.UserCircle size={28} color="black" />
                            <Tooltip label={email} withArrow >
                                <Text
                                    c="black"
                                    fw={500}
                                    size="sm"
                                    truncate
                                >
                                    {email}
                                </Text>
                            </Tooltip>
                        </Flex>

                        {/* Theme */}
                        <ThemeChanger />
                    </Flex>
                </Group>
            </AppShell.Header>

            <AppShell.Main >
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
        </AppShell>
    );
};

export default AdminHomepage;
