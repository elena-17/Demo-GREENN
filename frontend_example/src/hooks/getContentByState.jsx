import { Icons } from "../icons";

export function getContentByState(state) {
    switch (state) {
        case "pending":
            return {
                icon: (<Icons.Hourglass
                        size={28}
                        color="#94a3b8" />),
                text: "Training results will be available after the testCase is executed.",
                color: "dimmed",
            };
        case "failed":
            return {
                icon: (<Icons.TimesCircle
                        size={28}
                        color="#f87171" />),
                text: "The testCase has failed. Please check the configuration or logs for more details.",
                color: "red.5",
            };
        case "cancelled":
            return {
                icon: (<Icons.TimesCircle
                        size={28}
                        color="#f87171" />),
                text: "The testCase has been cancelled.",
                color: "red.5",
            };
        case "running":
            return {
                icon: (
                    <Icons.Spinner
                        size={24}
                        color="#60a5fa"
                        style={{ animation: "spin 1s linear infinite" }}
                    />
                ),
                text: "The testCase is currently running. Training results will be available once it is completed.",
                color: "blue.5",
            };
        default:
            return null;
    }
}
