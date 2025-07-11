import React, { useState, useRef, useEffect } from 'react';
import { IoCalendarOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';

function CustomDatePicker({ value, onChange, placeholder, icon, gradient }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value || '');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const datePickerRef = useRef(null);

    useEffect(() => {
        if (value) {
            const parsed = new Date(value);
            const isoDate = parsed.toISOString().split('T')[0]; // "yyyy-mm-dd"
            setSelectedDate(isoDate);
        } else {
            setSelectedDate('');
        }
    }, [value]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const handleDateSelect = (date) => {
        const dateString = date.toISOString().split('T')[0];
        setSelectedDate(dateString);
        onChange(dateString);
        setIsOpen(false);
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        const selected = new Date(selectedDate);
        return date.toDateString() === selected.toDateString();
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="relative" ref={datePickerRef}>
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
                    <span className={selectedDate ? 'text-white' : 'text-white/60'}>
                        {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
                    </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <IoCalendarOutline size={20} color="rgba(255,255,255,0.6)" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card border border-white/30 rounded-xl overflow-hidden z-50 animate-slide-up shadow-2xl w-80">
                    {/* Calendar Header */}
                    <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <IoChevronBack size={16} color="white" />
                            </button>

                            <div className="text-center">
                                <h3 className="text-white font-semibold text-lg">
                                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </h3>
                            </div>

                            <button
                                onClick={() => navigateMonth(1)}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <IoChevronForward size={16} color="white" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4">
                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-xs font-medium text-white/60 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentMonth).map((date, index) => (
                                <div key={index} className="aspect-square">
                                    {date ? (
                                        <button
                                            onClick={() => handleDateSelect(date)}
                                            className={`w-full h-full rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${isSelected(date)
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                                : isToday(date)
                                                    ? 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/50'
                                                    : 'text-white/80 hover:bg-white/20 hover:text-white'
                                                }`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4 border-t border-white/20 bg-white/5">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    setSelectedDate(today);
                                    onChange(today);
                                    setIsOpen(false);
                                }}
                                className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/80 hover:text-white transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedDate('');
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/80 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomDatePicker;