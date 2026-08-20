// components/AuthLayout.jsx

import SignIn from "./SignIn"
import Register from "./register";
import { useState } from "react";

import { Transition, Flex, BackgroundImage  } from "@mantine/core";
import img_fondo from "../styles/fondo_verde_largo.png";

const AuthLayout = () => {
    const [authView, setAuthView] = useState("signin");

    const toggleView = () => {
        setAuthView((prev) => (prev === "signin" ? "register" : "signin"));
    };


    return (
        <Flex justify="center" align="center" h="100vh">
            <BackgroundImage
                src={img_fondo}
                style={{ width: "100vw", height: "100vh", position: "relative" }}
            >
                {/* Capa oscura encima de la imagen */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0, 0, 0, 0.3)",
                        zIndex: 1,
                    }}
                />
                <Flex
                    justify="center"
                    align="center"
                    h="100vh"
                    w="100vw"
                    style={{ position: "relative", zIndex: 2 }}
                >
                    <Transition
                        mounted={authView === "signin"}
                        transition="fade-right"
                        duration={300}
                        timingFunction="ease"
                    >
                        {(styles) => (
                            <div style={{ ...styles, position: "absolute", width: "100%" }}>
                                <SignIn onSwitch={toggleView} />
                            </div>
                        )}
                    </Transition>

                    <Transition
                        mounted={authView === "register"}
                        transition="fade-left"
                        duration={300}
                        timingFunction="ease"
                    >
                        {(styles) => (
                            <div style={{ ...styles, position: "absolute", width: "100%" }}>
                                <Register onSwitch={toggleView} />
                            </div>
                        )}
                    </Transition>
                </Flex>
            </BackgroundImage>
        </Flex>
    );
};

export default AuthLayout;
