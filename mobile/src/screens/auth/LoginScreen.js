import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { API_URL } from '../../api/client';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      Alert.alert('Login', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', error.response?.data?.message || error.message || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={styles.card}>
        <Image source={require('../../../assets/dermas-logo.png')} style={styles.logo} />
        <Text style={styles.title}>DERMAS APPAREL</Text>
        <Text style={styles.subtitle}>Sign in to continue to the mobile ERP workspace.</Text>
        <View style={styles.form}>
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Login" loading={loading} onPress={submit} />
          <Button title="Create account request" variant="secondary" onPress={() => navigation.navigate('Register')} />
          <Button title="Forgot password" variant="secondary" onPress={() => navigation.navigate('ForgotPassword')} />
        </View>
        <Text style={styles.api}>API: {API_URL}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.sidebar,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 20,
    gap: 14,
  },
  logo: {
    width: 58,
    height: 58,
    alignSelf: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: 12,
  },
  api: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
  },
});
