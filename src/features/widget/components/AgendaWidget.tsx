import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetEvent, WidgetSnapshot } from '../types';
import { darkTheme, lightTheme, type WidgetTheme } from '../theme';

const COMPACT_HEIGHT_DP = 130;

interface AgendaWidgetProps {
  snapshot: WidgetSnapshot;
  theme: WidgetTheme;
  height: number;
}

function formatUpdatedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function Header({ snapshot, theme }: Omit<AgendaWidgetProps, 'height'>) {
  const updatedAt = formatUpdatedAt(snapshot.generatedAt);

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}
    >
      <TextWidget
        text="STEPI"
        style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: theme.accent }}
      />
      {updatedAt ? (
        <TextWidget
          text={updatedAt}
          style={{ fontSize: 11, color: theme.faint }}
        />
      ) : (
        <FlexWidget />
      )}
    </FlexWidget>
  );
}

function Message({title, caption, theme,}: { title: string; caption: string; theme: WidgetTheme; }) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <TextWidget
        text={title}
        style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}
      />
      <TextWidget
        text={caption}
        maxLines={2}
        truncate="END"
        style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}
      />
    </FlexWidget>
  );
}

function NextUp({
  event,
  inProgress,
  theme,
}: {
  event: WidgetEvent;
  inProgress: boolean;
  theme: WidgetTheme;
}) {
  const meta = event.location
    ? `${event.timeLabel}  ·  ${event.location}`
    : event.timeLabel;

  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <FlexWidget
          style={{
            backgroundColor: inProgress ? theme.accent : 'rgba(108, 92, 231, 0.18)',
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <TextWidget
            text={inProgress ? 'NOW' : 'NEXT UP'}
            style={{
              fontSize: 9,
              fontWeight: '700',
              letterSpacing: 0.8,
              color: inProgress ? theme.onAccent : theme.accent,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      <TextWidget
        text={event.title}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 19, fontWeight: '700', color: theme.ink }}
      />
      <TextWidget
        text={meta}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}
      />
    </FlexWidget>
  );
}

function UpcomingRow({ event, theme }: { event: WidgetEvent; theme: WidgetTheme }) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
      }}
    >
      <TextWidget
        text={event.timeLabel}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 11, width: 74, color: theme.faint }}
      />
      <FlexWidget style={{ flex: 1 }}>
        <TextWidget
          text={event.title}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 13, color: theme.muted }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function Body({ snapshot, theme, height }: AgendaWidgetProps) {
  if (snapshot.state === 'needs_setup') {
    return (
      <Message
        theme={theme}
        title="Connect your calendar"
        caption="Tap to link Google Calendar and see your day here."
      />
    );
  }

  if (snapshot.state === 'empty' || !snapshot.nextUp) {
    return (
      <Message
        theme={theme}
        title="Nothing scheduled"
        caption="You're clear for the next 7 days."
      />
    );
  }

  const compact = height < COMPACT_HEIGHT_DP;

  return (
    <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'column' }}>
      <NextUp event={snapshot.nextUp} inProgress={snapshot.inProgress} theme={theme} />

      {compact || snapshot.upcoming.length === 0 ? (
        <FlexWidget />
      ) : (
        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'column',
            marginTop: 10,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: theme.line,
          }}
        >
          {snapshot.upcoming.map(event => (
            <UpcomingRow key={event.id} event={event} theme={theme} />
          ))}
        </FlexWidget>
      )}
    </FlexWidget>
  );
}

export function AgendaWidget({ snapshot, theme, height }: AgendaWidgetProps) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel="Stepi agenda. Tap to open the app."
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'column',
        backgroundColor: theme.canvas,
        borderRadius: 24,
        padding: 14,
      }}
    >
      <Header snapshot={snapshot} theme={theme} />
      <Body snapshot={snapshot} theme={theme} height={height} />
    </FlexWidget>
  );
}

export function renderAgendaWidget(snapshot: WidgetSnapshot, height: number) {
  return {
    light: <AgendaWidget snapshot={snapshot} theme={lightTheme} height={height} />,
    dark: <AgendaWidget snapshot={snapshot} theme={darkTheme} height={height} />,
  };
}
