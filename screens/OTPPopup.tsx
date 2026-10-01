import React, { useEffect, useRef, useState } from "react";
import { Alert, Linking, Modal, Pressable, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../components/Button";

const OTPNumber = ({
    value,
    index,
    inputRefs,
    onChange,
}: {
    value: string;
    index: number;
    inputRefs: React.MutableRefObject<(TextInput | null)[]>;
    onChange: (value: string, index: number) => void;
}) => {
    return (
        <TextInput
            ref={ref => {
                inputRefs.current[index] = ref;
            }}
            value={value}
            maxLength={1}
            keyboardType="number-pad"
            selectTextOnFocus
            onChangeText={text => {
                const value = text.replace(/\D/g, "").slice(-1);
                onChange(value, index);
            }}
            style={{
                width: 34,
                height: 45,
                borderRadius: 6,
                color: "white",
                backgroundColor: "#2a2a2a",
                borderColor: "#525252",
                borderWidth: 1,
                fontSize: 20,
                textAlign: "center",
                fontFamily: "InterRegular",
                padding: 0,
            }}
        />
    );
};

const OTPPopup = ({ onClose }: { onClose: (success: boolean) => void }) => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const updateOTP = (value: string, index: number) => {
        const digits = otp.split("");

        while (digits.length < 6) {
            digits.push("");
        }

        if (!value) {
            digits[index] = "";
            setOtp(digits.join(""));

            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }

            return;
        }

        digits[index] = value;

        const newOtp = digits.join("");
        setOtp(newOtp);

        if (index < 5) {
            inputRefs.current[index + 1]?.focus();
            return;
        }

        if (index === 5 && newOtp.length === 6) {
            onFinish(newOtp);
        }
    };

    const clear = () => {
        setOtp("");

        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 50);
    };

    const onFinish = (otpValue = otp) => {
        if (otpValue.length !== 6 || loading) {
            return;
        }

        setLoading(true);

        fetch("https://tv.imgcdn.kim/newtv/otp.php", {
            headers: {
                otp: otpValue,
            },
        })
            .then(res => res.json())
            .then(async data => {
                setLoading(false);

                if (data.status === "ok") {
                    await AsyncStorage.setItem(
                        "netmirrorUserToken",
                        data.usertoken
                    );

                    onClose(true);
                } else {
                    Alert.alert(
                        "Error",
                        data.message || "Invalid OTP"
                    );

                    clear();
                }
            })
            .catch(err => {
                setLoading(false);

                Alert.alert(
                    "Error",
                    err.message || "Something went wrong"
                );
            });
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible
            onRequestClose={() => onClose(false)}
        >
            <View
                style={{
                    position: "absolute",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000000a9",
                }}
            >
                <View
                    style={{
                        backgroundColor: "#000000a0",
                        borderRadius: 15,
                        width: "85%",
                        paddingVertical: 40,
                        borderWidth: 1,
                        borderColor: "#000000",
                    }}
                >
                    <View style={{ alignItems: "center", gap: 50 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                gap: 20,
                                alignItems: "flex-start",
                                width: "70%",
                            }}
                        >
                            <Text
                                style={{
                                    width: 22,
                                    color: "white",
                                    fontWeight: "bold",
                                    backgroundColor: "#e0efff85",
                                    borderRadius: 50,
                                    aspectRatio: 1,
                                    textAlign: "center",
                                    borderWidth: 1,
                                    borderColor: "#ffffff75",
                                    verticalAlign: "middle",
                                }}
                            >
                                1
                            </Text>

                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 2,
                                    flexWrap: "wrap",
                                    width: "100%",
                                }}
                            >
                                <Text
                                    style={{
                                        color: "white",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Open{" "}
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        Linking.openURL(
                                            "https://netmirror.gg/tv"
                                        )
                                    }
                                >
                                    <Text
                                        style={{
                                            color: "#4da6ff",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            textDecorationLine: "underline",
                                        }}
                                    >
                                        https://netmirror.gg/tv
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View style={{ alignItems: "center" }}>
                        <View
                            style={{
                                flexDirection: "row",
                                gap: 20,
                                alignItems: "flex-start",
                                paddingTop: 30,
                                width: "70%",
                            }}
                        >
                            <Text
                                style={{
                                    width: 22,
                                    color: "white",
                                    fontWeight: "bold",
                                    backgroundColor: "#e0efff85",
                                    borderRadius: 50,
                                    aspectRatio: 1,
                                    textAlign: "center",
                                    borderWidth: 1,
                                    borderColor: "#ffffff75",
                                    verticalAlign: "middle",
                                }}
                            >
                                2
                            </Text>

                            <Text
                                style={{
                                    color: "white",
                                    fontWeight: "bold",
                                }}
                                numberOfLines={2}
                            >
                                Enter Your 6-digit OTP Code
                            </Text>
                        </View>

                        <Text
                            style={{
                                color: "white",
                                marginTop: 20,
                            }}
                        >
                            Try 111111 if error in website
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 10,
                                paddingTop: 30,
                                marginBottom: 30,
                            }}
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <OTPNumber
                                    key={index}
                                    value={otp.charAt(index)}
                                    index={index}
                                    inputRefs={inputRefs}
                                    onChange={updateOTP}
                                />
                            ))}
                        </View>

                        <View style={{ width: "70%" }}>
                            <Button
                                title="Verify OTP"
                                onPress={() => onFinish()}
                                loading={loading}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default OTPPopup;