import { act, create } from 'react-test-renderer';
import { useInterval } from '../useInterval';

function IntervalRunner({
  onTick,
  delayMs,
}: {
  onTick: () => void;
  delayMs: number | null;
}) {
  useInterval(onTick, delayMs);
  return null;
}

describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls the callback repeatedly at the given interval', () => {
    const onTick = jest.fn();

    act(() => {
      create(<IntervalRunner onTick={onTick} delayMs={1000} />);
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it('does not schedule anything when delayMs is null', () => {
    const onTick = jest.fn();

    act(() => {
      create(<IntervalRunner onTick={onTick} delayMs={null} />);
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onTick).not.toHaveBeenCalled();
  });
});
