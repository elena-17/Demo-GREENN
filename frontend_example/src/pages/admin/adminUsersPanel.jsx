import { useState, useEffect } from 'react';
import {
    Box, Title, Text, Table, TextInput,
    PasswordInput, Button, Group, Modal,
    Badge, Select, LoadingOverlay, ActionIcon,
    Tooltip, Stack, useMantineTheme, useComputedColorScheme
} from '@mantine/core';

import { Icons } from '../../icons';
import { AdminService } from '../../services/adminService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import SecurePasswordInput from '../../components/secure-passwordInput';


const AdminUsersPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [errorMatch, setErrorMatch] = useState(false);
    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isDark = computedColorScheme === 'dark';


    // Form states
    const [editForm, setEditForm] = useState({
        email: '',
        role: 'user'
    });
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await AdminService.getUsers();
                setUsers(response);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Handle edit user
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditForm({
            email: user.email,
            role: user.role
        });
        setEditModalOpen(true);
    };

    // Handle password reset
    const handlePasswordReset = (user) => {
        setSelectedUser(user);
        setPasswordForm({
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordModalOpen(true);
    };

    // Submit edited user
    const submitEditUser = async () => {
        try {
            // Reemplaza con tu API real
            await AdminService.updateUser(selectedUser.email, editForm.role);
            setUsers(users.map(u => u.email === selectedUser.email ? { ...u, ...editForm } : u));
            setEditModalOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to update user' || error.message,
                color: 'red',
            });
        }
    };

    // Submit password change
    const submitPasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setErrorMatch(true);
            notifications.show({
                title: 'Error',
                message: 'Passwords do not match',
                color: 'red',
            });
            return;
        }

        try {
            // Reemplaza con tu API real
            await AdminService.updatePassword(selectedUser.email, passwordForm.newPassword);

            setPasswordModalOpen(false);
        } catch (error) {
            console.error('Error updating password:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to update password',
                color: 'red',
            });
        }
    };

    const handleDeleteUserModal = (email) => {
        modals.openConfirmModal({
            title: 'Delete Project',
            children: (
                <Text size="md" style={{ wordWrap: 'break-word' }}>
                    Are you sure you want to delete user <strong>"{email}"</strong>?
                    <br />
                    This action will delete all associated test cases and data.
                    <br />
                    <strong>WARNING:</strong> This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => handleDeleteUser(email),
        });
    }

    // Handle delete user
    const handleDeleteUser = async (email) => {
        try {
            await AdminService.deleteUser(email);
            setUsers(users.filter(u => u.email !== email));
        } catch (error) {
            console.error('Error deleting user:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to delete user',
                color: 'red',
            });
        }
    };

    return (
        <Box p="xl" mx="auto" style={{ maxWidth: 1000 }}>
            <Title order={1} ta="center" mb="xl">USER MANAGEMENT</Title>

            {/* Filtros y búsqueda */}
            <Group mb="xl" grow>
                <TextInput
                    placeholder="Search users..."
                    leftSection={<Icons.User size={16} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                    data={[
                        { value: 'all', label: 'All Roles' },
                        { value: 'admin', label: 'Admins' },
                        { value: 'user', label: 'Regular Users' }
                    ]}
                    value={roleFilter}
                    onChange={setRoleFilter}
                />
            </Group>

            {/* Tabla de usuarios */}
            <Box style={{ position: 'relative' }}>
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

                <Table striped highlightOnHover>
                    <Table.Thead bg={isDark ? theme.colors.dark[7] : theme.colors.gray[1]}>
                        <Table.Tr>
                            <Table.Th>Email</Table.Th>
                            <Table.Th>Role</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredUsers.map(user => (
                            <Table.Tr key={user.email}>
                                <Table.Td>{user.email}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={user.role === 'admin' ? 'blue' : 'orange'}
                                        variant="light"
                                    >
                                        {user.role}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Tooltip label="Edit user">
                                            <ActionIcon
                                                variant="subtle"
                                                color="blue"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Icons.Edit size={16} />
                                            </ActionIcon>
                                        </Tooltip>

                                        <Tooltip label="Reset password">
                                            <ActionIcon
                                                variant="subtle"
                                                color="orange"
                                                onClick={() => handlePasswordReset(user)}
                                            >
                                                <Icons.PasswordLock size={18} />
                                            </ActionIcon>
                                        </Tooltip>

                                        <Tooltip label="Delete user">
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleDeleteUserModal(user.email)}
                                            >
                                                <Icons.Delete size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Box>

            {/* Modal de edición */}
            <Modal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit User"
            >
                <Stack>
                    <TextInput
                        label="Email"
                        value={editForm.email}
                        disabled
                    />
                    <Select
                        label="Role"
                        data={[
                            { value: 'admin', label: 'Admin' },
                            { value: 'user', label: 'User' }
                        ]}
                        value={editForm.role}
                        onChange={(value) => setEditForm({ ...editForm, role: value })}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitEditUser}>
                            Save Changes
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Modal de cambio de contraseña */}
            <Modal
                opened={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                title={`Reset Password`}
            >
                <Stack>
                    <SecurePasswordInput
                        label="New Password"
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                            setErrorMatch(false);
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                        }}
                        error={errorMatch ? 'Passwords do not match' : null}
                    />
                    <PasswordInput
                        label="Confirm Password"
                        withAsterisk
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={submitPasswordChange}
                        >
                            Save Changes
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Box>
    );
};

export default AdminUsersPanel;
