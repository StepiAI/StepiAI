import { useState } from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { voiceBackgroundCss, softGradientCss } from '../../../shared/theme/gradient';
import {  CloseIcon, MicIcon } from '../../../shared/components/Icons';

interface VoiceAssistantScreenProps {
  visible: boolean;
  onClose: () => void;
  topInset: number;
  bottomInset: number;
}

export function VoiceAssistantScreen({
  visible,
  onClose,
  topInset,
  bottomInset,
}: VoiceAssistantScreenProps) {
  const [listening, setListening] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{
          experimental_backgroundImage: voiceBackgroundCss,
          paddingTop: topInset,
          paddingBottom: bottomInset,
        }}
      >
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-[18px] pb-[14px] pt-[6px]">
            <View className="w-[46px]" />
            <Text className="text-[17px] text-light-inkStrong" style={textStyle('semibold')}>
              Voice Assistant STEPI AI
            </Text>
            <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                accessibilityLabel="Back"
                className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white/70"
              >
                <CloseIcon size={18} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-[24px]">
            <Text
              className="mb-[18px] text-[15px] text-light-muted"
              style={textStyle('medium')}
            >
              {listening ? 'Listening...' : 'Tap the mic to speak'}
            </Text>

            <Image
              source={require('../../../assets/chatbot.gif')}
              style={{ width: 260, height: 260 }}
              resizeMode="contain"
            />
          </View>

          <View className="items-center pb-[24px]">
            <TouchableOpacity
              onPress={() => setListening(current => !current)}
              activeOpacity={0.85}
              accessibilityLabel={listening ? 'Stop listening' : 'Start listening'}
              className="h-[72px] w-[72px] items-center justify-center rounded-full"
              style={{ experimental_backgroundImage: softGradientCss }}
            >
              <MicIcon size={28} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
