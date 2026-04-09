import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';
import { autoTranslate } from "../utils/translator"; // Import hàm dịch của bạn

export default function ProfileScreen({ navigation, route }) {
  // 1. Nhận ngôn ngữ từ HomeScreen truyền sang (mặc định là vi)
  const { currentLang } = route.params || { currentLang: { code: 'vi', locale: 'vi-VN' } };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  // State mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  // 2. State lưu trữ các nhãn giao diện (Labels)
  const [labels, setLabels] = useState({
    profileHeader: "THÔNG TIN CÁ NHÂN",
    emailLabel: "Email (Tài khoản)",
    nameLabel: "Họ và tên",
    placeholderName: "Nhập tên mới...",
    btnUpdate: "CẬP NHẬT TÊN",
    securityHeader: "BẢO MẬT MẬT KHẨU",
    oldPassLabel: "Mật khẩu cũ",
    oldPassPlaceholder: "Nhập mật khẩu hiện tại",
    newPassLabel: "Mật khẩu mới",
    newPassPlaceholder: "Nhập mật khẩu mới",
    confirmPassLabel: "Xác nhận mật khẩu mới",
    confirmPassPlaceholder: "Nhập lại mật khẩu mới",
    btnChangePass: "ĐỔI MẬT KHẨU",
    loadingText: "Đang tải..."
  });

  useEffect(() => {
    loadData();
    translateUI(); // Gọi dịch giao diện ngay khi vào màn hình
  }, []);

  // 3. Hàm dịch động toàn bộ giao diện dựa trên currentLang
  const translateUI = async () => {
    if (currentLang.code === 'vi') return; // Nếu là tiếng Việt thì giữ nguyên

    try {
      const keys = Object.keys(labels);
      const values = Object.values(labels);

      // Dịch mảng các giá trị nhãn
      const translatedValues = await Promise.all(
        values.map(val => autoTranslate(val, currentLang.code))
      );

      const newLabels = {};
      keys.forEach((key, index) => {
        newLabels[key] = translatedValues[index];
      });
      setLabels(newLabels);

      // Dịch luôn cả tiêu đề Header của Navigation
      const translatedTitle = await autoTranslate("Thông tin cá nhân", currentLang.code);
      navigation.setOptions({ title: `👤 ${translatedTitle}` });
    } catch (e) {
      console.log("Lỗi dịch giao diện Profile:", e);
    }
  };

const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // THỬ CẢ 2 ĐƯỜNG DẪN NẾU /auth/profile KHÔNG CHẠY
      // Bạn hãy kiểm tra xem backend của bạn dùng cái nào nhé
      const response = await API.get("/users/profile", { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      console.log("DỮ LIỆU PROFILE:", response.data);

      // Kiểm tra cấu trúc trả về (có thể là response.data hoặc response.data.data)
      const userData = response.data.data || response.data;

      if (userData) {
        const name = userData.fullName || userData.name || "Khách du lịch";
        const mail = userData.email || "";
        
        setFullName(name);
        setEmail(mail);
        
        // Lưu lại để dùng lần sau
        await AsyncStorage.setItem('userName', name);
        await AsyncStorage.setItem('userEmail', mail);
      }
    } catch (e) {
      console.log("Lỗi tải API, đang lấy từ bộ nhớ tạm...");
      // PHƯƠNG ÁN DỰ PHÒNG: Lấy từ AsyncStorage nếu API lỗi
      const sName = await AsyncStorage.getItem('userName');
      const sEmail = await AsyncStorage.getItem('userEmail');
      if (sName) setFullName(sName);
      if (sEmail) setEmail(sEmail);
    }
  };

  const handleUpdateName = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setLoadingProfile(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await API.patch("/users/profile", { fullName: fullName.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await AsyncStorage.setItem('userName', fullName.trim());
      Alert.alert("Success", "Name updated!");
    } catch (error) {
      Alert.alert("Error", "Update failed");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) return;
    setLoadingPass(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await API.post("/users/change-password", { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Success", "Password changed");
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      Alert.alert("Error", "Current password incorrect");
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.headerEmail}>{fullName || labels.loadingText}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>👤 {labels.profileHeader}</Text>
          
          <Text style={styles.label}>{labels.emailLabel}</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />

          <Text style={styles.label}>{labels.nameLabel}</Text>
          <TextInput 
            style={styles.input} 
            value={fullName} 
            onChangeText={setFullName}
            placeholder={labels.placeholderName}
          />
          
          <TouchableOpacity style={styles.smallBtn} onPress={handleUpdateName}>
            {loadingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{labels.btnUpdate}</Text>}
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>🔑 {labels.securityHeader}</Text>

          <Text style={styles.label}>{labels.oldPassLabel}</Text>
          <TextInput 
            style={styles.input} 
            secureTextEntry 
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder={labels.oldPassPlaceholder}
          />

          <Text style={styles.label}>{labels.newPassLabel}</Text>
          <TextInput 
            style={styles.input} 
            secureTextEntry 
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={labels.newPassPlaceholder}
          />

          <Text style={styles.label}>{labels.confirmPassLabel}</Text>
          <TextInput 
            style={styles.input} 
            secureTextEntry 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={labels.confirmPassPlaceholder}
          />

          <TouchableOpacity 
            style={[styles.smallBtn, {backgroundColor: '#333'}]} 
            onPress={handleChangePassword}
          >
            {loadingPass ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{labels.btnChangePass}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#FFF3E0' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6F00', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  avatarTextLarge: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  headerEmail: { marginTop: 10, color: '#666', fontWeight: '500', fontSize: 16 },
  form: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#FF6F00', marginBottom: 15 },
  label: { fontSize: 12, color: '#999', marginBottom: 5, fontWeight: '600' },
  input: { borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 15, fontSize: 16, paddingVertical: 5, color: '#333' },
  disabledInput: { color: '#AAA', borderBottomColor: '#F9F9F9' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 25 },
  smallBtn: { backgroundColor: '#FF6F00', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});