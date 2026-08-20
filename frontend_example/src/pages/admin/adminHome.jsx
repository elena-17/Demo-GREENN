import {
    Container,
    Image,
    Title,
    useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import alarcosLogo from '../../styles/logo.png';

const AdminHome = () => {
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

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
                maxWidth: 520,
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
                style={{ fontSize: isMobile ? '1.5rem' : '2rem', textAlign: 'center' }}
            >
                Welcome to
            </Title>
            <Title
                order={2}
                mb="xl"
                style={{ fontSize: isMobile ? '1.5rem' : '2rem', textAlign: 'center' }}
            >
                GREENN's Administration Panel
            </Title>

        </Container>
    );
};

export default AdminHome;
