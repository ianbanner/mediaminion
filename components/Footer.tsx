import React from 'react';

const Footer: React.FC = () => {
    return (
      <footer className="py-12 px-6 md:px-12 bg-slate-900/50 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h3 className="font-semibold text-gray-200">Product</h3>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Updates</a></li>
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-gray-200">Company</h3>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-gray-200">Legal</h3>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-gray-200">Follow Us</h3>
                {/* Placeholder for social links */}
                 <div className="mt-4 text-gray-400">Links coming soon.</div>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Social Media Minion. All rights reserved.
        </div>
      </footer>
    );
};

export default Footer;
