import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

const avatarColors = [
    'bg-red-600', 'bg-orange-600', 'bg-amber-600', 'bg-green-600', 'bg-teal-600', 
    'bg-cyan-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600'
];

const getColorForName = (name: string): string => {
    if (!name) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % avatarColors.length);
    return avatarColors[index];
};

const getInitials = (name: string): string => {
    if (!name) return '?';
    const trimmedName = name.trim().toLowerCase();
    if (trimmedName.length === 0) return '?';

    const firstLetter = trimmedName[0];
    if (trimmedName.length === 1) return firstLetter.toUpperCase();

    const consonants = "bcdfghjklmnpqrstvwxyz";
    let secondLetter = '';

    for (let i = 1; i < trimmedName.length; i++) {
        const char = trimmedName[i];
        if (consonants.includes(char)) {
            secondLetter = char;
            break;
        }
    }
    
    if (!secondLetter && trimmedName.length > 1) {
       for (let i = 1; i < trimmedName.length; i++) {
           if (trimmedName[i] !== ' ') {
               secondLetter = trimmedName[i];
               break;
           }
       }
    }

    if (!secondLetter) {
        return firstLetter.toUpperCase();
    }
    
    return (firstLetter + secondLetter).toUpperCase();
};


const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, className = 'h-8 w-8' }) => {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${className} rounded-full object-cover`} />;
  }
  
  const initials = getInitials(name);
  const colorClass = getColorForName(name);

  return (
    <div 
        className={`flex items-center justify-center rounded-full text-white font-bold ${colorClass} ${className}`}
        aria-label={name}
        title={name}
    >
      <span className="text-sm leading-none">{initials}</span>
    </div>
  );
};

export default Avatar;
