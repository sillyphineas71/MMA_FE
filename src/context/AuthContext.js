import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, StyleSheet } from "react-native";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tải token và user từ storage khi mở app
    const bootstrapAsync = async () => {
      let userToken, userData;
      try {
        userToken = await AsyncStorage.getItem("userToken");
        userData = await AsyncStorage.getItem("user");
        if (userToken && userData) {
          setToken(userToken);
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error("Lỗi phục hồi token", e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: async (data) => {
      // GIẢ ĐỊNH: data = { token: "...", user: { role: "admin", ... } }
      try {
        const { token, user } = data;
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        setToken(token);
        setUser(user);
      } catch (e) {
        console.error("Lỗi lưu trữ đăng nhập", e);
        throw new Error("Không thể lưu thông tin đăng nhập");
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } catch (e) {
        console.error("Lỗi đăng xuất", e);
      }
    },
    user,
    token,
  };

  if (isLoading) {
    // Màn hình chờ trong khi tải token
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

// Hook để sử dụng context
export const useAuth = () => useContext(AuthContext);