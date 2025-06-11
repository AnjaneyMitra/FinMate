// Firebase Connection Test
import React, { useState } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // Test 1: Check auth state
      console.log('🔍 Testing Firebase connection...');
      console.log('👤 Current user:', auth.currentUser);
      
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      // Test 2: Try to write to Firestore
      console.log('📝 Testing Firestore write...');
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Test message',
        timestamp: serverTimestamp(),
        userId: auth.currentUser.uid
      });
      
      console.log('✅ Test document created:', testDoc.id);
      
      // Test 3: Try to read from Firestore
      console.log('📖 Testing Firestore read...');
      const querySnapshot = await getDocs(collection(db, 'test'));
      console.log('📊 Documents found:', querySnapshot.size);
      
      setTestResult(`✅ Firebase connection successful! 
      - User: ${auth.currentUser.email}
      - Test doc ID: ${testDoc.id}
      - Documents in test collection: ${querySnapshot.size}`);
      
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      setTestResult(`❌ Firebase test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={testFirebaseConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Firebase'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-line text-sm">
          {testResult}
        </div>
      )}
    </div>
  );
}
