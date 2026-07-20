import { Text, TouchableOpacity, View } from 'react-native';
import { CheckBadge } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { ChatMessage } from '../types';
import { ScheduleProposalCard } from './ScheduleProposalCard';

interface MessageBubbleProps {
  message: ChatMessage;
  onQuickReply?: (reply: string) => void;
}

export function MessageBubble({ message, onQuickReply }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <View className="mb-[14px] max-w-[78%] self-end">
        <View
          className={`rounded-[22px] bg-light-userBubble px-[18px] py-[12px] ${
            message.status === 'sending' ? 'opacity-60' : ''
          }`}
        >
          <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
            {message.text}
          </Text>
        </View>

        {message.status === 'failed' ? (
          <Text
            className="mt-[4px] self-end text-[12px] text-light-muted"
            style={textStyle('regular')}
          >
            Not sent
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="mb-[14px] max-w-[86%] self-start rounded-[18px] border border-light-line bg-light-bubble px-[16px] py-[14px]">
      <Text className="text-[15px] leading-[21px] text-light-ink" style={textStyle('medium')}>
        {message.text}
      </Text>

      {message.bullets?.map(bullet => (
        <View key={bullet} className="mt-[8px] flex-row items-center gap-[8px] pl-[6px]">
          <CheckBadge />
          <Text className="flex-1 text-[15px] text-light-ink" style={textStyle('medium')}>
            {bullet}
          </Text>
        </View>
      ))}

      {message.proposal ? (
        <ScheduleProposalCard
          messageId={message.id}
          proposal={message.proposal}
          status={message.proposalStatus ?? 'pending'}
        />
      ) : null}

      {message.quickReplies?.length ? (
        <View className="mt-[14px] flex-row flex-wrap gap-[10px]">
          {message.quickReplies.map(reply => (
            <TouchableOpacity
              key={reply}
              activeOpacity={0.7}
              onPress={() => onQuickReply?.(reply)}
              className="rounded-[10px] border border-light-accentLine bg-light-accentSoft px-[14px] py-[9px]"
            >
              <Text className="text-[13px] text-light-accent" style={textStyle('semibold')}>
                {reply}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
