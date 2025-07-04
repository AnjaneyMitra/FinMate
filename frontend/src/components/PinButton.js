import React from 'react';
import { useSidebar } from '../contexts/SidebarContext';

const PinButton = ({ pageId, className = '', showLabel = false }) => {
  const { isItemPinned, pinItem, unpinItem, getAllItems } = useSidebar();

  // Find the page info
  const pageInfo = getAllItems().find(item => item.id === pageId);
  
  // Debug logging
  console.log('PinButton Debug:', {
    pageId,
    pageInfo,
    allItems: getAllItems(),
    isDefault: pageInfo?.isDefault
  });
  
  if (!pageInfo || pageInfo.isDefault) {
    console.log('PinButton: Not showing because', !pageInfo ? 'pageInfo not found' : 'pageInfo is default');
    return null; // Don't show pin button for default items like Dashboard
  }

  const isPinned = isItemPinned(pageId);

  const handleTogglePin = () => {
    if (isPinned) {
      unpinItem(pageId);
    } else {
      pinItem(pageId);
    }
  };

  return (
    <button
      onClick={handleTogglePin}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isPinned
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      title={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
    >
      <svg 
        className="w-4 h-4" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        transform={isPinned ? 'rotate(45)' : 'rotate(0)'}
        style={{ transition: 'transform 0.2s ease' }}
      >
        <path 
          fillRule="evenodd" 
          d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 011.4.9L18 9l.293.707A1 1 0 0117 11H9.293l-4 4a1 1 0 01-1.414-1.414l4-4V3a1 1 0 011-1z" 
          clipRule="evenodd" 
        />
      </svg>
      {showLabel && (
        <span>
          {isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
        </span>
      )}
    </button>
  );
};

export default PinButton;
