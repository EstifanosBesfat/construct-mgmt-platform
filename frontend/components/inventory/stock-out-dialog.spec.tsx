import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { useMaterials } from '@/hooks/use-materials';
import { useProjects } from '@/hooks/use-projects';
import { useStockOut } from '@/hooks/use-inventory';

jest.mock('@/hooks/use-materials', () => ({
  useMaterials: jest.fn(),
}));
jest.mock('@/hooks/use-projects', () => ({
  useProjects: jest.fn(),
}));
jest.mock('@/hooks/use-inventory', () => ({
  useStockOut: jest.fn(),
}));

const mockedMaterials = useMaterials as jest.Mock;
const mockedProjects = useProjects as jest.Mock;
const mockedStockOut = useStockOut as jest.Mock;

describe('StockOutDialog', () => {
  const mutateAsync = jest.fn();

  beforeEach(() => {
    mutateAsync.mockClear();
    mockedStockOut.mockReturnValue({ mutateAsync, isPending: false });
    mockedMaterials.mockReturnValue({
      data: {
        data: [
          {
            id: 'mat-1',
            name: 'Portland Cement 42.5N',
            code: 'MAT-001',
            unit: 'bag',
            currentStock: 50,
            minimumStock: 10,
            isLowStock: false,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    });
    mockedProjects.mockReturnValue({
      data: {
        data: [
          {
            id: 'proj-1',
            name: 'Bole Mixed-Use Tower',
            code: 'PRJ-DEMO',
            clientName: 'Addis Holdings PLC',
            location: 'Bole',
            startDate: '2026-09-01',
            endDate: '2027-06-30',
            budget: 12_500_000,
            status: 'PLANNED',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    });
  });

  it('shows an error and blocks submit when quantity exceeds available stock', () => {
    render(<StockOutDialog isOpen onClose={jest.fn()} />);

    const quantityInput = screen.getByPlaceholderText('e.g. 50');
    fireEvent.change(quantityInput, { target: { value: '80' } });

    expect(screen.getByText(/Exceeds available stock of 50/)).toBeInTheDocument();
    expect(screen.getByText(/Rejection Warning/)).toBeInTheDocument();
    expect(screen.getByText(/exceeds available stock \(50\)/)).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: 'Confirm Stock-Out' });
    expect(submit).toBeDisabled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
