import { Divider, Stack, Text } from "@mantine/core";

const TitleUnderlined = ({ title, subtitle }) => {

    return (
        <Stack gap={0} mb={20}>
            <Text size="lg" fw={500} mb={0} mt={{ base: "lg", md: "md" }}>
                {title}
            </Text>

            {subtitle &&
                <Text size="sm" c="dimmed" m={0}>{subtitle}</Text>
            }
            <Divider mt={0} />
        </Stack>
    );
};

export default TitleUnderlined;
