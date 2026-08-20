import { useEffect, useState } from "react";
import { Card, Image, Text, Anchor, Loader, Center, Skeleton } from "@mantine/core";


const Author = ({ username }) => {
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthor = async () => {
            if (!username) {
                console.error("No username provided");
                return;
            }
            //console.log(`Fetching data for username: ${username}`);
            try {
                const response = await fetch(`https://api.github.com/users/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setAuthor(data);
                } else {
                    console.error(`Error fetching user: ${response.status}`);
                }
            } catch (error) {
                console.error(`Error fetching user: ${error}`);
            } finally {
                setLoading(false);
            }
        };
        fetchAuthor();
    }, [username]);

    if (loading) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder h={275} w={200} >
                <Card.Section bg="white">
                    <Skeleton height={200} radius="md" />
                </Card.Section>
                <Loader size="md" mt="md" variant="dots" />
            </Card>
        );
    }

    if (!author) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder h={275} w={200} >
                <Card.Section bg="white">
                    <Skeleton height={200} radius="md" />
                </Card.Section>
                <Text size='lg' mt="md" ta='center' fw={700}>
                    User not found
                </Text>
            </Card>
        );
    }

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder h={275} w={200} >
            <Card.Section bg="white">
                <Anchor href={author.html_url} target="_blank" rel="noopener noreferrer" mt="xs">
                    <Image
                        src={author.avatar_url}
                        alt={author.login}
                        fit="cover"
                        radius="md"
                        height={200}
                    />
                </Anchor>
            </Card.Section>
            <Text size='lg' mt="md" ta='center' fw={700}>
                {author.login}
            </Text>
        </Card>
    );
};

export default Author;
