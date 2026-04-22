const Nav: React.FC = () => {
  return (
    <nav className="bg-white shadow-md py-2 px-4 border-b">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <div className="flex items-center space-x-8">
          <div className="text-lg font-bold text-gray-800 bg-gray-200 px-4 py-2 rounded">
            Company Logo Placeholder
          </div>
          <div className="text-lg font-bold text-gray-800 bg-gray-200 px-4 py-2 rounded">
            Client Logo Placeholder
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;