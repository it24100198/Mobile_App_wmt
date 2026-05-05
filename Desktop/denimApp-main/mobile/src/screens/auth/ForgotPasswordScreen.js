import { useState } from 'react';
import { Alert } from 'react-native';
import ScreenScaffold from '../../components/ScreenScaffold';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { forgotPassword } from '../../api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      Alert.alert('Password reset', res.data?.message || 'Reset instructions were sent if the account exists.');
    } catch (error) {
      Alert.alert('Password reset', error.response?.data?.message || 'Could not request reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScaffold title="Forgot Password" subtitle="Request the same reset flow used by the web app.">
      <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Button title="Send reset instructions" loading={loading} onPress={submit} />
    </ScreenScaffold>
  );
}
