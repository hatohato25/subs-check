import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomSubscriptionForm } from '@/components/features/CustomSubscriptionForm';
import type { CustomSubscription } from '@/types/subscription';

describe('CustomSubscriptionForm', () => {
  it('should render add button initially', () => {
    const mockOnAdd = vi.fn();
    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    expect(screen.getByText('カスタムサブスクを追加')).toBeInTheDocument();
  });

  it('should open form when add button clicked', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    const addButton = screen.getByText('カスタムサブスクを追加');
    await user.click(addButton);

    // WHY: フォームが開かれたか確認
    expect(screen.getByText('ADD CUSTOM')).toBeInTheDocument();
    expect(screen.getByLabelText('サービス名')).toBeInTheDocument();
    expect(screen.getByLabelText('月額料金（円）')).toBeInTheDocument();
  });

  it('should close form when close button clicked', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    // フォームを開く
    await user.click(screen.getByText('カスタムサブスクを追加'));

    // 閉じるボタンをクリック
    const closeButton = screen.getByLabelText('閉じる');
    await user.click(closeButton);

    // WHY: フォームが閉じられて初期状態に戻る
    expect(screen.queryByText('ADD CUSTOM')).not.toBeInTheDocument();
    expect(screen.getByText('カスタムサブスクを追加')).toBeInTheDocument();
  });

  it('should show validation error when name is empty', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    // フォームを開く
    await user.click(screen.getByText('カスタムサブスクを追加'));

    // 金額のみ入力
    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '1000');

    // 送信
    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    // WHY: バリデーションエラーが表示される
    await waitFor(() => {
      expect(screen.getByText('サービス名を入力してください')).toBeInTheDocument();
    });

    // WHY: onAddは呼ばれない
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should show validation error when price is empty', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    // フォームを開く
    await user.click(screen.getByText('カスタムサブスクを追加'));

    // サービス名のみ入力
    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, 'ChatGPT Plus');

    // 送信
    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    // WHY: バリデーションエラーが表示される
    await waitFor(() => {
      expect(screen.getByText('有効な金額を入力してください')).toBeInTheDocument();
    });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it.skip('should show validation error when price is negative', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    await user.click(screen.getByText('カスタムサブスクを追加'));

    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, 'Test Service');

    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '-100');

    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('有効な金額を入力してください')).toBeInTheDocument();
    });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it.skip('should show validation error when price exceeds 999999', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    await user.click(screen.getByText('カスタムサブスクを追加'));

    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, 'Test Service');

    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '1000000');

    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('金額は999,999円以下で入力してください')).toBeInTheDocument();
    });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should add custom subscription with valid inputs', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    await user.click(screen.getByText('カスタムサブスクを追加'));

    // サービス名を入力
    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, 'ChatGPT Plus');

    // 金額を入力
    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '2000');

    // 送信
    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    // WHY: onAddが正しい形式で呼ばれたか確認
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringContaining('custom-'),
          name: 'ChatGPT Plus',
          nameEn: 'ChatGPT Plus',
          price: 2000,
          category: 'custom',
          isCustom: true,
          fallbackIcon: '📱', // デフォルトの絵文字
          color: '#FF6F00',
        })
      );
    });

    // WHY: フォームが閉じられる
    expect(screen.queryByText('ADD CUSTOM')).not.toBeInTheDocument();
  });

  it('should trim whitespace from name', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    await user.click(screen.getByText('カスタムサブスクを追加'));

    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, '  ChatGPT Plus  ');

    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '2000');

    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    // WHY: 前後の空白が除去される
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ChatGPT Plus',
          nameEn: 'ChatGPT Plus',
        })
      );
    });
  });

  it('should show validation error when name is only whitespace', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    await user.click(screen.getByText('カスタムサブスクを追加'));

    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, '   ');

    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '1000');

    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('サービス名を入力してください')).toBeInTheDocument();
    });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it.skip('should allow emoji selection', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    await user.click(screen.getByText('カスタムサブスクを追加'));

    // WHY: 絵文字ボタンをクリック（2番目の絵文字を選択）
    const emojiButtons = screen.getAllByRole('button', { name: /^[📱💻🎮📚🏋️🍔☕🎬🎵📦]$/ });
    await user.click(emojiButtons[1]); // 💻

    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, 'Test Service');

    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '1500');

    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    // WHY: 選択した絵文字が設定される
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackIcon: '💻',
        })
      );
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    // 1回目の追加
    await user.click(screen.getByText('カスタムサブスクを追加'));

    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, 'First Service');

    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '1000');

    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    // 2回目の追加
    await user.click(screen.getByText('カスタムサブスクを追加'));

    // WHY: フォームがリセットされているか確認
    const nameInputAgain = screen.getByLabelText('サービス名');
    const priceInputAgain = screen.getByLabelText('月額料金（円）');

    expect(nameInputAgain).toHaveValue('');
    expect(priceInputAgain).toHaveValue(null);
  });

  it('should generate unique id using timestamp', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();

    render(<CustomSubscriptionForm onAdd={mockOnAdd} />);

    await user.click(screen.getByText('カスタムサブスクを追加'));

    const nameInput = screen.getByLabelText('サービス名');
    await user.type(nameInput, 'Service 1');

    const priceInput = screen.getByLabelText('月額料金（円）');
    await user.type(priceInput, '1000');

    const submitButton = screen.getByText('追加する');
    await user.click(submitButton);

    // WHY: IDが custom-{timestamp} の形式で生成される
    await waitFor(() => {
      const call = mockOnAdd.mock.calls[0][0] as CustomSubscription;
      expect(call.id).toMatch(/^custom-\d+$/);
    });
  });
});
