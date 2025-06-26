/**
 * Unified API Service - Central hub for all backend communication
 * Handles authentication, error handling, and service coordination
 */

class UnifiedApiService {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.authToken = null;
    this.refreshTokenTimer = null;
    this.requestQueue = [];
    this.isRefreshing = false;
  }

  // Authentication Management
  setAuthToken(token) {
    this.authToken = token;
    localStorage.setItem('authToken', token);
    this.startTokenRefreshTimer();
  }

  getAuthToken() {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('authToken') || 'demo-token';
    }
    return this.authToken;
  }

  startTokenRefreshTimer() {
    // Refresh token every 45 minutes (Firebase tokens expire in 1 hour)
    this.refreshTokenTimer = setInterval(() => {
      this.refreshAuthToken();
    }, 45 * 60 * 1000);
  }

  async refreshAuthToken() {
    try {
      // Implement Firebase token refresh logic here
      const auth = await import('../firebase');
      if (auth.auth.currentUser) {
        const newToken = await auth.auth.currentUser.getIdToken(true);
        this.setAuthToken(newToken);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  // Enhanced HTTP Client with retry logic and error handling
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw this.handleApiError(error);
    }
  }

  handleApiError(error) {
    if (error.message.includes('401')) {
      // Token expired or invalid
      this.refreshAuthToken();
      return new Error('Authentication required. Please log in again.');
    } else if (error.message.includes('403')) {
      return new Error('Access denied. Insufficient permissions.');
    } else if (error.message.includes('500')) {
      return new Error('Server error. Please try again later.');
    }
    return error;
  }

  // === EXPENSE MANAGEMENT SERVICES ===
  
  async getExpenses(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.makeRequest(`/expenses${queryParams ? `?${queryParams}` : ''}`);
  }

  async addExpense(expenseData) {
    return this.makeRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }

  async updateExpense(expenseId, expenseData) {
    return this.makeRequest(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData)
    });
  }

  async deleteExpense(expenseId) {
    return this.makeRequest(`/expenses/${expenseId}`, {
      method: 'DELETE'
    });
  }

  async getCategoryBreakdown(period = 'month') {
    return this.makeRequest(`/category-breakdown?period=${period}`);
  }

  async getSpendingAnalysis(userId) {
    return this.makeRequest(`/spending-analysis/${userId}`);
  }

  // === BANK STATEMENT SERVICES ===
  
  async uploadBankStatement(file, bankName) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bank_name', bankName);

    return this.makeRequest('/upload-statement', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
        // Don't set Content-Type for FormData
      },
      body: formData
    });
  }

  async getBankStatementHistory() {
    return this.makeRequest('/bank-statements');
  }

  async processTransactions(statementId) {
    return this.makeRequest(`/process-transactions/${statementId}`, {
      method: 'POST'
    });
  }

  // === AI & GEMINI SERVICES ===
  
  async getContentSuggestions(userProfile) {
    return this.makeRequest('/api/content/suggestions', {
      method: 'POST',
      body: JSON.stringify({ user_profile: userProfile })
    });
  }

  async askGeminiAssistant(query, context = {}) {
    return this.makeRequest('/api/content/ask', {
      method: 'POST',
      body: JSON.stringify({ 
        query, 
        context,
        user_id: this.getCurrentUserId()
      })
    });
  }

  async getPersonalizedInsights() {
    return this.makeRequest('/api/content/insights');
  }

  // === TAX FILING SERVICES ===
  
  async getTaxForms() {
    return this.makeRequest('/api/tax/forms');
  }

  async getTaxFormDetails(formId) {
    return this.makeRequest(`/api/tax/forms/${formId}`);
  }

  async saveTaxDraft(formId, formData) {
    return this.makeRequest('/api/tax/drafts', {
      method: 'POST',
      body: JSON.stringify({ form_id: formId, form_data: formData })
    });
  }

  async getTaxDrafts(formId = null) {
    const query = formId ? `?form_id=${formId}` : '';
    return this.makeRequest(`/api/tax/drafts${query}`);
  }

  async submitTaxReturn(formId, formData) {
    return this.makeRequest('/api/tax/submit', {
      method: 'POST',
      body: JSON.stringify({ form_id: formId, form_data: formData })
    });
  }

  async getTaxAssistance(formId, fieldId, query, formData = {}) {
    return this.makeRequest('/api/tax/assist', {
      method: 'POST',
      body: JSON.stringify({ 
        form_id: formId, 
        field_id: fieldId, 
        user_query: query, 
        form_data: formData 
      })
    });
  }

  async recommendTaxForms(financialProfile) {
    return this.makeRequest('/api/tax/recommend-forms', {
      method: 'POST',
      body: JSON.stringify(financialProfile)
    });
  }

  async uploadTaxDocument(file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    return this.makeRequest('/api/tax/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: formData
    });
  }

  async getTaxDocuments() {
    return this.makeRequest('/api/tax/documents');
  }

  // === FIRESTORE INTEGRATION ===
  
  async syncWithFirestore(data, collection) {
    return this.makeRequest('/api/firestore/sync', {
      method: 'POST',
      body: JSON.stringify({ data, collection })
    });
  }

  async getFirestoreData(collection, documentId = null) {
    const endpoint = documentId 
      ? `/api/firestore/${collection}/${documentId}`
      : `/api/firestore/${collection}`;
    return this.makeRequest(endpoint);
  }

  // === UNIFIED DASHBOARD DATA ===
  
  async getDashboardData() {
    try {
      const [expenses, insights, taxStatus, bankStatements] = await Promise.all([
        this.getExpenses({ recent: true }),
        this.getPersonalizedInsights(),
        this.getTaxDrafts(),
        this.getBankStatementHistory()
      ]);

      return {
        expenses: expenses.expenses || [],
        insights: insights.insights || [],
        taxStatus: taxStatus.drafts || [],
        bankStatements: bankStatements.statements || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // === UTILITY METHODS ===
  
  getCurrentUserId() {
    // Extract user ID from auth token or return default
    try {
      const auth = require('../firebase');
      return auth.auth.currentUser?.uid || 'demo-user';
    } catch {
      return 'demo-user';
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // === REAL-TIME FEATURES ===
  
  setupWebSocket() {
    // WebSocket connection for real-time updates
    this.ws = new WebSocket(`ws://localhost:8000/ws`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRealTimeUpdate(data);
    };

    this.ws.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(() => this.setupWebSocket(), 5000);
    };
  }

  handleRealTimeUpdate(data) {
    // Emit custom events for components to listen
    window.dispatchEvent(new CustomEvent('finmate-update', { detail: data }));
  }

  // === CLEANUP ===
  
  destroy() {
    if (this.refreshTokenTimer) {
      clearInterval(this.refreshTokenTimer);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Singleton instance
const unifiedApiService = new UnifiedApiService();

export default unifiedApiService;
