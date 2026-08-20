import { Switch, useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
import { Icons } from "../icons";
const ThemeChanger = () => {
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const { setColorScheme } = useMantineColorScheme();

    return (
        <Switch
            size="md"
            color="dark.4"
            checked={computedColorScheme === "dark"}
            onChange={() =>
                setColorScheme(computedColorScheme === "light" ? "dark" : "light")
            }
            onLabel={
                <Icons.Sun size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />
            }
            offLabel={
                <Icons.Moon size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />
            }
        />
    )
}

export default ThemeChanger;
