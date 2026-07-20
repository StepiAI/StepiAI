import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { MicIcon, SendIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { softGradientCss } from '../../../shared/theme/gradient';

// dipakai sebagai prop, bukan className, jadi gak bisa ambil token tailwind
const PLACEHOLDER_COLOR = '#A0A0A8';

interface ChatComposerProps {
  onSend: (text: string) => void;
  onVoicePress?: () => void;
}

export function ChatComposer({ onSend, onVoicePress }: ChatComposerProps) {
  const [draft, setDraft] = useState('');

  const trimmed = draft.trim();
  const canSend = trimmed.length > 0;

  const send = () => {
    if (!canSend) return;

    onSend(trimmed);
    setDraft('');
  };

  return (
    <View className="flex-row items-center gap-[12px] px-[18px] py-[12px]">
      <View className="h-[48px] flex-1 justify-center rounded-[24px] border border-light-line bg-light-sheet px-[18px]">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          placeholder="Ask me anything..."
          placeholderTextColor={PLACEHOLDER_COLOR}
          returnKeyType="send"
          className="text-[15px] text-light-ink"
          style={textStyle('regular')}
        />
      </View>

      <TouchableOpacity
        onPress={canSend ? send : onVoicePress}
        activeOpacity={0.8}
        accessibilityLabel={canSend ? 'Send message' : 'Voice input'}
        className="h-[44px] w-[44px] items-center justify-center rounded-full"
        style={{ experimental_backgroundImage: softGradientCss }}
      >
        {canSend ? <SendIcon /> : <MicIcon />}
      </TouchableOpacity>
    </View>
  );
}
