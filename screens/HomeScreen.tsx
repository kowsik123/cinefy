import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Animated, BackHandler, Easing, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Dimensions } from "react-native";
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPPopup from '../screens/OTPPopup';
import Button from '../components/Button';
import BlackGlassButton from '../components/BlackGlassButton';

const categories = require("./assets/categories.json");

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const HEIGHT_PERCENT = 0.32;

const Card = ({ nameLogo, description, tags, height, onPress }: any) => {
    return <Pressable onPress={onPress} style={{ width: SCREEN_WIDTH * 0.8, height: height * HEIGHT_PERCENT, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 20, backgroundColor: "#ffffff2c", padding: 20, gap: 20 }}>
        <Image style={{ width: "100%", height: height * 0.08, objectFit: "contain" }} source={{ uri: nameLogo }}></Image>
        <View style={{ gap: 8 }}>
            <Text style={{ textAlign: "center", width: "100%", color: "white", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{tags.slice(0, 3).join("  •  ")}</Text>
            <Text style={{ textAlign: "center", width: "100%", color: "white", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{tags.slice(3, 5).join("  • ")}</Text>
        </View>
        <Text style={{ textAlign: "center", color: "white", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{description}</Text>
    </Pressable>
}

const EpisodeCard = ({ text, id, ott, t, ep_desc, info, last, setOTPOpen }: any) => {
    const [pressed, setPressed] = useState(false);
    const navigation = useNavigation<any>();
    const onPress = () => {
        AsyncStorage.getItem('netmirrorUserToken').then(usertoken => {
            fetch('https://tv.imgcdn.kim/newtv/player.php?id=' + id, {
                headers: {
                    ott: ott || "hs",
                    usertoken: usertoken || '',
                } as any,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "otp") {
                        setOTPOpen(true);
                    }
                    else navigation.navigate('VideoPlayer', { title: t, id, url: data.video_link, type: "series" });
                });
        });
    };
    return <Pressable onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)} style={{ width: "100%", paddingVertical: 20, paddingHorizontal: 15, flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: pressed ? "#ffffff2c" : "#00000000" }}>
        <Image source={{ uri: ott === "nf" ? `https://imgcdn.kim/epimg/150/${id}.jpg` : ott === "pv" ? `https://imgcdn.kim/pvimg/${id}.jpg` : `https://imgcdn.kim/hsepimg/${id}.jpg` }} style={{ width: "35%", aspectRatio: 220 / 124, borderRadius: 7 }} />
        <View style={{ width: "65%", justifyContent: "center" }}>
            <Text style={{ color: "white", fontSize: 10 }} numberOfLines={1}>{t}</Text>
            <Text numberOfLines={3} style={{ fontSize: 8, color: "#d5d5d5", marginTop: 7, lineHeight: 12 }}>{ep_desc}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
                {info?.map((i: any, index: number) => <Text key={index} style={{ fontSize: 8, color: "#ececec" }}>{i}</Text>)}
            </View>
        </View>
        {!last && <View style={{ width: "95%", position: "absolute", bottom: 0, left: "5%", borderBottomWidth: 1, borderColor: "rgba(255, 255, 255, 0.363)" }}></View>}
    </Pressable>
}

const EpisodesCard = ({ seasons, ott, otpOpen, setOTPOpen }: any) => {
    const [currentSeason, setCurrentSeason] = useState(0);
    const [episodes, setEpisodes] = useState([]);
    useEffect(() => {
        if (!seasons?.[currentSeason]?.id) return;
        fetch(`https://tv.imgcdn.kim/newtv/episodes.php?id=${seasons[currentSeason].id}`, { headers: { ott: ott || "hs" } }).then((res) => res.json()).then((data) => {
            setEpisodes(data.episodes || []);
        });
    }, [currentSeason]);
    return <View style={{ width: SCREEN_WIDTH * 0.9, maxHeight: "70%", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 20, backgroundColor: "#ffffff2c", paddingVertical: 20, paddingBottom: 0, gap: 0, position: "absolute" }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "100%" }} contentContainerStyle={{ gap: 10, flexDirection: "row", paddingHorizontal: 20 }}>
            {seasons?.map((season: any, i: number) => (<BlackGlassButton active={i === currentSeason} onPress={() => setCurrentSeason(i)} key={season.id} text={`Season ${i + 1}`} />))}
        </ScrollView>
        <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%", marginTop: 18 }} contentContainerStyle={{}}>
            {episodes.map((episode: any, index: number) => (
                <EpisodeCard setOTPOpen={setOTPOpen} last={index === episodes.length - 1} key={index} text={`S${currentSeason + 1} E${episode?.ep}`} {...episode} ott={ott} />
            ))}
        </ScrollView>
    </View>
}

const TitleCard = ({ nameLogo, description, id, tags, height, ott }: any) => {
    const [titleData, setTitleData] = useState<any>(null);
    const navigation = useNavigation<any>();
    const [otpOpen, setOTPOpen] = useState(false);
    const [episodesOpen, setEpisodesOpen] = useState(false);
    useEffect(() => {
        if (episodesOpen) {
            const sub = BackHandler.addEventListener("hardwareBackPress", () => {
                setEpisodesOpen(false);
                return true;
            });
            return () => sub.remove();
        }
    }, [episodesOpen]);
    useEffect(() => {
        fetch(`https://tv.imgcdn.kim/newtv/post.php?id=${id}`, { headers: { ott: ott || "hs", usertoken: "" } }).then((res) => res.json()).then((data) => {
            setTitleData(data);
        });
    }, [id]);
    const onPress = () => {
        if (!titleData) return;
        AsyncStorage.getItem('netmirrorUserToken').then(usertoken => {
            fetch('https://tv.imgcdn.kim/newtv/player.php?id=' + id, {
                headers: {
                    ott: titleData?.ott || "hs",
                    usertoken: usertoken || '',
                } as any,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "otp") {
                        setOTPOpen(true);
                    }
                    else navigation.navigate('VideoPlayer', { title: titleData?.title, id, url: data.video_link, type: "movie" });
                });
        });
    };
    tags = tags || [titleData?.year, titleData?.ua, titleData?.runtime, ...(titleData?.moredetails?.find((l: any) => l.k === "IMDB Genres")?.v?.split(", ") || [])];
    return <>
        <View style={{ width: SCREEN_WIDTH * 0.8, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 20, backgroundColor: "#ffffff2c", padding: 20, gap: 20, opacity: episodesOpen ? 0 : 1 }}>
            {nameLogo ? <Image style={{ width: "100%", height: height * 0.08, objectFit: "contain" }} source={{ uri: nameLogo }}></Image> : <Text style={{ width: "100%", height: height * 0.08, fontSize: 26, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", color: "white", textShadowColor: "black", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>{titleData?.title}</Text>}
            <View style={{ gap: 8 }}>
                <Text style={{ textAlign: "center", width: "100%", color: "white", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{tags?.slice(0, 3).join("  •  ")}</Text>
                <Text style={{ textAlign: "center", width: "100%", color: "white", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{tags?.slice(3, 5).join("  •  ")}</Text>
            </View>
            <Text style={{ textAlign: "center", color: "white", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{description || titleData?.desc}</Text>
            {!!titleData?.season ? <Button title="Episodes" onPress={() => setEpisodesOpen(true)} /> : <Button title="Watch Now" onPress={onPress} />}
            {otpOpen && <OTPPopup onClose={() => setOTPOpen(false)} />}
        </View>
        {episodesOpen && <EpisodesCard otp={otpOpen} setOTPOpen={setOTPOpen} seasons={titleData?.season} ott={ott} />}
    </>
}

const Category = ({ height, setBackgroundImage, title, list, onMove, setOpenTitle }: { setBackgroundImage: (img: string) => void, title: string, list: any[], onMove: (index: number) => void, height: number, setOpenTitle: (title: string) => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    return <View style={{ justifyContent: "center" }}>
        <Text style={{ position: "absolute", top: height * 0.5 - height * HEIGHT_PERCENT * 0.5 - 50, left: 0, width: "100%", textAlign: "center", color: "white", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5, fontSize: 22, fontWeight: "medium" }}>{title}</Text>
        <View style={{ width: "100%", height: height, alignItems: "center", justifyContent: "center" }}>
            <ScrollView onMomentumScrollEnd={(e) => { const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH); setBackgroundImage(list[index].bgimg || ""); onMove(index); setCurrentIndex(index); }} pagingEnabled horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: SCREEN_WIDTH * 0.2, paddingHorizontal: SCREEN_WIDTH * 0.1, flexDirection: "row" }}>
                {list.map((t, i) => <Card height={height} key={i} {...t} onPress={() => setOpenTitle({ ...t })} />)}
            </ScrollView>
            {currentIndex !== list.length - 1 && <Ionicons name="chevron-forward" size={32} color="white" style={{ position: "absolute", right: 5, top: (height) * 0.5 - 16, textShadowColor: "#000000c8", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 }} />}
        </View>
    </View>
}

const SearchBar = ({ expanded, setExpanded, text, setText }: { expanded: boolean, setExpanded: (expanded: boolean) => void, text: string, setText: (text: string) => void }) => {
    const width = useRef(new Animated.Value(46)).current;
    const insets = useSafeAreaInsets();
    const ref = useRef<TextInput>(null);

    useEffect(() => {
        Animated.timing(width, {
            toValue: expanded ? SCREEN_WIDTH - 40 : 46,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [expanded]);

    return (
        <Animated.View style={{ position: "absolute", top: 10 + insets.top, right: 20, width, height: 46, borderRadius: 46, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#ffffff2c" }}>
            <Pressable onPress={() => { ref.current?.focus(); setExpanded(!expanded); }} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="search" size={24} color="white" style={{ width: 44, height: 44, textAlign: "center", verticalAlign: "middle" }} />
                <TextInput ref={ref} value={text} onChangeText={setText} onBlur={() => text ? null : setExpanded(false)} returnKeyType="search" placeholder="Search" placeholderTextColor="white" style={{ color: "white", flex: 1, height: 46, fontSize: 16 }} />
            </Pressable>
        </Animated.View>
    );
};

const Title = ({ src, setOpenTitle, id, ott }: { src: string, setOpenTitle: (title: any) => void, id: string, ott: string }) => {
    return (
        <Pressable onPress={() => setOpenTitle({ id, ott })}>
            <Image source={{ uri: src }} style={{ width: "100%", aspectRatio: 284 / 398, borderRadius: 8 }} />
        </Pressable>
    );
}

const SearchResults = ({ text, setOpenTitle, hide }: { text: string, setOpenTitle: (title: any) => void, hide: any }) => {
    const [primeTitles, setPrimeTitles] = useState<any[]>([]);
    const [disneyTitles, setDisneyTitles] = useState<any[]>([]);
    const [netflixTitles, setNetflixTitles] = useState<any[]>([]);
    useEffect(() => {
        fetch("https://tv.imgcdn.kim/newtv/search.php?s=" + encodeURIComponent(text), { headers: { ott: "pv" } }).then(res => res.json()).then(data => {
            setPrimeTitles(data?.searchResult?.slice(0, 10) || []);
        });
        fetch("https://tv.imgcdn.kim/newtv/search.php?s=" + encodeURIComponent(text), { headers: { ott: "hs" } }).then(res => res.json()).then(data => {
            setDisneyTitles(data?.searchResult?.slice(0, 10) || []);
        });
        fetch("https://tv.imgcdn.kim/newtv/search.php?s=" + encodeURIComponent(text), { headers: { ott: "nf" } }).then(res => res.json()).then(data => {
            setNetflixTitles(data?.searchResult?.slice(0, 10) || []);
        });
    }, [text]);
    return (
        <View style={{ position: "absolute", top: 80 + useSafeAreaInsets().top, left: 20, right: 20, bottom: 0, flex: 1, display: hide ? "none" : "flex" }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ flexDirection: "row", paddingBottom: 50, justifyContent: "space-between" }}>
                <View style={{ width: "30%", gap: 20 }}>{netflixTitles.map((title: any) => <Title key={title.id} src={`https://imgcdn.kim/poster/v/${title.id}.jpg`} setOpenTitle={setOpenTitle} id={title.id} ott={'nf'} />)}</View>
                <View style={{ width: "30%", gap: 20 }}>{disneyTitles.map((title: any) => <Title key={title.id} src={`https://imgcdn.kim/hs/v/166/${title.id}.jpg`} setOpenTitle={setOpenTitle} id={title.id} ott={'hs'} />)}</View>
                <View style={{ width: "30%", gap: 20 }}>{primeTitles.map((title: any) => <Title key={title.id} src={`https://imgcdn.kim/pv/v/${title.id}.jpg`} setOpenTitle={setOpenTitle} id={title.id} ott={'pv'} />)}</View>
            </ScrollView>
        </View>
    );
}

const getBGImage = (title: any) => {
    if (!title) return "";
    if (title.ott === "nf") {
        return `https://imgcdn.kim/poster/v/${title.id}.jpg`;
    } else if (title.ott === "hs") {
        return `https://imgcdn.kim/hs/v/1000/${title.id}.jpg`;
    } else if (title.ott === "pv") {
        return `https://imgcdn.kim/pv/v/${title.id}.jpg`;
    }
    return "";
}

function HomeScreen() {
    const [backgroundImage, setBackgroundImage] = useState("");
    const [expanded, setExpanded] = useState(false);
    const categoryIndexes = useRef<Record<number, number>>({}).current;
    const [scrollViewHeight, setScrollViewHeight] = useState(SCREEN_HEIGHT);
    const [text, setText] = useState("");
    const [openTitle, setOpenTitle] = useState<any>(null);
    const isFocused = useIsFocused();
    useEffect(() => {
        if (!isFocused) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            if (openTitle) {
                setOpenTitle(null);
                if (text) setExpanded(true);
                return true;
            }
            if (text) {
                setText("");
                return true;
            }
            return false;
        });
        return () => sub.remove();
    }, [openTitle, text, isFocused]);
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "black" }}>
            <Image source={{ uri: openTitle ? openTitle?.bgimg ? openTitle.bgimg : getBGImage(openTitle) : backgroundImage || categories[0].list[0].bgimg || "https://static.wikia.nocookie.net/interstellarfilm/images/5/5a/Interstellar_poster_7.jpg/revision/latest/scale-to-width-down/1000?cb=20160116231848" }} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}></Image>
            {(openTitle && !openTitle?.bgimg) && <View style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />}
            <ScrollView onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)} pagingEnabled pointerEvents={(text || openTitle) ? "none" : "auto"} showsVerticalScrollIndicator={false} style={{ flex: 1, opacity: (text || openTitle) ? 0 : 1 }} contentContainerStyle={{ alignItems: "center" }} onMomentumScrollEnd={(e) => { const index = Math.round(e.nativeEvent.contentOffset.y / e.nativeEvent.layoutMeasurement.height); setExpanded(false); setBackgroundImage(categories[index]?.list?.[categoryIndexes?.[index] || 0]?.bgimg || ""); }}>
                {categories.map((category: any, index: number) => (
                    <Category setOpenTitle={setOpenTitle} key={index} height={scrollViewHeight} setBackgroundImage={setBackgroundImage} title={category.title} list={category.list} onMove={(index) => { categoryIndexes[categories.indexOf(category)] = index; setExpanded(false) }} />
                ))}
            </ScrollView>
            {openTitle && <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flex: 1, alignItems: "center", justifyContent: "center" }}>
                <TitleCard height={scrollViewHeight} {...openTitle} />
            </View>}
            <SearchBar expanded={expanded} setExpanded={setExpanded} text={text} setText={setText} />
            {text && expanded && <SearchResults hide={openTitle} text={text} setOpenTitle={setOpenTitle} />}
        </View>
    );
}

export default HomeScreen;