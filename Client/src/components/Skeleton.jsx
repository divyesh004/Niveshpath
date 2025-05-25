import React from 'react';

/**
 * Skeleton component for loading states
 * @param {Object} props
 * @param {string} props.type - Type of skeleton (text, circle, rect, card, profile, etc)
 * @param {number} props.width - Width of the skeleton
 * @param {number} props.height - Height of the skeleton
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.count - Number of skeleton items to render
 */
const Skeleton = ({ 
  type = 'text', 
  width, 
  height, 
  className = '', 
  count = 1,
  ...rest
 }) => {
  // Generate unique key for each skeleton item
  const getUniqueKey = (index) => `skeleton-${type}-${index}`;
  
  // Determine the base classes based on type
  const getBaseClasses = () => {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
    
    switch (type) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'rect':
        return `${baseClasses} rounded-md`;
      case 'card':
        return `${baseClasses} rounded-lg`;
      case 'profile':
        return `${baseClasses} rounded-full`;
      case 'text':
      default:
        return `${baseClasses} rounded h-4`;
    }
  };
  
  // Determine the dimensions
  const getStyle = () => {
    const style = {};
    
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    
    return style;
  };
  
  // Render multiple skeleton items if count > 1
  if (count > 1) {
    return (
      <div className="flex flex-col space-y-2">
        {Array(count)
          .fill(null)
          .map((_, index) => (
            <div
              key={getUniqueKey(index)}
              className={`${getBaseClasses()} ${className}`}
              style={getStyle()}
              {...rest}
            />
          ))}
      </div>
    );
  }
  
  // Render a single skeleton item
  return (
    <div
      className={`${getBaseClasses()} ${className}`}
      style={getStyle()}
      {...rest}
    />
  );
};

/**
 * Skeleton Text component for text loading states
 */
Skeleton.Text = ({ lines = 3, className = '', ...rest }) => (
  <div className={`space-y-2 ${className}`}>
    {Array(lines)
      .fill(null)
      .map((_, index) => (
        <Skeleton 
          key={`skeleton-text-${index}`} 
          type="text" 
          className={index === lines - 1 ? 'w-3/4' : 'w-full'}
          {...rest}
        />
      ))}
  </div>
);

/**
 * Skeleton Card component for card loading states
 */
Skeleton.Card = ({ className = '', ...rest }) => (
  <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
    <Skeleton type="rect" height={150} className="mb-4" />
    <Skeleton.Text lines={3} />
  </div>
);

/**
 * Skeleton Profile component for profile loading states
 */
Skeleton.Profile = ({ className = '', ...rest }) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    <Skeleton type="circle" width={50} height={50} />
    <div className="space-y-2 flex-1">
      <Skeleton type="text" className="w-1/3" />
      <Skeleton type="text" className="w-1/2" />
    </div>
  </div>
);

/**
 * Skeleton Table component for table loading states
 */
Skeleton.Table = ({ rows = 5, columns = 3, className = '', ...rest }) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex space-x-4">
      {Array(columns)
        .fill(null)
        .map((_, index) => (
          <Skeleton 
            key={`skeleton-table-header-${index}`} 
            type="text" 
            className="w-full h-6" 
            {...rest}
          />
        ))}
    </div>
    
    {Array(rows)
      .fill(null)
      .map((_, rowIndex) => (
        <div key={`skeleton-table-row-${rowIndex}`} className="flex space-x-4">
          {Array(columns)
            .fill(null)
            .map((_, colIndex) => (
              <Skeleton 
                key={`skeleton-table-cell-${rowIndex}-${colIndex}`} 
                type="text" 
                className="w-full" 
                {...rest}
              />
            ))}
        </div>
      ))}
  </div>
);

/**
 * Skeleton Dashboard component for dashboard loading states
 */
Skeleton.Dashboard = ({ className = '', ...rest }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header section */}
    <div className="flex justify-between items-center">
      <Skeleton type="text" className="w-1/4 h-8" />
      <Skeleton type="rect" width={120} height={40} />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array(3)
        .fill(null)
        .map((_, index) => (
          <div key={`skeleton-stat-${index}`} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <Skeleton type="text" className="w-1/3 mb-2" />
            <Skeleton type="text" className="w-1/2 h-8" />
          </div>
        ))}
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton type="rect" height={250} />
        <Skeleton.Table rows={3} />
      </div>
      <div className="space-y-4">
        <Skeleton type="rect" height={150} />
        <Skeleton.Text lines={4} />
      </div>
    </div>
  </div>
);

/**
 * Skeleton Form component for form loading states
 */
Skeleton.Form = ({ fields = 4, className = '', ...rest }) => (
  <div className={`space-y-4 ${className}`}>
    {Array(fields)
      .fill(null)
      .map((_, index) => (
        <div key={`skeleton-form-field-${index}`} className="space-y-2">
          <Skeleton type="text" className="w-1/4 h-4" />
          <Skeleton type="rect" height={40} />
        </div>
      ))}
    <Skeleton type="rect" width={120} height={40} className="mt-6" />
  </div>
);

export default Skeleton;