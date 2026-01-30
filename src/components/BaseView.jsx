// src/components/BaseView.jsx
import React from 'react';
import Navbar from './navbar';
import Header from './header';
import MusicPlaybar from './musicplaybar';

const BaseView = ({ children, setIsSearching, setSearchQuery, setIsShazamClicked})  => {
    return (
        <div className="w-screen h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/5 p-6 pt-4">
                    <Navbar />
                </div>
                <div className="w-4/5 p-6 pt-4 flex flex-col overflow-hidden">
                    <div className="mb-auto">
                        <Header setIsSearching={setIsSearching} setSearchQuery={setSearchQuery} setIsShazamClicked={setIsShazamClicked} />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>

            <div className="h-[70px] border-t border-gray-700">
                <MusicPlaybar />
            </div>
        </div>
    );
};

export default BaseView;