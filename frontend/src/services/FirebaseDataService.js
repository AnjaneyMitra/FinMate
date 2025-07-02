// Firebase Data Service for FinMate
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export class FirebaseDataService {
  constructor() {
    this.userId = null;
    this.listeners = new Map(); // For real-time listeners
  }

  // Get current user ID
  getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
      console.warn('⚠️ FirebaseDataService: No authenticated user found. Operations might fail or use anonymous context if rules allow.');
      return 'anonymous-user'; // Fallback, though most operations should be guarded by auth state.
    }
    console.log('✅ FirebaseDataService: Operating with user ID:', user.uid);
    return user.uid;
  }

  // Transaction Management
  async addTransaction(transactionData) {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to add transactions');
      }

      const userId = this.getCurrentUserId();
      console.log('🔄 Adding transaction for user:', userId);
      console.log('📝 Transaction data:', transactionData);
      
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // If assigned to a goal, increment goal's saved
      if (transactionData.goalId && transactionData.amount > 0) {
        await this.incrementGoalSaved(transactionData.goalId, transactionData.amount);
      }
      
      console.log('✅ Transaction added with ID:', docRef.id);
      return { id: docRef.id, ...transactionData };
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firebase security rules.');
      }
      throw error;
    }
  }

  async updateTransaction(transactionId, updateData) {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      // Get previous transaction for goal/amount diff
      const prevSnap = await getDoc(docRef);
      const prev = prevSnap.exists() ? prevSnap.data() : null;
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      // Handle goal progress update
      if (prev) {
        // If goal changed, decrement old, increment new
        if (prev.goalId && prev.goalId !== updateData.goalId) {
          await this.decrementGoalSaved(prev.goalId, prev.amount);
        }
        if (updateData.goalId) {
          // If same goal, adjust by diff; if new, increment new
          const diff = (updateData.amount || 0) - (prev.goalId === updateData.goalId ? (prev.amount || 0) : 0);
          if (diff !== 0) {
            if (diff > 0) await this.incrementGoalSaved(updateData.goalId, diff);
            else await this.decrementGoalSaved(updateData.goalId, -diff);
          } else if (prev.goalId !== updateData.goalId) {
            await this.incrementGoalSaved(updateData.goalId, updateData.amount || 0);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(transactionId) {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      const prevSnap = await getDoc(docRef);
      const prev = prevSnap.exists() ? prevSnap.data() : null;
      await deleteDoc(docRef);
      // If linked to a goal, decrement saved
      if (prev && prev.goalId && prev.amount > 0) {
        await this.decrementGoalSaved(prev.goalId, prev.amount);
      }
      return true;
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      throw error;
    }
  }

  async getTransactions(filters = {}) {
    try {
      const userId = this.getCurrentUserId();
      
      // Use simple query without date filters to avoid Firestore index issues
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      // Only apply category filter at database level if specified
      if (filters.category && filters.category !== 'all') {
        q = query(q, where('category', '==', filters.category));
      }

      const querySnapshot = await getDocs(q);
      let transactions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings for consistent processing
          date: data.date?.toDate?.()?.toISOString() || data.date,
          createdAt: data.createdAt?.toDate?.()?.toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString()
        });
      });

      console.log(`📊 FirebaseDataService: Retrieved ${transactions.length} total transactions before filtering`);

      // Apply date filters in memory to avoid Firestore index/timezone issues
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        transactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= startDate;
        });
        console.log(`📊 FirebaseDataService: ${transactions.length} transactions after startDate filter (${filters.startDate})`);
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        transactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate <= endDate;
        });
        console.log(`📊 FirebaseDataService: ${transactions.length} transactions after endDate filter (${filters.endDate})`);
      }

      // Apply limit after all filtering
      if (filters.limit && transactions.length > filters.limit) {
        transactions = transactions.slice(0, filters.limit);
        console.log(`📊 FirebaseDataService: Limited to ${filters.limit} transactions`);
      }

      console.log(`📊 FirebaseDataService: Returning ${transactions.length} transactions after all filters`);
      return transactions;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }
  }

  // Real-time transaction listener
  subscribeToTransactions(callback, filters = {}) {
    try {
      const userId = this.getCurrentUserId();
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        q = query(q, where('category', '==', filters.category));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactions = [];
        querySnapshot.forEach((doc) => {
          transactions.push({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
          });
        });
        callback(transactions);
      });

      this.listeners.set('transactions', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to transactions:', error);
      throw error;
    }
  }

  // Budget Management
  // Now using its own Firestore collection for budgets
  async saveBudget(budgetData) {
    try {
      const userId = this.getCurrentUserId();
      const budgetRef = doc(db, 'budgets', userId);
      // --- Validation/Auto-correction: Ensure sum matches income ---
      const cats = ['essentials','savings','discretionary','emergency'];
      const income = Number(budgetData.income) || 0;
      let total = cats.reduce((sum, c) => sum + (Number(budgetData[c]) || 0), 0);
      let corrected = { ...budgetData };
      if (income > 0 && total !== income) {
        // Proportionally adjust all categories
        cats.forEach(c => {
          corrected[c] = Math.round((budgetData[c] || 0) * income / (total || 1));
        });
        // Final correction for rounding
        const checkSum = cats.reduce((sum, c) => sum + (Number(corrected[c]) || 0), 0);
        if (checkSum !== income) {
          corrected['essentials'] += (income - checkSum);
        }
      }
      await setDoc(budgetRef, {
        ...corrected,
        userId,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
      console.log('✅ Budget saved (validated/corrected)');
      return true;
    } catch (error) {
      console.error('❌ Error saving budget:', error);
      throw error;
    }
  }

  async getBudget() {
    try {
      const userId = this.getCurrentUserId();
      const budgetRef = doc(db, 'budgets', userId);
      const budgetSnap = await getDoc(budgetRef);
      if (budgetSnap.exists()) {
        return {
          id: budgetSnap.id,
          ...budgetSnap.data(),
          createdAt: budgetSnap.data().createdAt?.toDate?.()?.toISOString(),
          updatedAt: budgetSnap.data().updatedAt?.toDate?.()?.toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching budget:', error);
      throw error;
    }
  }

  // --- Planned Spending by Category ---
  async savePlannedSpendingByCategory(categories) {
    try {
      const userId = this.getCurrentUserId();
      const plannedRef = doc(db, 'plannedSpendingByCategory', userId);
      await setDoc(plannedRef, {
        userId,
        categories,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
      console.log('✅ Planned spending by category saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving planned spending by category:', error);
      throw error;
    }
  }

  async getPlannedSpendingByCategory() {
    try {
      const userId = this.getCurrentUserId();
      const plannedRef = doc(db, 'plannedSpendingByCategory', userId);
      const plannedSnap = await getDoc(plannedRef);
      if (plannedSnap.exists()) {
        return {
          id: plannedSnap.id,
          ...plannedSnap.data(),
          createdAt: plannedSnap.data().createdAt?.toDate?.()?.toISOString(),
          updatedAt: plannedSnap.data().updatedAt?.toDate?.()?.toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching planned spending by category:', error);
      throw error;
    }
  }

  // User Preferences Management
  async saveUserPreferences(preferences) {
    try {
      const userId = this.getCurrentUserId();
      const prefsRef = doc(db, 'userPreferences', userId);
      
      await updateDoc(prefsRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      }).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'userPreferences'), {
          ...preferences,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      console.log('✅ User preferences saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences() {
    try {
      const userId = this.getCurrentUserId();
      const prefsRef = doc(db, 'userPreferences', userId);
      const prefsSnap = await getDoc(prefsRef);

      if (prefsSnap.exists()) {
        return {
          id: prefsSnap.id,
          ...prefsSnap.data(),
          createdAt: prefsSnap.data().createdAt?.toDate?.()?.toISOString(),
          updatedAt: prefsSnap.data().updatedAt?.toDate?.()?.toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching user preferences:', error);
      throw error;
    }
  }

  // Analytics & Insights Storage
  async saveAnalyticsData(analyticsType, data) {
    try {
      const userId = this.getCurrentUserId();
      await addDoc(collection(db, 'analytics'), {
        userId,
        type: analyticsType,
        data,
        createdAt: serverTimestamp()
      });

      console.log('✅ Analytics data saved:', analyticsType);
      return true;
    } catch (error) {
      console.error('❌ Error saving analytics:', error);
      throw error;
    }
  }

  // Spending Analysis with Firebase
  async fetchSpendingSummary(period = 'month', category = 'all') { // Added category filter
    try {
      console.log('📊 FirebaseDataService: fetchSpendingSummary called. Period:', period, 'Category:', category);
      const transactions = await this.getTransactions({
        startDate: this.getPeriodStartDate(period),
        category: category === 'all' ? null : category, // Apply category filter
      });

      console.log('📊 FirebaseDataService: fetchSpendingSummary - transactions fetched:', transactions.length);

      if (transactions.length === 0) {
        return {
          total_spent: 0,
          transaction_count: 0,
          average_transaction: 0,
          categories: {},
          daily_average: 0,
          trends: { trend_direction: 'stable' },
          top_merchants: [],
          spending_patterns: {}
        };
      }

      // Calculate summary from Firebase transactions
      const totalSpent = transactions.reduce((sum, tx) => sum + (tx?.amount || 0), 0);
      const categories = {};
      const merchants = {};
      
      transactions.forEach(tx => {
        if (!tx || !tx.category || typeof tx.category !== 'string' || tx.category.trim().length === 0) return;
        if (tx.amount === null || tx.amount === undefined || typeof tx.amount !== 'number' || tx.amount < 0) return;
        
        // Categories
        const cleanCategory = tx.category.trim().toLowerCase();
        if (!categories[cleanCategory]) {
          categories[cleanCategory] = { total: 0, count: 0 };
        }
        categories[cleanCategory].total += tx.amount;
        categories[cleanCategory].count += 1;

        // Merchants
        if (tx.merchant_name && typeof tx.merchant_name === 'string' && tx.merchant_name.trim().length > 0) {
          const cleanMerchant = tx.merchant_name.trim();
          if (!merchants[cleanMerchant]) {
            merchants[cleanMerchant] = { total: 0, count: 0 };
          }
          merchants[cleanMerchant].total += tx.amount;
          merchants[cleanMerchant].count += 1;
        }
      });

      const topMerchants = Object.entries(merchants)
        .filter(([name, data]) => name && name.trim().length > 0 && data && data.total > 0)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([name, data]) => ({ name, ...data }));

      // Filter out categories with no spending
      const validCategories = Object.entries(categories).reduce((acc, [cat, data]) => {
        if (cat && cat.trim().length > 0 && data && data.total > 0) {
          acc[cat] = {
            total: data.total,
            percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
            transaction_count: data.count,
            average_amount: data.count > 0 ? data.total / data.count : 0
          };
        }
        return acc;
      }, {});

      return {
        total_spent: totalSpent,
        transaction_count: transactions.length,
        average_transaction: transactions.length > 0 ? totalSpent / transactions.length : 0,
        categories: validCategories,
        daily_average: totalSpent / this.getPeriodDays(period),
        trends: this.calculateTrends(transactions),
        top_merchants: topMerchants,
        spending_patterns: this.analyzeSpendingPatterns(transactions)
      };
    } catch (error) {
      console.error('❌ Error fetching spending summary:', error);
      throw error;
    }
  }

  async fetchSpendingTrends(category = null, timeRange = '3months') {
    try {
      console.log('📊 FirebaseDataService: fetchSpendingTrends called. Category:', category, 'TimeRange:', timeRange);
      const filters = {
        startDate: this.getPeriodStartDate(timeRange)
      };
      
      if (category && category !== 'all') {
        filters.category = category;
      }

      const transactions = await this.getTransactions(filters);

      console.log('📊 FirebaseDataService: fetchSpendingTrends - transactions fetched:', transactions.length);

      // Group by date and filter out invalid transactions
      const dailyTotals = {};
      transactions.forEach(tx => {
        if (!tx || !tx.date || typeof tx.date !== 'string' || tx.date.trim().length === 0) return;
        if (tx.amount === null || tx.amount === undefined || typeof tx.amount !== 'number' || tx.amount < 0) return;
        
        const date = tx.date.split('T')[0];
        if (!date || date.length !== 10) return; // Basic date format validation
        
        dailyTotals[date] = (dailyTotals[date] || 0) + tx.amount;
      });

      const trends = Object.entries(dailyTotals)
        .filter(([date, amount]) => date && amount >= 0)
        .map(([date, amount]) => ({
          date,
          amount
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        status: 'success',
        trends: trends,
        summary: {
          total_amount: transactions.reduce((sum, tx) => sum + (tx?.amount || 0), 0),
          average_daily: trends.length > 0 ? trends.reduce((sum, t) => sum + (t?.amount || 0), 0) / trends.length : 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching spending trends:', error);
      throw error;
    }
  }

  async fetchSpendingInsights(timeRange = 'month') { // Added timeRange filter
    try {
      console.log('📊 FirebaseDataService: fetchSpendingInsights called. TimeRange:', timeRange);
      const transactions = await this.getTransactions({
        startDate: this.getPeriodStartDate(timeRange) // Use timeRange for fetching transactions
      });
      
      console.log('📊 FirebaseDataService: fetchSpendingInsights - transactions fetched:', transactions.length);

      if (!transactions || transactions.length === 0) {
        return [];
      }

      const insights = [];
      
      // Calculate insights with null checks
      const validTransactions = transactions.filter(tx => 
        tx && 
        tx.amount !== null && 
        tx.amount !== undefined && 
        typeof tx.amount === 'number' && 
        tx.amount >= 0
      );
      
      if (validTransactions.length === 0) {
        return [];
      }
      
      const totalSpent = validTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const categories = {};
      
      validTransactions.forEach(tx => {
        if (!tx.category || typeof tx.category !== 'string' || tx.category.trim().length === 0) return;
        const cleanCategory = tx.category.trim().toLowerCase();
        categories[cleanCategory] = (categories[cleanCategory] || 0) + tx.amount;
      });

      // Top category insight
      const categoryEntries = Object.entries(categories).filter(([cat, amount]) => cat && amount > 0);
      if (categoryEntries.length > 0) {
        const topCategory = categoryEntries.sort((a, b) => b[1] - a[1])[0];
        if (topCategory && topCategory[1] > 0 && totalSpent > 0 && (topCategory[1] / totalSpent) > 0.4) {
          insights.push({
            type: 'warning',
            title: 'High Category Concentration',
            message: `You're spending ${((topCategory[1] / totalSpent) * 100).toFixed(1)}% of your budget on ${topCategory[0]}. Consider diversifying your expenses.`,
            priority: 'medium'
          });
        }
      }

      // Transaction tracking insight
      if (validTransactions.length > 0) {
        insights.push({
          type: 'tip',
          title: 'Great Job Tracking!',
          message: `You've recorded ${validTransactions.length} transactions this ${timeRange}. Keep up the good habit of tracking your expenses!`,
          priority: 'low'
        });
      }

      // High spending alert
      if (validTransactions.length > 0 && totalSpent > 0) {
        const avgTransaction = totalSpent / validTransactions.length;
        const highValueTx = validTransactions.filter(tx => tx.amount > avgTransaction * 2);
        if (highValueTx.length > 0) {
          insights.push({
            type: 'alert',
            title: 'High Value Transactions',
            message: `You have ${highValueTx.length} transactions that are significantly higher than your average. Review these for potential savings.`,
            priority: 'high'
          });
        }
      }

      return insights;
    } catch (error) {
      console.error('❌ Error fetching spending insights:', error);
      throw error;
    }
  }

  // --- Financial Goals ---
  async getGoals() {
    try {
      const userId = this.getCurrentUserId();
      const goalsRef = collection(db, 'goals');
      const q = query(goalsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const goals = [];
      snapshot.forEach(docSnap => {
        goals.push({ id: docSnap.id, ...docSnap.data() });
      });
      return goals;
    } catch (error) {
      console.error('❌ Error fetching goals:', error);
      return [];
    }
  }

  async saveGoal(goal) {
    try {
      const userId = this.getCurrentUserId();
      // If goal has id, update; else, add new
      if (goal.id) {
        const goalRef = doc(db, 'goals', goal.id);
        await updateDoc(goalRef, { ...goal, userId, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'goals'), {
          ...goal,
          userId,
          saved: 0, // Start at 0 saved
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      return true;
    } catch (error) {
      console.error('❌ Error saving goal:', error);
      throw error;
    }
  }

  // --- Goal Progress Automation ---
  async incrementGoalSaved(goalId, amount) {
    if (!goalId || typeof amount !== 'number') return;
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      saved: (await getDoc(goalRef)).data().saved + amount,
      updatedAt: serverTimestamp()
    });
  }

  async decrementGoalSaved(goalId, amount) {
    if (!goalId || typeof amount !== 'number') return;
    const goalRef = doc(db, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);
    const currentSaved = goalSnap.exists() ? goalSnap.data().saved : 0;
    await updateDoc(goalRef, {
      saved: Math.max(0, currentSaved - amount),
      updatedAt: serverTimestamp()
    });
  }

  // Utility methods
  getPeriodStartDate(period) {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case 'year':
        return new Date(now.getFullYear(), 0, 1).toISOString();
      case '3months':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
  }

  getPeriodDays(period) {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }

  calculateTrends(transactions) {
    if (transactions.length < 2) {
      return { trend_direction: 'stable', trend_magnitude: 0 };
    }

    const sortedTx = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentTx = sortedTx.slice(-7); // Last 7 transactions
    const olderTx = sortedTx.slice(-14, -7); // Previous 7 transactions

    const recentAvg = recentTx.reduce((sum, tx) => sum + tx.amount, 0) / recentTx.length;
    const olderAvg = olderTx.reduce((sum, tx) => sum + tx.amount, 0) / olderTx.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return { trend_direction: 'increasing', trend_magnitude: change };
    if (change < -10) return { trend_direction: 'decreasing', trend_magnitude: Math.abs(change) };
    return { trend_direction: 'stable', trend_magnitude: Math.abs(change) };
  }

  analyzeSpendingPatterns(transactions) {
    // Analyze spending patterns by day of week, time of day, etc.
    const patterns = {
      by_day_of_week: {},
      by_hour: {},
      by_payment_method: {}
    };

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      patterns.by_day_of_week[dayOfWeek] = (patterns.by_day_of_week[dayOfWeek] || 0) + tx.amount;
      patterns.by_hour[hour] = (patterns.by_hour[hour] || 0) + tx.amount;
      patterns.by_payment_method[tx.payment_method] = (patterns.by_payment_method[tx.payment_method] || 0) + tx.amount;
    });

    return patterns;
  }

  // Cleanup listeners
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  // Bulk operations
  async bulkImportTransactions(transactions) {
    try {
      const batch = writeBatch(db);
      const userId = this.getCurrentUserId();

      transactions.forEach((transaction) => {
        const docRef = doc(collection(db, 'transactions'));
        batch.set(docRef, {
          ...transaction,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log('✅ Bulk import successful:', transactions.length, 'transactions');
      return true;
    } catch (error) {
      console.error('❌ Error in bulk import:', error);
      throw error;
    }
  }

  // Data backup/export
  async exportAllData() {
    try {
      const [transactions, budget, preferences] = await Promise.all([
        this.getTransactions(),
        this.getBudget(),
        this.getUserPreferences()
      ]);

      return {
        transactions,
        budget,
        preferences,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }
}

export default FirebaseDataService;
