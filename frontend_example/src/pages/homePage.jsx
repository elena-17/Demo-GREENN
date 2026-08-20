import {
    Container,
    Stack,
    Button,
    Image,
    Title,
    useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import alarcosLogo from '../styles/logo.png';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    const navigate = useNavigate();

    const handleClick = () => {
       navigate('/help');
    }

    return (
        <Container
            px="md"
            py="xl"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                height: '80vh',
                maxWidth: 480,
            }}
        >
            {/* Logo */}
            <Image
                src={alarcosLogo}
                alt="Alarcos Logo"
                style={{
                    width: isMobile ? '60%' : '300px',
                    maxWidth: 300,
                    height: 'auto',
                    marginBottom: 30,
                }}
            />

            {/* Heading */}
            <Title
                order={2}
                mb="sm"
                style={{ fontSize: isMobile ? '1.5rem' : '2rem', textAlign: 'center' }}
            >
                GREENN
            </Title>
            <Title
                order={4}
                mb="xl"
                style={{ fontSize: isMobile ? '1rem' : '1.5rem', textAlign: 'center' }}
            >
                Discover Our Platform
            </Title>

            {/* Action Buttons */}
            <Stack spacing="sm">
                <Button variant="outline"  size={isMobile ? 'sm' : 'md'} onClick={handleClick}>
                    Learn More
                </Button>
            </Stack>
        </Container>
    );
};

export default HomePage;
