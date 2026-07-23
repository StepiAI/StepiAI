import { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshGradient } from '../../../shared/components/MeshGradient';
import { GoogleLogo } from '../../../shared/components/GoogleLogo';
import { textStyle } from '../../../shared/theme/typography';
import { signInWithGoogle } from '../services/googleAuth';

interface RegisterScreenProps {
  onBackToOnboarding?: () => void;
}

export function RegisterScreen({ onBackToOnboarding }: RegisterScreenProps) {
  const [signingIn, setSigningIn] = useState(false);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <MeshGradient>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {onBackToOnboarding && (
          <View className="h-12 px-6 justify-center">
            <TouchableOpacity activeOpacity={0.7} onPress={onBackToOnboarding} hitSlop={12}>
              <Text className="text-[15px] text-white/80" style={textStyle('medium')}>
                ‹ Features
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="flex-1 justify-end px-7 pb-14">
          <View className="items-center mb-11">
            <Text className="text-[30px] tracking-[0.2px] text-white" style={textStyle('bold')}>
              Create your Account
            </Text>
            <Text className="mt-2 text-[17px] text-white/80" style={textStyle('medium')}>
              Start planning your day to day
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={signingIn}
            className="h-[62px] flex-row items-center justify-center gap-3 rounded-[34px] bg-white"
            style={googleShadow}
          >
            {signingIn ? (
              <ActivityIndicator color="#3B3A6B" />
            ) : (
              <>
                <GoogleLogo size={22} />
                <Text className="text-[17px] text-[#3B3A6B]" style={textStyle('bold')}>
                  Sign Up with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View className="mt-20 flex-row justify-center">
            <Text className="text-[15px] text-white/80" style={textStyle('medium')}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleGoogleSignIn} hitSlop={8}>
              <Text className="text-[15px] text-white" style={textStyle('bold')}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </MeshGradient>
  );
}

// shadow props gaada di tailwind jir, coba klo ketemu boleh diganti
const googleShadow = {
  shadowColor: '#3A2C6B',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.18,
  shadowRadius: 24,
  elevation: 6,
};
