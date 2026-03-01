/**
 * BusWay Pro Parent App - Expo/React Native Source
 * 
 * This is the source code for the mobile application.
 * To use:
 * 1. Create a new Expo project: npx create-expo-app BusWayParent
 * 2. Install dependencies: expo install lucide-react-native axios zustand @react-navigation/native @react-navigation/stack react-native-maps
 * 3. Copy these files into your project.
 */

// --- src/store/useAuthStore.ts ---
/*
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    AsyncStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
*/

// --- src/screens/LoginScreen.tsx ---
/*
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'https://your-api-url.run.app/api';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { phoneNumber: phone });
      setStep(2);
    } catch (err) {
      alert('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { phoneNumber: phone, otp });
      setAuth(data.user, data.token);
    } catch (err) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BusWay Pro</Text>
      <Text style={styles.subtitle}>Parent Portal</Text>
      
      {step === 1 ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="6-Digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#10b981', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 40 },
  form: { gap: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, fontSize: 16 },
  button: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
*/
