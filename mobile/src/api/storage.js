import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'dermas.auth.token';
export const USER_KEY = 'dermas.auth.user';

export const authStorage = {
  async getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async getUser() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  async setSession(user, token) {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  },
  async clearSession() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
