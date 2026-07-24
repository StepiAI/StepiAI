import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetEvent, WidgetSnapshot } from '../types';
import { darkTheme, lightTheme, type WidgetTheme } from '../theme';

const COMPACT_HEIGHT_DP = 150;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AgendaWidgetProps {
  snapshot: WidgetSnapshot;
  theme: WidgetTheme;
  height: number;
}

function resolveDate(iso: string) {
  const date = new Date(iso);
  const t = date.getTime();
  return Number.isNaN(t) || t === 0 ? new Date() : date;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function allEvents(snapshot: WidgetSnapshot): WidgetEvent[] {
  return snapshot.nextUp ? [snapshot.nextUp, ...snapshot.upcoming] : snapshot.upcoming;
}

function DateCard({
  date,
  countLabel,
  theme,
}: {
  date: Date;
  countLabel: string;
  theme: WidgetTheme;
}) {
  const bigDate = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  const sub = `${WEEKDAYS[date.getDay()]} · ${formatClock(date)}`;

  return (
    <FlexWidget
      style={{
        flex: 5,
        height: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundGradient: { from: theme.dateFrom, to: theme.dateTo, orientation: 'TOP_BOTTOM' },
        borderRadius: 20,
        padding: 16,
      }}
    >
      <TextWidget
        text={bigDate}
        style={{ fontSize: 30, fontWeight: '700', color: theme.dateInk }}
      />

      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget
          text={sub}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 13, fontWeight: '600', color: theme.dateInk }}
        />
        <TextWidget
          text={countLabel}
          style={{ fontSize: 12, color: theme.dateSub, marginTop: 3 }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}


function EventRow({
  event,
  now,
  theme,
}: {
  event: WidgetEvent;
  now: boolean;
  theme: WidgetTheme;
}) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 12,
      }}
    >
      <FlexWidget
        style={{
          width: 3,
          height: 30,
          borderRadius: 3,
          backgroundColor: now ? theme.barNow : theme.bar,
          marginRight: 11,
        }}
      />
      <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
        <TextWidget
          text={event.title}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 13, fontWeight: '600', color: theme.ink }}
        />
        <TextWidget
          text={event.timeLabel}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 11, color: theme.muted, marginTop: 3 }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function PanelMessage({
  title,
  caption,
  theme,
}: {
  title: string;
  caption: string;
  theme: WidgetTheme;
}) {
  return (
    <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
      <TextWidget text={title} style={{ fontSize: 15, fontWeight: '600', color: theme.ink }} />
      <TextWidget
        text={caption}
        maxLines={2}
        truncate="END"
        style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}
      />
    </FlexWidget>
  );
}

function UpcomingPanel({ snapshot, theme, height }: AgendaWidgetProps) {
  if (snapshot.state === 'needs_setup') {
    return (
      <PanelMessage
        theme={theme}
        title="Hubungkan kalender"
        caption="Tap buat sambungin Google Calendar kamu."
      />
    );
  }

  const events = allEvents(snapshot);

  if (snapshot.state === 'empty' || events.length === 0) {
    return (
      <PanelMessage
        theme={theme}
        title="Kosong, santai dulu ✨"
        caption="Ga ada agenda dalam waktu dekat."
      />
    );
  }

  const maxRows = height < COMPACT_HEIGHT_DP ? 2 : 3;
  const rows = events.slice(0, maxRows);

  return (
    <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
      <TextWidget
        text="UPCOMING"
        style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: theme.label }}
      />
      {rows.map((event, index) => (
        <EventRow
          key={event.id}
          event={event}
          now={index === 0 && snapshot.inProgress}
          theme={theme}
        />
      ))}
    </FlexWidget>
  );
}

export function AgendaWidget({ snapshot, theme, height }: AgendaWidgetProps) {
  const date = resolveDate(snapshot.generatedAt);
  const count = allEvents(snapshot).length;

  const countLabel =
    snapshot.state === 'needs_setup'
      ? 'Not connected'
      : count === 0
        ? 'No events'
        : `${count} event${count === 1 ? '' : 's'}`;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel="Stepi agenda. Tap to open the app."
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'row',
        backgroundColor: theme.canvas,
        borderRadius: 28,
        padding: 12,
      }}
    >
      <DateCard date={date} countLabel={countLabel} theme={theme} />
      <FlexWidget style={{ flex: 6, height: 'match_parent', marginLeft: 12, paddingVertical: 4 }}>
        <UpcomingPanel snapshot={snapshot} theme={theme} height={height} />
      </FlexWidget>
    </FlexWidget>
  );
}

export function renderAgendaWidget(snapshot: WidgetSnapshot, height: number) {
  return {
    light: <AgendaWidget snapshot={snapshot} theme={lightTheme} height={height} />,
    dark: <AgendaWidget snapshot={snapshot} theme={darkTheme} height={height} />,
  };
}
