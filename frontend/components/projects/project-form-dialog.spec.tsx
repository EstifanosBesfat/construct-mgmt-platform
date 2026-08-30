import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';

jest.mock('@/hooks/use-projects', () => ({
  useCreateProject: jest.fn(),
  useUpdateProject: jest.fn(),
}));

const mockedCreate = useCreateProject as jest.Mock;
const mockedUpdate = useUpdateProject as jest.Mock;

describe('ProjectFormDialog', () => {
  const mutateAsync = jest.fn().mockResolvedValue({ id: 'proj-1' });
  const onClose = jest.fn();

  beforeEach(() => {
    mutateAsync.mockClear();
    onClose.mockClear();
    mockedCreate.mockReturnValue({ mutateAsync, isPending: false });
    mockedUpdate.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
  });

  it('renders the create-project form and submits valid values', async () => {
    const user = userEvent.setup();

    render(<ProjectFormDialog isOpen onClose={onClose} />);

    expect(screen.getByText('Create New Project')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. Riverside Complex'), 'Bole Mixed-Use Tower');
    await user.type(screen.getByPlaceholderText('e.g. PRJ-006'), 'prj-demo');
    await user.type(screen.getByPlaceholderText('e.g. Horizon Group'), 'Addis Holdings PLC');
    await user.type(screen.getByPlaceholderText('e.g. Addis Ababa, Bole'), 'Bole, Addis Ababa');
    await user.type(screen.getByPlaceholderText('e.g. 50000000'), '12500000');

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-09-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2027-06-30' } });

    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bole Mixed-Use Tower',
        code: 'PRJ-DEMO',
        clientName: 'Addis Holdings PLC',
        location: 'Bole, Addis Ababa',
        budget: 12500000,
        status: 'PLANNED',
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
