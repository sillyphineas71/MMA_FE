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
    // signIn can accept either a token string or an object { token, user }
    signIn: async (data) => {
      try {
        let token;
        let userObj = null;

        if (typeof data === "string") {
          token = data;
        } else if (data && typeof data === "object") {
          token = data.token;
          userObj = data.user || null;
        }

        if (!token) throw new Error("Missing token");

        // If user not provided, try to decode token payload
        if (!userObj) {
          try {
            const base64Url = token.split(".")[1] || "";
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            // pad base64 string
            const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

            let decoded = null;
            // try Buffer (node/react-native with buffer polyfill)
            try {
              if (typeof Buffer !== "undefined" && Buffer.from) {
                decoded = Buffer.from(padded, "base64").toString("binary");
              }
            } catch (ee) {
              decoded = null;
            }

            // fallback to global atob if available
            if (!decoded) {
              if (
                typeof global !== "undefined" &&
                typeof global.atob === "function"
              ) {
                decoded = global.atob(padded);
              } else if (typeof atob === "function") {
                decoded = atob(padded);
              }
            }

            if (!decoded) throw new Error("No base64 decoder available");

            const jsonPayload = decodeURIComponent(
              decoded
                .split("")
                .map(function (c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
            );

            const payload = JSON.parse(jsonPayload);
            userObj = {
              id: payload.sub,
              email: payload.email,
              roles: payload.roles || [],
            };
            // derive single role for UI convenience (admin > owner > customer)
            if (Array.isArray(userObj.roles) && userObj.roles.includes("admin"))
              userObj.role = "admin";
            else if (
              Array.isArray(userObj.roles) &&
              userObj.roles.includes("owner")
            )
              userObj.role = "owner";
            else if (
              Array.isArray(userObj.roles) &&
              userObj.roles.includes("customer")
            )
              userObj.role = "customer";
            else
              userObj.role =
                (Array.isArray(userObj.roles) && userObj.roles[0]) || null;
          } catch (e) {
            console.warn("Không thể decode token để lấy user payload", e);
          }
        }

        await AsyncStorage.setItem("userToken", token);
        if (userObj)
          await AsyncStorage.setItem("user", JSON.stringify(userObj));
        setToken(token);
        setUser(userObj);
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
