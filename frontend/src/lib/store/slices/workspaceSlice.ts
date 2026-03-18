import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  currentWorkspace: any | null;
  currentWorkspaceId: string | null;
  theme: any | null;
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
    setWorkspace: (state, action: PayloadAction<any>) => {
      state.currentWorkspace = action.payload;
      state.currentWorkspaceId = action.payload?.id ?? null;
    },
    setTheme: (state, action: PayloadAction<any>) => {
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
