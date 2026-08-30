import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { BoqTable } from '@/components/boq/boq-table';
import { BoqItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

const items: BoqItem[] = [
  {
    id: 'boq-1',
    projectId: 'proj-1',
    description: 'Reinforced concrete foundation',
    unit: 'm3',
    quantity: 860,
    unitPrice: 4850,
    total: 4_171_000,
    createdAt: '2026-08-21T00:00:00.000Z',
    updatedAt: '2026-08-21T00:00:00.000Z',
  },
  {
    id: 'boq-2',
    projectId: 'proj-1',
    description: 'Formwork',
    unit: 'm2',
    quantity: 120,
    unitPrice: 250,
    total: 30_000,
    createdAt: '2026-08-21T00:00:00.000Z',
    updatedAt: '2026-08-21T00:00:00.000Z',
  },
];

describe('BoqTable', () => {
  it('shows each line total and the project Total BOQ value', () => {
    const totalBoqValue = 4_201_000;

    render(
      <BoqTable
        items={items}
        totalBoqValue={totalBoqValue}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText('Reinforced concrete foundation')).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(4_171_000))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(30_000))).toBeInTheDocument();
    expect(screen.getByText('Total BOQ Rate Value:')).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(totalBoqValue))).toBeInTheDocument();
  });
});
