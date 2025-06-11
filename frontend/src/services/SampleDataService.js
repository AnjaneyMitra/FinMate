import FirebaseDataService from './FirebaseDataService';

// Sample data utility for testing Firebase integration
export class SampleDataService {
  constructor() {
    this.firebaseService = new FirebaseDataService();
  }

  // Generate realistic sample transactions for demo
  generateSampleTransactions() {
    const today = new Date();
    
    return [
      {
        amount: 850,
        description: 'Weekly groceries at Whole Foods',
        category: 'food',
        subcategory: 'Groceries',
        payment_method: 'credit_card',
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Whole Foods Market',
        notes: 'Weekly grocery shopping - fruits, vegetables, dairy'
      },
      {
        amount: 12000,
        description: 'Monthly rent payment',
        category: 'bills',
        subcategory: 'Rent/Mortgage',
        payment_method: 'net_banking',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Property Management Co',
        notes: 'June 2025 rent payment'
      },
      {
        amount: 450,
        description: 'Gas station fill up',
        category: 'transport',
        subcategory: 'Fuel/Gas',
        payment_method: 'debit_card',
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Shell Gas Station',
        notes: 'Full tank for weekend trip'
      },
      {
        amount: 320,
        description: 'Coffee and breakfast',
        category: 'food',
        subcategory: 'Cafe/Coffee',
        payment_method: 'upi',
        date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Starbucks',
        notes: 'Morning coffee with a friend'
      },
      {
        amount: 2800,
        description: 'New running shoes',
        category: 'shopping',
        subcategory: 'Clothing',
        payment_method: 'credit_card',
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Nike Store',
        notes: 'Nike Air Max for daily running'
      },
      {
        amount: 1200,
        description: 'Internet bill',
        category: 'bills',
        subcategory: 'Internet',
        payment_method: 'net_banking',
        date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Airtel Broadband',
        notes: 'Monthly internet subscription'
      },
      {
        amount: 750,
        description: 'Movie tickets and snacks',
        category: 'entertainment',
        subcategory: 'Movies',
        payment_method: 'credit_card',
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'PVR Cinemas',
        notes: 'Weekend movie with family'
      },
      {
        amount: 180,
        description: 'Uber ride to office',
        category: 'transport',
        subcategory: 'Uber/Taxi',
        payment_method: 'wallet',
        date: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Uber',
        notes: 'Rainy day cab ride'
      },
      {
        amount: 890,
        description: 'Monthly gym membership',
        category: 'personal',
        subcategory: 'Fitness',
        payment_method: 'debit_card',
        date: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Gold\'s Gym',
        notes: 'Monthly fitness membership renewal'
      },
      {
        amount: 1500,
        description: 'Online course subscription',
        category: 'education',
        subcategory: 'Courses',
        payment_method: 'credit_card',
        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Coursera',
        notes: 'Machine Learning specialization course'
      },
      {
        amount: 350,
        description: 'Medicine and vitamins',
        category: 'healthcare',
        subcategory: 'Pharmacy',
        payment_method: 'cash',
        date: new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Apollo Pharmacy',
        notes: 'Monthly vitamin supplements'
      },
      {
        amount: 95,
        description: 'Spotify Premium',
        category: 'entertainment',
        subcategory: 'Streaming Services',
        payment_method: 'credit_card',
        date: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        merchant_name: 'Spotify',
        notes: 'Monthly music streaming subscription'
      }
    ];
  }

  // Add sample transactions to Firebase
  async addSampleData() {
    try {
      const sampleTransactions = this.generateSampleTransactions();
      
      console.log('🎯 Adding sample transactions to Firebase...');
      await this.firebaseService.bulkImportTransactions(sampleTransactions);
      
      console.log('✅ Sample data added successfully!');
      return {
        success: true,
        count: sampleTransactions.length,
        message: `Added ${sampleTransactions.length} sample transactions`
      };
    } catch (error) {
      console.error('❌ Error adding sample data:', error);
      throw error;
    }
  }

  // Add sample budget
  async addSampleBudget() {
    try {
      const sampleBudget = {
        monthlyBudget: 50000,
        currency: 'INR',
        categories: {
          food: 8000,
          bills: 15000,
          transport: 3000,
          shopping: 5000,
          entertainment: 2000,
          healthcare: 1000,
          education: 2000,
          personal: 1000,
          miscellaneous: 13000
        }
      };

      await this.firebaseService.saveBudget(sampleBudget);
      console.log('✅ Sample budget added successfully!');
      
      return {
        success: true,
        budget: sampleBudget,
        message: 'Sample budget of ₹50,000 added'
      };
    } catch (error) {
      console.error('❌ Error adding sample budget:', error);
      throw error;
    }
  }

  // Add sample user preferences
  async addSamplePreferences() {
    try {
      const samplePreferences = {
        defaultCurrency: 'INR',
        defaultView: 'overview',
        notifications: true,
        theme: 'light',
        dateFormat: 'DD/MM/YYYY',
        language: 'en'
      };

      await this.firebaseService.saveUserPreferences(samplePreferences);
      console.log('✅ Sample preferences added successfully!');
      
      return {
        success: true,
        preferences: samplePreferences,
        message: 'Sample preferences added'
      };
    } catch (error) {
      console.error('❌ Error adding sample preferences:', error);
      throw error;
    }
  }

  // Complete sample data setup
  async setupCompleteDemo() {
    try {
      const results = await Promise.all([
        this.addSampleData(),
        this.addSampleBudget(),
        this.addSamplePreferences()
      ]);

      const totalTransactions = results[0].count;
      
      return {
        success: true,
        summary: {
          transactions: totalTransactions,
          budget: 50000,
          preferences: 'configured'
        },
        message: `🎉 Demo setup complete! Added ${totalTransactions} transactions, budget, and preferences.`
      };
    } catch (error) {
      console.error('❌ Error setting up demo:', error);
      throw error;
    }
  }
}

export default SampleDataService;
