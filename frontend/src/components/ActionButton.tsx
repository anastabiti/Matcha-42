import { motion } from 'framer-motion';
import React from 'react';
import { Heart, X } from 'lucide-react';
type ActionButtonProps = {
    onClick?: () => void;
    icon: React.ReactNode;
    variant: 'primary' | 'secondary';
};

export const ActionButton = ({
    onClick,
    icon,
    variant = 'secondary'
}: ActionButtonProps) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`
            w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-colors
            ${variant === 'primary'
                ? 'bg-[#e94057] text-white hover:bg-[#d93a4f]'
                : 'bg-[#3a3445] text-white/90 hover:bg-[#4a4455]'
            }
        `}
    >
        {icon}
    </motion.button>
);


type ActionButtonsProps = {
    onSwipe: (direction: 'left' | 'right') => void;
    onLike: () => void;
};

export const ActionButtons = ({ onSwipe, onLike }: ActionButtonsProps) => (
    <div className="flex items-center justify-center gap-x-16">
        <ActionButton
            onClick={() => onSwipe('left')}
            icon={<X className="w-7 h-7" />}
            variant="secondary"
        />
        <ActionButton
            onClick={onLike}
            icon={<Heart className="w-7 h-7" />}
            variant="primary"
        />
    </div>
);

export default ActionButtons;