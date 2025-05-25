import ThemeSwitcher from './ThemeSwitcher';

const ThemeExample = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">NiveshPath Theme Demo</h1>
          <ThemeSwitcher />
        </div>
        
        {/* Modern Theme Components */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Modern & Youthful Theme</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">SIP Calculator</h3>
              <p className="mb-4">Calculate your future investments with our SIP calculator.</p>
              <button className="btn">Calculate Now</button>
            </div>
            
            <div className="glass-card">
              <h3 className="text-xl font-semibold mb-4">Budget Planner</h3>
              <p className="mb-4">Plan your monthly budget and track expenses.</p>
              <button className="btn-outline">Start Planning</button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="form-label">Investment Amount</label>
            <input type="text" className="input-field" placeholder="₹10,000" />
          </div>
          
          <div className="mb-6">
            <label className="form-label">Progress</label>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
        
        {/* Professional Theme Components */}
        <div className="theme-professional">
          <h2 className="text-3xl font-semibold mb-6">Professional & Trustworthy Theme</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card-pro">
              <h3 className="text-xl font-semibold mb-4">EMI Calculator</h3>
              <p className="mb-4">Calculate your loan EMI with our easy-to-use calculator.</p>
              <button className="btn-pro">Calculate EMI</button>
            </div>
            
            <div className="card-pro">
              <h3 className="text-xl font-semibold mb-4">Financial Advisor</h3>
              <p className="mb-4">Get personalized financial advice from our AI advisor.</p>
              <button className="btn-pro">Chat Now</button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="form-label">Loan Amount</label>
            <input type="text" className="input-field" placeholder="₹5,00,000" />
          </div>
          
          <div className="mb-6">
            <label className="form-label">Progress</label>
            <div className="progress-bar">
              <div className="progress-bar-fill-pro" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeExample;