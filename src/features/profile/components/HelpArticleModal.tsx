import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from '../../../shared/components/Icons';
import { useTextStyle } from '../../../shared/theme/typography';
import type { HelpArticle } from '../helpArticles';

interface HelpArticleModalProps {
  article: HelpArticle | null;
  onClose: () => void;
}

// sheet artikel Help Center. Pakai RN Modal biasa (jalan di Android & iOS);
// insets dipasang manual karena SafeAreaView di dalem Modal ngukurnya 0.
export function HelpArticleModal({ article, onClose }: HelpArticleModalProps) {
  const textStyle = useTextStyle();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={article !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        {/* tap area gelap di atas sheet = tutup */}
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close help article" />

        <View
          className="max-h-[85%] overflow-hidden rounded-t-[24px] bg-light-canvas"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row items-center justify-between px-[20px] pb-[10px] pt-[16px]">
            <Text
              className="flex-1 pr-[12px] text-[19px] text-light-inkStrong"
              style={textStyle('bold')}
              numberOfLines={2}
            >
              {article?.title}
            </Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close"
              className="h-[36px] w-[36px] items-center justify-center rounded-full bg-white"
            >
              <CloseIcon size={12} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-[20px]"
            contentContainerClassName="pb-[16px]"
            showsVerticalScrollIndicator={false}
          >
            {article ? (
              <>
                <Text
                  className="text-[14px] leading-[21px] text-light-muted"
                  style={textStyle('regular')}
                >
                  {article.intro}
                </Text>

                <View className="mt-[14px] gap-[12px]">
                  {article.sections.map((section, index) => (
                    <View
                      key={section.heading ?? index}
                      className="rounded-[14px] bg-white p-[16px]"
                    >
                      {section.heading ? (
                        <Text
                          className="text-[15px] text-light-inkStrong"
                          style={textStyle('semibold')}
                        >
                          {section.heading}
                        </Text>
                      ) : null}
                      <Text
                        className={`text-[14px] leading-[21px] text-light-ink ${
                          section.heading ? 'mt-[6px]' : ''
                        }`}
                        style={textStyle('regular')}
                      >
                        {section.body}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
