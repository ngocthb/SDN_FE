import React, { useState, useRef, useEffect } from 'react';
import { IoCheckmark, IoChevronDown } from 'react-icons/io5';

function CustomSelect({ value, onChange, options, placeholder, icon, gradient }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const selectRef = useRef(null);

    useEffect(() => {
        const option = options.find(opt => opt.value === value);
        setSelectedOption(option || null);
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        setSelectedOption(option);
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={selectRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`input-glass h-14 text-lg cursor-pointer flex items-center justify-between transition-all duration-300 ${isOpen ? 'ring-2 ring-purple-500/50 border-purple-500/50' : ''
                    }`}
            >
                <div className="flex items-center space-x-3">
                    {icon && (
                        <div className={`w-6 h-6 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            {React.createElement(icon, { size: 14, color: "white" })}
                        </div>
                    )}
                    <span className={selectedOption ? 'text-white' : 'text-white/60'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <IoChevronDown size={20} color="rgba(255,255,255,0.6)" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card border border-white/30 rounded-xl overflow-hidden z-50 animate-slide-up shadow-2xl">
                    {options.map((option, index) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`px-4 py-3 cursor-pointer transition-all duration-200 flex items-center space-x-3 hover:bg-white/20 ${selectedOption?.value === option.value ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300' : 'text-white/80 hover:text-white'
                                }`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {option.icon && (
                                <div className={`w-5 h-5 bg-gradient-to-r ${option.gradient || 'from-gray-500 to-gray-600'} rounded-lg flex items-center justify-center`}>
                                    {React.createElement(option.icon, { size: 12, color: "white" })}
                                </div>
                            )}
                            <span className="text-sm font-medium">{option.label}</span>
                            {selectedOption?.value === option.value && (
                                <div className="ml-auto">
                                    <IoCheckmark size={16} color="#a855f7" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomSelect;