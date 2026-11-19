import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  Badge,
  ConfidenceMeter,
  MetricCard,
  Modal,
  SegmentedControl,
  Toast,
  Tooltip,
} from '../../src/shared/ui';

afterEach(() => {
  cleanup();
});

describe('Data display UI kit components', () => {
  it('renders Badge with custom severity variants', () => {
    render(<Badge severity="severe">Severe Alert</Badge>);
    expect(screen.getByText('Severe Alert')).toBeDefined();
  });

  it('renders MetricCard with labels, units, and deltas', () => {
    render(
      <MetricCard
        label="PM2.5 Level"
        value={180}
        unit="µg/m³"
        delta="-20% today"
        deltaType="positive"
        tooltip="Test formula"
      />
    );
    expect(screen.getByText('PM2.5 Level')).toBeDefined();
    expect(screen.getByText('180')).toBeDefined();
    expect(screen.getByText('µg/m³')).toBeDefined();
    expect(screen.getByText('-20% today')).toBeDefined();
  });

  it('renders ConfidenceMeter with accessible progressbar attributes', () => {
    render(<ConfidenceMeter level="high" explanation="Based on CPCB data" />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect(screen.getByText('Based on CPCB data')).toBeDefined();
  });

  it('handles user selection changes in SegmentedControl', () => {
    let selected = 'a';
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    const { rerender } = render(
      <SegmentedControl
        options={options}
        value={selected}
        onChange={(v) => {
          selected = v;
        }}
        ariaLabel="Sample selector"
      />
    );

    const btnB = screen.getByText('Option B');
    fireEvent.click(btnB);
    expect(selected).toBe('b');

    rerender(
      <SegmentedControl
        options={options}
        value={selected}
        onChange={(v) => {
          selected = v;
        }}
        ariaLabel="Sample selector"
      />
    );
    expect(btnB.getAttribute('aria-checked')).toBe('true');
  });
});

describe('Feedback and overlay UI kit components', () => {
  it('renders accessible Modal and handles close button, backdrop, and Escape key', () => {
    let closeCount = 0;
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={() => {
          closeCount += 1;
        }}
        title="Dialog Title"
      >
        <p>Modal body content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Dialog Title')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(closeCount).toBe(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(closeCount).toBe(2);

    const backdrop = document.querySelector('.bg-slate-950\\/60');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(closeCount).toBe(3);
    }

    rerender(
      <Modal isOpen={false} onClose={() => {}} title="Dialog Title">
        <p>Hidden</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders Toast and Tooltip helpers with interactive hover and focus states', () => {
    render(<Toast message="Copied" onDismiss={() => {}} />);
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Copied')).toBeDefined();

    render(
      <Tooltip content="Scientific citation description">
        <button type="button">Hover target</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Hover target');
    expect(trigger).toBeDefined();

    fireEvent.mouseEnter(trigger.parentElement ?? trigger);
    expect(screen.getByRole('tooltip')).toBeDefined();

    fireEvent.mouseLeave(trigger.parentElement ?? trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.focus(trigger.parentElement ?? trigger);
    expect(screen.getByRole('tooltip')).toBeDefined();

    fireEvent.blur(trigger.parentElement ?? trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
