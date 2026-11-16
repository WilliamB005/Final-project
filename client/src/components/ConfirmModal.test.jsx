// Component tests for the "Are you sure?" dialog (Session 22: test what the user sees).
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import { ConfirmModal } from './Modal';

it('shows the title and the message', () => {
  render(
    <ConfirmModal title="Delete room?" message="This can't be undone." onConfirm={() => {}} onClose={() => {}} />,
  );
  expect(screen.getByText('Delete room?')).toBeInTheDocument();
  expect(screen.getByText("This can't be undone.")).toBeInTheDocument();
});

it('calls onConfirm when Delete is clicked', async () => {
  const onConfirm = vi.fn();
  render(<ConfirmModal title="Delete room?" message="Sure?" onConfirm={onConfirm} onClose={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(onConfirm).toHaveBeenCalled();
});

it('calls onClose when Cancel is clicked', async () => {
  const onClose = vi.fn();
  render(<ConfirmModal title="Delete room?" message="Sure?" onConfirm={() => {}} onClose={onClose} />);
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).toHaveBeenCalled();
});
