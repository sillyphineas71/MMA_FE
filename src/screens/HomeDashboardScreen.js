import React, { useState, useRef } from "react"; // ✅ Thêm useState, useRef
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal, // ✅ Thêm Modal
  FlatList, // ✅ Thêm FlatList
  KeyboardAvoidingView, // ✅ Thêm KeyboardAvoidingView
  Platform, // ✅ Thêm Platform
  ActivityIndicator, // ✅ Thêm ActivityIndicator
  SafeAreaView, // ✅ SỬA LỖI TAI THỎ: Dùng SsafeAreaView của react-native
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// ✅ SỬA LỖI TAI THỎ: Xóa import từ thư viện bên ngoài
// import { SafeAreaView } from "react-native-safe-area-context";
import { palette, radius, spacing, shadow } from "../theme/theme";
import { useAuth } from "../context/AuthContext"; //  lấy user từ context

// ✅ URL Webhook n8n của bạn
const CHATBOT_WEBHOOK_URL =
  "https://n8n.vmt.vn/webhook/ec699673-8bb2-4e2d-9900-7f1b1dd1067d";

// ✅ Tin nhắn chào mừng mặc định
const defaultWelcomeMessage = {
  id: "1",
  text: "Xin chào! Tôi là trợ lý AI. Tôi có thể trả lời mọi câu hỏi liên quan đến bóng đá mà bạn đang thắc mắc!",
  sender: "bot",
};

export default function HomeDashboardScreen({ navigation }) {
  const { user, signOut } = useAuth(); //  truy cập user đăng nhập

  // ✅ State cho Chatbot
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([defaultWelcomeMessage]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // ✅ Hàm gửi tin nhắn đến n8n
  const handleSend = async () => {
    const userMessageText = currentMessage.trim();
    if (!userMessageText) return;

    const userMessage = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: "user",
    };

    // Thêm tin nhắn của user vào danh sách
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Gửi tin nhắn đến webhook n8n
      const response = await fetch(CHATBOT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessageText,
          userId: user?._id || user?.id || user?.email, // Gửi kèm thông tin user
          userName: user?.fullName || user?.name || "Guest",
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi mạng hoặc server");
      }

      const data = await response.json();

      // ✅ Xử lý phản hồi từ n8n
      // Sửa lại: Đọc trực tiếp từ key "output" của Object
      const botReply = data.output;

      if (!botReply) {
        throw new Error("Phản hồi từ bot không hợp lệ");
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi chatbot:", error);
      // Gửi tin nhắn lỗi cho user
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ THÊM MỚI: Hàm xóa lịch sử chat
  const handleClearChat = () => {
    setMessages([defaultWelcomeMessage]);
  };

  // ✅ Hàm render từng tin nhắn
  const renderChatMessage = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={isUser ? styles.userText : styles.botText}>
          {item.text}
        </Text>
      </View>
    );
  };
  // Đăng xuất
  const handleSignOut = async () => {
    try {
      await signOut(); // Context tự reset về Login
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.username}>
              Hey,{" "}
              {user?.fullName ||
                user?.name ||
                user?.email?.split("@")[0] ||
                "Player"}{" "}
            </Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Nút thông báo */}
            <TouchableOpacity activeOpacity={0.8} style={{ marginRight: 15 }}>
              <Ionicons
                name="notifications-outline"
                size={26}
                color={palette.text}
              />
            </TouchableOpacity>

            {/*  Nút Logout */}
            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.8}>
              <Feather name="log-out" size={22} color={palette.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={palette.sub} />
          <TextInput
            placeholder="Tìm kiếm sân bóng..."
            placeholderTextColor={palette.sub}
            style={styles.searchInput}
          />
        </View>

        {/* Banner */}
        <LinearGradient
          colors={[palette.primaryLight, palette.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Ionicons
            name="football"
            size={80}
            color="rgba(255,255,255,0.9)"
            style={{ marginBottom: spacing.sm }}
          />
          <Text style={styles.bannerText}>
            Book Venues With The Best Offers!
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bookButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.bookButtonText}>Book Now ↗</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Grid buttons */}
        <View style={styles.grid}>
          {[
            { label: "My Profile", icon: "person-outline", screen: "Profile" },
            { label: "History Booking", icon: "time-outline", screen: "BookingHistory" },
            { label: "About Us", icon: "information-circle-outline", screen: "About" },
            { label: "Support", icon: "help-circle-outline", screen: "Support" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.gridItem}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(item.screen)} // ✅ chuyển sang screen tương ứng
            >
              <Ionicons name={item.icon} size={28} color={palette.primaryDark} />
              <Text style={styles.gridText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={28} color={palette.primaryDark} />
        <Ionicons name="football-outline" size={26} color={palette.sub} />
        <Ionicons name="menu-outline" size={26} color={palette.sub} />
      </View>

      {/* ✅ NÚT FAB ĐỂ MỞ CHATBOT */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsChatVisible(true)}
      >
        <Ionicons name="chatbubbles-outline" size={30} color="#fff" />
      </TouchableOpacity>

      {/* ✅ MODAL CHATBOT */}
      <Modal
        visible={isChatVisible}
        animationType="slide"
        onRequestClose={() => setIsChatVisible(false)}
      >
        <SafeAreaView style={styles.chatContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100} // Tinh chỉnh nếu cần
          >
            {/* Header Chat */}
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Trợ lý AI</Text>
              {/* ✅ THÊM MỚI: Nhóm các nút header */}
              <View style={styles.chatHeaderButtons}>
                <TouchableOpacity onPress={handleClearChat}>
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={palette.sub}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsChatVisible(false)}
                  style={{ marginLeft: spacing.md }}
                >
                  <Ionicons name="close" size={30} color={palette.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Khung chat */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id}
              style={styles.messageList}
              contentContainerStyle={{ padding: spacing.md }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            {/* Loading indicator */}
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={palette.primary}
                style={styles.loadingIndicator}
              />
            )}

            {/* Input chat */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor={palette.sub}
                value={currentMessage}
                onChangeText={setCurrentMessage}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={isLoading}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={32}
                  color={palette.primary}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  username: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: palette.sub,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: palette.text,
  },
  banner: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
    ...shadow.card,
  },
  bannerText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  bookButton: {
    backgroundColor: "#fff",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  bookButtonText: {
    fontWeight: "700",
    color: palette.primaryDark,
  },
  grid: {
    marginTop: spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.lg,
    ...shadow.card,
  },
  gridText: {
    marginTop: spacing.sm,
    fontWeight: "600",
    color: palette.text,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: spacing.sm,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.card,
  },

  // ✅ STYLE CHO FAB
  fab: {
    position: "absolute",
    bottom: 80, // Nâng lên trên bottomNav
    right: 20,
    backgroundColor: palette.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
    elevation: 8,
  },

  // ✅ STYLE CHO MODAL CHAT
  chatContainer: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.card,
  },
  // ✅ THÊM MỚI: Style cho nhóm nút
  chatHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
  },
  messageList: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: spacing.md,
    borderRadius: radius.lg,
    marginVertical: spacing.sm,
  },
  userBubble: {
    backgroundColor: palette.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: radius.sm,
  },
  botBubble: {
    backgroundColor: palette.card,
    alignSelf: "flex-start",
    borderBottomLeftRadius: radius.sm,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: palette.text,
  },
  loadingIndicator: {
    marginVertical: spacing.sm,
    alignSelf: "flex-start",
    marginLeft: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.card,
    backgroundColor: palette.bg,
  },
  chatInput: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    fontSize: 16,
    color: palette.text,
  },
  sendButton: {
    padding: 5,
  },
});
