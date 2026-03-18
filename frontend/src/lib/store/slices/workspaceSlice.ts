import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Workspace, WorkspaceTheme } from '@/types';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  currentWorkspaceId: string | null;
  theme: WorkspaceTheme | null;
}

const initialState: WorkspaceState = {
  currentWorkspace: null,
  currentWorkspaceId: null,
  theme: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.currentWorkspace = action.payload;
      state.currentWorkspaceId = action.payload?.id ?? null;
    },
    setTheme: (state, action: PayloadAction<WorkspaceTheme>) => {
      state.theme = action.payload;
    },
    clearWorkspace: (state) => {
      state.currentWorkspace = null;
      state.currentWorkspaceId = null;
      state.theme = null;
    },
  },
});

export const { setWorkspace, setTheme, clearWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
