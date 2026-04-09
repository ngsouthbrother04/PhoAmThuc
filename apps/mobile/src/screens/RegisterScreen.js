import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, Alert 
} from "react-native";
import { useState } from "react";
import API from "../api/api";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [claimCode, setClaimCode] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !claimCode) {
      Alert.alert("Lưu ý", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await API.post("/auth/register", {
        email,
        password,
        claimCode,
      });

      Alert.alert("Thành công", "Tài khoản Phố Ẩm Thực đã sẵn sàng!", [
        { text: "Đăng nhập ngay", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Mã kích hoạt không đúng hoặc email đã tồn tại!";
      Alert.alert("Lỗi đăng ký", errorMsg);
    }
  };

  return (
    // 1. Dùng KeyboardAvoidingView để đẩy giao diện lên khi bàn phím hiện
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* 2. Dùng ScrollView để có thể cuộn nội dung khi màn hình bị chật */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.logoIcon}>📝</Text>
          <Text style={styles.logoText}>ĐĂNG KÝ</Text>
          <Text style={styles.subTitle}>Trở thành thành viên của Phố Ẩm Thực</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Nhập email của bạn..."
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            placeholder="Tối thiểu 6 ký tự..."
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            style={styles.input}
          />
        </View>

        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>Mã kích hoạt (Claim Code)</Text>
          <TextInput
            placeholder="Nhập mã ưu đãi của bạn..."
            value={claimCode}
            onChangeText={setClaimCode}
            style={[styles.input, styles.highlightInput]}
            autoCapitalize="characters" // Tự viết hoa cho mã code
          />
          <Text style={styles.hintText}>* Mã này giúp bạn mở khóa các tour ẩm thực đặc biệt.</Text>
        </View> */}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Hoàn Tất Đăng Ký</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footer} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.footerText}>Đã có tài khoản? <Text style={styles.signInText}>Quay lại Đăng nhập</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { paddingHorizontal: 30, paddingVertical: 50 },
  headerContainer: { alignItems: "center", marginBottom: 30 },
  logoIcon: { fontSize: 40, marginBottom: 10 },
  logoText: { fontSize: 24, fontWeight: "900", color: "#FF6F00", letterSpacing: 1 },
  subTitle: { fontSize: 13, color: "#9E9E9E", marginTop: 5 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "bold", color: "#424242", marginBottom: 5 },
  input: {
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  highlightInput: {
    borderColor: "#FFB300",
    backgroundColor: "#FFFDE7", // Tô vàng nhẹ cho ô nhập mã code
  },
  hintText: { fontSize: 11, color: "#757575", marginTop: 4, fontStyle: "italic" },
  registerButton: {
    backgroundColor: "#FF6F00",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
  },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  footer: { marginTop: 25, alignItems: "center" },
  footerText: { color: "#757575", fontSize: 14 },
  signInText: { color: "#FF6F00", fontWeight: "bold" },
});