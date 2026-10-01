import { useEvent } from "expo";
import { Modal, Pressable, View, Text, ScrollView } from "react-native";

const AudioPicker = ({ audioOpen, closeAudioPicker, player }: { audioOpen: boolean; closeAudioPicker: () => void; player: any }) => {
    const { availableAudioTracks } = useEvent(player, "availableAudioTracksChange", {
        availableAudioTracks: player.availableAudioTracks,
    });
    const { audioTrack: selectedAudioTrack } = useEvent(player, "audioTrackChange", {
        audioTrack: player.audioTrack,
    });

    const isSelectedTrack = (track: any) => {
        if (!selectedAudioTrack) return false;
        if (track.id && selectedAudioTrack.id) return track.id === selectedAudioTrack.id;
        return track.name === selectedAudioTrack.name
            && track.label === selectedAudioTrack.label
            && track.language === selectedAudioTrack.language;
    };
    return (<Modal visible={audioOpen} transparent={true} animationType="fade" onRequestClose={closeAudioPicker}>
        <Pressable onPress={closeAudioPicker} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: "40%", maxHeight: "80%", backgroundColor: "#1c1c1c", borderRadius: 10, padding: 20, paddingBottom: 0 }}>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Audio Tracks</Text>
                <ScrollView style={{ height: "100%" }} contentContainerStyle={{}}>
                    {availableAudioTracks.length > 0 ? availableAudioTracks.map((track: any, index: number) => {
                        const selected = isSelectedTrack(track);
                        const trackName = track.name || track.label || track.language || `Audio track ${index + 1}`;
                        return (
                            <Pressable key={track.id || `${trackName}-${track.language}-${index}`} onPress={() => { player.audioTrack = track; }} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: index === availableAudioTracks.length - 1 ? 0 : 1, borderBottomColor: "#ffffff22" }}>
                                <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: selected ? "white" : "#ffffff84", backgroundColor: selected ? "white" : "transparent", alignItems: "center", justifyContent: "center" }}>
                                    {selected && <Text style={{ color: "#1c1c1c", fontSize: 14, fontWeight: "bold", lineHeight: 18 }}>✓</Text>}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "white", fontSize: 14 }} numberOfLines={1}>{trackName}</Text>
                                    {track.language && track.language !== trackName && <Text style={{ color: "#ffffff84", fontSize: 12, marginTop: 2 }}>{track.language}</Text>}
                                </View>
                            </Pressable>
                        );
                    }) : (<Text style={{ color: "#ffffff84", fontSize: 14, paddingVertical: 12 }}>No audio tracks available</Text>)}
                </ScrollView>
            </View>
        </Pressable>
    </Modal>)
}

export default AudioPicker;