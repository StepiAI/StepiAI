import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { renderAgendaWidget } from './components/AgendaWidget';
import { readWidgetSnapshot } from './storage';
import { refreshWidgetSnapshot } from './sync';

export async function widgetTaskHandler({
  widgetAction,
  widgetInfo,
  renderWidget,
}: WidgetTaskHandlerProps) {
  const { height } = widgetInfo;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE': {
      renderWidget(renderAgendaWidget(await readWidgetSnapshot(), height));
      renderWidget(renderAgendaWidget(await refreshWidgetSnapshot(), height));
      break;
    }

    case 'WIDGET_RESIZED': {
      renderWidget(renderAgendaWidget(await readWidgetSnapshot(), height));
      break;
    }

    case 'WIDGET_DELETED':
    case 'WIDGET_CLICK':
      break;
  }
}
