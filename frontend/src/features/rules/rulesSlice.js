import { createSlice } from '@reduxjs/toolkit';

const rulesSlice = createSlice({
  name: 'rules',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setRules: (state, action) => {
      state.list = action.payload;
    },
    updateRuleInList: (state, action) => {
      state.list = state.list.map((rule) => (rule.id === action.payload.id ? action.payload : rule));
    },
    setRulesLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRulesError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setRules, updateRuleInList, setRulesLoading, setRulesError } = rulesSlice.actions;
export default rulesSlice.reducer;
