import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../styles/logo.png';
import { TextInput, PasswordInput, Button, Flex, Title, Text, Paper, Anchor } from '@mantine/core';
import { StorageService } from '../services/storageService';
import { useProjects } from '../contexts/projectsContext';
import { AuthService } from '../services/authService';
import { notifications } from '@mantine/notifications';
import SecurePasswordInput from '../components/secure-passwordInput';


const Register = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [acceptedPassword, setAcceptedPassword] = useState(false);
  const navigate = useNavigate();

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
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      newErrors.password = 'Passwords do not match';
    }
    if (!acceptedPassword) {
      newErrors.password = 'Password does not meet the requirements';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleRegister = async () => {
    if (validateInputs()) {
      try {
        const response = await AuthService.register(username, password);
        notifications.show({
          title: "Success",
          message: "Registration successful!",
        });
        handleSignIn(username, password);
      } catch (error) {
        console.error("Error during registration:", error);
        notifications.show({
          title: "Error",
          message: `Registration failed: ${error.message}`,
          color: "red",
        });
      }
    }
  };

  const handleSignIn = async () => {
    if (validateInputs()) {
      try {
        const response = await AuthService.login(username, password);
        // Guarda el token en localStorage
        const { token, refreshToken, isAdmin } = response;
        storage.setItem('token', token);
        storage.setItem('refreshToken', refreshToken);
        storage.setItem('userEmail', username);
        storage.setItem('isAdmin', isAdmin);
        // Redirige según el rol de usuario
        if (isAdmin) {
          navigate('/admin');
          await fetchProjects();
        } else {
          navigate('/homepage');
        }
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Login failed. Please check your credentials.",
          color: "red",
        });
      }
    }
  };

  return (
    <Flex justify="center" align="center">

      <Paper shadow="lg" ta="center" p="md" radius="md" maw={300} w="100%" withBorder>
        <img src={logo} alt="System Logo" style={{ width: 150 }} />
        <Title order={2} style={{ marginBottom: 20 }}>Register</Title>
        <TextInput
          label="Username"
          placeholder="Enter your email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          labelProps={{ style: { fontWeight: "bold", textAlign: "left", width: "100%" } }}
          mt="md"
        />

        <SecurePasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          labelProps={{ style: { fontWeight: 'bold', textAlign: 'left', width: '100%' } }}
          mt="md"
          setAccepted={setAcceptedPassword}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder='Enter your password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          labelProps={{ style: { fontWeight: "bold", textAlign: "left", width: "100%" } }}
          mt="md"
        />
        {authError && <Text c="red" size="sm" style={{ marginTop: 10 }}>{authError}</Text>}
        <Button fullWidth onClick={handleRegister} style={{ marginTop: 20 }} disabled={!username && !password}>
          Register
        </Button>
        <Text size="sm" mt="md" c="dimmed">
          Already have an account?{' '}
          <Anchor size="sm" onClick={onSwitch} component='button'>
            Login here
          </Anchor>
        </Text>
      </Paper>
    </Flex>

  );
};

export default Register;
