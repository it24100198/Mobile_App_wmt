import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import ScreenScaffold from '../../components/ScreenScaffold';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { submitRegistrationRequest } from '../../api/client';
import { colors } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'employee' });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await submitRegistrationRequest(form);
      Alert.alert('Request submitted', res.data?.message || 'Your account request was submitted.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Register', error.response?.data?.message || 'Could not submit the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScaffold title="Create Account Request" subtitle="Matches the web registration request workflow.">
      <TextField label="Full name" value={form.fullName} onChangeText={(v) => update('fullName', v)} />
      <TextField label="Email" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" />
      <TextField label="Password" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry />
      <TextField label="Requested role" value={form.role} onChangeText={(v) => update('role', v)} />
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
