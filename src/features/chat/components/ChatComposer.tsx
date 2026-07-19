import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { SendIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

// dipakai sebagai prop, bukan className, jadi gak bisa ambil token tailwind
const PLACEHOLDER_COLOR = '#A0A0A8';

interface ChatComposerProps {
  onSend: (text: string) => void;
}

export function ChatComposer({ onSend }: ChatComposerProps) {
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
        onPress={send}
        disabled={!canSend}
        activeOpacity={0.8}
        accessibilityLabel="Send message"
        className={`h-[44px] w-[44px] items-center justify-center rounded-full bg-light-accent ${
          canSend ? '' : 'opacity-40'
        }`}
      >
        <SendIcon />
      </TouchableOpacity>
    </View>
  );
}
