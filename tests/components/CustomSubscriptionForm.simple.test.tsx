import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CustomSubscriptionForm } from '@/components/features/CustomSubscriptionForm';

describe('CustomSubscriptionForm - Simple Tests', () => {
  it('should render add button initially', () => {
    const mockOnAdd = vi.fn();
    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    expect(screen.getByText('カスタムサブスクを追加')).toBeInTheDocument();
  });

  it('should show form elements', async () => {
    const mockOnAdd = vi.fn();
    const { getByText } = render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    const addButton = getByText('カスタムサブスクを追加');
    addButton.click();

    // WHY: フォームが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('ADD CUSTOM')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('サービス名')).toBeInTheDocument();
    expect(screen.getByLabelText('月額料金（円）')).toBeInTheDocument();
    expect(screen.getByText('追加する')).toBeInTheDocument();
  });
});
