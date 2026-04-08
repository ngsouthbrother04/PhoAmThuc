import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, StyleSheet, Dimensions, TextInput, 
  ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Modal, Alert 
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import API from "../api/api";

const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', locale: 'vi-VN' },
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', locale: 'ko-KR' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'zh', name: '中文', flag: '🇨🇳', locale: 'zh-CN' },
];

export default function HomeScreen() {
  const [pois, setPois] = useState([]);
  const [filteredPois, setFilteredPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Ngôn ngữ & Dịch thuật
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [translatedData, setTranslatedData] = useState({ name: "", desc: "" });
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => { fetchPois(); }, []);

  // Tự động dịch khi đổi địa điểm hoặc đổi ngôn ngữ
  useEffect(() => {
    if (selectedPoi) handleAutoTranslate();
  }, [selectedPoi, lang]);

  const fetchPois = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await API.get("/pois", { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.data?.items) {
        const items = res.data.data.items;
        setPois(items);
        setFilteredPois(items);
        if (items.length > 0) setSelectedPoi(items[0]);
      }
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const handleAutoTranslate = async () => {
    const originalName = selectedPoi.name?.vi || "";
    const originalDesc = selectedPoi.description?.vi || "";
    if (lang.code === 'vi') {
      setTranslatedData({ name: originalName, desc: originalDesc });
      return;
    }
    try {
      setIsTranslating(true);
      const fetchTranslate = async (text, target) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${target}&dt=t&q=${encodeURI(text)}`;
        const response = await fetch(url);
        const json = await response.json();
        return json[0].map(item => item[0]).join("");
      };
      const [tName, tDesc] = await Promise.all([
        fetchTranslate(originalName, lang.code),
        fetchTranslate(originalDesc, lang.code)
      ]);
      setTranslatedData({ name: tName, desc: tDesc });
    } catch (e) {
      setTranslatedData({ name: selectedPoi.name?.vi, desc: selectedPoi.description?.vi });
    } finally { setIsTranslating(false); }
  };

  const handleToggleSpeech = async () => {
    if (!translatedData.desc) return;
    const speaking = await Speech.isSpeakingAsync();
    if (speaking || isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      if (speaking) return; 
    }
    setIsSpeaking(true);
    Speech.speak(translatedData.desc, {
      language: lang.locale, // Dùng locale chuẩn (ja-JP, fr-FR...)
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const filtered = pois.filter(p => 
        (p.name?.vi || "").toLowerCase().includes(text.toLowerCase()) ||
        (p.name?.en || "").toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPois(filtered);
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }
  };

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" color="#FF6F00" />;

  return (
    <View style={styles.container}>
      {/* 1. KHÔI PHỤC THANH TÌM KIẾM */}
      <View style={styles.searchSection}>
        <View style={styles.topRow}>
          <View style={styles.searchBar}>
            <Text>🔍 </Text>
            <TextInput
              placeholder={lang.code === 'vi' ? "Tìm địa điểm..." : "Search..."}
              style={styles.input}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={() => setIsLangModalVisible(true)}>
            <Text style={{fontSize: 22}}>{lang.flag}</Text>
          </TouchableOpacity>
        </View>

        {isDropdownVisible && (
          <View style={styles.dropdown}>
            <FlatList
              data={filteredPois}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropItem} onPress={() => {
                  setSelectedPoi(item);
                  setIsDropdownVisible(false);
                  setSearchQuery("");
                }}>
                  <Text>{item.name?.vi}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} initialRegion={{ latitude: 10.7712, longitude: 106.6901, latitudeDelta: 0.05, longitudeDelta: 0.05 }}>
          {pois.map((p) => (
            <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} pinColor={selectedPoi?.id === p.id ? "#FF6F00" : "#E64A19"} onPress={() => setSelectedPoi(p)} />
          ))}
        </MapView>
      </View>

      <View style={styles.infoContainer}>
        <ScrollView contentContainerStyle={{padding: 25}}>
          {isTranslating ? (
             <ActivityIndicator color="#FF6F00" />
          ) : (
            <>
              <Text style={styles.poiName}>{translatedData.name}</Text>
              <View style={styles.divider} />
              <Text style={styles.poiDesc}>{translatedData.desc}</Text>
              <TouchableOpacity style={[styles.audioBtn, isSpeaking && {backgroundColor: '#FF6F00'}]} onPress={handleToggleSpeech}>
                <Text style={{color: isSpeaking ? '#fff' : '#FF6F00', fontWeight: 'bold'}}>
                  {isSpeaking ? "⏹️ STOP" : `🔊 LISTEN (${lang.name})`}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      <Modal visible={isLangModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn Ngôn Ngữ Thuyết Minh</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(i) => i.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.langItem} onPress={() => { setLang(item); setIsLangModalVisible(false); Speech.stop(); setIsSpeaking(false); }}>
                  <Text style={{fontSize: 24, marginRight: 15}}>{item.flag}</Text>
                  <Text style={{fontSize: 16, fontWeight: lang.code === item.code ? 'bold' : 'normal'}}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsLangModalVisible(false)}>
              <Text style={{color: '#fff'}}>ĐÓNG</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchSection: { position: 'absolute', top: 50, left: 15, right: 15, zIndex: 10 },
  topRow: { flexDirection: 'row' },
  searchBar: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 5, marginRight: 10, alignItems: 'center' },
  input: { flex: 1, marginLeft: 5 },
  langBtn: { backgroundColor: '#fff', padding: 8, borderRadius: 12, elevation: 5, justifyContent: 'center' },
  dropdown: { backgroundColor: '#fff', borderRadius: 10, marginTop: 5, elevation: 5, maxHeight: 150 },
  dropItem: { padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  mapContainer: { height: '45%' },
  map: { ...StyleSheet.absoluteFillObject },
  infoContainer: { flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -25, elevation: 20 },
  poiName: { fontSize: 24, fontWeight: '900', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  poiDesc: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 20 },
  audioBtn: { padding: 16, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#FF6F00', backgroundColor: '#FFF3E0' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '80%' },
  modalTitle: { fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  langItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  closeBtn: { backgroundColor: '#FF6F00', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 }
});