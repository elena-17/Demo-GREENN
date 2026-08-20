import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../styles/logo.png';
import { API_BASE_URL } from '../config';
import { TextInput, PasswordInput, Button, Flex, Title, Text, Paper, Notification, Anchor } from '@mantine/core';
import { StorageService } from '../services/storageService';
import { useProjects } from '../contexts/projectsContext';
import { notifications } from "@mantine/notifications";

const SignIn = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const storage = new StorageService();
  const { fetchProjects } = useProjects();

  const validateInputs = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!username) {
      newErrors.username = 'Email is required';
    } else if (!emailPattern.test(username)) {
      newErrors.username = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const sessionExpired = sessionStorage.getItem('sessionExpired');
    if (sessionExpired) {
      setShowSessionExpired(true);
      sessionStorage.removeItem('sessionExpired');
    }
    else {
      storage.removeItem('token');
      storage.removeItem('refreshToken');
      storage.removeItem('userEmail');

    }
    setTimeout(() => {
      setShowSessionExpired(false);
    }, 3000);

  }, []);

  const handleSignIn = async () => {
    if (validateInputs()) {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: username,
          password,
        });
        // Guarda el token en localStorage
        const { token, refreshToken, isAdmin } = response.data;
        storage.setItem('token', token);
        storage.setItem('refreshToken', refreshToken);
        storage.setItem('userEmail', username);
        storage.setItem('isAdmin', isAdmin);
        setLoading(false);
        // Redirige según el rol de usuario
        if (isAdmin) {
          navigate('/admin'); // Redirige al panel de administración
        } else {
          await fetchProjects();
          navigate('/homepage'); // Redirige a la lista de proyectos
        }
      } catch (error) {
        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'An unexpected error occurred';
        setAuthError(errorMessage);
        setLoading(false);
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red',
        });
      }
    }
  };

  return (
    <Flex justify="center" align="center">
      {showSessionExpired && (
        <Notification
          color="red"
          title="Session Expired"
          onClose={() => setShowSessionExpired(false)}
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999, // Ensure it appears above the Paper component
          }}
        >
          Your session has expired. Please sign in again.
        </Notification>
      )}
      <Paper shadow="lg" ta="center" p="md" radius="md" maw={300} w="100%" withBorder>
        <img src={logo} alt="System Logo" style={{ width: 150 }} />
        <Title order={2} style={{ marginBottom: 20 }}>Sign in</Title>
        <TextInput
          label="Username"
          placeholder="Enter your email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          labelProps={{ style: { fontWeight: "bold", textAlign: "left", width: "100%" } }}
          mt="md"
        />
        <PasswordInput
          label="Password"
          placeholder='Enter your password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          labelProps={{ style: { fontWeight: "bold", textAlign: "left", width: "100%" } }}
          mt="md"
        />
        {authError && <Text c="red" size="sm" style={{ marginTop: 10 }}>{authError}</Text>}
        <Button fullWidth onClick={handleSignIn} style={{ marginTop: 20 }} disabled={!username && !password}
          loading={loading}>
          Sign In
        </Button>
        <Text size="sm" mt="md" c="dimmed">
          Don't have an account?{' '}
          <Anchor size="sm" onClick={onSwitch} component='button'>
            Register here
          </Anchor>
        </Text>
      </Paper>
    </Flex>

  );
};


export default SignIn;
