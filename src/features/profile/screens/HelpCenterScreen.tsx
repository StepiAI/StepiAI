import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { MicIcon, SearchIcon } from '../../../shared/components/Icons';
import { useTextStyle } from '../../../shared/theme/typography';
import { HELP_ARTICLES, type HelpArticle } from '../helpArticles';
import { HelpArticleModal } from '../components/HelpArticleModal';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsScreenLayout } from '../components/SettingsScreenLayout';
import { SettingsSection } from '../components/SettingsSection';

const PLACEHOLDER_COLOR = '#A0A0A8';

function matchesQuery(article: HelpArticle, query: string) {
  if (article.title.toLowerCase().includes(query)) return true;
  if (article.intro.toLowerCase().includes(query)) return true;
  return article.sections.some(
    section =>
      section.heading?.toLowerCase().includes(query) ||
      section.body.toLowerCase().includes(query),
  );
}

export function HelpCenterScreen() {
  const textStyle = useTextStyle();

  const [query, setQuery] = useState('');
  const [openArticle, setOpenArticle] = useState<HelpArticle | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const trimmed = query.trim().toLowerCase();
  const articles = trimmed
    ? HELP_ARTICLES.filter(article => matchesQuery(article, trimmed))
    : HELP_ARTICLES;

  return (
    <SettingsScreenLayout title="Help Center">
      <View className="h-[46px] flex-row items-center gap-[10px] rounded-[12px] bg-light-sheet px-[14px]">
        <SearchIcon />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for help..."
          placeholderTextColor={PLACEHOLDER_COLOR}
          className="flex-1 text-[15px] text-light-ink"
          style={textStyle('regular')}
        />

        <MicIcon color={PLACEHOLDER_COLOR} size={18} />
      </View>

      <SettingsSection title="Popular Topics">
        {articles.length ? (
          articles.map(article => (
            <SettingsRow
              key={article.id}
              label={article.title}
              showChevron
              onPress={() => setOpenArticle(article)}
            />
          ))
        ) : (
          <SettingsRow label="No topics match your search" />
        )}
      </SettingsSection>

      <View className="flex-row items-center gap-[12px] rounded-[14px] bg-light-sheet p-[16px]">
        <View className="flex-1">
          <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
            Can&apos;t find what you need?
          </Text>
          <Text className="mt-[2px] text-[13px] text-light-muted" style={textStyle('regular')}>
            Chat with STEPI AI
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Chat')}
          activeOpacity={0.7}
          className="rounded-full border border-light-accent px-[18px] py-[8px]"
        >
          <Text className="text-[13px] text-light-accent" style={textStyle('semibold')}>
            Ask AI
          </Text>
        </TouchableOpacity>
      </View>

      <HelpArticleModal article={openArticle} onClose={() => setOpenArticle(null)} />
    </SettingsScreenLayout>
  );
}
