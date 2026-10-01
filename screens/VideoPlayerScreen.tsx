import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, PanResponder, Animated, Modal, ScrollView, ActivityIndicator } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoPlayer, VideoView } from 'expo-video';
import { useEvent, useEventListener } from 'expo';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from "expo-status-bar";
import Icon from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import AudioPicker from './AudioPicker';
import SubtitlePicker from './SubtitlePicker';

const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const TimeSlider = ({ player, controlsOpen }: any) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [sliderWidth, setSliderWidth] = useState(0);
    const [sliderPageX, setSliderPageX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const viewRef = useRef<View>(null);
    const controlsAnimation = useRef(new Animated.Value(controlsOpen ? 0 : 1)).current;

    useEffect(() => {
        Animated.timing(controlsAnimation, {
            toValue: controlsOpen ? 0 : 1,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [controlsAnimation, controlsOpen]);

    useEventListener(player, "timeUpdate", () => {
        if (!dragging) {
            setCurrentTime(player.currentTime);
        }
    });

    const updateSliderWidth = () => {
        viewRef.current?.measure((x, y, width, height, pageX) => {
            setSliderWidth(width);
            setSliderPageX(pageX);
        });
    };

    const seekToGesture = (clientX: number) => {
        if (!sliderWidth || !player.duration) return;
        const touchX = clientX - sliderPageX;
        const position = Math.max(0, Math.min(touchX, sliderWidth));
        const time = (position / sliderWidth) * player.duration;
        setCurrentTime(time);
        return time;
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
            setDragging(true);
            seekToGesture(event.nativeEvent.pageX);
        },
        onPanResponderMove: (event, gestureState) => {
            seekToGesture(gestureState.moveX);
        },
        onPanResponderRelease: (event, gestureState) => {
            setDragging(false);
            const finalTime = seekToGesture(gestureState.moveX);
            if (finalTime !== undefined) {
                player.currentTime = finalTime;
            }
        },
        onPanResponderTerminate: () => {
            setDragging(false);
        },
    });

    const progress = player.duration ? Math.min(currentTime / player.duration, 1) : 0;

    return (
        <Animated.View pointerEvents={controlsOpen ? 'auto' : 'none'} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', justifyContent: "flex-end", paddingBottom: 30, opacity: controlsAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: controlsAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) }] }}>
            <View ref={viewRef} onLayout={updateSliderWidth} {...panResponder.panHandlers} style={{ marginLeft: "5%", width: "90%", height: 30, justifyContent: 'center' }}>
                <View style={{ width: "100%", height: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c", borderRadius: 6, justifyContent: 'center' }}>
                    <View style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: "#ffffff84", borderBottomLeftRadius: 6, borderTopLeftRadius: 6, position: 'relative' }} />
                    <View style={{ position: 'absolute', left: `${progress * 100}%`, transform: [{ translateX: -8 }], width: dragging ? 20 : 16, height: dragging ? 20 : 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c", borderRadius: 20 }} />
                </View>
            </View>
            <View style={{ marginLeft: "5%", width: "90%", flexDirection: "row", justifyContent: "space-between", paddingTop: 5 }}>
                <Text style={{ color: "white", fontSize: 12, marginTop: 4 }}>{formatTime(currentTime)}</Text>
                <Text style={{ color: "white", fontSize: 12, marginTop: 4 }}>{formatTime(player.duration)}</Text>
            </View>
        </Animated.View>
    );
};

const TopControls = ({ contentFit, title, controlsOpen, onBackPress, setContentFit, setControlsOpen, player }: any) => {
    const controlsAnimation = useRef(new Animated.Value(controlsOpen ? 0 : 1)).current;

    useEffect(() => {
        Animated.timing(controlsAnimation, {
            toValue: controlsOpen ? 0 : 1,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [controlsAnimation, controlsOpen]);

    const [audioOpen, setAudioOpen] = useState(false);
    const [subtitlesOpen, setSubtitlesOpen] = useState(false);

    const closeAudioPicker = () => {
        setAudioOpen(false);
        setControlsOpen(true);
    };

    const closeSubtitlesPicker = () => {
        setSubtitlesOpen(false);
        setControlsOpen(true);
    };

    return (
        <Animated.View style={{ position: "absolute", top: 0, left: 0, width: "100%", paddingHorizontal: "5%", paddingTop: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "center", transform: [{ translateY: controlsAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) }], opacity: controlsAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                <Pressable onPress={onBackPress} style={{ width: 40, height: 40, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c" }}>
                    <Icon name="arrow-left" size={20} color="white" />
                </Pressable>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "bold", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c", height: 40, borderRadius: 40, verticalAlign: "middle", paddingHorizontal: 20, maxWidth: "100%", textAlign: "center" }} numberOfLines={1}>
                    {title || "Untitled"}
                </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                <Pressable onPress={() => { setControlsOpen(false); setSubtitlesOpen(true); }} style={{ height: 40, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c", flexDirection: "row", paddingHorizontal: 15, gap: 10 }}>
                    <Icon name="closed-captioning" size={20} color="white" />
                    <Text style={{ color: "white", fontSize: 14 }}>Subtitles</Text>
                </Pressable>
                <Pressable onPress={() => { setControlsOpen(false); setAudioOpen(true); }} style={{ height: 40, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c", flexDirection: "row", paddingHorizontal: 15, gap: 10 }}>
                    <Icon name="volume-high" size={20} color="white" />
                    <Text style={{ color: "white", fontSize: 14 }}>Audio</Text>
                </Pressable>
                <Pressable onPress={() => { setContentFit((prev: string) => prev === "cover" ? "contain" : prev === "contain" ? "fill" : "cover") }} style={{ width: 40, height: 40, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c" }}>
                    <Icon name={contentFit === "cover" ? "maximize" : contentFit === "contain" ? "minimize" : "arrows-up-down-left-right"} size={20} color="white" />
                </Pressable>
            </View>
            {audioOpen && <AudioPicker audioOpen={audioOpen} closeAudioPicker={closeAudioPicker} player={player} />}
            {subtitlesOpen && <SubtitlePicker open={subtitlesOpen} closeSubtitlesPicker={closeSubtitlesPicker} player={player} />}
        </Animated.View>
    );
}

const ErrorModal = ({ onRetry, onClose }: any) => {
    return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#151515', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', alignItems: 'center' }}>
                <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255, 70, 70, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 70, 70, 0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Text style={{ color: '#ff5555', fontSize: 30, fontWeight: '700' }}>!</Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 21, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>Unable to Play Video</Text>
                <Text style={{ color: '#b8b8b8', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 12 }}>
                    We couldn't play this video right now. The video may be unavailable in your current region or there may be a network issue.
                </Text>
                <Text style={{ color: '#999', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 22 }}>
                    If the problem continues, try connecting to a <Text style={{ color: '#fff', fontWeight: '600' }}>VPN</Text> server in{' '}
                    <Text style={{ color: '#fff', fontWeight: '600' }}>India, Singapore, Netherlands, or Russia</Text>{' '}
                    and try again.
                </Text>
                <View style={{ width: '100%', gap: 10 }}>
                    {onRetry && (
                        <Pressable style={({ pressed }) => ({ height: 48, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })} onPress={onRetry}>
                            <Text style={{ color: '#000', fontSize: 15, fontWeight: '700' }}>Try Again</Text>
                        </Pressable>
                    )}
                    <Pressable onPress={onClose} style={({ pressed }) => ({ height: 48, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    </Modal>
}

const VideoPlayerScreen = ({ route }: any) => {
    const { url, title } = route.params;

    const player = useVideoPlayer({ uri: url, headers: { Referer: "https://net52.cc", "X-Requested-With": "NetmirrorNewTV v1.0" } }, p => p.play());
    const { isPlaying } = useEvent(player, "playingChange", { isPlaying: false });
    const [controlsOpen, setControlsOpen] = useState(true);
    const [contentFit, setContentFit] = useState<"cover" | "contain" | "fill">("cover");
    const navigation = useNavigation();
    const videoWidth = useRef(0);
    const pendingTap = useRef<{ side: "left" | "right"; timeout: ReturnType<typeof setTimeout> } | null>(null);
    const [errorMessage, setErrorMessage] = useState(false);

    const { error, status }: any = useEvent(player, "statusChange", { error: undefined, status: "idle" });

    useEffect(() => {
        if (error) setErrorMessage(true);
        else setErrorMessage(false);
    }, [error]);

    const handleVideoTap = (event: any) => {
        if (controlsOpen) {
            setControlsOpen(false);
            return;
        }

        const side = event.nativeEvent.locationX < videoWidth.current / 2 ? "left" : "right";
        if (pendingTap.current?.side === side) {
            clearTimeout(pendingTap.current.timeout);
            pendingTap.current = null;
            player.currentTime = side === "left" ? Math.max(player.currentTime - 10, 0) : Math.min(player.currentTime + 10, player.duration);
            return;
        }

        if (pendingTap.current) clearTimeout(pendingTap.current.timeout);
        const timeout = setTimeout(() => {
            pendingTap.current = null;
            setControlsOpen(true);
        }, 280);
        pendingTap.current = { side, timeout };
    };

    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        NavigationBar.setHidden(true);
        StatusBar.setHidden(true, "fade");
        player.timeUpdateEventInterval = 1;
        return () => {
            if (pendingTap.current) clearTimeout(pendingTap.current.timeout);
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            NavigationBar.setHidden(false);
            StatusBar.setHidden(false, "fade");
        };
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <VideoView nativeControls={false} player={player} style={{ width: '100%', height: '100%' }} contentFit={contentFit} />
            <Pressable onLayout={({ nativeEvent }) => { videoWidth.current = nativeEvent.layout.width; }} onPress={handleVideoTap} style={{ position: 'absolute', top: 0, left: 0, flex: 1, width: '100%', height: '100%', backgroundColor: controlsOpen ? 'rgba(0,0,0,0.5)' : 'transparent' }} />
            <TopControls player={player} setControlsOpen={setControlsOpen} contentFit={contentFit} setContentFit={setContentFit} title={title} controlsOpen={controlsOpen} onBackPress={() => navigation.goBack()} />
            {controlsOpen && (<View style={{ position: 'absolute', top: 0, left: 0, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', pointerEvents: controlsOpen ? 'auto' : 'none', gap: "15%" }}>
                <Pressable onPress={() => player.currentTime = (Math.max(player.currentTime - 10, 0))}>
                    <Icon name="angles-left" size={24} color="white" />
                </Pressable>
                <Pressable onPress={() => isPlaying ? player.pause() : player.play()} style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c" }}>
                    {status === "loading" ? <ActivityIndicator color={"white"} size={30} /> : <Icon name={isPlaying ? "pause" : "play"} size={30} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />}
                </Pressable>
                <Pressable onPress={() => player.currentTime = Math.min(player.currentTime + 10, player.duration)}>
                    <Icon name="angles-right" size={24} color="white" />
                </Pressable>
            </View>)}
            <TimeSlider player={player} controlsOpen={controlsOpen} />
            {errorMessage && <ErrorModal onClose={() => setErrorMessage(false)} />}
        </View>
    );
};

export default VideoPlayerScreen;
