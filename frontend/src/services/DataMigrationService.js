import FirebaseDataService from './FirebaseDataService';

export class DataMigrationService {
  constructor() {
    this.firebaseService = new FirebaseDataService();
  }

  // Migrate localStorage data to Firebase
  async migrateLocalStorageToFirebase(userId = 'demo-user') {
    try {
      console.log('🔄 Starting data migration from localStorage to Firebase...');

      // Get all localStorage data
      const transactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
      const budget = localStorage.getItem(`budget_${userId}`);
      const preferences = JSON.parse(localStorage.getItem(`preferences_${userId}`) || '{}');

      let migrationResults = {
        transactions: { success: 0, failed: 0 },
        budget: { success: 0, failed: 0 },
        preferences: { success: 0, failed: 0 }
      };

      // Migrate transactions
      if (transactions.length > 0) {
        try {
          await this.firebaseService.bulkImportTransactions(transactions);
          migrationResults.transactions.success = transactions.length;
          console.log(`✅ Migrated ${transactions.length} transactions`);
        } catch (error) {
          migrationResults.transactions.failed = transactions.length;
          console.error('❌ Failed to migrate transactions:', error);
        }
      }

      // Migrate budget
      if (budget) {
        try {
          await this.firebaseService.saveBudget({
            monthlyBudget: parseFloat(budget),
            currency: 'INR'
          });
          migrationResults.budget.success = 1;
          console.log('✅ Migrated budget data');
        } catch (error) {
          migrationResults.budget.failed = 1;
          console.error('❌ Failed to migrate budget:', error);
        }
      }

      // Migrate preferences
      if (Object.keys(preferences).length > 0) {
        try {
          await this.firebaseService.saveUserPreferences(preferences);
          migrationResults.preferences.success = 1;
          console.log('✅ Migrated user preferences');
        } catch (error) {
          migrationResults.preferences.failed = 1;
          console.error('❌ Failed to migrate preferences:', error);
        }
      }

      console.log('🎉 Migration completed:', migrationResults);
      return migrationResults;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Backup data from Firebase
  async backupFirebaseData() {
    try {
      console.log('💾 Creating Firebase data backup...');
      
      const backupData = await this.firebaseService.exportAllData();
      
      // Create downloadable backup file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finmate-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ Backup created successfully');
      return backupData;

    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  // Restore data from backup file
  async restoreFromBackup(backupFile) {
    try {
      console.log('🔄 Restoring data from backup...');

      const fileContent = await this.readFileAsText(backupFile);
      const backupData = JSON.parse(fileContent);

      if (!backupData.transactions && !backupData.budget && !backupData.preferences) {
        throw new Error('Invalid backup file format');
      }

      let restoreResults = {
        transactions: { success: 0, failed: 0 },
        budget: { success: 0, failed: 0 },
        preferences: { success: 0, failed: 0 }
      };

      // Restore transactions
      if (backupData.transactions && backupData.transactions.length > 0) {
        try {
          await this.firebaseService.bulkImportTransactions(backupData.transactions);
          restoreResults.transactions.success = backupData.transactions.length;
          console.log(`✅ Restored ${backupData.transactions.length} transactions`);
        } catch (error) {
          restoreResults.transactions.failed = backupData.transactions.length;
          console.error('❌ Failed to restore transactions:', error);
        }
      }

      // Restore budget
      if (backupData.budget) {
        try {
          await this.firebaseService.saveBudget(backupData.budget);
          restoreResults.budget.success = 1;
          console.log('✅ Restored budget data');
        } catch (error) {
          restoreResults.budget.failed = 1;
          console.error('❌ Failed to restore budget:', error);
        }
      }

      // Restore preferences
      if (backupData.preferences) {
        try {
          await this.firebaseService.saveUserPreferences(backupData.preferences);
          restoreResults.preferences.success = 1;
          console.log('✅ Restored user preferences');
        } catch (error) {
          restoreResults.preferences.failed = 1;
          console.error('❌ Failed to restore preferences:', error);
        }
      }

      console.log('🎉 Restore completed:', restoreResults);
      return restoreResults;

    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  // Utility to read file content
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // Clear localStorage after successful migration
  clearLocalStorageData(userId = 'demo-user') {
    const keysToRemove = [
      `transactions_${userId}`,
      `budget_${userId}`,
      `preferences_${userId}`
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('🧹 Cleared localStorage data after migration');
  }

  // Check if migration is needed
  async checkMigrationStatus(userId = 'demo-user') {
    const localTransactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
    const localBudget = localStorage.getItem(`budget_${userId}`);
    
    let firebaseTransactions = [];
    let firebaseBudget = null;
    
    try {
      firebaseTransactions = await this.firebaseService.getTransactions({ limit: 1 });
      firebaseBudget = await this.firebaseService.getBudget();
    } catch (error) {
      console.log('No Firebase data found');
    }

    return {
      needsMigration: localTransactions.length > 0 || localBudget,
      localData: {
        transactions: localTransactions.length,
        hasBudget: !!localBudget
      },
      firebaseData: {
        transactions: firebaseTransactions.length,
        hasBudget: !!firebaseBudget
      }
    };
  }
}

export default DataMigrationService;
