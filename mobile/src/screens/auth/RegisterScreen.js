import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import ScreenScaffold from '../../components/ScreenScaffold';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { submitRegistrationRequest } from '../../api/client';
import { colors } from '../../theme/colors';

const WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'admin123',
  'letmein',
  'welcome123',
  'abc12345',
  'iloveyou',
  'changeme',
  'dermas123',
]);

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const validatePhone = (value) => /^[+]?[(]?[0-9\s\-()]{7,20}$/.test(value.trim());

const validateForm = (form) => {
  if (!form.fullName.trim()) return 'Full name is required.';
  if (form.fullName.trim().length < 2) return 'Full name must be at least 2 characters.';
  if (form.fullName.trim().length > 120) return 'Full name must be at most 120 characters.';
  if (!form.email.trim()) return 'Email is required.';
  if (!validateEmail(form.email)) return 'Enter a valid email address.';
  if (!form.phoneNumber.trim()) return 'Phone number is required.';
  if (!validatePhone(form.phoneNumber)) return 'Enter a valid phone number.';
  if (!form.password) return 'Password is required.';
  if (form.password.length < 12) return 'Password must be at least 12 characters.';
  if (form.password.length > 128) return 'Password must be at most 128 characters.';
  if (!/[a-z]/.test(form.password)) return 'Password must include at least one lowercase letter.';
  if (!/[A-Z]/.test(form.password)) return 'Password must include at least one uppercase letter.';
  if (!/[0-9]/.test(form.password)) return 'Password must include at least one number.';
  if (!/[^A-Za-z0-9]/.test(form.password)) return 'Password must include at least one special character.';
  if (WEAK_PASSWORDS.has(form.password.trim().toLowerCase())) {
    return 'Choose a stronger password that is not commonly used.';
  }
  if (form.reasonForAccess.trim().length > 500) return 'Reason for access must be at most 500 characters.';

  return '';
};

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    reasonForAccess: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    const validationError = validateForm(form);
    if (validationError) {
      Alert.alert('Register', validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await submitRegistrationRequest({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        reasonForAccess: form.reasonForAccess.trim(),
      });
      Alert.alert('Request submitted', res.data?.message || 'Your account request was submitted.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Register', error.response?.data?.error || error.response?.data?.message || 'Could not submit the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScaffold title="Create Account Request" subtitle="Matches the web registration request workflow.">
      <TextField label="Full name" value={form.fullName} onChangeText={(v) => update('fullName', v)} />
      <TextField label="Email" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" />
      <TextField label="Phone number" value={form.phoneNumber} onChangeText={(v) => update('phoneNumber', v)} keyboardType="phone-pad" />
      <TextField label="Password" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry />
      <TextField
        label="Reason for access"
        value={form.reasonForAccess}
        onChangeText={(v) => update('reasonForAccess', v)}
        multiline
        placeholder="Optional"
      />
      <Button title="Submit request" loading={loading} onPress={submit} />
      <Text style={styles.note}>Admins approve or reject requests from Pending User Requests.</Text>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
