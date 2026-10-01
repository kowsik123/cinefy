import { useEvent } from "expo";
import { VideoPlayer } from "expo-video";
import { Modal, Pressable, View, Text, ScrollView } from "react-native";


const SubtitlePicker = ({ open, closeSubtitlesPicker, player }: { open: boolean; closeSubtitlesPicker: () => void; player: VideoPlayer }) => {
    const { availableSubtitleTracks } = useEvent(player, "availableSubtitleTracksChange", {
        availableSubtitleTracks: player.availableSubtitleTracks,
    });
    const { subtitleTrack: selectedSubtitle } = useEvent(player, "subtitleTrackChange", {
        subtitleTrack: player.subtitleTrack,
    });

    const isSelectedSubtitle = (subtitle: any) => {
        if (!selectedSubtitle) return false;
        if (subtitle.id && selectedSubtitle.id) return subtitle.id === selectedSubtitle.id;
        return subtitle.name === selectedSubtitle.name && subtitle.label === selectedSubtitle.label && subtitle.language === selectedSubtitle.language;
    };

    return (<Modal visible={open} transparent={true} animationType="fade" onRequestClose={closeSubtitlesPicker}>
        <Pressable onPress={closeSubtitlesPicker} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: "40%", maxHeight: "80%", backgroundColor: "#1c1c1c", borderRadius: 10, padding: 20, paddingBottom: 0 }}>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Subtitles</Text>
                <ScrollView style={{ height: "100%" }} contentContainerStyle={{}}>
                    <Pressable onPress={() => { player.subtitleTrack = null; }} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: availableSubtitleTracks.length > 0 ? 1 : 0, borderBottomColor: "#ffffff22" }}>
                        <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: !selectedSubtitle ? "white" : "#ffffff84", backgroundColor: !selectedSubtitle ? "white" : "transparent", alignItems: "center", justifyContent: "center" }}>
                            {!selectedSubtitle && <Text style={{ color: "#1c1c1c", fontSize: 14, fontWeight: "bold", lineHeight: 18 }}>✓</Text>}
                        </View>
                        <Text style={{ color: "white", fontSize: 14 }}>Off</Text>
                    </Pressable>
                    {availableSubtitleTracks.length > 0 ? availableSubtitleTracks.map((subtitle: any, index: number) => {
                        const selected = isSelectedSubtitle(subtitle);
                        const subtitleName = subtitle.name || subtitle.label || subtitle.language || `Subtitle ${index + 1}`;
                        return (
                            <Pressable key={subtitle.id || `${subtitleName}-${subtitle.language}-${index}`} onPress={() => { player.subtitleTrack = subtitle; }} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: index === availableSubtitleTracks.length - 1 ? 0 : 1, borderBottomColor: "#ffffff22" }}>
                                <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: selected ? "white" : "#ffffff84", backgroundColor: selected ? "white" : "transparent", alignItems: "center", justifyContent: "center" }}>
                                    {selected && <Text style={{ color: "#1c1c1c", fontSize: 14, fontWeight: "bold", lineHeight: 18 }}>✓</Text>}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "white", fontSize: 14 }} numberOfLines={1}>{subtitleName}</Text>
                                    {subtitle.language && subtitle.language !== subtitleName && <Text style={{ color: "#ffffff84", fontSize: 12, marginTop: 2 }}>{subtitle.language}</Text>}
                                </View>
                            </Pressable>
                        );
                    }) : (<Text style={{ color: "#ffffff84", fontSize: 14, paddingVertical: 12 }}>No subtitles available</Text>)}
                </ScrollView>
            </View>
        </Pressable>
    </Modal>)
}

export default SubtitlePicker;